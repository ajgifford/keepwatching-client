import axiosInstance from '../api/axiosInstance';
import { generateGenreFilterValues, generateStreamingServiceFilterValues } from '../constants/filters';
import { ApiErrorResponse } from '../model/errors';
import { RootState } from '../store';
import { deleteAccount, logout } from './accountSlice';
import { fetchShowWithDetails, updateEpisodeWatchStatus, updateSeasonWatchStatus } from './activeShowSlice';
import { ActivityNotificationType, showActivityNotification } from './activityNotificationSlice';
import { editProfile, removeProfileImage, updateProfileImage } from './profilesSlice';
import {
  AddShowFavoriteResponse,
  EpisodesForProfile,
  EpisodesForProfileResponse,
  FavoriteMovieResponse,
  KeepWatchingShow,
  MovieReference,
  Profile,
  ProfileContentResponse,
  ProfileMovie,
  ProfileShow,
  ProfileShowWithSeasons,
  ProfileWithContent,
  RecentUpcomingEpisode,
  RemoveMovieResponse,
  RemoveShowFavoriteResponse,
  UpdateWatchStatusResponse,
  UserWatchStatus,
  WatchStatus,
} from '@ajgifford/keepwatching-types';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

const ACTIVE_PROFILE_KEY = 'activeProfile';

interface ActiveProfileState {
  profile: Profile | null;
  shows: ProfileShow[];
  showGenres: string[];
  showStreamingServices: string[];
  upcomingEpisodes: RecentUpcomingEpisode[];
  recentEpisodes: RecentUpcomingEpisode[];
  nextUnwatchedEpisodes: KeepWatchingShow[];
  movies: ProfileMovie[];
  movieGenres: string[];
  movieStreamingServices: string[];
  recentMovies: MovieReference[];
  upcomingMovies: MovieReference[];
  lastUpdated: string | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

const blankState: ActiveProfileState = {
  profile: null,
  shows: [],
  showGenres: [],
  showStreamingServices: [],
  upcomingEpisodes: [],
  recentEpisodes: [],
  nextUnwatchedEpisodes: [],
  movies: [],
  movieGenres: [],
  movieStreamingServices: [],
  recentMovies: [],
  upcomingMovies: [],
  lastUpdated: null,
  loading: false,
  error: null,
};

interface UpdateWatchStatus {
  show: ProfileShow;
  showWithSeasons: ProfileShowWithSeasons;
  nextUnwatchedEpisodes: KeepWatchingShow[];
}

const determineInitialState = () => {
  const data = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const localState: ActiveProfileState = data ? JSON.parse(data) : blankState;
  return localState;
};

const initialState = determineInitialState();

export const setActiveProfile = createAsyncThunk<
  ProfileWithContent,
  { accountId: number; profileId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeProfile/set',
  async ({ accountId, profileId }: { accountId: number; profileId: number }, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<ProfileContentResponse> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}`
      );
      return response.data.profileWithContent;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred loading the active profile' });
    }
  }
);

export const reloadActiveProfile = createAsyncThunk<ProfileWithContent, void, { rejectValue: ApiErrorResponse }>(
  'activeProfile/reload',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      const profileId = state.activeProfile.profile?.id;

      if (!accountId || !profileId) {
        return rejectWithValue({ message: 'No account or active profile found' });
      }

      const response: AxiosResponse<ProfileContentResponse> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}`
      );
      return response.data.profileWithContent;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred reloading the active profile' });
    }
  }
);

