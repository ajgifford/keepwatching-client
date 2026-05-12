import { screen, waitFor } from '@testing-library/react';
import React from 'react';

import axiosInstance from '../../../../app/api/axiosInstance';
import { PersonSearchDetails } from '../../../../app/model/personSearchTypes';
import * as personSearchSlice from '../../../../app/slices/personSearchSlice';
import { renderWithProviders } from '../../../../app/testUtils';
import { PersonSearchTab } from '../personSearchTab';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockAxiosGet = axiosInstance.get as jest.Mock;

jest.mock('@ajgifford/keepwatching-ui', () => ({
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
}));

jest.mock('../searchEmptyState', () => ({
  SearchEmptyState: ({ searchType, isNoResults, searchQuery }: any) => (
    <div
      data-testid="search-empty-state"
      data-search-type={searchType}
      data-is-no-results={String(isNoResults)}
      data-search-query={searchQuery || ''}
    >
      SearchEmptyState
    </div>
  ),
}));

jest.mock('../../person/personConfidenceBanner', () => ({
  PersonConfidenceBanner: () => <div data-testid="person-confidence-banner">PersonConfidenceBanner</div>,
}));

jest.mock('../../person/personFilmographyDisplay', () => ({
  PersonFilmographyDisplay: ({ person }: any) => (
    <div data-testid="person-filmography-display" data-person-id={String(person.id)}>
      PersonFilmographyDisplay
    </div>
  ),
}));

jest.mock('../../person/personDisambiguationModal', () => ({
  PersonDisambiguationModal: () => <div data-testid="person-disambiguation-modal">PersonDisambiguationModal</div>,
}));

const defaultPersonSearchState = {
  personSearch: {
    results: [],
    selectedPerson: null,
    alternativePersons: [],
    autoSelectedConfidence: 'high' as const,
    query: '',
    showDisambiguation: false,
    loading: false,
    error: null,
    page: 1,
    totalResults: 0,
    hasMore: true,
  },
};

const mockSelectedPerson: PersonSearchDetails = {
  id: 31,
  name: 'Tom Hanks',
  profileImage: '/tom-hanks.jpg',
  department: 'Acting',
  popularity: 85.5,
  knownFor: ['Forrest Gump'],
  biography: 'Biography text',
  birthday: '1956-07-09',
  birthplace: 'Concord, California, USA',
  deathday: null,
  movieCredits: [],
  tvCredits: [],
  totalCredits: 0,
};

