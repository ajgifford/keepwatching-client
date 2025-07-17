// src/app/slices/personSearchSlice.ts
import axiosInstance from '../api/axiosInstance';
import { PERSON_SEARCH_CONFIG, PersonDetails } from '../model/personSearchTypes';
import { RootState } from '../store';
import {
  PersonSearchResponse,
  PersonSearchResult,
  SearchPersonCredit,
  SearchPersonCreditsResponse,
} from '@ajgifford/keepwatching-types';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

interface PersonSearchState {
  query: string;
  results: PersonSearchResult[];
  selectedPerson: PersonDetails | null;
  alternativePersons: PersonSearchResult[];
  showDisambiguation: boolean;
  autoSelectedConfidence: 'high' | 'medium' | 'low';
  loading: boolean;
  error: string | null;
  page: number;
  totalResults: number;
  hasMore: boolean;
}

const initialState: PersonSearchState = {
  query: '',
  results: [],
  selectedPerson: null,
  alternativePersons: [],
  showDisambiguation: false,
  autoSelectedConfidence: 'high',
  loading: false,
  error: null,
  page: 1,
  totalResults: 0,
  hasMore: true,
};

// Thunk to search for people
export const searchPeople = createAsyncThunk(
  'personSearch/searchPeople',
  async (params: { searchString: string; page?: number }) => {
    const { searchString, page = 1 } = params;
    const response = await axiosInstance.get<PersonSearchResponse>('/search/people', {
      params: { searchString, page },
    });
    return { ...response.data, searchString, page };
  }
);

