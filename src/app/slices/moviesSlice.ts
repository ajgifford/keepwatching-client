import axiosInstance from '../../app/api/axiosInstance';
import { Movie } from '../../app/model/movies';
import { generateGenreFilterValues, generateStreamingServiceFilterValues } from '../constants/filters';
import { WatchStatus } from '../model/watchStatus';
import { RootState } from '../store';
import { logout } from './authSlice';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

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

export const fetchMoviesForProfile = createAsyncThunk('movies/fetchMoviesForProfile', async (profileId: number) => {
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
});

export const updateMovieStatus = createAsyncThunk(
  'movies/updateMovieStatus',
  async ({ profileId, movieId, status }: { profileId: number; movieId: number; status: WatchStatus }) => {
    await axiosInstance.put(`/api/profiles/${profileId}/movies/watchStatus`, {
      movie_id: movieId,
      status: status,
    });
    return { profileId, movieId, status };
  },
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    addMovie: (state, action: PayloadAction<{ profileId: number; movie: Movie }>) => {
      const { profileId, movie } = action.payload;
      if (state.moviesByProfile[profileId]) {
        state.moviesByProfile[profileId].push(movie);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
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
      .addCase(updateMovieStatus.fulfilled, (state, action) => {
        const { profileId, movieId, status } = action.payload;
        const profileMovies = state.moviesByProfile[profileId];
        if (profileMovies) {
          const movie = profileMovies.find((m) => m.movie_id === movieId);
          if (movie) {
            movie.watched = status;
          }
        }
      })
      .addCase(updateMovieStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update movie status';
      });
  },
});

export const { addMovie } = moviesSlice.actions;
export const selectMoviesByProfile = (state: RootState) => state.movies.moviesByProfile;
export const selectGenresByProfile = (state: RootState) => state.movies.genresByProfile;
export const selectStreamingServicesByProfile = (state: RootState) => state.movies.streamingServicesByProfile;
export const selectMoviesLoading = (state: RootState) => state.movies.loading;
export const selectMoviesError = (state: RootState) => state.movies.error;

export default moviesSlice.reducer;