describe('PersonSearchTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosGet.mockResolvedValue({ data: { results: [], totalResults: 0 } });
  });

  describe('initial rendering', () => {
    it('should render search input with correct label', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.getByLabelText(/Search for actors, directors, writers/i)).toBeInTheDocument();
    });

    it('should render Search button', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
    });

    it('should not show clear button when search text is empty', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.queryByRole('button', { name: /clear input/i })).not.toBeInTheDocument();
    });

    it('should show SearchEmptyState in initial state', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.getByTestId('search-empty-state')).toBeInTheDocument();
    });

    it('should pass people as searchType to SearchEmptyState', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.getByTestId('search-empty-state')).toHaveAttribute('data-search-type', 'people');
    });

    it('should enable Search button when not loading', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.getByRole('button', { name: /^search$/i })).not.toBeDisabled();
    });
  });

  describe('search input interactions', () => {
    it('should update search text as user types', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      const input = screen.getByLabelText(/Search for actors/i);
      await user.type(input, 'Tom Hanks');

      expect(input).toHaveValue('Tom Hanks');
    });

    it('should show clear button when text is entered', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      await user.type(screen.getByLabelText(/Search for actors/i), 'Tom');

      expect(screen.getByRole('button', { name: /clear input/i })).toBeInTheDocument();
    });

    it('should clear text when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      const input = screen.getByLabelText(/Search for actors/i);
      await user.type(input, 'Tom Hanks');

      await user.click(screen.getByRole('button', { name: /clear input/i }));

      expect(input).toHaveValue('');
    });

    it('should hide clear button after clearing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      await user.type(screen.getByLabelText(/Search for actors/i), 'Tom');
      await user.click(screen.getByRole('button', { name: /clear input/i }));

      expect(screen.queryByRole('button', { name: /clear input/i })).not.toBeInTheDocument();
    });

    it('should not dispatch search actions when text is empty and Search is clicked', async () => {
      const user = userEvent.setup();
      const clearSpy = jest.spyOn(personSearchSlice, 'clearPersonSearch');

      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(clearSpy).not.toHaveBeenCalled();
    });

    it('should trigger search when Enter key is pressed in the input', async () => {
      const user = userEvent.setup();
      const clearSpy = jest.spyOn(personSearchSlice, 'clearPersonSearch');

      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      const input = screen.getByLabelText(/Search for actors/i);
      await user.type(input, 'Tom Hanks');
      await user.keyboard('{Enter}');

      expect(clearSpy).toHaveBeenCalled();
    });

    it('should not trigger search when other keys are pressed', async () => {
      const user = userEvent.setup();
      const clearSpy = jest.spyOn(personSearchSlice, 'clearPersonSearch');

      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      const input = screen.getByLabelText(/Search for actors/i);
      await user.type(input, 'Tom');
      await user.keyboard('{Escape}');

      expect(clearSpy).not.toHaveBeenCalled();
    });
  });

  describe('search dispatch', () => {
    it('should dispatch clearPersonSearch when search is triggered', async () => {
      const user = userEvent.setup();
      const clearSpy = jest.spyOn(personSearchSlice, 'clearPersonSearch');

      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      await user.type(screen.getByLabelText(/Search for actors/i), 'Tom Hanks');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(clearSpy).toHaveBeenCalled();
    });

    it('should dispatch searchPeople with search string and page 1', async () => {
      const user = userEvent.setup();
      const searchSpy = jest.spyOn(personSearchSlice, 'searchPeople');

      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      await user.type(screen.getByLabelText(/Search for actors/i), 'Tom Hanks');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(searchSpy).toHaveBeenCalledWith({ searchString: 'Tom Hanks', page: 1 });
    });

    it('should dispatch clearPersonSearch before searchPeople', async () => {
      const user = userEvent.setup();
      const clearSpy = jest.spyOn(personSearchSlice, 'clearPersonSearch');
      const searchSpy = jest.spyOn(personSearchSlice, 'searchPeople');

      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      await user.type(screen.getByLabelText(/Search for actors/i), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(clearSpy).toHaveBeenCalled();
      expect(searchSpy).toHaveBeenCalled();
      expect(clearSpy.mock.invocationCallOrder[0]).toBeLessThan(searchSpy.mock.invocationCallOrder[0]);
    });
  });

  describe('loading state', () => {
    it('should show LoadingComponent when loading with no selected person and no results', () => {
      const loadingState = {
        personSearch: { ...defaultPersonSearchState.personSearch, loading: true },
      };

      renderWithProviders(<PersonSearchTab />, { preloadedState: loadingState });

      expect(screen.getByTestId('loading-component')).toBeInTheDocument();
    });

    it('should disable Search button when loading', () => {
      const loadingState = {
        personSearch: { ...defaultPersonSearchState.personSearch, loading: true },
      };

      renderWithProviders(<PersonSearchTab />, { preloadedState: loadingState });

      expect(screen.getByRole('button', { name: /^search$/i })).toBeDisabled();
    });

    it('should not show LoadingComponent when selectedPerson exists even while loading', () => {
      const loadingWithPersonState = {
        personSearch: {
          ...defaultPersonSearchState.personSearch,
          loading: true,
          selectedPerson: mockSelectedPerson,
        },
      };

      renderWithProviders(<PersonSearchTab />, { preloadedState: loadingWithPersonState });

      expect(screen.queryByTestId('loading-component')).not.toBeInTheDocument();
    });

    it('should not show LoadingComponent when results exist even while loading', () => {
      const loadingWithResultsState = {
        personSearch: {
          ...defaultPersonSearchState.personSearch,
          loading: true,
          results: [
            { id: 31, name: 'Tom Hanks', profileImage: '', department: 'Acting', popularity: 80, knownFor: [] },
          ],
        },
      };

      renderWithProviders(<PersonSearchTab />, { preloadedState: loadingWithResultsState });

      expect(screen.queryByTestId('loading-component')).not.toBeInTheDocument();
    });
  });

  describe('selected person state', () => {
    const selectedPersonState = {
      personSearch: {
        ...defaultPersonSearchState.personSearch,
        selectedPerson: mockSelectedPerson,
      },
    };

    it('should show PersonConfidenceBanner when selectedPerson exists', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: selectedPersonState });
      expect(screen.getByTestId('person-confidence-banner')).toBeInTheDocument();
    });

    it('should show PersonFilmographyDisplay with the selected person', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: selectedPersonState });
      const display = screen.getByTestId('person-filmography-display');
      expect(display).toBeInTheDocument();
      expect(display).toHaveAttribute('data-person-id', '31');
    });

    it('should show PersonDisambiguationModal alongside selected person', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: selectedPersonState });
      expect(screen.getByTestId('person-disambiguation-modal')).toBeInTheDocument();
    });

    it('should not show SearchEmptyState when selectedPerson exists', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: selectedPersonState });
      expect(screen.queryByTestId('search-empty-state')).not.toBeInTheDocument();
    });

    it('should not show LoadingComponent when selectedPerson exists', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: selectedPersonState });
      expect(screen.queryByTestId('loading-component')).not.toBeInTheDocument();
    });
  });

  describe('disambiguation state', () => {
    it('should show PersonDisambiguationModal when showDisambiguation is true', () => {
      const disambiguationState = {
        personSearch: {
          ...defaultPersonSearchState.personSearch,
          showDisambiguation: true,
          results: [
            { id: 31, name: 'Tom Hanks', profileImage: '', department: 'Acting', popularity: 80, knownFor: [] },
          ],
        },
      };

      renderWithProviders(<PersonSearchTab />, { preloadedState: disambiguationState });

      expect(screen.getByTestId('person-disambiguation-modal')).toBeInTheDocument();
    });

    it('should not show SearchEmptyState when disambiguation is shown', () => {
      const disambiguationState = {
        personSearch: {
          ...defaultPersonSearchState.personSearch,
          showDisambiguation: true,
          results: [
            { id: 31, name: 'Tom Hanks', profileImage: '', department: 'Acting', popularity: 80, knownFor: [] },
          ],
        },
      };

      renderWithProviders(<PersonSearchTab />, { preloadedState: disambiguationState });

      expect(screen.queryByTestId('search-empty-state')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error Alert when personError is set', () => {
      const errorState = {
        personSearch: {
          ...defaultPersonSearchState.personSearch,
          error: 'Failed to search people',
        },
      };

      renderWithProviders(<PersonSearchTab />, { preloadedState: errorState });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to search people')).toBeInTheDocument();
    });

    it('should not show error Alert when no error', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show error Alert alongside SearchEmptyState', () => {
      const errorState = {
        personSearch: {
          ...defaultPersonSearchState.personSearch,
          error: 'Network error occurred',
        },
      };

      renderWithProviders(<PersonSearchTab />, { preloadedState: errorState });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('search-empty-state')).toBeInTheDocument();
    });
  });

  describe('SearchEmptyState props', () => {
    it('should pass isNoResults=false when search not performed', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.getByTestId('search-empty-state')).toHaveAttribute('data-is-no-results', 'false');
    });

    it('should pass empty searchQuery initially', () => {
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });
      expect(screen.getByTestId('search-empty-state')).toHaveAttribute('data-search-query', '');
    });

    it('should pass current searchText as searchQuery', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      await user.type(screen.getByLabelText(/Search for actors/i), 'Tom Hanks');

      expect(screen.getByTestId('search-empty-state')).toHaveAttribute('data-search-query', 'Tom Hanks');
    });
  });

  describe('auto-fetch person details', () => {
    it('should dispatch fetchPersonDetails when selectedPerson lacks credits', async () => {
      const fetchSpy = jest.spyOn(personSearchSlice, 'fetchPersonDetails');

      const personWithoutCredits = {
        ...mockSelectedPerson,
        movieCredits: undefined as any,
        tvCredits: undefined as any,
        totalCredits: undefined as any,
      };

      renderWithProviders(<PersonSearchTab />, {
        preloadedState: {
          personSearch: {
            ...defaultPersonSearchState.personSearch,
            selectedPerson: personWithoutCredits,
          },
        },
      });

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(31);
      });
    });

    it('should not dispatch fetchPersonDetails when selectedPerson has all credits', async () => {
      const fetchSpy = jest.spyOn(personSearchSlice, 'fetchPersonDetails');

      renderWithProviders(<PersonSearchTab />, {
        preloadedState: {
          personSearch: {
            ...defaultPersonSearchState.personSearch,
            selectedPerson: mockSelectedPerson,
          },
        },
      });

      await waitFor(() => {
        expect(fetchSpy).not.toHaveBeenCalled();
      });
    });

    it('should not dispatch fetchPersonDetails when no selected person', async () => {
      const fetchSpy = jest.spyOn(personSearchSlice, 'fetchPersonDetails');

      renderWithProviders(<PersonSearchTab />, { preloadedState: defaultPersonSearchState });

      await waitFor(() => {
        expect(fetchSpy).not.toHaveBeenCalled();
      });
    });

    it('should dispatch fetchPersonDetails when totalCredits is undefined but movieCredits/tvCredits exist', async () => {
      const fetchSpy = jest.spyOn(personSearchSlice, 'fetchPersonDetails');

      const personMissingTotal = {
        ...mockSelectedPerson,
        id: 42,
        movieCredits: [],
        tvCredits: [],
        totalCredits: undefined as any,
      };

      renderWithProviders(<PersonSearchTab />, {
        preloadedState: {
          personSearch: {
            ...defaultPersonSearchState.personSearch,
            selectedPerson: personMissingTotal,
          },
        },
      });

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(42);
      });
    });
  });
});
