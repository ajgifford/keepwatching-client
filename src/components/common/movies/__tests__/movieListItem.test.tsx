import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import { MovieListItem, FilterProps } from '../movieListItem';
import { renderWithProviders } from '../../../../app/testUtils';
import { ProfileMovie, WatchStatus } from '@ajgifford/keepwatching-types';
import * as activeProfileSlice from '../../../../app/slices/activeProfileSlice';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((path: string) => `https://image.tmdb.org/t/p/original${path}`),
}));

jest.mock('../../../utility/contentUtility', () => ({
  calculateRuntimeDisplay: jest.fn((runtime: number) => {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
  }),
}));

jest.mock('../../../utility/watchStatusUtility', () => ({
  WatchStatusIcon: ({ status }: any) => <div data-testid="watch-status-icon">{status}</div>,
  getWatchStatusAction: (status: string) => {
    if (status === 'Watched') return 'Mark as Unwatched';
    return 'Mark as Watched';
  },
}));

jest.mock('../../controls/optionalTooltipControl', () => ({
  OptionalTooltipControl: ({ children, title, disabled }: any) => (
    <div data-testid="optional-tooltip" data-title={title} data-disabled={disabled}>
      {children}
    </div>
  ),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn(() => false); // Default to large screen
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mockUseMediaQuery(),
}));

describe('MovieListItem', () => {
  const mockMovie: ProfileMovie = {
    id: 1,
    tmdbId: 278,
    title: 'The Shawshank Redemption',
    posterImage: '/shawshank.jpg',
    backdropImage: '/shawshank-backdrop.jpg',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    releaseDate: '1994-09-23',
    runtime: 142,
    genres: 'Drama, Crime',
    streamingServices: 'Netflix, Hulu',
    watchStatus: WatchStatus.NOT_WATCHED as any,
    isFavorite: true,
    userRating: 9.3,
    profileId: 1,
    mpaRating: 'R',
  };

  const mockGetFilters = jest.fn((): FilterProps => ({
    genre: 'Drama',
    streamingService: 'Netflix',
    watchStatus: ['Not Watched'],
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render movie title', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
    });

    it('should render movie poster', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const poster = screen.getByAltText('The Shawshank Redemption');
      expect(poster).toBeInTheDocument();
      expect(poster).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original/shawshank.jpg');
    });

    it('should render movie description', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Two imprisoned men bond over a number of years/)).toBeInTheDocument();
    });

    it('should render genres', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Drama, Crime/)).toBeInTheDocument();
    });

    it('should render streaming services', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Netflix, Hulu/)).toBeInTheDocument();
    });

    it('should render release date', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText(/1994-09-23/)).toBeInTheDocument();
    });

    it('should render MPA rating', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getAllByText(/R/)[0]).toBeInTheDocument();
    });

    it('should render runtime', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText(/2h 22m/)).toBeInTheDocument();
    });

    it('should render TBD for missing release date', () => {
      const movieWithoutDate = { ...mockMovie, releaseDate: '' };

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={movieWithoutDate} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText(/TBD/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should render as clickable list item', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const listItem = container.querySelector('.MuiListItem-root');
      expect(listItem).toBeInTheDocument();
    });
  });

  describe('remove favorite', () => {
    it('should dispatch removeMovieFavorite when clicking star button', async () => {
      const user = userEvent.setup();
      const dispatchSpy = jest.spyOn(activeProfileSlice, 'removeMovieFavorite');

      const { store } = renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const favoriteButton = screen.getByRole('button', { name: /Remove Favorite/i });
      await user.click(favoriteButton);

      expect(dispatchSpy).toHaveBeenCalledWith({
        profileId: 1,
        movieId: 1,
      });
    });

    it('should stop propagation when clicking favorite button', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const favoriteButton = screen.getByRole('button', { name: /Remove Favorite/i });
      await user.click(favoriteButton);

      // Navigation should not be called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('watch status', () => {
    it('should display correct watch status icon', () => {
      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const statusIcon = screen.getByTestId('watch-status-icon');
      expect(statusIcon).toHaveTextContent(WatchStatus.NOT_WATCHED);
    });

    it('should dispatch updateMovieWatchStatus when toggling watch status', async () => {
      const user = userEvent.setup();
      const dispatchSpy = jest.spyOn(activeProfileSlice, 'updateMovieWatchStatus');

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const watchStatusButton = screen.getAllByRole('button')[1]; // Second button (first is favorite)
      await user.click(watchStatusButton);

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith({
          profileId: 1,
          movieId: 1,
          status: WatchStatus.WATCHED,
        });
      });
    });

    it('should toggle from watched to unwatched', async () => {
      const user = userEvent.setup();
      const watchedMovie = { ...mockMovie, watchStatus: WatchStatus.WATCHED as any };
      const dispatchSpy = jest.spyOn(activeProfileSlice, 'updateMovieWatchStatus');

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={watchedMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const watchStatusButton = screen.getAllByRole('button')[1];
      await user.click(watchStatusButton);

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith({
          profileId: 1,
          movieId: 1,
          status: WatchStatus.NOT_WATCHED,
        });
      });
    });

    it('should disable watch status button for unaired movies', () => {
      const unairedMovie = { ...mockMovie, watchStatus: WatchStatus.UNAIRED as any };

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={unairedMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const watchStatusButton = screen.getAllByRole('button')[1];
      expect(watchStatusButton).toBeDisabled();
    });

    it('should stop propagation when clicking watch status button', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const watchStatusButton = screen.getAllByRole('button')[1];
      await user.click(watchStatusButton);

      // Navigation should not be called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('responsive behavior', () => {
    it('should not show expand/collapse button on large screens', () => {
      // Mock useMediaQuery to return false (large screen)
      mockUseMediaQuery.mockReturnValue(false);

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('should show "Show More" button on small screens', () => {
      // Mock useMediaQuery to return true (small screen)
      mockUseMediaQuery.mockReturnValue(true);

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText('Show More')).toBeInTheDocument();
    });

    it('should toggle to "Show Less" when clicking "Show More"', async () => {
      const user = userEvent.setup();
      mockUseMediaQuery.mockReturnValue(true);

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const showMoreButton = screen.getByText('Show More');
      await user.click(showMoreButton);

      expect(screen.getByText('Show Less')).toBeInTheDocument();
      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
    });

    it('should toggle back to "Show More" when clicking "Show Less"', async () => {
      const user = userEvent.setup();
      mockUseMediaQuery.mockReturnValue(true);

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const showMoreButton = screen.getByText('Show More');
      await user.click(showMoreButton);

      const showLessButton = screen.getByText('Show Less');
      await user.click(showLessButton);

      expect(screen.getByText('Show More')).toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('should stop propagation when clicking expand button', async () => {
      const user = userEvent.setup();
      mockUseMediaQuery.mockReturnValue(true);

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={mockMovie} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      const showMoreButton = screen.getByText('Show More');
      await user.click(showMoreButton);

      // Navigation should not be called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle movie with missing description', () => {
      const movieWithoutDesc = { ...mockMovie, description: '' };

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={movieWithoutDesc} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
    });

    it('should handle movie with missing MPA rating', () => {
      const movieWithoutRating = { ...mockMovie, mpaRating: undefined };

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={movieWithoutRating as any} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
    });

    it('should handle profileId as string', () => {
      const movieWithStringProfile = { ...mockMovie, profileId: '5' as any };

      renderWithProviders(
        <BrowserRouter>
          <MovieListItem movie={movieWithStringProfile} getFilters={mockGetFilters} />
        </BrowserRouter>
      );

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
    });
  });
});
