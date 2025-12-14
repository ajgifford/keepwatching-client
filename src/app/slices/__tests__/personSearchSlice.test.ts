import axiosInstance from '../../api/axiosInstance';
import { PERSON_SEARCH_CONFIG, PersonSearchDetails } from '../../model/personSearchTypes';
import { createMockStore } from '../../testUtils';
import {
  clearPersonSearch,
  fetchPersonDetails,
  resetPage,
  searchPeople,
  selectAlternativePersons,
  selectAutoSelectedConfidence,
  selectPerson,
  selectPersonSearchError,
  selectPersonSearchHasMore,
  selectPersonSearchLoading,
  selectPersonSearchPage,
  selectPersonSearchQuery,
  selectPersonSearchResults,
  selectSelectedPerson,
  selectShowDisambiguation,
  setQuery,
  toggleDisambiguation,
} from '../personSearchSlice';
import { PersonSearchResult, SearchPersonCredit } from '@ajgifford/keepwatching-types';

// Mock axios
jest.mock('../../api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('personSearchSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPersonResult: PersonSearchResult = {
    id: 1,
    name: 'Tom Hanks',
    profileImage: 'tom.jpg',
    knownFor: ['Forrest Gump', 'Cast Away'],
    department: 'Acting',
    popularity: 25.5,
  };

  const mockPersonDetails: PersonSearchDetails = {
    id: 1,
    name: 'Tom Hanks',
    profileImage: 'tom.jpg',
    knownFor: ['Forrest Gump', 'Cast Away'],
    department: 'Acting',
    popularity: 25.5,
    biography: 'An American actor and filmmaker.',
    birthday: '1956-07-09',
    birthplace: 'Concord, California, USA',
    deathday: '',
    movieCredits: [],
    tvCredits: [],
    totalCredits: 0,
  };

  describe('searchPeople', () => {
    it('should search people successfully with high confidence auto-selection', async () => {
      const highPopularityPerson = { ...mockPersonResult, popularity: 20.0 };
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          results: [highPopularityPerson, { ...mockPersonResult, id: 2, name: 'Other Person' }],
          totalResults: 2,
        },
      });

      const store = createMockStore();
      await store.dispatch(searchPeople({ searchString: 'Tom Hanks', page: 1 }));

      const state = store.getState().personSearch;
      expect(state.loading).toBe(false);
      expect(selectPersonSearchResults(store.getState())).toHaveLength(2);
      expect(selectSelectedPerson(store.getState())).toEqual(highPopularityPerson);
      expect(selectAutoSelectedConfidence(store.getState())).toBe('high');
      expect(selectShowDisambiguation(store.getState())).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should auto-select with high confidence for single result', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          results: [mockPersonResult],
          totalResults: 1,
        },
      });

      const store = createMockStore();
      await store.dispatch(searchPeople({ searchString: 'Tom Hanks', page: 1 }));

      const state = store.getState().personSearch;
      expect(selectAutoSelectedConfidence(store.getState())).toBe('high');
      expect(selectSelectedPerson(store.getState())).toEqual(mockPersonResult);
    });

    it('should calculate medium confidence and auto-select', async () => {
      const mediumPopularityPerson = { ...mockPersonResult, popularity: 7.0 };
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          results: [mediumPopularityPerson, { ...mockPersonResult, id: 2, popularity: 3.0 }],
          totalResults: 2,
        },
      });

      const store = createMockStore();
      await store.dispatch(searchPeople({ searchString: 'Someone', page: 1 }));

      const state = store.getState().personSearch;
      expect(selectAutoSelectedConfidence(store.getState())).toBe('medium');
      expect(selectSelectedPerson(store.getState())).toEqual(mediumPopularityPerson);
      expect(selectShowDisambiguation(store.getState())).toBe(false);
    });

    it('should calculate low confidence and show disambiguation', async () => {
      const lowPopularityPerson = { ...mockPersonResult, popularity: 2.0 };
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          results: [lowPopularityPerson, { ...mockPersonResult, id: 2, popularity: 1.5 }],
          totalResults: 2,
        },
      });

      const store = createMockStore();
      await store.dispatch(searchPeople({ searchString: 'Unknown Person', page: 1 }));

      const state = store.getState().personSearch;
      expect(selectAutoSelectedConfidence(store.getState())).toBe('low');
      expect(selectSelectedPerson(store.getState())).toBeNull();
      expect(selectShowDisambiguation(store.getState())).toBe(true);
      expect(selectAlternativePersons(store.getState())).toHaveLength(2);
    });

    it('should apply exact match boost to confidence calculation', async () => {
      const person = { ...mockPersonResult, name: 'Tom Hanks', popularity: 3.0 };
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          results: [person, { ...mockPersonResult, id: 2, name: 'Tom Hardy' }],
          totalResults: 2,
        },
      });

      const store = createMockStore();
      await store.dispatch(searchPeople({ searchString: 'Tom Hanks', page: 1 }));

      const state = store.getState().personSearch;
      // 3.0 * 2.0 (EXACT_MATCH_BOOST) * 1.5 (ACTOR_DEPARTMENT_BOOST) = 9.0 > 5.0 (MEDIUM threshold)
      expect(selectAutoSelectedConfidence(store.getState())).toBe('medium');
      expect(selectSelectedPerson(store.getState())).toEqual(person);
    });

    it('should apply actor department boost to confidence calculation', async () => {
      const actor = { ...mockPersonResult, department: 'Acting', popularity: 4.0 };
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          results: [actor, { ...mockPersonResult, id: 2 }],
          totalResults: 2,
        },
      });

      const store = createMockStore();
      await store.dispatch(searchPeople({ searchString: 'Someone', page: 1 }));

      const state = store.getState().personSearch;
      // 4.0 * 1.5 (ACTOR_DEPARTMENT_BOOST) = 6.0 > 5.0 (MEDIUM threshold)
      expect(selectAutoSelectedConfidence(store.getState())).toBe('medium');
    });

    it('should handle pagination by appending results', async () => {
      const initialResults = [mockPersonResult];
      const paginatedResults = [{ ...mockPersonResult, id: 2, name: 'Person 2' }];

      // Set up store with existing results from page 1
      const store = createMockStore({
        personSearch: {
          query: 'Tom',
          results: initialResults,
          selectedPerson: mockPersonResult as PersonSearchDetails,
          alternativePersons: [],
          showDisambiguation: false,
          autoSelectedConfidence: 'high',
          loading: false,
          error: null,
          page: 2, // Already on page 2 to prevent clearing
          totalResults: 10,
          hasMore: true,
        },
      });

      // Load page 2
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { results: paginatedResults, totalResults: 10 },
      });

      await store.dispatch(searchPeople({ searchString: 'Tom', page: 2 }));

      const state = store.getState().personSearch;
      expect(selectPersonSearchResults(store.getState())).toHaveLength(2);
      expect(state.page).toBe(2);
      expect(selectPersonSearchHasMore(store.getState())).toBe(true);
    });

    it('should set hasMore to false when all results are loaded', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          results: [mockPersonResult],
          totalResults: 1,
        },
      });

      const store = createMockStore();
      await store.dispatch(searchPeople({ searchString: 'Tom Hanks', page: 1 }));

      const state = store.getState().personSearch;
      expect(selectPersonSearchHasMore(store.getState())).toBe(false);
    });

    it('should handle search error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'Search failed' } },
      });

      const store = createMockStore();
      await store.dispatch(searchPeople({ searchString: 'Tom Hanks' }));

      const state = store.getState().personSearch;
      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });

    it('should clear results when starting new search (page 1)', async () => {
      const store = createMockStore({
        personSearch: {
          query: 'old query',
          results: [mockPersonResult],
          selectedPerson: mockPersonDetails,
          alternativePersons: [],
          showDisambiguation: false,
          autoSelectedConfidence: 'high',
          loading: false,
          error: null,
          page: 1,
          totalResults: 1,
          hasMore: false,
        },
      });

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          results: [{ ...mockPersonResult, id: 99, name: 'New Person' }],
          totalResults: 1,
        },
      });

      await store.dispatch(searchPeople({ searchString: 'New Search', page: 1 }));

      const state = store.getState().personSearch;
      expect(state.query).toBe('New Search');
      expect(selectPersonSearchResults(store.getState())).toHaveLength(1);
      expect(selectPersonSearchResults(store.getState())[0].id).toBe(99);
    });
  });

  describe('fetchPersonDetails', () => {
    it('should fetch person details and credits successfully', async () => {
      const mockCastCredit: SearchPersonCredit = {
        tmdbId: 1,
        title: 'Forrest Gump',
        mediaType: 'movie',
        releaseDate: '1994-07-06',
        posterPath: 'poster.jpg',
        character: 'Forrest Gump',
        job: '',
        department: '',
        isCast: true,
      };

      const mockCrewCredit: SearchPersonCredit = {
        tmdbId: 2,
        title: 'Band of Brothers',
        mediaType: 'tv',
        releaseDate: '2001-09-09',
        posterPath: 'poster2.jpg',
        character: '',
        job: 'Producer',
        department: 'Production',
        isCast: false,
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce({
          data: { person: mockPersonDetails },
        })
        .mockResolvedValueOnce({
          data: {
            credits: {
              cast: [mockCastCredit],
              crew: [mockCrewCredit],
            },
          },
        });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: { id: 1, accountId: 1, name: 'Profile', avatar: null },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchPersonDetails(1));

      const state = store.getState().personSearch;
      expect(state.loading).toBe(false);
      expect(state.selectedPerson).toBeTruthy();
      expect(state.selectedPerson?.movieCredits).toHaveLength(1);
      expect(state.selectedPerson?.tvCredits).toHaveLength(1);
      expect(state.error).toBeNull();
    });

    it('should merge cast and crew credits for the same movie', async () => {
      const castCredit: SearchPersonCredit = {
        tmdbId: 1,
        title: 'The Green Mile',
        mediaType: 'movie',
        releaseDate: '1999-12-10',
        posterPath: 'poster.jpg',
        character: 'Paul Edgecomb',
        job: '',
        department: '',
        isCast: true,
      };

      const crewCredit: SearchPersonCredit = {
        tmdbId: 1,
        title: 'The Green Mile',
        mediaType: 'movie',
        releaseDate: '1999-12-10',
        posterPath: 'poster.jpg',
        character: '',
        job: 'Executive Producer',
        department: 'Production',
        isCast: false,
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce({
          data: { person: mockPersonDetails },
        })
        .mockResolvedValueOnce({
          data: {
            credits: {
              cast: [castCredit],
              crew: [crewCredit],
            },
          },
        });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: { id: 1, accountId: 1, name: 'Profile', avatar: null },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchPersonDetails(1));

      const state = store.getState().personSearch;
      expect(state.selectedPerson?.movieCredits).toHaveLength(1);
      const mergedCredit = state.selectedPerson?.movieCredits[0];
      expect(mergedCredit?.job).toBe('Paul Edgecomb, Executive Producer');
      expect(mergedCredit?.isCast).toBe(true);
    });

    it('should sort credits by release date (newest first)', async () => {
      const oldCredit: SearchPersonCredit = {
        tmdbId: 1,
        title: 'Old Movie',
        mediaType: 'movie',
        releaseDate: '1990-01-01',
        posterPath: 'old.jpg',
        character: 'Character',
        job: '',
        department: '',
        isCast: true,
      };

      const newCredit: SearchPersonCredit = {
        tmdbId: 2,
        title: 'New Movie',
        mediaType: 'movie',
        releaseDate: '2023-01-01',
        posterPath: 'new.jpg',
        character: 'Character',
        job: '',
        department: '',
        isCast: true,
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce({
          data: { person: mockPersonDetails },
        })
        .mockResolvedValueOnce({
          data: {
            credits: {
              cast: [oldCredit, newCredit],
              crew: [],
            },
          },
        });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: { id: 1, accountId: 1, name: 'Profile', avatar: null },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchPersonDetails(1));

      const state = store.getState().personSearch;
      expect(state.selectedPerson?.movieCredits[0].title).toBe('New Movie');
      expect(state.selectedPerson?.movieCredits[1].title).toBe('Old Movie');
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(fetchPersonDetails(1));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('should handle error when no active profile found', async () => {
      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(fetchPersonDetails(1));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No active profile found' });
    });

    it('should handle fetch error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch person' } },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: { id: 1, accountId: 1, name: 'Profile', avatar: null },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchPersonDetails(1));

      const state = store.getState().personSearch;
      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('reducers', () => {
    it('should set query', () => {
      const store = createMockStore();
      store.dispatch(setQuery('Tom Hanks'));

      expect(selectPersonSearchQuery(store.getState())).toBe('Tom Hanks');
    });

    it('should select person from results', () => {
      const person2 = { ...mockPersonResult, id: 2, name: 'Person 2' };
      const person3 = { ...mockPersonResult, id: 3, name: 'Person 3' };

      const store = createMockStore({
        personSearch: {
          query: 'test',
          results: [mockPersonResult, person2, person3],
          selectedPerson: null,
          alternativePersons: [],
          showDisambiguation: true,
          autoSelectedConfidence: 'low',
          loading: false,
          error: null,
          page: 1,
          totalResults: 3,
          hasMore: false,
        },
      });

      store.dispatch(selectPerson(2));

      const state = store.getState().personSearch;
      expect(state.selectedPerson?.id).toBe(2);
      expect(selectShowDisambiguation(store.getState())).toBe(false);
      expect(selectAlternativePersons(store.getState())).toHaveLength(2);
      expect(selectAlternativePersons(store.getState()).find((p) => p.id === 2)).toBeUndefined();
    });

    it('should toggle disambiguation', () => {
      const store = createMockStore({
        personSearch: {
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
        },
      });

      store.dispatch(toggleDisambiguation());
      expect(selectShowDisambiguation(store.getState())).toBe(true);

      store.dispatch(toggleDisambiguation());
      expect(selectShowDisambiguation(store.getState())).toBe(false);
    });

    it('should clear person search', () => {
      const store = createMockStore({
        personSearch: {
          query: 'Tom Hanks',
          results: [mockPersonResult],
          selectedPerson: mockPersonDetails,
          alternativePersons: [{ ...mockPersonResult, id: 2 }],
          showDisambiguation: true,
          autoSelectedConfidence: 'medium',
          loading: false,
          error: 'Some error',
          page: 2,
          totalResults: 10,
          hasMore: true,
        },
      });

      store.dispatch(clearPersonSearch());

      const state = store.getState().personSearch;
      expect(state.query).toBe('');
      expect(state.results).toHaveLength(0);
      expect(state.selectedPerson).toBeNull();
      expect(state.alternativePersons).toHaveLength(0);
      expect(state.showDisambiguation).toBe(false);
      expect(state.autoSelectedConfidence).toBe('high');
      expect(state.page).toBe(1);
      expect(state.totalResults).toBe(0);
      expect(state.hasMore).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should reset page', () => {
      const store = createMockStore({
        personSearch: {
          query: 'Tom Hanks',
          results: [mockPersonResult],
          selectedPerson: null,
          alternativePersons: [],
          showDisambiguation: false,
          autoSelectedConfidence: 'high',
          loading: false,
          error: null,
          page: 3,
          totalResults: 50,
          hasMore: true,
        },
      });

      store.dispatch(resetPage());

      const state = store.getState().personSearch;
      expect(selectPersonSearchPage(store.getState())).toBe(1);
      expect(state.results).toHaveLength(0);
      expect(selectPersonSearchHasMore(store.getState())).toBe(true);
    });
  });

  describe('selectors', () => {
    const mockState = {
      personSearch: {
        query: 'Tom Hanks',
        results: [mockPersonResult],
        selectedPerson: mockPersonDetails,
        alternativePersons: [{ ...mockPersonResult, id: 2 }],
        showDisambiguation: true,
        autoSelectedConfidence: 'medium' as const,
        loading: false,
        error: 'Test error',
        page: 2,
        totalResults: 10,
        hasMore: true,
      },
    };

    it('should select query', () => {
      const store = createMockStore(mockState);
      expect(selectPersonSearchQuery(store.getState())).toBe('Tom Hanks');
    });

    it('should select results', () => {
      const store = createMockStore(mockState);
      expect(selectPersonSearchResults(store.getState())).toHaveLength(1);
    });

    it('should select selected person', () => {
      const store = createMockStore(mockState);
      expect(selectSelectedPerson(store.getState())).toEqual(mockPersonDetails);
    });

    it('should select alternative persons', () => {
      const store = createMockStore(mockState);
      expect(selectAlternativePersons(store.getState())).toHaveLength(1);
    });

    it('should select show disambiguation', () => {
      const store = createMockStore(mockState);
      expect(selectShowDisambiguation(store.getState())).toBe(true);
    });

    it('should select auto selected confidence', () => {
      const store = createMockStore(mockState);
      expect(selectAutoSelectedConfidence(store.getState())).toBe('medium');
    });

    it('should select loading', () => {
      const store = createMockStore(mockState);
      expect(selectPersonSearchLoading(store.getState())).toBe(false);
    });

    it('should select error', () => {
      const store = createMockStore(mockState);
      expect(selectPersonSearchError(store.getState())).toBe('Test error');
    });

    it('should select hasMore', () => {
      const store = createMockStore(mockState);
      expect(selectPersonSearchHasMore(store.getState())).toBe(true);
    });

    it('should select page', () => {
      const store = createMockStore(mockState);
      expect(selectPersonSearchPage(store.getState())).toBe(2);
    });
  });
});
