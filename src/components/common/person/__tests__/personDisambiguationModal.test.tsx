import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PersonDisambiguationModal } from '../personDisambiguationModal';
import { renderWithProviders } from '../../../../app/testUtils';
import * as personSearchSlice from '../../../../app/slices/personSearchSlice';
import { PersonSearch, PersonSearchResult } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((path: string, size?: string) => `https://image.tmdb.org/t/p/${size || 'original'}${path || ''}`),
}));

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn(() => false); // Default to large screen
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mockUseMediaQuery(),
}));

describe('PersonDisambiguationModal', () => {
  const mockResults: PersonSearchResult[] = [
    {
      id: 31,
      name: 'Tom Hanks',
      profileImage: '/tom-hanks.jpg',
      department: 'Acting',
      popularity: 85.5,
      knownFor: ['Forrest Gump', 'Cast Away', 'Toy Story'],
    },
    {
      id: 32,
      name: 'Tom Hardy',
      profileImage: '/tom-hardy.jpg',
      department: 'Acting',
      popularity: 75.2,
      knownFor: ['Inception', 'Mad Max', 'Venom'],
    },
    {
      id: 33,
      name: 'Tom Cruise',
      profileImage: '/tom-cruise.jpg',
      department: 'Acting',
      popularity: 95.8,
      knownFor: ['Top Gun', 'Mission: Impossible', 'Jerry Maguire'],
    },
  ];

  const mockSelectedPerson: PersonSearch = {
    tmdbId: 31,
    id: 31,
    name: 'Tom Hanks',
    profileImage: '/tom-hanks.jpg',
    department: 'Acting',
    popularity: 85.5,
    knownFor: ['Forrest Gump', 'Cast Away', 'Toy Story'],
    biography: 'Biography text',
    birthday: '1956-07-09',
    birthplace: 'Concord, California, USA',
    deathday: undefined,
  };

  const mockState = {
    personSearch: {
      results: mockResults,
      selectedPerson: mockSelectedPerson,
      alternativePersons: [],
      autoSelectedConfidence: 'high' as const,
      query: 'actor',
      showDisambiguation: true,
      loading: false,
      error: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dialog behavior', () => {
    it('should render dialog when open is true', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      const closedState = {
        personSearch: {
          ...mockState.personSearch,
          showDisambiguation: false,
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: closedState,
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog title', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByText('Who did you mean?')).toBeInTheDocument();
    });

    it('should dispatch toggleDisambiguation when clicking close icon', async () => {
      const user = userEvent.setup();
      const dispatchSpy = jest.spyOn(personSearchSlice, 'toggleDisambiguation');

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should dispatch toggleDisambiguation when clicking Cancel button', async () => {
      const user = userEvent.setup();
      const dispatchSpy = jest.spyOn(personSearchSlice, 'toggleDisambiguation');

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('rendering results list', () => {
    it('should render all search results', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
      expect(screen.getByText('Tom Hardy')).toBeInTheDocument();
      expect(screen.getByText('Tom Cruise')).toBeInTheDocument();
    });

    it('should render department chips', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      const actingChips = screen.getAllByText('Acting');
      expect(actingChips).toHaveLength(3);
    });

    it('should render popularity values', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByText(/Popularity: 85.5/)).toBeInTheDocument();
      expect(screen.getByText(/Popularity: 75.2/)).toBeInTheDocument();
      expect(screen.getByText(/Popularity: 95.8/)).toBeInTheDocument();
    });

    it('should render known for text', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByText(/Known for: Forrest Gump, Cast Away, Toy Story/)).toBeInTheDocument();
      expect(screen.getByText(/Known for: Inception, Mad Max, Venom/)).toBeInTheDocument();
      expect(screen.getByText(/Known for: Top Gun, Mission: Impossible, Jerry Maguire/)).toBeInTheDocument();
    });

    it('should render profile images', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      const images = screen.getAllByRole('img', { hidden: true });
      expect(images.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('selected person', () => {
    it('should show Selected chip for currently selected person', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByText('Selected')).toBeInTheDocument();
    });

    it('should not show Selected chip for non-selected persons', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      const selectedChips = screen.getAllByText('Selected');
      expect(selectedChips).toHaveLength(1);
    });

    it('should mark selected person in the list', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      // Selected chip proves the selected person is marked
      expect(screen.getByText('Selected')).toBeInTheDocument();
    });
  });

  describe('person selection', () => {
    it('should dispatch fetchPersonDetails when clicking a person', async () => {
      const user = userEvent.setup();
      const dispatchSpy = jest.spyOn(personSearchSlice, 'fetchPersonDetails');

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      // Find the button by looking for the parent ListItemButton
      const tomHardyName = screen.getByText('Tom Hardy');
      const listItemButton = tomHardyName.closest('[role="button"]');
      await user.click(listItemButton!);

      expect(dispatchSpy).toHaveBeenCalledWith(32);
    });

    it('should dispatch toggleDisambiguation when selecting a person', async () => {
      const user = userEvent.setup();
      const dispatchSpy = jest.spyOn(personSearchSlice, 'toggleDisambiguation');

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      const tomCruiseName = screen.getByText('Tom Cruise');
      const listItemButton = tomCruiseName.closest('[role="button"]');
      await user.click(listItemButton!);

      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('department colors', () => {
    it('should apply primary color for Acting department', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      const actingChips = screen.getAllByText('Acting');
      const firstChip = actingChips[0].closest('.MuiChip-root');
      expect(firstChip).toHaveClass('MuiChip-colorPrimary');
    });

    it('should apply secondary color for Directing department', () => {
      const directingState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              department: 'Directing',
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: directingState,
      });

      const directingChip = screen.getByText('Directing').closest('.MuiChip-root');
      expect(directingChip).toHaveClass('MuiChip-colorSecondary');
    });

    it('should apply success color for Production department', () => {
      const productionState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              department: 'Production',
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: productionState,
      });

      const productionChip = screen.getByText('Production').closest('.MuiChip-root');
      expect(productionChip).toHaveClass('MuiChip-colorSuccess');
    });

    it('should apply info color for Writing department', () => {
      const writingState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              department: 'Writing',
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: writingState,
      });

      const writingChip = screen.getByText('Writing').closest('.MuiChip-root');
      expect(writingChip).toHaveClass('MuiChip-colorInfo');
    });

    it('should apply default color for unknown department', () => {
      const unknownState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              department: 'Sound',
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: unknownState,
      });

      const soundChip = screen.getByText('Sound').closest('.MuiChip-root');
      expect(soundChip).toHaveClass('MuiChip-colorDefault');
    });

    it('should handle case-insensitive department matching', () => {
      const mixedCaseState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              department: 'ACTING',
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mixedCaseState,
      });

      const actingChip = screen.getByText('ACTING').closest('.MuiChip-root');
      expect(actingChip).toHaveClass('MuiChip-colorPrimary');
    });
  });

  describe('formatKnownFor function', () => {
    it('should render first 3 known for titles', () => {
      const manyTitles = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              knownFor: ['Title 1', 'Title 2', 'Title 3', 'Title 4', 'Title 5'],
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: manyTitles,
      });

      expect(screen.getByText(/Known for: Title 1, Title 2, Title 3/)).toBeInTheDocument();
      expect(screen.queryByText(/Title 4/)).not.toBeInTheDocument();
    });

    it('should not render known for section if empty array', () => {
      const noKnownFor = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              knownFor: [],
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: noKnownFor,
      });

      expect(screen.queryByText(/Known for:/)).not.toBeInTheDocument();
    });

    it('should handle less than 3 titles', () => {
      const fewTitles = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              knownFor: ['Title A', 'Title B'],
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: fewTitles,
      });

      expect(screen.getByText(/Known for: Title A, Title B/)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render empty state when no results', () => {
      const emptyState = {
        personSearch: {
          ...mockState.personSearch,
          results: [],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: emptyState,
      });

      expect(screen.getByText('No people found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search terms/)).toBeInTheDocument();
    });

    it('should not render list when results are empty', () => {
      const emptyState = {
        personSearch: {
          ...mockState.personSearch,
          results: [],
        },
      };

      const { container } = renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: emptyState,
      });

      const listItems = container.querySelectorAll('.MuiListItem-root');
      expect(listItems).toHaveLength(0);
    });
  });

  describe('responsive behavior', () => {
    it('should use useMediaQuery to determine fullScreen', () => {
      mockUseMediaQuery.mockReturnValue(false);

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      // Dialog renders regardless of screen size
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render dialog on small screens', () => {
      mockUseMediaQuery.mockReturnValue(true);

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      // Dialog renders with fullScreen prop on small screens
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing profile images', () => {
      const noImageState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              profileImage: '',
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: noImageState,
      });

      // Component should still render even with missing profile image
      expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      const longNameState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              name: 'This is a very long name that goes on and on and on and on',
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: longNameState,
      });

      expect(screen.getByText(/This is a very long name/)).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const specialCharsState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              name: "O'Brien & Smith-Jones",
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: specialCharsState,
      });

      expect(screen.getByText("O'Brien & Smith-Jones")).toBeInTheDocument();
    });

    it('should handle zero popularity', () => {
      const zeroPopularityState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              popularity: 0,
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: zeroPopularityState,
      });

      expect(screen.getByText(/Popularity: 0.0/)).toBeInTheDocument();
    });

    it('should handle very high popularity', () => {
      const highPopularityState = {
        personSearch: {
          ...mockState.personSearch,
          results: [
            {
              ...mockResults[0],
              popularity: 999.999,
            },
          ],
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: highPopularityState,
      });

      expect(screen.getByText(/Popularity: 1000.0/)).toBeInTheDocument();
    });

    it('should handle no selected person', () => {
      const noSelectedState = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: null,
        },
      };

      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: noSelectedState,
      });

      expect(screen.queryByText('Selected')).not.toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render Dialog component', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render all person names in the list', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
      expect(screen.getByText('Tom Hardy')).toBeInTheDocument();
      expect(screen.getByText('Tom Cruise')).toBeInTheDocument();
    });

    it('should render department chips for each result', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      const actingChips = screen.getAllByText('Acting');
      expect(actingChips).toHaveLength(3);
    });

    it('should render popularity for each person', () => {
      renderWithProviders(<PersonDisambiguationModal />, {
        preloadedState: mockState,
      });

      expect(screen.getByText(/Popularity: 85.5/)).toBeInTheDocument();
      expect(screen.getByText(/Popularity: 75.2/)).toBeInTheDocument();
      expect(screen.getByText(/Popularity: 95.8/)).toBeInTheDocument();
    });
  });
});
