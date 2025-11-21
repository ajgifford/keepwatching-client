import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PersonConfidenceBanner } from '../personConfidenceBanner';
import { renderWithProviders } from '../../../../app/testUtils';
import * as personSearchSlice from '../../../../app/slices/personSearchSlice';
import { PersonSearch } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((path: string) => `https://image.tmdb.org/t/p/original${path || ''}`),
}));

describe('PersonConfidenceBanner', () => {
  const mockSelectedPerson: PersonSearch = {
    tmdbId: 31,
    name: 'Tom Hanks',
    profileImage: '/tom-hanks.jpg',
    department: 'Acting',
    popularity: 85.5,
    knownFor: ['Forrest Gump', 'Cast Away', 'Toy Story', 'Saving Private Ryan', 'The Green Mile'],
    biography: 'Thomas Jeffrey Hanks is an American actor and filmmaker. Known for both his comedic and dramatic roles, he is one of the most popular and recognizable film stars worldwide.',
    birthday: '1956-07-09',
    birthplace: 'Concord, California, USA',
    deathday: undefined,
  };

  const mockState = {
    personSearch: {
      selectedPerson: mockSelectedPerson,
      alternativePersons: [],
      autoSelectedConfidence: 'high' as const,
      query: 'actor',
      showDisambiguation: false,
      loading: false,
      error: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering with selectedPerson', () => {
    it('should render person name', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    });

    it('should render department chip', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.getByText('Acting')).toBeInTheDocument();
    });

    it('should render popularity with 1 decimal place', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.getByText(/Popularity: 85.5/)).toBeInTheDocument();
    });

    it('should render profile image', () => {
      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      const avatar = container.querySelector('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original/tom-hanks.jpg');
    });

    it('should handle missing profile image', () => {
      const stateWithoutImage = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: { ...mockSelectedPerson, profileImage: '' },
        },
      };

      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: stateWithoutImage,
      });

      const avatar = container.querySelector('img');
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original');
    });
  });

  describe('confidence levels', () => {
    it('should render High confidence chip', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.getByText('High confidence')).toBeInTheDocument();
    });

    it('should render Medium confidence chip', () => {
      const mediumState = {
        personSearch: {
          ...mockState.personSearch,
          autoSelectedConfidence: 'medium' as const,
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mediumState,
      });

      expect(screen.getByText('Medium confidence')).toBeInTheDocument();
    });

    it('should render Low confidence chip', () => {
      const lowState = {
        personSearch: {
          ...mockState.personSearch,
          autoSelectedConfidence: 'low' as const,
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: lowState,
      });

      expect(screen.getByText('Low confidence')).toBeInTheDocument();
    });

    it('should not render confidence chip for unknown confidence', () => {
      const unknownState = {
        personSearch: {
          ...mockState.personSearch,
          autoSelectedConfidence: null as any,
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: unknownState,
      });

      expect(screen.queryByText(/confidence/)).not.toBeInTheDocument();
    });

    it('should apply success color for high confidence', () => {
      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      const chip = screen.getByText('High confidence').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorSuccess');
    });

    it('should apply info color for medium confidence', () => {
      const mediumState = {
        personSearch: {
          ...mockState.personSearch,
          autoSelectedConfidence: 'medium' as const,
        },
      };

      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mediumState,
      });

      const chip = screen.getByText('Medium confidence').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorInfo');
    });

    it('should apply warning color for low confidence', () => {
      const lowState = {
        personSearch: {
          ...mockState.personSearch,
          autoSelectedConfidence: 'low' as const,
        },
      };

      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: lowState,
      });

      const chip = screen.getByText('Low confidence').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorWarning');
    });
  });

  describe('knownFor text', () => {
    it('should render first 3 known for titles', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.getByText(/Known for: Forrest Gump, Cast Away, Toy Story/)).toBeInTheDocument();
    });

    it('should not include 4th and 5th titles', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.queryByText(/Saving Private Ryan/)).not.toBeInTheDocument();
      expect(screen.queryByText(/The Green Mile/)).not.toBeInTheDocument();
    });

    it('should handle less than 3 known for titles', () => {
      const shortKnownFor = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            knownFor: ['Movie A', 'Movie B'],
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: shortKnownFor,
      });

      expect(screen.getByText(/Known for: Movie A, Movie B/)).toBeInTheDocument();
    });

    it('should not render known for section if empty', () => {
      const noKnownFor = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            knownFor: [],
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: noKnownFor,
      });

      expect(screen.queryByText(/Known for:/)).not.toBeInTheDocument();
    });

    it('should not render known for section if undefined', () => {
      const noKnownFor = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            knownFor: undefined,
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: noKnownFor,
      });

      expect(screen.queryByText(/Known for:/)).not.toBeInTheDocument();
    });
  });

  describe('biography', () => {
    it('should render biography', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.getByText(/Thomas Jeffrey Hanks is an American actor/)).toBeInTheDocument();
    });

    it('should not render biography section if empty', () => {
      const noBiography = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            biography: '',
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: noBiography,
      });

      expect(screen.queryByText(/Thomas Jeffrey Hanks/)).not.toBeInTheDocument();
    });

    it('should not render biography section if undefined', () => {
      const noBiography = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            biography: undefined,
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: noBiography,
      });

      expect(screen.queryByText(/Thomas Jeffrey Hanks/)).not.toBeInTheDocument();
    });
  });

  describe('personal details', () => {
    it('should render birthday', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.getByText(/Born:/)).toBeInTheDocument();
    });

    it('should format birthday as locale date string', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      const expectedDate = new Date('1956-07-09').toLocaleDateString();
      expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();
    });

    it('should render birthplace', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.getByText(/Birthplace: Concord, California, USA/)).toBeInTheDocument();
    });

    it('should render deathday if present', () => {
      const withDeathday = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            deathday: '2020-01-01',
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: withDeathday,
      });

      expect(screen.getByText(/Died:/)).toBeInTheDocument();
      const expectedDate = new Date('2020-01-01').toLocaleDateString();
      expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();
    });

    it('should not render birthday if undefined', () => {
      const noBirthday = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            birthday: undefined,
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: noBirthday,
      });

      expect(screen.queryByText(/Born:/)).not.toBeInTheDocument();
    });

    it('should not render birthplace if undefined', () => {
      const noBirthplace = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            birthplace: undefined,
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: noBirthplace,
      });

      expect(screen.queryByText(/Birthplace:/)).not.toBeInTheDocument();
    });

    it('should not render deathday if undefined', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.queryByText(/Died:/)).not.toBeInTheDocument();
    });
  });

  describe('alternatives section', () => {
    it('should render See other results button when alternatives exist', () => {
      const withAlternatives = {
        personSearch: {
          ...mockState.personSearch,
          alternativePersons: [
            { tmdbId: 1, name: 'Other Person 1', department: 'Acting', popularity: 50 } as PersonSearch,
            { tmdbId: 2, name: 'Other Person 2', department: 'Acting', popularity: 40 } as PersonSearch,
          ],
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: withAlternatives,
      });

      expect(screen.getByText(/Not who you're looking for\? See other actors/)).toBeInTheDocument();
    });

    it('should show correct count with plural people', () => {
      const withAlternatives = {
        personSearch: {
          ...mockState.personSearch,
          alternativePersons: [
            { tmdbId: 1, name: 'Other Person 1' } as PersonSearch,
            { tmdbId: 2, name: 'Other Person 2' } as PersonSearch,
          ],
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: withAlternatives,
      });

      expect(screen.getByText('2 other people found')).toBeInTheDocument();
    });

    it('should show singular person for 1 alternative', () => {
      const withOneAlternative = {
        personSearch: {
          ...mockState.personSearch,
          alternativePersons: [{ tmdbId: 1, name: 'Other Person' } as PersonSearch],
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: withOneAlternative,
      });

      expect(screen.getByText('1 other person found')).toBeInTheDocument();
    });

    it('should not render alternatives section when no alternatives', () => {
      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      expect(screen.queryByText(/Not who you're looking for/)).not.toBeInTheDocument();
      expect(screen.queryByText(/other/)).not.toBeInTheDocument();
    });

    it('should use query in button text', () => {
      const withAlternatives = {
        personSearch: {
          ...mockState.personSearch,
          query: 'director',
          alternativePersons: [{ tmdbId: 1, name: 'Other Person' } as PersonSearch],
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: withAlternatives,
      });

      expect(screen.getByText(/See other directors/)).toBeInTheDocument();
    });

    it('should dispatch toggleDisambiguation when clicking See other button', async () => {
      const user = userEvent.setup();
      const dispatchSpy = jest.spyOn(personSearchSlice, 'toggleDisambiguation');

      const withAlternatives = {
        personSearch: {
          ...mockState.personSearch,
          alternativePersons: [{ tmdbId: 1, name: 'Other Person' } as PersonSearch],
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: withAlternatives,
      });

      const button = screen.getByRole('button', { name: /Not who you're looking for/i });
      await user.click(button);

      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('null selectedPerson', () => {
    it('should return null when selectedPerson is null', () => {
      const nullState = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: null,
        },
      };

      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: nullState,
      });

      expect(container.firstChild).toBeNull();
    });
  });

  describe('layout and styling', () => {
    it('should render Paper component', () => {
      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      const paper = container.querySelector('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
    });

    it('should render Avatar component', () => {
      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();
    });

    it('should render department Chip', () => {
      const { container } = renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: mockState,
      });

      const chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBeGreaterThanOrEqual(2); // Department + confidence
    });
  });

  describe('edge cases', () => {
    it('should handle zero popularity', () => {
      const zeroPopularity = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            popularity: 0,
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: zeroPopularity,
      });

      expect(screen.getByText(/Popularity: 0/)).toBeInTheDocument();
    });

    it('should handle undefined popularity', () => {
      const undefinedPopularity = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            popularity: undefined,
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: undefinedPopularity,
      });

      expect(screen.getByText(/Popularity: 0/)).toBeInTheDocument();
    });

    it('should handle very long biography', () => {
      const longBiography = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            biography:
              'This is a very long biography that goes on and on and on. '.repeat(20) + 'More text here.',
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: longBiography,
      });

      expect(screen.getByText(/This is a very long biography/)).toBeInTheDocument();
    });

    it('should handle special characters in name', () => {
      const specialChars = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            name: "O'Brien & Smith-Jones",
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: specialChars,
      });

      expect(screen.getByText("O'Brien & Smith-Jones")).toBeInTheDocument();
    });

    it('should handle very high popularity', () => {
      const highPopularity = {
        personSearch: {
          ...mockState.personSearch,
          selectedPerson: {
            ...mockSelectedPerson,
            popularity: 999.999,
          },
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: highPopularity,
      });

      expect(screen.getByText(/Popularity: 1000.0/)).toBeInTheDocument();
    });

    it('should handle empty query', () => {
      const withAlternatives = {
        personSearch: {
          ...mockState.personSearch,
          query: '',
          alternativePersons: [{ tmdbId: 1, name: 'Other Person' } as PersonSearch],
        },
      };

      renderWithProviders(<PersonConfidenceBanner />, {
        preloadedState: withAlternatives,
      });

      expect(screen.getByText(/See other s/)).toBeInTheDocument();
    });
  });
});
