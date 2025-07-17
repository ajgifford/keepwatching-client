// src/app/slices/personSearchSlice.ts
import axiosInstance from '../api/axiosInstance';
import { PERSON_SEARCH_CONFIG, PersonDetails } from '../model/personSearchTypes';
import { RootState } from '../store';
import {
  PersonSearchResponse,
  PersonSearchResult,
  SearchPersonCredit,
  SearchPersonCreditsResponse,
  SearchPersonResponse,
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
  async (params: { searchString: string; page?: number }, { rejectWithValue }) => {
    try {
      const { searchString, page = 1 } = params;
      const response = await axiosInstance.get<PersonSearchResponse>('/search/people', {
        params: { searchString, page },
      });

      return {
        results: response.data.results,
        totalResults: response.data.totalResults,
        page: params.page || 1,
        searchString: params.searchString,
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

// Thunk to fetch detailed person information
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

      // Fetch person details
      const personResponse = await axiosInstance.get<SearchPersonResponse>(
        `/accounts/${accountId}/profiles/${profileId}/tmdbPerson/${personId}`
      );
      const person = personResponse.data.person;

      // Fetch credits
      const creditsResponse = await axiosInstance.get<SearchPersonCreditsResponse>(
        `/accounts/${accountId}/profiles/${profileId}/tmdbPerson/${personId}/credits`
      );
      const credits = creditsResponse.data.credits;

      const castCredits = credits.cast.map((credit) => ({
        ...credit,
        isCast: true,
      }));

      const crewCredits = credits.crew.map((credit) => ({
        ...credit,
        isCast: false,
      }));

      const creditMap = new Map<string, SearchPersonCredit>();

      // Process all credits
      [...castCredits, ...crewCredits].forEach((credit) => {
        const key = `${credit.tmdbId}-${credit.mediaType}`;

        if (creditMap.has(key)) {
          // Merge roles for the same movie/show
          const existing = creditMap.get(key)!;

          // Collect all crew jobs (excluding character names)
          const existingJobs: string[] = [];
          if (existing.job && existing.job.trim() && !existing.isCast) {
            existingJobs.push(
              ...existing.job
                .split(', ')
                .map((j) => j.trim())
                .filter(Boolean)
            );
          }

          // Add new crew job if this is a crew credit
          if (credit.job && credit.job.trim() && !credit.isCast) {
            const newJob = credit.job.trim();
            if (!existingJobs.includes(newJob)) {
              existingJobs.push(newJob);
            }
          }

          // Handle character information - prefer cast character
          let finalCharacter = existing.character;
          if (credit.isCast && credit.character) {
            finalCharacter = credit.character;
          } else if (!finalCharacter && credit.character) {
            finalCharacter = credit.character;
          }

          // Create final job field that combines character and crew roles appropriately
          let finalJob = '';
          if (finalCharacter && existingJobs.length > 0) {
            // Both character and crew jobs exist - combine them
            finalJob = `${finalCharacter}, ${existingJobs.join(', ')}`;
          } else if (finalCharacter) {
            // Only character exists (cast only)
            finalJob = finalCharacter;
          } else if (existingJobs.length > 0) {
            // Only crew jobs exist
            finalJob = existingJobs.join(', ');
          }

          creditMap.set(key, {
            ...existing,
            job: finalJob,
            character: finalCharacter,
            // Prefer cast over crew for priority
            isCast: existing.isCast || credit.isCast,
          });
        } else {
          // First time seeing this credit - set up job field for display
          let displayJob = '';
          if (credit.character) {
            displayJob = credit.character;
          } else if (credit.job) {
            displayJob = credit.job;
          }

          creditMap.set(key, {
            ...credit,
            job: displayJob, // This will be used by convertCreditToMediaItem
          });
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
  const normalizedQuery = query.replace(/\+/g, ' ').toLowerCase().trim();
  const normalizedName = topResult.name.toLowerCase().trim();
  const isExactMatch = normalizedName === normalizedQuery;
  const isActor = topResult.department.toLowerCase() === 'acting';

  let confidenceScore = topResult.popularity;
  if (isExactMatch) confidenceScore *= PERSON_SEARCH_CONFIG.EXACT_MATCH_BOOST;
  if (isActor) confidenceScore *= PERSON_SEARCH_CONFIG.ACTOR_DEPARTMENT_BOOST;

  let confidence: 'high' | 'medium' | 'low';
  if (results.length === 1) {
    confidence = 'high';
  } else if (confidenceScore >= PERSON_SEARCH_CONFIG.HIGH_CONFIDENCE_POPULARITY) {
    confidence = 'high';
  } else if (confidenceScore >= PERSON_SEARCH_CONFIG.MEDIUM_CONFIDENCE_POPULARITY) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  const alternatives = results.length > 1 ? results : [];
  const selectedPerson = confidence !== 'low' ? topResult : null;

  return {
    selectedPerson,
    confidence,
    alternatives,
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

        const allResults = state.results;
        const otherResults = allResults.filter((p) => p.id !== action.payload);
        state.alternativePersons = otherResults;
      }
    },
    toggleDisambiguation: (state) => {
      state.showDisambiguation = !state.showDisambiguation;
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

export const { setQuery, selectPerson, toggleDisambiguation, clearPersonSearch, resetPage } = personSearchSlice.actions;

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
