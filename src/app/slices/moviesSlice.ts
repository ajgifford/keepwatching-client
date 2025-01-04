import axiosInstance from '../../app/api/axiosInstance';
import { Movie } from '../../app/model/movies';
import { generateGenreFilterValues, generateStreamingServiceFilterValues } from '../constants/filters';
import { WatchStatus } from '../model/watchStatus';
import { RootState } from '../store';
import { logout } from './authSlice';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

interface MoviesState {
  moviesByProfile: { [profileId: number]: Movie[] };
  genresByProfile: { [profileId: number]: string[] };
  streamingServicesByProfile: { [profileId: number]: string[] };
  loading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  moviesByProfile: {},
  genresByProfile: {},
  streamingServicesByProfile: {},
  loading: false,
  error: null,
};

export const fetchMoviesForProfile = createAsyncThunk(
  'movies/fetchMoviesForProfile',
  async (profileId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/profiles/${profileId}/movies`);
      const responseMovies: Movie[] = response.data.results;
      return { profileId, movies: responseMovies };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateMovieStatus = createAsyncThunk(
  'movies/updateMovieStatus',
  async (
    { profileId, movieId, status }: { profileId: number; movieId: number; status: WatchStatus },
    { rejectWithValue },
  ) => {
    try {
      await axiosInstance.put(`/api/profiles/${profileId}/movies/watchStatus`, {
        movie_id: movieId,
        status: status,
      });
      return { profileId, movieId, status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const addMovieFavorite = createAsyncThunk(
  'movies/addMovieFavorite',
  async ({ profileId, movieId }: { profileId: number; movieId: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/profiles/${profileId}/movies/favorites`, {
        id: movieId,
      });
      const movie = response.data.results[0];
      return { profileId, movie };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchMoviesForProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMoviesForProfile.fulfilled, (state, action) => {
        const { profileId, movies } = action.payload;
        state.moviesByProfile[profileId] = movies;
        state.genresByProfile[profileId] = generateGenreFilterValues(movies);
        state.streamingServicesByProfile[profileId] = generateStreamingServiceFilterValues(movies);
        state.loading = false;
      })
      .addCase(fetchMoviesForProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load movies';
      })
      .addCase(addMovieFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMovieFavorite.fulfilled, (state, action) => {
        const { profileId, movie } = action.payload;
        if (state.moviesByProfile[profileId]) {
          state.moviesByProfile[profileId].push(movie);
          const movies = state.moviesByProfile[profileId];
          state.genresByProfile[profileId] = generateGenreFilterValues(movies);
          state.streamingServicesByProfile[profileId] = generateStreamingServiceFilterValues(movies);
        }
        state.loading = false;
      })
      .addCase(addMovieFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add a favorite';
      })
      .addCase(updateMovieStatus.fulfilled, (state, action) => {
        const { profileId, movieId, status } = action.payload;
        const profileMovies = state.moviesByProfile[profileId];
        if (profileMovies) {
          const movie = profileMovies.find((m) => m.movie_id === movieId);
          if (movie) {
            movie.watch_status = status;
          }
        }
      })
      .addCase(updateMovieStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update movie status';
      });
  },
});

export const selectMoviesByProfile = (state: RootState) => state.movies.moviesByProfile;
export const selectMovieGenresByProfile = (state: RootState) => state.movies.genresByProfile;
export const selectMovieStreamingServicesByProfile = (state: RootState) => state.movies.streamingServicesByProfile;
export const selectMoviesLoading = (state: RootState) => state.movies.loading;
export const selectMoviesError = (state: RootState) => state.movies.error;

export function selectMoviesByProfileId(state: RootState, profile_id: number): Movie[] {
  return state.movies.moviesByProfile[profile_id] || [];
}

export const makeSelectMovieWatchStatusCountsByProfile = () => {
  const selectWatchedAndNotWatchedCount = createSelector(
    [selectMoviesByProfile, (state: RootState, profile_id: number) => profile_id],
    (moviesByProfile, profile_id): { watched: number; notWatched: number } => {
      const movies = moviesByProfile[profile_id] || [];
      const watched = movies.filter((movie) => movie.watch_status === 'WATCHED').length;
      const notWatched = movies.filter((movie) => movie.watch_status === 'NOT_WATCHED').length;
      return { watched, notWatched };
    },
  );
  return selectWatchedAndNotWatchedCount;
};

export default moviesSlice.reducer;
