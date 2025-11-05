import axiosInstance from '../api/axiosInstance';
import { RootState } from '../store';
import { deleteAccount, logout } from './accountSlice';
import { updateMovieWatchStatus } from './activeProfileSlice';
import {
  CastMember,
  MovieDetailsResponse,
  ProfileMovieWithDetails,
  SimilarOrRecommendedMovie,
} from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

interface ActiveMovieState {
  movieDetailsLoading: boolean;
  movie: ProfileMovieWithDetails | null;
  recommendedMovies: SimilarOrRecommendedMovie[];
  similarMovies: SimilarOrRecommendedMovie[];
  castMembers: CastMember[];
  movieDetailsError: ApiErrorResponse | null;
}

const initialState: ActiveMovieState = {
  movie: null,
  similarMovies: [],
  recommendedMovies: [],
  castMembers: [],
  movieDetailsLoading: false,
  movieDetailsError: null,
};

export const fetchMovieWithDetails = createAsyncThunk<
  MovieDetailsResponse,
  { profileId: number; movieId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeMovie/fetchMovieWithDetails',
  async ({ profileId, movieId }: { profileId: number; movieId: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<MovieDetailsResponse> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}/movies/${movieId}/details`
      );

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching a movie with its details' });
    }
  }
);

const activeMovieSlice = createSlice({
  name: 'activeMovie',
  initialState,
  reducers: {
    clearActiveMovie: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        return initialState;
      })
      .addCase(deleteAccount.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchMovieWithDetails.pending, (state) => {
        state.movieDetailsLoading = true;
        state.movieDetailsError = null;
      })
      .addCase(fetchMovieWithDetails.fulfilled, (state, action) => {
        state.movie = action.payload.movie;
        state.recommendedMovies = action.payload.recommendedMovies;
        state.similarMovies = action.payload.similarMovies;
        state.castMembers = action.payload.castMembers;
        state.movieDetailsLoading = false;
        state.movieDetailsError = null;
      })
      .addCase(fetchMovieWithDetails.rejected, (state, action) => {
        state.movieDetailsLoading = false;
        state.movieDetailsError = action.payload || { message: 'Failed to load show details' };
      })
      .addCase(updateMovieWatchStatus.fulfilled, (state, action) => {
        const { movieId, status } = action.payload;
        const movie = state.movie;
        if (movie && movie.id === movieId) {
          movie.watchStatus = status;
        }
      });
  },
});

export const { clearActiveMovie } = activeMovieSlice.actions;

export const selectMovie = (state: RootState) => state.activeMovie.movie;
export const selectMovieLoading = (state: RootState) => state.activeMovie.movieDetailsLoading;
export const selectMovieError = (state: RootState) => state.activeMovie.movieDetailsError;
export const selectSimilarMovies = (state: RootState) => state.activeMovie.similarMovies;
export const selectCastMembers = (state: RootState) => state.activeMovie.castMembers;
export const selectRecommendedMovies = (state: RootState) => state.activeMovie.recommendedMovies;

export default activeMovieSlice.reducer;