export const reloadProfileEpisodes = createAsyncThunk<EpisodesForProfile, void, { rejectValue: ApiErrorResponse }>(
  'activeProfile/reloadProfileEpisodes',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      const profileId = state.activeProfile.profile?.id;

      if (!accountId || !profileId) {
        return rejectWithValue({ message: 'No account or active profile found' });
      }

      const response: AxiosResponse<EpisodesForProfileResponse> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}/episodes`
      );

      return response.data.episodes;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred reloading profile episodes' });
    }
  }
);

export const addShowFavorite = createAsyncThunk<
  AddShowFavoriteResponse,
  { profileId: number; showId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeProfile/addShowFavorite',
  async ({ profileId, showId }: { profileId: number; showId: number }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<AddShowFavoriteResponse> = await axiosInstance.post(
        `/accounts/${accountId}/profiles/${profileId}/shows/favorites`,
        {
          showTMDBId: showId,
        }
      );
      const result = response.data;
      const show = response.data.addedShow;
      const showTitle = show.title;

      dispatch(
        showActivityNotification({
          message: `${showTitle} favorited`,
          type: ActivityNotificationType.Success,
        })
      );
      return result;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred adding a show favorite' });
    }
  }
);

export const updateAfterAddShowFavorite = createAsyncThunk<ProfileShow, ProfileShow, { rejectValue: ApiErrorResponse }>(
  'activeProfile/updateAfterAddShowFavorite',
  async (show: ProfileShow, { rejectWithValue }) => {
    if (show) {
      return show;
    }
    return rejectWithValue({ message: 'Error while updating show after making it a favorite' });
  }
);

export const removeShowFavorite = createAsyncThunk<
  RemoveShowFavoriteResponse,
  { profileId: number; showId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeProfile/removeShowFavorite',
  async ({ profileId, showId }: { profileId: number; showId: number }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<RemoveShowFavoriteResponse> = await axiosInstance.delete(
        `/accounts/${accountId}/profiles/${profileId}/shows/favorites/${showId}`
      );
      const result = response.data;
      const show = result.removedShowReference;
      const showTitle = show.title;

      dispatch(
        showActivityNotification({
          message: `${showTitle} removed`,
          type: ActivityNotificationType.Success,
        })
      );
      return result;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

export const updateShowWatchStatus = createAsyncThunk<
  UpdateWatchStatus,
  { profileId: number; showId: number; status: UserWatchStatus },
  { rejectValue: ApiErrorResponse }
>(
  'activeProfile/updateShowWatchStatus',
  async (
    { profileId, showId, status }: { profileId: number; showId: number; status: UserWatchStatus },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<UpdateWatchStatusResponse> = await axiosInstance.put(
        `/accounts/${accountId}/profiles/${profileId}/shows/watchStatus`,
        {
          showId: showId,
          status: status,
        }
      );

      const showWithSeasons = response.data.statusData.showWithSeasons;
      const show = toProfileShow(showWithSeasons);
      const nextUnwatchedEpisodes = response.data.statusData.nextUnwatchedEpisodes;

      return { show, showWithSeasons, nextUnwatchedEpisodes };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      console.log('Error in updateShowWatchStatus', error);
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

export const addMovieFavorite = createAsyncThunk<
  FavoriteMovieResponse,
  { profileId: number; movieId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeProfile/addMovieFavorite',
  async ({ profileId, movieId }: { profileId: number; movieId: number }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<FavoriteMovieResponse> = await axiosInstance.post(
        `/accounts/${accountId}/profiles/${profileId}/movies/favorites`,
        {
          movieTMDBId: movieId,
        }
      );

      const movie = response.data.favoritedMovie;
      const movieTitle = movie.title;

      dispatch(
        showActivityNotification({
          message: `${movieTitle} favorited`,
          type: ActivityNotificationType.Success,
        })
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred adding a movie favorite' });
    }
  }
);

export const removeMovieFavorite = createAsyncThunk<
  RemoveMovieResponse,
  { profileId: number; movieId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeProfile/removeMovieFavorite',
  async ({ profileId, movieId }: { profileId: number; movieId: number }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<RemoveMovieResponse> = await axiosInstance.delete(
        `/accounts/${accountId}/profiles/${profileId}/movies/favorites/${movieId}`
      );

      const movie = response.data.removedMovieReference;
      const movieTitle = movie.title;

      dispatch(
        showActivityNotification({
          message: `${movieTitle} removed`,
          type: ActivityNotificationType.Success,
        })
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred removing a movie favorite' });
    }
  }
);

export const updateMovieWatchStatus = createAsyncThunk<
  { movieId: number; status: UserWatchStatus },
  { profileId: number; movieId: number; status: UserWatchStatus },
  { rejectValue: ApiErrorResponse }
>(
  'activeProfile/updateMovieWatchStatus',
  async (
    { profileId, movieId, status }: { profileId: number; movieId: number; status: UserWatchStatus },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/movies/watchStatus`, {
        movieId: movieId,
        status: status,
      });
      return { movieId, status };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      console.log('Error in updateMovieWatchStatus', error);
      return rejectWithValue({ message: 'An unknown error occurred updating movie watch status' });
    }
  }
);

export const updateNextEpisodeWatchStatus = createAsyncThunk<
  UpdateWatchStatus,
  { profileId: number; episodeId: number; episodeStatus: UserWatchStatus },
  { rejectValue: ApiErrorResponse }
