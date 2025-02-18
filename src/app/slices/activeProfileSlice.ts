import axiosInstance from '../api/axiosInstance';
import { generateGenreFilterValues, generateStreamingServiceFilterValues } from '../constants/filters';
import { Movie, MovieIds } from '../model/movies';
import { ACTIVE_PROFILE_KEY, Profile } from '../model/profile';
import { NextWatchEpisode, Show } from '../model/shows';
import { WatchStatus } from '../model/watchStatus';
import { RootState } from '../store';
import { logout } from './accountSlice';
import { updateEpisodeWatchStatus, updateSeasonWatchStatus } from './activeShowSlice';
import { NotificationType, showNotification } from './notificationSlice';
import { updateProfileImage } from './profilesSlice';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

interface ActiveProfileState {
  profile: Profile | null;
  shows: Show[];
  showGenres: string[];
  showStreamingServices: string[];
  nextWatchEpisodes: NextWatchEpisode[];
  movies: Movie[];
  movieGenres: string[];
  movieStreamingServices: string[];
  recentMovies: MovieIds[];
  upcomingMovies: MovieIds[];
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;
}

const blankState: ActiveProfileState = {
  profile: null,
  shows: [],
  showGenres: [],
  showStreamingServices: [],
  nextWatchEpisodes: [],
  movies: [],
  movieGenres: [],
  movieStreamingServices: [],
  recentMovies: [],
  upcomingMovies: [],
  lastUpdated: null,
  loading: false,
  error: null,
};

const determineInitialState = () => {
  const data = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const localState: ActiveProfileState = data ? JSON.parse(data) : blankState;
  return localState;
};

const initialState = determineInitialState();

