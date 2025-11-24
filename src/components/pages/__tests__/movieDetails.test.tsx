import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MovieDetails from '../movieDetails';
import { WatchStatus } from '@ajgifford/keepwatching-types';

// Mock dependencies
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../app/slices/activeMovieSlice', () => ({
  clearActiveMovie: jest.fn(() => ({ type: 'activeMovie/clear' })),
  fetchMovieWithDetails: jest.fn((params) => ({
    type: 'activeMovie/fetchMovieWithDetails',
    payload: params,
  })),
  selectCastMembers: jest.fn(),
  selectMovie: jest.fn(),
  selectMovieError: jest.fn(),
  selectMovieLoading: jest.fn(),
  selectRecommendedMovies: jest.fn(),
  selectSimilarMovies: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  updateMovieWatchStatus: jest.fn((params) => ({
    type: 'activeProfile/updateMovieWatchStatus',
    payload: params,
  })),
}));

jest.mock('../../common/media/mediaCard', () => ({
  MediaCard: ({ item }: { item: any }) => <div data-testid={`media-card-${item.id}`}>{item.title}</div>,
}));

jest.mock('../../common/media/scrollableMediaRow', () => ({
  ScrollableMediaRow: ({ title, items, renderItem, getItemKey = (_item: any, index: number) => index }: any) => (
    <div data-testid="scrollable-media-row">
      <h3>{title}</h3>
      {items?.map((item: any, index: number) => (
        <div key={getItemKey(item, index)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../common/movies/movieCast', () => ({
  MovieCastSection: ({ castMembers }: { castMembers: any[] }) => (
    <div data-testid="movie-cast-section">Cast: {castMembers?.length || 0}</div>
  ),
}));

jest.mock('../../common/tabs/tabPanel', () => ({
  TabPanel: ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </div>
  ),
  a11yProps: (index: number) => ({
    id: `movie-tab-${index}`,
    'aria-controls': `movie-tabpanel-${index}`,
  }),
}));

jest.mock('../../utility/watchStatusUtility', () => ({
  WatchStatusIcon: ({ status }: { status: string }) => <span data-testid="watch-status-icon">{status}</span>,
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  ErrorComponent: ({ error }: { error: string }) => <div data-testid="error-component">{error}</div>,
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
  buildTMDBImagePath: (path: string) => `https://image.tmdb.org/t/p/w500${path}`,
  formatCurrency: (value: number) => `$${value.toLocaleString()}`,
  formatRuntime: (minutes: number) => `${minutes} min`,
  formatUserRating: (rating: number) => rating?.toFixed(1) || 'N/A',
}));

const mockMovie = {
  id: 1,
  title: 'Test Movie',
  description: 'A test movie description',
  releaseDate: '2024-01-15',
  runtime: 120,
  userRating: 8.5,
  mpaRating: 'PG-13',
  backdropImage: '/backdrop.jpg',
  posterImage: '/poster.jpg',
  genres: 'Action, Adventure',
  streamingServices: 'Netflix, Hulu',
  director: 'Test Director',
  productionCompanies: 'Test Studios',
  revenue: 1000000,
  budget: 500000,
  watchStatus: WatchStatus.NOT_WATCHED,
};

const mockCastMembers = [
  { id: 1, name: 'Actor One', character: 'Character One' },
  { id: 2, name: 'Actor Two', character: 'Character Two' },
];

const mockRecommendedMovies = [
  { id: 2, title: 'Recommended Movie 1' },
  { id: 3, title: 'Recommended Movie 2' },
];

const mockSimilarMovies = [
  { id: 4, title: 'Similar Movie 1' },
  { id: 5, title: 'Similar Movie 2' },
];

const renderMovieDetails = (
  movieId = '1',
  profileId = '1',
  initialEntries = [`/movies/${movieId}/${profileId}`]
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/movies/:movieId/:profileId" element={<MovieDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('MovieDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockResolvedValue({ type: 'mock' });

    const { useAppSelector } = require('../../../app/hooks');
    const {
      selectCastMembers,
      selectMovie,
      selectMovieError,
      selectMovieLoading,
      selectRecommendedMovies,
      selectSimilarMovies,
    } = require('../../../app/slices/activeMovieSlice');

    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectMovie) return mockMovie;
      if (selector === selectCastMembers) return mockCastMembers;
      if (selector === selectRecommendedMovies) return mockRecommendedMovies;
      if (selector === selectSimilarMovies) return mockSimilarMovies;
      if (selector === selectMovieLoading) return false;
      if (selector === selectMovieError) return null;
      return null;
    });
  });

  describe('component lifecycle', () => {
    it('dispatches fetchMovieWithDetails on mount', () => {
      const { fetchMovieWithDetails } = require('../../../app/slices/activeMovieSlice');
      renderMovieDetails();

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchMovieWithDetails({ profileId: 1, movieId: 1 })
      );
    });

    it('dispatches clearActiveMovie on unmount', () => {
      const { clearActiveMovie } = require('../../../app/slices/activeMovieSlice');
      const { unmount } = renderMovieDetails();

      unmount();

      expect(mockDispatch).toHaveBeenCalledWith(clearActiveMovie());
    });
  });

  describe('loading and error states', () => {
    it('renders loading component when loading', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovieLoading } = require('../../../app/slices/activeMovieSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovieLoading) return true;
        return null;
      });

      renderMovieDetails();

      expect(screen.getByTestId('loading-component')).toBeInTheDocument();
    });

    it('renders error component when there is an error', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovieError } = require('../../../app/slices/activeMovieSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovieError) return 'Failed to load movie';
        return null;
      });

      renderMovieDetails();

      expect(screen.getByTestId('error-component')).toBeInTheDocument();
      expect(screen.getByText('Failed to load movie')).toBeInTheDocument();
    });
  });

  describe('movie information display', () => {
    it('renders movie title', () => {
      renderMovieDetails();

      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    it('renders movie description', () => {
      renderMovieDetails();

      expect(screen.getByText('A test movie description')).toBeInTheDocument();
    });

    it('renders movie release date', () => {
      renderMovieDetails();

      // The date 2024-01-15 is more than 90 days old, so it displays as year only
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    it('renders movie runtime', () => {
      renderMovieDetails();

      expect(screen.getByText('120 min')).toBeInTheDocument();
    });

    it('renders movie rating', () => {
      renderMovieDetails();

      expect(screen.getByText('8.5')).toBeInTheDocument();
    });

    it('renders MPA rating chip', () => {
      renderMovieDetails();

      expect(screen.getByText('PG-13')).toBeInTheDocument();
    });

    it('renders streaming services', () => {
      renderMovieDetails();

      expect(screen.getByText('Netflix, Hulu')).toBeInTheDocument();
    });

    it('renders director', () => {
      renderMovieDetails();

      expect(screen.getByText('Test Director')).toBeInTheDocument();
    });

    it('renders production companies', () => {
      renderMovieDetails();

      expect(screen.getByText('Test Studios')).toBeInTheDocument();
    });

    it('renders genres as chips', () => {
      renderMovieDetails();

      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
    });

    it('renders box office revenue', () => {
      renderMovieDetails();

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('renders budget', () => {
      renderMovieDetails();

      expect(screen.getByText('$500,000')).toBeInTheDocument();
    });
  });

  describe('back button navigation', () => {
    it('renders back button', () => {
      renderMovieDetails();

      expect(screen.getByLabelText('back')).toBeInTheDocument();
    });

    it('navigates to movies page when back button is clicked', () => {
      renderMovieDetails();

      const backButton = screen.getByLabelText('back');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/movies');
    });

    it('preserves genre filter in back navigation', () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/movies/1/1',
              state: { returnPath: '/movies', genre: 'Action' },
            },
          ]}
        >
          <Routes>
            <Route path="/movies/:movieId/:profileId" element={<MovieDetails />} />
          </Routes>
        </MemoryRouter>
      );

      const backButton = screen.getByLabelText('back');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/movies?genre=Action');
    });

    it('preserves streaming service filter in back navigation', () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/movies/1/1',
              state: { returnPath: '/movies', streamingService: 'Netflix' },
            },
          ]}
        >
          <Routes>
            <Route path="/movies/:movieId/:profileId" element={<MovieDetails />} />
          </Routes>
        </MemoryRouter>
      );

      const backButton = screen.getByLabelText('back');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/movies?streamingService=Netflix');
    });

    it('preserves watch status filter in back navigation', () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/movies/1/1',
              state: { returnPath: '/movies', watchStatus: 'WATCHED' },
            },
          ]}
        >
          <Routes>
            <Route path="/movies/:movieId/:profileId" element={<MovieDetails />} />
          </Routes>
        </MemoryRouter>
      );

      const backButton = screen.getByLabelText('back');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/movies?watchStatus=WATCHED');
    });

    it('navigates correctly when back button is clicked from movies page', () => {
      renderMovieDetails();

      const backButton = screen.getByLabelText('back');
      fireEvent.click(backButton);

      // Verify it navigates to the movies page
      expect(mockNavigate).toHaveBeenCalledWith('/movies');
    });
  });

  describe('watch status functionality', () => {
    it('renders watch status button', () => {
      renderMovieDetails();

      expect(screen.getByRole('button', { name: /mark as watched/i })).toBeInTheDocument();
    });

    it('shows "Mark as Watched" for unwatched movies', () => {
      renderMovieDetails();

      expect(screen.getByRole('button', { name: /mark as watched/i })).toBeInTheDocument();
    });

    it('shows "Mark Unwatched" for watched movies', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovie } = require('../../../app/slices/activeMovieSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovie) return { ...mockMovie, watchStatus: WatchStatus.WATCHED };
        if (selector === require('../../../app/slices/activeMovieSlice').selectCastMembers)
          return mockCastMembers;
        if (selector === require('../../../app/slices/activeMovieSlice').selectRecommendedMovies)
          return mockRecommendedMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectSimilarMovies) return mockSimilarMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieLoading) return false;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieError) return null;
        return null;
      });

      renderMovieDetails();

      expect(screen.getByRole('button', { name: /mark unwatched/i })).toBeInTheDocument();
    });

    it('dispatches updateMovieWatchStatus when watch status button is clicked', async () => {
      const { updateMovieWatchStatus } = require('../../../app/slices/activeProfileSlice');
      renderMovieDetails();

      const watchButton = screen.getByRole('button', { name: /mark as watched/i });
      fireEvent.click(watchButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          updateMovieWatchStatus({
            profileId: 1,
            movieId: 1,
            status: WatchStatus.WATCHED,
          })
        );
      });
    });

    it('disables watch status button for unaired movies', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovie } = require('../../../app/slices/activeMovieSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovie) return { ...mockMovie, watchStatus: WatchStatus.UNAIRED };
        if (selector === require('../../../app/slices/activeMovieSlice').selectCastMembers)
          return mockCastMembers;
        if (selector === require('../../../app/slices/activeMovieSlice').selectRecommendedMovies)
          return mockRecommendedMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectSimilarMovies) return mockSimilarMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieLoading) return false;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieError) return null;
        return null;
      });

      renderMovieDetails();

      const watchButton = screen.getByRole('button', { name: /mark as watched/i });
      expect(watchButton).toBeDisabled();
    });
  });

  describe('tab navigation', () => {
    it('renders Cast and Related Content tabs', () => {
      renderMovieDetails();

      expect(screen.getByRole('tab', { name: /cast/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /related content/i })).toBeInTheDocument();
    });

    it('displays cast section by default', () => {
      renderMovieDetails();

      expect(screen.getByTestId('movie-cast-section')).toBeVisible();
    });

    it('switches to related content tab when clicked', async () => {
      renderMovieDetails();

      const relatedContentTab = screen.getByRole('tab', { name: /related content/i });
      fireEvent.click(relatedContentTab);

      await waitFor(() => {
        const scrollableRows = screen.getAllByTestId('scrollable-media-row');
        expect(scrollableRows.length).toBeGreaterThan(0);
      });
    });

    it('displays recommended movies in related content tab', async () => {
      renderMovieDetails();

      const relatedContentTab = screen.getByRole('tab', { name: /related content/i });
      fireEvent.click(relatedContentTab);

      await waitFor(() => {
        expect(screen.getByText('Recommended Movies')).toBeInTheDocument();
        expect(screen.getByTestId('media-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('media-card-3')).toBeInTheDocument();
      });
    });

    it('displays similar movies in related content tab', async () => {
      renderMovieDetails();

      const relatedContentTab = screen.getByRole('tab', { name: /related content/i });
      fireEvent.click(relatedContentTab);

      await waitFor(() => {
        expect(screen.getByText('Similar Movies')).toBeInTheDocument();
        expect(screen.getByTestId('media-card-4')).toBeInTheDocument();
        expect(screen.getByTestId('media-card-5')).toBeInTheDocument();
      });
    });
  });

  describe('cast display', () => {
    it('renders cast section with correct count', () => {
      renderMovieDetails();

      expect(screen.getByText('Cast: 2')).toBeInTheDocument();
    });
  });

  describe('image rendering', () => {
    it('renders movie poster image', () => {
      const { container } = renderMovieDetails();

      const posterImages = container.querySelectorAll('img[alt="Test Movie"]');
      // Should have both backdrop and poster
      expect(posterImages.length).toBeGreaterThan(0);
      
      // Poster is the second image (after backdrop)
      const posterImage = posterImages[1] as HTMLImageElement;
      expect(posterImage.src).toContain('/poster.jpg');
    });

    it('renders backdrop image', () => {
      const { container } = renderMovieDetails();

      const backdropImage = container.querySelector('img[alt="Test Movie"]') as HTMLImageElement;
      expect(backdropImage).toBeInTheDocument();
      expect(backdropImage.src).toContain('/backdrop.jpg');
    });

    it('handles missing poster image with placeholder', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovie } = require('../../../app/slices/activeMovieSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovie) return { ...mockMovie, posterImage: null };
        if (selector === require('../../../app/slices/activeMovieSlice').selectCastMembers)
          return mockCastMembers;
        if (selector === require('../../../app/slices/activeMovieSlice').selectRecommendedMovies)
          return mockRecommendedMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectSimilarMovies) return mockSimilarMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieLoading) return false;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieError) return null;
        return null;
      });

      const { container } = renderMovieDetails();

      // Get the poster image (second image with alt text)
      const posterImages = container.querySelectorAll('img[alt="Test Movie"]');
      const posterImage = posterImages[1] as HTMLImageElement;
      
      fireEvent.error(posterImage);

      expect(posterImage.src).toContain('placehold.co');
    });
  });

  describe('date formatting', () => {
    it('formats recent release date as year only for dates beyond 90 days', () => {
      renderMovieDetails();

      // Since 2024-01-15 is more than 90 days old from current time (11/21/2025), it shows only year
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    it('formats release date as full date for very recent releases', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovie } = require('../../../app/slices/activeMovieSlice');

      // Use a date within last 90 days - current date is 11/21/2025
      const recentDate = '2025-11-01';

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovie) return { ...mockMovie, releaseDate: recentDate };
        if (selector === require('../../../app/slices/activeMovieSlice').selectCastMembers)
          return mockCastMembers;
        if (selector === require('../../../app/slices/activeMovieSlice').selectRecommendedMovies)
          return mockRecommendedMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectSimilarMovies) return mockSimilarMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieLoading) return false;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieError) return null;
        return null;
      });

      renderMovieDetails();

      expect(screen.getByText(recentDate)).toBeInTheDocument();
    });

    it('shows TBD for missing release date', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovie } = require('../../../app/slices/activeMovieSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovie) return { ...mockMovie, releaseDate: undefined };
        if (selector === require('../../../app/slices/activeMovieSlice').selectCastMembers)
          return mockCastMembers;
        if (selector === require('../../../app/slices/activeMovieSlice').selectRecommendedMovies)
          return mockRecommendedMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectSimilarMovies) return mockSimilarMovies;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieLoading) return false;
        if (selector === require('../../../app/slices/activeMovieSlice').selectMovieError) return null;
        return null;
      });

      renderMovieDetails();

      expect(screen.getByText('TBD')).toBeInTheDocument();
    });
  });
});
