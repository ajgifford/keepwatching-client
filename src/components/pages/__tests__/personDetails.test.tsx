import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import PersonDetails from '../personDetails';

// Mock dependencies
const mockNavigate = jest.fn();
const mockAxiosGet = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
  },
}));

jest.mock('../../../app/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
}));

jest.mock('../../common/person/creditCard', () => ({
  CreditCard: ({ credit }: { credit: any }) => (
    <div data-testid={`credit-card-${credit.name}`}>
      {credit.name} - {credit.character}
    </div>
  ),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  ErrorComponent: ({ error }: { error: string }) => <div data-testid="error-component">{error}</div>,
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
  buildTMDBImagePath: (path: string) => `https://image.tmdb.org/t/p/w500${path}`,
}));

const mockProfile = {
  id: 1,
  accountId: 100,
  name: 'Test Profile',
  image: 'profile.jpg',
};

const mockPerson = {
  id: 1,
  name: 'John Doe',
  biography:
    'John Doe is a talented actor known for his versatile performances in both film and television. Born in Los Angeles, he began his career in theater before transitioning to screen acting.',
  birthdate: '1980-05-15',
  deathdate: null,
  gender: 2, // Male
  placeOfBirth: 'Los Angeles, California, USA',
  profileImage: '/profile.jpg',
  movieCredits: [
    {
      id: 1,
      name: 'Test Movie 1',
      character: 'Hero',
      releaseDate: '2020-01-01',
    },
    {
      id: 2,
      name: 'Test Movie 2',
      character: 'Villain',
      releaseDate: '2021-01-01',
    },
  ],
  showCredits: [
    {
      id: 3,
      name: 'Test Show 1',
      character: 'Lead Character',
      firstAirDate: '2019-01-01',
    },
    {
      id: 4,
      name: 'Test Show 2',
      character: 'Supporting',
      firstAirDate: '2022-01-01',
    },
  ],
};

const mockFemalePerson = {
  ...mockPerson,
  name: 'Jane Doe',
  gender: 1,
  birthdate: '1985-03-20',
};

const mockDeceasedPerson = {
  ...mockPerson,
  name: 'Deceased Actor',
  birthdate: '1950-01-01',
  deathdate: '2020-12-31',
};