// Thunk to get person details and credits
export const fetchPersonDetails = createAsyncThunk(
  'personSearch/fetchPersonDetails',
  async (personId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const profileId = state.activeProfile.profile?.id;
      if (!profileId) {
        return rejectWithValue({ message: 'No active profile found' });
      }

      const [detailsResponse, creditsResponse] = await Promise.all([
        axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/tmdbPerson/${personId}`),
        axiosInstance.get<SearchPersonCreditsResponse>(
          `/accounts/${accountId}/profiles/${profileId}/tmdbPerson/${personId}/credits`
        ),
      ]);

      const person = detailsResponse.data.person;
      const credits = creditsResponse.data.credits;

      // Combine cast and crew credits
      const castCredits = credits.cast.map((credit) => ({
        ...credit,
        job: credit.character || 'Actor',
        isCast: true,
      }));
      const crewCredits = credits.crew.map((credit) => ({
        ...credit,
        isCast: false,
      }));

      // Deduplicate by tmdbId and mediaType, combining roles
      const creditMap = new Map<string, SearchPersonCredit>();

      [...castCredits, ...crewCredits].forEach((credit) => {
        const key = `${credit.tmdbId}-${credit.mediaType}`;
        const existing = creditMap.get(key);

        if (existing) {
          // Combine roles for the same movie/show
          const existingJobs = existing.job ? existing.job.split(', ') : [];
          const newJob = credit.job || '';

          if (newJob && !existingJobs.includes(newJob)) {
            existingJobs.push(newJob);
          }

          // Prefer cast over crew for character info and sorting
          creditMap.set(key, {
            ...existing,
            job: existingJobs.join(', '),
            character: existing.character || credit.character, // Keep cast character if available
            // Keep cast role priority for sorting
            isCast: existing.isCast || credit.isCast,
          });
        } else {
          creditMap.set(key, credit);
        }
      });

      // Convert back to array and sort
      const allCredits = Array.from(creditMap.values()).sort((a, b) => {
        // Sort by release date (newest first)
        const aDate = new Date(a.releaseDate || '1900-01-01');
        const bDate = new Date(b.releaseDate || '1900-01-01');
        return bDate.getTime() - aDate.getTime();
      });

      const movieCredits = allCredits.filter((credit) => credit.mediaType === 'movie');
      const tvCredits = allCredits.filter((credit) => credit.mediaType === 'tv');

      return {
        ...person,
        movieCredits,
        tvCredits,
        totalCredits: allCredits.length,
      } as PersonDetails;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching person details' });
    }
  }
);

// Helper function to determine search confidence
const calculateSearchConfidence = (
  results: PersonSearchResult[],
  query: string
): {
  selectedPerson: PersonSearchResult | null;
  confidence: 'high' | 'medium' | 'low';
  alternatives: PersonSearchResult[];
} => {
  if (results.length === 0) {
    return { selectedPerson: null, confidence: 'low', alternatives: [] };
  }

  const topResult = results[0];
  const isExactMatch = topResult.name.toLowerCase() === query.toLowerCase();
  const isActor = topResult.department.toLowerCase() === 'acting';

  // Calculate confidence score
  let confidenceScore = topResult.popularity;
  if (isExactMatch) confidenceScore *= PERSON_SEARCH_CONFIG.EXACT_MATCH_BOOST;
  if (isActor) confidenceScore *= PERSON_SEARCH_CONFIG.ACTOR_DEPARTMENT_BOOST;

  let confidence: 'high' | 'medium' | 'low';
  if (confidenceScore >= PERSON_SEARCH_CONFIG.HIGH_CONFIDENCE_POPULARITY && results.length > 1) {
    // High confidence: clear winner
    confidence = 'high';
  } else if (confidenceScore >= PERSON_SEARCH_CONFIG.MEDIUM_CONFIDENCE_POPULARITY) {
    // Medium confidence: somewhat confident
    confidence = 'medium';
  } else {
    // Low confidence: show disambiguation
    confidence = 'low';
  }

  // If low confidence or multiple highly popular results, show alternatives
  const shouldShowAlternatives =
    confidence === 'low' ||
    (results.length > 1 && results[1].popularity > PERSON_SEARCH_CONFIG.MEDIUM_CONFIDENCE_POPULARITY);

  return {
    selectedPerson: confidence !== 'low' ? topResult : null,
    confidence,
    alternatives: shouldShowAlternatives ? results.slice(1, 6) : [], // Show up to 5 alternatives
  };
};

const personSearchSlice = createSlice({
  name: 'personSearch',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    selectPerson: (state, action: PayloadAction<number>) => {
      const person = [...state.results, ...state.alternativePersons].find((p) => p.id === action.payload);
      if (person) {
        state.selectedPerson = person as PersonDetails;
        state.showDisambiguation = false;
      }
    },
    toggleDisambiguation: (state) => {
      state.showDisambiguation = !state.showDisambiguation;
    },
    dismissConfidenceBanner: (state) => {
      // User acknowledged the auto-selection, hide alternatives
      state.alternativePersons = [];
    },
    clearPersonSearch: (state) => {
      return { ...initialState };
    },
    resetPage: (state) => {
      state.page = 1;
      state.results = [];
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPeople.pending, (state) => {
        state.loading = true;
        state.error = null;
        if (state.page === 1) {
          state.results = [];
          state.selectedPerson = null;
          state.alternativePersons = [];
        }
      })
      .addCase(searchPeople.fulfilled, (state, action) => {
        state.loading = false;
        const { results, totalResults, page, searchString } = action.payload;

        if (page === 1) {
          state.results = results;
          state.query = searchString;

          const { selectedPerson, confidence, alternatives } = calculateSearchConfidence(results, searchString);

          state.autoSelectedConfidence = confidence;
          state.alternativePersons = alternatives;

          if (selectedPerson) {
            // Auto-select the person
            state.selectedPerson = selectedPerson as PersonDetails;
            state.showDisambiguation = false;
          } else {
            // No auto-selection - show disambiguation if we have results
            state.selectedPerson = null;
            state.showDisambiguation = results.length > 0; // Show modal if any results exist
          }
        } else {
          // Pagination: just append results
          state.results = [...state.results, ...results];
        }

        state.page = page;
        state.totalResults = totalResults;
        state.hasMore = results.length > 0 && state.results.length < totalResults;
      })
      .addCase(searchPeople.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search people';
      })
      .addCase(fetchPersonDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPerson = action.payload;
      })
      .addCase(fetchPersonDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch person details';
      });
  },
});

export const { setQuery, selectPerson, toggleDisambiguation, dismissConfidenceBanner, clearPersonSearch, resetPage } =
  personSearchSlice.actions;

// Selectors
export const selectPersonSearchQuery = (state: RootState) => state.personSearch.query;
export const selectPersonSearchResults = (state: RootState) => state.personSearch.results;
export const selectSelectedPerson = (state: RootState) => state.personSearch.selectedPerson;
export const selectAlternativePersons = (state: RootState) => state.personSearch.alternativePersons;
export const selectShowDisambiguation = (state: RootState) => state.personSearch.showDisambiguation;
export const selectAutoSelectedConfidence = (state: RootState) => state.personSearch.autoSelectedConfidence;
export const selectPersonSearchLoading = (state: RootState) => state.personSearch.loading;
export const selectPersonSearchError = (state: RootState) => state.personSearch.error;
export const selectPersonSearchHasMore = (state: RootState) => state.personSearch.hasMore;
export const selectPersonSearchPage = (state: RootState) => state.personSearch.page;

export default personSearchSlice.reducer;