export const setActiveProfile = createAsyncThunk(
  'activeProfile/set',
  async ({ accountId, profileId }: { accountId: string; profileId: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}`);
      const results = response.data.results;
      const profile: Profile = results.profile;
      const shows: Show[] = results.shows;
      const nextWatchEpisodes: NextWatchEpisode[] = results.nextWatch;
      const movies: Movie[] = results.movies;
      const recentMovies = results.recentMovies;
      const upcomingMovies = results.upcomingMovies;
      return { profile, shows, nextWatchEpisodes, movies, recentMovies, upcomingMovies };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const reloadActiveProfile = createAsyncThunk(
  'activeProfile/reload',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      const profileId = state.activeProfile.profile?.id;

      if (!accountId || !profileId) {
        throw new Error('No active profile found');
      }

      const response = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}`);
      const results = response.data.results;
      const profile: Profile = results.profile;
      const shows: Show[] = results.shows;
      const nextWatchEpisodes: NextWatchEpisode[] = results.nextWatch;
      const movies: Movie[] = results.movies;
      const recentMovies = results.recentMovies;
      const upcomingMovies = results.upcomingMovies;

      return { profile, shows, nextWatchEpisodes, movies, recentMovies, upcomingMovies };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const reloadNextWatchEpisodes = createAsyncThunk(
  'activeProfile/reloadNextWatchEpisodes',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const profileId = state.activeProfile.profile?.id;
      const response = await axiosInstance.get(`/profiles/${profileId}/shows/nextWatch`);
      const nextWatchEpisodes: NextWatchEpisode[] = response.data.results;
      console.log('reload next watches', nextWatchEpisodes);
      return nextWatchEpisodes;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const addShowFavorite = createAsyncThunk(
  'activeProfile/addShowFavorite',
  async ({ profileId, showId }: { profileId: number; showId: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/profiles/${profileId}/shows/favorites`, {
        id: showId,
      });
      const show = response.data.result.favoritedShow;
      const nextWatchEpisodes = response.data.result.nextWatchEpisodes;
      const showTitle = show.title;
      dispatch(
        showNotification({
          message: `${showTitle} favorited`,
          type: NotificationType.Success,
        }),
      );
      return { show, nextWatchEpisodes };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const updateAfterAddShowFavorite = createAsyncThunk(
  'activeProfile/updateAfterAddShowFavorite',
  async (show: Show, { rejectWithValue }) => {
    if (show) {
      return show;
    }
    return rejectWithValue('Error while updating show after making it a favorite');
  },
);

export const removeShowFavorite = createAsyncThunk(
  'activeProfile/removeShowFavorite',
  async ({ profileId, showId }: { profileId: number; showId: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/profiles/${profileId}/shows/favorites/${showId}`);
      const show = response.data.result;
      const showTitle = show.title;
      dispatch(
        showNotification({
          message: `${showTitle} removed`,
          type: NotificationType.Success,
        }),
      );
      return show;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const updateShowStatus = createAsyncThunk(
  'activeProfile/updateShowStatus',
  async (
    { profileId, showId, status }: { profileId: string; showId: number; status: WatchStatus },
    { rejectWithValue },
  ) => {
    try {
      await axiosInstance.put(`/profiles/${profileId}/shows/watchStatus`, {
        show_id: showId,
        status: status,
        recursive: true,
      });
      return { showId, status };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const addMovieFavorite = createAsyncThunk(
  'activeProfile/addMovieFavorite',
  async ({ profileId, movieId }: { profileId: number; movieId: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/profiles/${profileId}/movies/favorites`, {
        id: movieId,
      });
      const result = response.data.result;
      const movie = result.favoritedMovie;
      const movieTitle = movie.title;
      const recentMovies = result.recentMovies;
      const upcomingMovies = result.upcomingMovies;
      dispatch(
        showNotification({
          message: `${movieTitle} favorited`,
          type: NotificationType.Success,
        }),
      );
      return { movie, recentMovies, upcomingMovies };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const removeMovieFavorite = createAsyncThunk(
  'activeProfile/removeMovieFavorite',
  async ({ profileId, movieId }: { profileId: number; movieId: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/profiles/${profileId}/movies/favorites/${movieId}`);
      const result = response.data.result;
      const movie = result.removedMovie;
      const movieTitle = movie.title;
      const recentMovies = result.recentMovies;
      const upcomingMovies = result.upcomingMovies;
      dispatch(
        showNotification({
          message: `${movieTitle} removed`,
          type: NotificationType.Success,
        }),
      );
      return { movie, recentMovies, upcomingMovies };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const updateMovieStatus = createAsyncThunk(
  'activeProfile/updateMovieStatus',
  async (
    { profileId, movieId, status }: { profileId: number; movieId: number; status: WatchStatus },
    { rejectWithValue },
  ) => {
    try {
      await axiosInstance.put(`/profiles/${profileId}/movies/watchStatus`, {
        movie_id: movieId,
        status: status,
      });
      return { movieId, status };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

const activeProfileSlice = createSlice({
  name: 'activeProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        localStorage.removeItem(ACTIVE_PROFILE_KEY);
        return blankState;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.image = action.payload.image;
          localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
        }
      })
      .addCase(setActiveProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setActiveProfile.fulfilled, (state, action) => {
        const { profile, shows, nextWatchEpisodes, movies, recentMovies, upcomingMovies } = action.payload;
        state.profile = profile;
        state.shows = shows;
        state.showGenres = generateGenreFilterValues(shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(shows);
        state.nextWatchEpisodes = nextWatchEpisodes;
        state.movies = movies;
        state.movieGenres = generateGenreFilterValues(movies);
        state.movieStreamingServices = generateStreamingServiceFilterValues(movies);
        state.recentMovies = recentMovies;
        state.upcomingMovies = upcomingMovies;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(setActiveProfile.rejected, (state, action) => {
        state.loading = false;
        state.lastUpdated = null;
        state.error = action.error.message || 'Failed to load active profile';
      })
      .addCase(reloadActiveProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reloadActiveProfile.fulfilled, (state, action) => {
        const { profile, shows, nextWatchEpisodes, movies, recentMovies, upcomingMovies } = action.payload;
        state.profile = profile;
        state.shows = shows;
        state.showGenres = generateGenreFilterValues(shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(shows);
        state.nextWatchEpisodes = nextWatchEpisodes;
        state.movies = movies;
        state.movieGenres = generateGenreFilterValues(movies);
        state.movieStreamingServices = generateStreamingServiceFilterValues(movies);
        state.recentMovies = recentMovies;
        state.upcomingMovies = upcomingMovies;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(reloadActiveProfile.rejected, (state, action) => {
        state.loading = false;
        state.lastUpdated = null;
        state.error = action.error.message || 'Failed to reload active profile';
      })
      .addCase(reloadNextWatchEpisodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reloadNextWatchEpisodes.fulfilled, (state, action) => {
        const nextWatchEpisodes = action.payload;
        state.nextWatchEpisodes = nextWatchEpisodes;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(reloadNextWatchEpisodes.rejected, (state, action) => {
        state.loading = false;
        state.lastUpdated = null;
        state.error = action.error.message || 'Failed to reload active profile';
      })
      .addCase(addShowFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addShowFavorite.fulfilled, (state, action) => {
        const { show, nextWatchEpisodes } = action.payload;
        state.shows.push(show);
        if (nextWatchEpisodes) {
          state.nextWatchEpisodes = nextWatchEpisodes;
        }
        state.showGenres = generateGenreFilterValues(state.shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(state.shows);
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(addShowFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add a show favorite';
      })
      .addCase(updateAfterAddShowFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAfterAddShowFavorite.fulfilled, (state, action) => {
        const show = action.payload;
        state.shows = state.shows.map((s) => (s.show_id === show.show_id ? show : s));
        state.showGenres = generateGenreFilterValues(state.shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(state.shows);
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(updateAfterAddShowFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update a show favorite';
      })
      .addCase(removeShowFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeShowFavorite.fulfilled, (state, action) => {
        const show = action.payload;
        state.shows = state.shows.filter((filterShow) => filterShow.show_id !== show.id);
        state.showGenres = generateGenreFilterValues(state.shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(state.shows);
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(removeShowFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove a show favorite';
      })
      .addCase(updateShowStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShowStatus.fulfilled, (state, action) => {
        const { showId, status } = action.payload;
        const shows = state.shows;
        if (shows) {
          const show = shows.find((m) => m.show_id === showId);
          if (show) {
            show.watch_status = status;
          }
        }
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(updateShowStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update show status';
      })
      .addCase(updateEpisodeWatchStatus.fulfilled, (state, action) => {
        const showId = action.payload.showId;
        const status = action.payload.showStatus;
        const shows = state.shows;
        if (shows) {
          const show = shows.find((m) => m.show_id === showId);
          if (show) {
            show.watch_status = status;
          }
        }
        state.lastUpdated = new Date().toLocaleString();
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(updateSeasonWatchStatus.fulfilled, (state, action) => {
        const showId = action.payload.showId;
        const status = action.payload.showStatus;
        const shows = state.shows;
        if (shows) {
          const show = shows.find((m) => m.show_id === showId);
          if (show) {
            show.watch_status = status;
          }
        }
        state.lastUpdated = new Date().toLocaleString();
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(addMovieFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMovieFavorite.fulfilled, (state, action) => {
        const { movie, recentMovies, upcomingMovies } = action.payload;
        state.movies.push(movie);
        state.movieGenres = generateGenreFilterValues(state.movies);
        state.movieStreamingServices = generateStreamingServiceFilterValues(state.movies);
        state.recentMovies = recentMovies;
        state.upcomingMovies = upcomingMovies;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(addMovieFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add a movie favorite';
      })
      .addCase(removeMovieFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMovieFavorite.fulfilled, (state, action) => {
        const { movie, recentMovies, upcomingMovies } = action.payload;
        state.movies = state.movies.filter((filterMovie) => filterMovie.movie_id !== movie.id);
        state.movieGenres = generateGenreFilterValues(state.movies);
        state.movieStreamingServices = generateStreamingServiceFilterValues(state.movies);
        state.recentMovies = recentMovies;
        state.upcomingMovies = upcomingMovies;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(removeMovieFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove a movie favorite';
      })
      .addCase(updateMovieStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMovieStatus.fulfilled, (state, action) => {
        const { movieId, status } = action.payload;
        const movies = state.movies;
        if (movies) {
          const movie = movies.find((m) => m.movie_id === movieId);
          if (movie) {
            movie.watch_status = status;
          }
        }
        state.lastUpdated = new Date().toLocaleString();
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(updateMovieStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update movie status';
      });
  },
});

export const selectActiveProfile = (state: RootState) => state.activeProfile.profile;
export const selectLastUpdated = (state: RootState) => state.activeProfile.lastUpdated;
export const selectShows = (state: RootState) => state.activeProfile.shows;
export const selectShowGenres = (state: RootState) => state.activeProfile.showGenres;
export const selectShowStreamingServices = (state: RootState) => state.activeProfile.showStreamingServices;
export const selectMovies = (state: RootState) => state.activeProfile.movies;
export const selectMovieGenres = (state: RootState) => state.activeProfile.movieGenres;
export const selectMovieStreamingServices = (state: RootState) => state.activeProfile.movieStreamingServices;
export const selectNextEpsiodes = (state: RootState) => state.activeProfile.nextWatchEpisodes;
export const selectRecentMovies = (state: RootState) => state.activeProfile.recentMovies;
export const selectUpcomingMovies = (state: RootState) => state.activeProfile.upcomingMovies;
export const selectActiveProfileLoading = (state: RootState) => state.activeProfile.loading;
export const selectActiveProfileError = (state: RootState) => state.activeProfile.error;

export const selectShowByTMDBId = createSelector(
  [selectShows, (state: RootState, tmdbId: number) => tmdbId],
  (shows = [], tmdbId) => {
    return shows.find((show) => show.tmdb_id === tmdbId);
  },
);

export const selectMovieByTMDBId = createSelector(
  [selectMovies, (state: RootState, tmdbId: number) => tmdbId],
  (movies = [], tmdbId) => {
    return movies.find((movie) => movie.tmdb_id === tmdbId);
  },
);

export const selectMoviesByIds = createSelector(
  [selectMovies, (state: RootState, movieIds: MovieIds[]) => movieIds],
  (movies = [], movieIds = []) => {
    const selectedMovies: Movie[] = [];
    movieIds.forEach((movieId) => {
      const movie = movies.find((movie) => movie.movie_id === Number(movieId.movie_id));
      if (movie) {
        selectedMovies.push(movie);
      }
    });
    return selectedMovies;
  },
);

export const selectShowWatchCounts = createSelector([selectShows], (shows = []) => {
  const watched = shows.filter((show) => show.watch_status === 'WATCHED').length;
  const notWatched = shows.filter((show) => show.watch_status === 'NOT_WATCHED').length;
  const watching = shows.filter((show) => show.watch_status === 'WATCHING').length;
  return { watched, watching, notWatched };
});

export const selectMovieWatchCounts = createSelector([selectMovies], (movies = []) => {
  const watched = movies.filter((movie) => movie.watch_status === 'WATCHED').length;
  const notWatched = movies.filter((movie) => movie.watch_status === 'NOT_WATCHED').length;
  const watching = movies.filter((movie) => movie.watch_status === 'WATCHING').length;
  return { watched, watching, notWatched };
});

export default activeProfileSlice.reducer;