const renderPersonDetails = (personId = '1', initialEntries = [`/person/${personId}`]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/person/:personId" element={<PersonDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PersonDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { useAppSelector } = require('../../../app/hooks');
    const { selectActiveProfile } = require('../../../app/slices/activeProfileSlice');

    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectActiveProfile) return mockProfile;
      return null;
    });

    mockAxiosGet.mockResolvedValue({
      status: 200,
      data: { person: mockPerson },
    });
  });

  describe('component lifecycle and data fetching', () => {
    it('fetches person details on mount', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/100/profiles/1/person/1');
      });
    });

    it('displays person name after data loads', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('shows loading component while fetching', async () => {
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockAxiosGet.mockReturnValue(promise);

      renderPersonDetails();

      expect(screen.getByTestId('loading-component')).toBeInTheDocument();

      resolvePromise({ status: 200, data: { person: mockPerson } });

      await waitFor(() => {
        expect(screen.queryByTestId('loading-component')).not.toBeInTheDocument();
      });
    });

    it('shows error component when fetch fails', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Failed to load'));

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByTestId('error-component')).toBeInTheDocument();
        expect(screen.getByText('Person details failed to load')).toBeInTheDocument();
      });
    });

    it('shows error when response status is not 200', async () => {
      mockAxiosGet.mockResolvedValue({
        status: 404,
        data: null,
      });

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByTestId('error-component')).toBeInTheDocument();
      });
    });
  });

  describe('person information display', () => {
    it('renders person name', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('renders biography', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText(/John Doe is a talented actor/)).toBeInTheDocument();
      });
    });

    it('renders gender chip for male', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Male')).toBeInTheDocument();
      });
    });

    it('renders gender chip for female', async () => {
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: { person: mockFemalePerson },
      });

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Female')).toBeInTheDocument();
      });
    });

    it('calculates and displays age correctly for living person', async () => {
      renderPersonDetails();

      await waitFor(() => {
        // Age should be calculated from birthdate 1980-05-15 to current date
        const ageText = screen.getByText(/Age \d+/);
        expect(ageText).toBeInTheDocument();
      });
    });

    it('calculates age correctly for deceased person', async () => {
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: { person: mockDeceasedPerson },
      });

      renderPersonDetails();

      await waitFor(() => {
        // Age should be 70 (2020 - 1950)
        expect(screen.getByText('Age 70')).toBeInTheDocument();
      });
    });

    it('renders place of birth', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Los Angeles, California, USA')).toBeInTheDocument();
      });
    });

    it('renders profile image', async () => {
      renderPersonDetails();

      await waitFor(() => {
        const image = screen.getByAltText('John Doe') as HTMLImageElement;
        expect(image).toBeInTheDocument();
        expect(image.src).toContain('/profile.jpg');
      });
    });
  });

  describe('expandable biography', () => {
    it('truncates long biography initially on mobile', async () => {
      const longBiography = 'a'.repeat(500);
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: {
          person: {
            ...mockPerson,
            biography: longBiography,
          },
        },
      });

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText(/Show More/)).toBeInTheDocument();
      });
    });

    it('expands biography when Show More is clicked', async () => {
      const longBiography = 'a'.repeat(500);
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: {
          person: {
            ...mockPerson,
            biography: longBiography,
          },
        },
      });

      renderPersonDetails();

      await waitFor(() => {
        const showMoreButton = screen.getByText(/Show More/);
        fireEvent.click(showMoreButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Show Less/)).toBeInTheDocument();
      });
    });

    it('collapses biography when Show Less is clicked', async () => {
      const longBiography = 'a'.repeat(500);
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: {
          person: {
            ...mockPerson,
            biography: longBiography,
          },
        },
      });

      renderPersonDetails();

      await waitFor(() => {
        const showMoreButton = screen.getByText(/Show More/);
        fireEvent.click(showMoreButton);
      });

      await waitFor(() => {
        const showLessButton = screen.getByText(/Show Less/);
        fireEvent.click(showLessButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Show More/)).toBeInTheDocument();
      });
    });

    it('does not show expand/collapse buttons for short biography', async () => {
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: {
          person: {
            ...mockPerson,
            biography: 'Short bio',
          },
        },
      });

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Short bio')).toBeInTheDocument();
        expect(screen.queryByText(/Show More/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Show Less/)).not.toBeInTheDocument();
      });
    });
  });

  describe('movie credits section', () => {
    it('renders movie credits heading with count', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Movie Credits (2)')).toBeInTheDocument();
      });
    });

    it('displays all movie credits', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByTestId('credit-card-Test Movie 1')).toBeInTheDocument();
        expect(screen.getByTestId('credit-card-Test Movie 2')).toBeInTheDocument();
      });
    });

    it('shows movie credit details', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1 - Hero')).toBeInTheDocument();
        expect(screen.getByText('Test Movie 2 - Villain')).toBeInTheDocument();
      });
    });
  });

  describe('TV credits section', () => {
    it('renders TV credits heading with count', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('TV Credits (2)')).toBeInTheDocument();
      });
    });

    it('displays all TV credits', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByTestId('credit-card-Test Show 1')).toBeInTheDocument();
        expect(screen.getByTestId('credit-card-Test Show 2')).toBeInTheDocument();
      });
    });

    it('shows TV credit details', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Test Show 1 - Lead Character')).toBeInTheDocument();
        expect(screen.getByText('Test Show 2 - Supporting')).toBeInTheDocument();
      });
    });
  });

  describe('back button navigation', () => {
    it('renders back button', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByLabelText('back')).toBeInTheDocument();
      });
    });

    it('navigates to movies page when back button is clicked', async () => {
      renderPersonDetails();

      await waitFor(() => {
        const backButton = screen.getByLabelText('back');
        fireEvent.click(backButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/movies');
    });

    it('uses custom return path from location state', async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/person/1',
              state: { returnPath: '/search' },
            },
          ]}
        >
          <Routes>
            <Route path="/person/:personId" element={<PersonDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const backButton = screen.getByLabelText('back');
        fireEvent.click(backButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });
  });

  describe('empty states and edge cases', () => {
    it('handles person with no movie credits', async () => {
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: {
          person: {
            ...mockPerson,
            movieCredits: [],
          },
        },
      });

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Movie Credits (0)')).toBeInTheDocument();
      });
    });

    it('handles person with no TV credits', async () => {
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: {
          person: {
            ...mockPerson,
            showCredits: [],
          },
        },
      });

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('TV Credits (0)')).toBeInTheDocument();
      });
    });

    it('does not render when profile is not available', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectActiveProfile } = require('../../../app/slices/activeProfileSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectActiveProfile) return null;
        return null;
      });

      renderPersonDetails();

      expect(mockAxiosGet).not.toHaveBeenCalled();
    });
  });

  describe('gender icon rendering', () => {
    it('renders male icon for gender 2', async () => {
      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Male')).toBeInTheDocument();
      });
    });

    it('renders female icon for gender 1', async () => {
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: { person: mockFemalePerson },
      });

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('Female')).toBeInTheDocument();
      });
    });

    it('renders person icon for unknown gender', async () => {
      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: {
          person: {
            ...mockPerson,
            gender: 0,
          },
        },
      });

      renderPersonDetails();

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('responsive behavior', () => {
    it('renders correctly in mobile view', async () => {
      // Mock useMediaQuery for mobile
      global.innerWidth = 500;

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('renders correctly in desktop view', async () => {
      // Mock useMediaQuery for desktop
      global.innerWidth = 1200;

      renderPersonDetails();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });
});