>(
  'activeProfile/updateNextEpisodeWatchState',
  async (
    { profileId, episodeId, episodeStatus }: { profileId: number; episodeId: number; episodeStatus: UserWatchStatus },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<UpdateWatchStatusResponse> = await axiosInstance.put(
        `/accounts/${accountId}/profiles/${profileId}/episodes/watchStatus`,
        {
          episodeId: episodeId,
          status: episodeStatus,
        }
      );

      const showWithSeasons = response.data.statusData.showWithSeasons;
      const show = toProfileShow(showWithSeasons);
      const nextUnwatchedEpisodes = response.data.statusData.nextUnwatchedEpisodes;

      return { show, showWithSeasons, nextUnwatchedEpisodes };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      console.log('Error in updateNextEpisodeWatchStatus', error);
      return rejectWithValue({ message: 'An unknown error occurred updating the next episode watch status' });
    }
  }
);

function toProfileShow(show: ProfileShowWithSeasons): ProfileShow {
  const {
    id,
    tmdbId,
    title,
    description,
    releaseDate,
    posterImage,
    backdropImage,
    userRating,
    contentRating,
    streamingServices,
    genres,
    seasonCount,
    episodeCount,
    status,
    type,
    inProduction,
    lastAirDate,
    network,
    profileId,
    watchStatus,
    lastEpisode,
    nextEpisode,
  } = show;

  return {
    id,
    tmdbId,
    title,
    description,
    releaseDate,
    posterImage,
    backdropImage,
    userRating,
    contentRating,
    streamingServices,
    genres,
    seasonCount,
    episodeCount,
    status,
    type,
    inProduction,
    lastAirDate,
    network,
    profileId,
    watchStatus,
    lastEpisode,
    nextEpisode,
  };
}

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
      .addCase(deleteAccount.fulfilled, () => {
        localStorage.removeItem(ACTIVE_PROFILE_KEY);
        return blankState;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.image = action.payload.image;
          localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
        }
      })
      .addCase(fetchShowWithDetails.fulfilled, (state, action) => {
        const show = toProfileShow(action.payload.showWithSeasons);
        const shows = state.shows;
        if (shows) {
          const index = shows.findIndex((s) => s.id === show.id);
          if (index !== -1) {
            shows[index] = show;
          }
        }
      })
      .addCase(setActiveProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setActiveProfile.fulfilled, (state, action) => {
        const { profile, shows, episodes, movies, recentUpcomingMovies } = action.payload;
        state.profile = profile;
        state.shows = shows;
        state.showGenres = generateGenreFilterValues(shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(shows);
        state.upcomingEpisodes = episodes.upcomingEpisodes;
        state.recentEpisodes = episodes.recentEpisodes;
        state.nextUnwatchedEpisodes = episodes.nextUnwatchedEpisodes;
        state.movies = movies;
        state.movieGenres = generateGenreFilterValues(movies);
        state.movieStreamingServices = generateStreamingServiceFilterValues(movies);
        state.recentMovies = recentUpcomingMovies.recentMovies;
        state.upcomingMovies = recentUpcomingMovies.upcomingMovies;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(setActiveProfile.rejected, (state, action) => {
        state.loading = false;
        state.lastUpdated = null;
        state.error = action.payload || { message: 'Failed to load active profile' };
      })
      .addCase(reloadActiveProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reloadActiveProfile.fulfilled, (state, action) => {
        const { profile, shows, episodes, movies, recentUpcomingMovies } = action.payload;
        state.profile = profile;
        state.shows = shows;
        state.showGenres = generateGenreFilterValues(shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(shows);
        state.upcomingEpisodes = episodes.upcomingEpisodes;
        state.recentEpisodes = episodes.recentEpisodes;
        state.nextUnwatchedEpisodes = episodes.nextUnwatchedEpisodes;
        state.movies = movies;
        state.movieGenres = generateGenreFilterValues(movies);
        state.movieStreamingServices = generateStreamingServiceFilterValues(movies);
        state.recentMovies = recentUpcomingMovies.recentMovies;
        state.upcomingMovies = recentUpcomingMovies.upcomingMovies;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(reloadActiveProfile.rejected, (state, action) => {
        state.loading = false;
        state.lastUpdated = null;
        state.error = action.payload || { message: 'Failed to reload active profile' };
      })
      .addCase(reloadProfileEpisodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reloadProfileEpisodes.fulfilled, (state, action) => {
        const { upcomingEpisodes, recentEpisodes, nextUnwatchedEpisodes } = action.payload;
        state.upcomingEpisodes = upcomingEpisodes;
        state.recentEpisodes = recentEpisodes;
        state.nextUnwatchedEpisodes = nextUnwatchedEpisodes;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(reloadProfileEpisodes.rejected, (state, action) => {
        state.loading = false;
        state.lastUpdated = null;
        state.error = action.payload || { message: 'Failed to reload episodes for the active profile' };
      })
      .addCase(addShowFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addShowFavorite.fulfilled, (state, action) => {
        const { addedShow, episodes } = action.payload;
        const existingShowIndex = state.shows.findIndex((show) => show.id === addedShow.id);
        if (existingShowIndex === -1) {
          state.shows.push(addedShow);
        } else {
          state.shows[existingShowIndex] = addedShow;
        }
        if (episodes) {
          if (episodes.upcomingEpisodes) {
            state.upcomingEpisodes = episodes.upcomingEpisodes;
          }
          if (episodes.recentEpisodes) {
            state.recentEpisodes = episodes.recentEpisodes;
          }
          if (episodes.nextUnwatchedEpisodes) {
            state.nextUnwatchedEpisodes = episodes.nextUnwatchedEpisodes;
          }
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
        state.error = action.payload || { message: 'Failed to add a show favorite' };
      })
      .addCase(updateAfterAddShowFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAfterAddShowFavorite.fulfilled, (state, action) => {
        const show = action.payload;
        state.shows = state.shows.map((s) => (s.id === show.id ? show : s));
        state.showGenres = generateGenreFilterValues(state.shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(state.shows);
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(updateAfterAddShowFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update active profile after adding show favorite' };
      })
      .addCase(removeShowFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeShowFavorite.fulfilled, (state, action) => {
        const { removedShowReference, episodes } = action.payload;
        state.shows = state.shows.filter((filterShow) => filterShow.id !== removedShowReference.id);
        state.showGenres = generateGenreFilterValues(state.shows);
        state.showStreamingServices = generateStreamingServiceFilterValues(state.shows);
        state.upcomingEpisodes = episodes.upcomingEpisodes;
        state.recentEpisodes = episodes.recentEpisodes;
        state.nextUnwatchedEpisodes = episodes.nextUnwatchedEpisodes;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(removeShowFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to remove a show favorite' };
      })
      .addCase(updateShowWatchStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShowWatchStatus.fulfilled, (state, action) => {
        const { show, nextUnwatchedEpisodes } = action.payload;
        const shows = state.shows;
        if (shows) {
          const index = shows.findIndex((m) => m.id === show.id);
          if (index !== -1) {
            shows[index] = show;
          }
        }
        state.nextUnwatchedEpisodes = nextUnwatchedEpisodes;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(updateShowWatchStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update show status' };
      })
      .addCase(updateSeasonWatchStatus.fulfilled, (state, action) => {
        const { showWithSeasons: show, nextUnwatchedEpisodes } = action.payload;

        const profileShow = toProfileShow(show);
        const shows = state.shows;
        if (shows) {
          const index = shows.findIndex((m) => m.id === show.id);
          if (index !== -1) {
            shows[index] = profileShow;
          }
        }

        state.nextUnwatchedEpisodes = nextUnwatchedEpisodes;
        state.lastUpdated = new Date().toLocaleString();
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(updateEpisodeWatchStatus.fulfilled, (state, action) => {
        const { showWithSeasons, nextUnwatchedEpisodes } = action.payload;

        const show = toProfileShow(showWithSeasons);
        const shows = state.shows;
        if (shows) {
          const index = shows.findIndex((s) => s.id === showWithSeasons.id);
          if (index !== -1) {
            shows[index] = show;
          }
        }

        state.nextUnwatchedEpisodes = nextUnwatchedEpisodes;
        state.lastUpdated = new Date().toLocaleString();
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(addMovieFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMovieFavorite.fulfilled, (state, action) => {
        const { favoritedMovie, recentUpcomingMovies } = action.payload;
        const existingMovieIndex = state.movies.findIndex((show) => show.id === favoritedMovie.id);
        if (existingMovieIndex === -1) {
          state.movies.push(favoritedMovie);
        } else {
          state.movies[existingMovieIndex] = favoritedMovie;
        }
        state.movieGenres = generateGenreFilterValues(state.movies);
        state.movieStreamingServices = generateStreamingServiceFilterValues(state.movies);
        state.recentMovies = recentUpcomingMovies.recentMovies;
        state.upcomingMovies = recentUpcomingMovies.upcomingMovies;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(addMovieFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to add a movie favorite' };
      })
      .addCase(removeMovieFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMovieFavorite.fulfilled, (state, action) => {
        const { removedMovieReference, recentUpcomingMovies } = action.payload;
        state.movies = state.movies.filter((filterMovie) => filterMovie.id !== removedMovieReference.id);
        state.movieGenres = generateGenreFilterValues(state.movies);
        state.movieStreamingServices = generateStreamingServiceFilterValues(state.movies);
        state.recentMovies = recentUpcomingMovies.recentMovies;
        state.upcomingMovies = recentUpcomingMovies.upcomingMovies;
        state.lastUpdated = new Date().toLocaleString();
        state.loading = false;
        state.error = null;
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(removeMovieFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to remove a movie favorite' };
      })
      .addCase(updateMovieWatchStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMovieWatchStatus.fulfilled, (state, action) => {
        const { movieId, status } = action.payload;
        const movies = state.movies;
        if (movies) {
          const movie = movies.find((m) => m.id === movieId);
          if (movie) {
            movie.watchStatus = status;
          }
        }
        state.loading = false;
        state.lastUpdated = new Date().toLocaleString();
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(updateMovieWatchStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update movie status' };
      })
      .addCase(updateNextEpisodeWatchStatus.fulfilled, (state, action) => {
        const { show, nextUnwatchedEpisodes } = action.payload;

        const shows = state.shows;
        if (shows) {
          const index = shows.findIndex((s) => s.id === show.id);
          if (index !== -1) {
            shows[index] = show;
          }
        }

        state.nextUnwatchedEpisodes = nextUnwatchedEpisodes;
        state.lastUpdated = new Date().toLocaleString();
        localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        if (state.profile && state.profile.id === action.payload.id) {
          state.profile = action.payload;
        }
      })
      .addCase(removeProfileImage.fulfilled, (state, action) => {
        if (state.profile && state.profile.id === action.payload.id) {
          state.profile.image = action.payload.image;
          localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(state));
        }
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
export const selectUpcomingEpisodes = (state: RootState) => state.activeProfile.upcomingEpisodes;
export const selectRecentEpisodes = (state: RootState) => state.activeProfile.recentEpisodes;
export const selectNextUnwatchedEpisodes = (state: RootState) => state.activeProfile.nextUnwatchedEpisodes;
export const selectRecentMovies = (state: RootState) => state.activeProfile.recentMovies;
export const selectUpcomingMovies = (state: RootState) => state.activeProfile.upcomingMovies;
export const selectActiveProfileLoading = (state: RootState) => state.activeProfile.loading;
export const selectActiveProfileError = (state: RootState) => state.activeProfile.error;

export const selectShowByTMDBId = createSelector(
  [selectShows, (state: RootState, tmdbId: number) => tmdbId],
  (shows = [], tmdbId) => {
    return shows.find((show) => show.tmdbId === tmdbId);
  }
);

export const selectMovieByTMDBId = createSelector(
  [selectMovies, (state: RootState, tmdbId: number) => tmdbId],
  (movies = [], tmdbId) => {
    return movies.find((movie) => movie.tmdbId === tmdbId);
  }
);

export const selectMoviesByIds = createSelector(
  [selectMovies, (state: RootState, movieIds: MovieReference[]) => movieIds],
  (movies = [], movieIds = []) => {
    const selectedMovies: ProfileMovie[] = [];
    movieIds.forEach((movieId) => {
      const movie = movies.find((movie) => movie.id === Number(movieId.id));
      if (movie) {
        selectedMovies.push(movie);
      }
    });
    return selectedMovies;
  }
);

export const selectShowWatchCounts = createSelector([selectShows], (shows = []) => {
  const watched = shows.filter((show) => show.watchStatus === WatchStatus.WATCHED).length;
  const notWatched = shows.filter((show) => show.watchStatus === WatchStatus.NOT_WATCHED).length;
  const watching = shows.filter((show) => show.watchStatus === WatchStatus.WATCHING).length;
  const upToDate = shows.filter((show) => show.watchStatus === WatchStatus.UP_TO_DATE).length;
  const unaired = shows.filter((show) => show.watchStatus === WatchStatus.UNAIRED).length;
  return { watched, upToDate, watching, notWatched, unaired };
});

export const selectMovieWatchCounts = createSelector([selectMovies], (movies = []) => {
  const watched = movies.filter((movie) => movie.watchStatus === WatchStatus.WATCHED).length;
  const notWatched = movies.filter((movie) => movie.watchStatus === WatchStatus.NOT_WATCHED).length;
  const unaired = movies.filter((movie) => movie.watchStatus === WatchStatus.UNAIRED).length;
  return { watched, notWatched, unaired };
});

export default activeProfileSlice.reducer;
