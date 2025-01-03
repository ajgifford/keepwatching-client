import axiosInstance from '../../app/api/axiosInstance';
import { Movie } from '../../app/model/movies';
import { generateGenreFilterValues, generateStreamingServiceFilterValues } from '../constants/filters';
import { WatchStatus } from '../model/watchStatus';
import { RootState } from '../store';
import { logout } from './authSlice';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

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

export const fetchForProfile = createAsyncThunk(
  'movies/fetchForProfile',
  async (profileId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/profiles/${profileId}/movies`);
      const responseMovies: Movie[] = response.data.results;
      responseMovies.sort((a, b) => {
        const watchedOrder = { NOT_WATCHED: 1, WATCHING: 2, WATCHED: 3 };
        const aWatched = watchedOrder[a.watched];
        const bWatched = watchedOrder[b.watched];
        if (aWatched !== bWatched) {
          return aWatched - bWatched;
        }
        return a.title.localeCompare(b.title);
      });
      return { profileId, movies: responseMovies };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateStatus = createAsyncThunk(
  'movies/updateStatus',
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

export const addFavorite = createAsyncThunk(
  'movies/addFavorite',
  async ({ profileId, movieId }: { profileId: number; movieId: number }, { getState, rejectWithValue }) => {
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
      .addCase(fetchForProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForProfile.fulfilled, (state, action) => {
        const { profileId, movies } = action.payload;
        state.moviesByProfile[profileId] = movies;
        state.genresByProfile[profileId] = generateGenreFilterValues(movies);
        state.streamingServicesByProfile[profileId] = generateStreamingServiceFilterValues(movies);
        state.loading = false;
      })
      .addCase(fetchForProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load movies';
      })
      .addCase(addFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        const { profileId, movie } = action.payload;
        if (state.moviesByProfile[profileId]) {
          state.moviesByProfile[profileId].push(movie);
          const movies = state.moviesByProfile[profileId];
          state.genresByProfile[profileId] = generateGenreFilterValues(movies);
          state.streamingServicesByProfile[profileId] = generateStreamingServiceFilterValues(movies);
        }
        state.loading = false;
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add a favorite';
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        const { profileId, movieId, status } = action.payload;
        const profileMovies = state.moviesByProfile[profileId];
        if (profileMovies) {
          const movie = profileMovies.find((m) => m.movie_id === movieId);
          if (movie) {
            movie.watched = status;
          }
        }
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update movie status';
      });
  },
});

export const selectMoviesByProfile = (state: RootState) => state.movies.moviesByProfile;
export const selectGenresByProfile = (state: RootState) => state.movies.genresByProfile;
export const selectStreamingServicesByProfile = (state: RootState) => state.movies.streamingServicesByProfile;
export const selectMoviesLoading = (state: RootState) => state.movies.loading;
export const selectMoviesError = (state: RootState) => state.movies.error;

export default moviesSlice.reducer;
