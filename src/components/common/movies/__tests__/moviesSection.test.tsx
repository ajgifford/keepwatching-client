import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { MoviesSection } from '../moviesSection';
import { ProfileMovie, WatchStatus } from '@ajgifford/keepwatching-types';

// Mock MovieCard component
jest.mock('../movieCard', () => ({
  MovieCard: ({ movie }: { movie: ProfileMovie }) => <div data-testid="movie-card">{movie.title}</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MoviesSection', () => {
  const mockRecentMovies: ProfileMovie[] = [
    {
      id: 1,
      title: 'Fight Club',
      releaseDate: '1999-10-15',
      posterImage: '/poster1.jpg',
      backdropImage: '/backdrop1.jpg',
      description: 'A ticking-time-bomb insomniac...',
      runtime: 139,
      userRating: 8.4,
      streamingServices: 'Netflix',
      watchStatus: WatchStatus.NOT_WATCHED,
      profileId: 1,
      genres: 'Drama',
      tmdbId: 550,
      mpaRating: '',
    },
    {
      id: 2,
      title: 'Pulp Fiction',
      releaseDate: '1994-10-14',
      posterImage: '/poster2.jpg',
      backdropImage: '/backdrop2.jpg',
      description: 'The lives of two mob hitmen...',
      runtime: 154,
      userRating: 8.9,
      streamingServices: 'Amazon Prime',
      watchStatus: WatchStatus.WATCHED,
      profileId: 1,
      genres: 'Crime',
      tmdbId: 680,
      mpaRating: '',
    },
  ];

  const mockUpcomingMovies: ProfileMovie[] = [
    {
      id: 3,
      tmdbId: 123,
      title: 'Upcoming Movie 1',
      releaseDate: '2025-12-25',
      posterImage: '/poster3.jpg',
      backdropImage: '/backdrop3.jpg',
      description: 'An upcoming movie...',
      runtime: 120,
      userRating: 0,
      streamingServices: '',
      watchStatus: WatchStatus.NOT_WATCHED,
      profileId: 1,
      genres: 'Action',
      mpaRating: '',
    },
  ];

  describe('basic rendering', () => {
    it('should render recent movies section header', () => {
      renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      expect(screen.getByText('Recent Movies')).toBeInTheDocument();
      expect(screen.getByText('Released last 30 days')).toBeInTheDocument();
    });

    it('should render upcoming movies section header', () => {
      renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      expect(screen.getByText('Upcoming Movies')).toBeInTheDocument();
      expect(screen.getByText('Coming soon')).toBeInTheDocument();
    });

    it('should render movie icon for recent movies', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      const movieIcon = container.querySelector('[data-testid="MovieIcon"]');
      expect(movieIcon).toBeInTheDocument();
    });

    it('should render upcoming icon for upcoming movies', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      const upcomingIcon = container.querySelector('[data-testid="UpcomingIcon"]');
      expect(upcomingIcon).toBeInTheDocument();
    });

    it('should render both sections when both have movies', () => {
      renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />);

      expect(screen.getByText('Recent Movies')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Movies')).toBeInTheDocument();
    });
  });

  describe('movie grid with data', () => {
    it('should render recent movie cards', () => {
      renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      expect(screen.getByText('Fight Club')).toBeInTheDocument();
      expect(screen.getByText('Pulp Fiction')).toBeInTheDocument();
    });

    it('should render upcoming movie cards', () => {
      renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      expect(screen.getByText('Upcoming Movie 1')).toBeInTheDocument();
    });

    it('should render correct number of movie cards for recent movies', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(2);
    });

    it('should render correct number of movie cards for upcoming movies', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(1);
    });

    it('should render all movies from both sections', () => {
      const { container } = renderWithRouter(
        <MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />
      );

      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(3);
    });
  });

  describe('empty states', () => {
    it('should show empty message when no recent movies', () => {
      renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      expect(screen.getByText('No recent movie releases')).toBeInTheDocument();
    });

    it('should show empty message when no upcoming movies', () => {
      renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      expect(screen.getByText('No upcoming movie releases')).toBeInTheDocument();
    });

    it('should show both empty messages when no movies at all', () => {
      renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={[]} />);

      expect(screen.getByText('No recent movie releases')).toBeInTheDocument();
      expect(screen.getByText('No upcoming movie releases')).toBeInTheDocument();
    });

    it('should not render movie cards when recent movies is empty', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      // Should only have 1 movie card (from upcoming)
      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(1);
    });

    it('should not render movie cards when upcoming movies is empty', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      // Should only have 2 movie cards (from recent)
      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(2);
    });
  });

  describe('section links', () => {
    it('should link recent movies header to /movies', () => {
      renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      const links = screen.getAllByRole('link');
      const recentLink = links.find((link) => link.textContent?.includes('Recent Movies'));

      expect(recentLink).toHaveAttribute('href', '/movies');
    });

    it('should link upcoming movies header to /movies', () => {
      renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      const links = screen.getAllByRole('link');
      const upcomingLink = links.find((link) => link.textContent?.includes('Upcoming Movies'));

      expect(upcomingLink).toHaveAttribute('href', '/movies');
    });
  });

  describe('chips and badges', () => {
    it('should render secondary colored chip for recent movies', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      const secondaryChip = container.querySelector('.MuiChip-colorSecondary');
      expect(secondaryChip).toBeInTheDocument();
      expect(secondaryChip).toHaveTextContent('Released last 30 days');
    });

    it('should render warning colored chip for upcoming movies', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      const warningChip = container.querySelector('.MuiChip-colorWarning');
      expect(warningChip).toBeInTheDocument();
      expect(warningChip).toHaveTextContent('Coming soon');
    });

    it('should render outlined variant chips', () => {
      const { container } = renderWithRouter(
        <MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />
      );

      const outlinedChips = container.querySelectorAll('.MuiChip-outlined');
      expect(outlinedChips).toHaveLength(2);
    });

    it('should render small sized chips', () => {
      const { container } = renderWithRouter(
        <MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />
      );

      const smallChips = container.querySelectorAll('.MuiChip-sizeSmall');
      expect(smallChips).toHaveLength(2);
    });
  });

  describe('layout and styling', () => {
    it('should render in grid container', () => {
      const { container } = renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      const gridContainers = container.querySelectorAll('[class*="MuiGrid"][class*="container"]');
      expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('should render section headers with h5 variant', () => {
      renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />);

      const recentHeader = screen.getByText('Recent Movies');
      const upcomingHeader = screen.getByText('Upcoming Movies');

      expect(recentHeader).toHaveClass('MuiTypography-h5');
      expect(upcomingHeader).toHaveClass('MuiTypography-h5');
    });

    it('should render empty message with body1 variant', () => {
      renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={[]} />);

      const emptyMessages = screen.getAllByText(/No .* movie releases/);
      emptyMessages.forEach((message) => {
        expect(message).toHaveClass('MuiTypography-body1');
      });
    });
  });

  describe('different data scenarios', () => {
    it('should handle single recent movie', () => {
      const singleMovie = [mockRecentMovies[0]];

      const { container } = renderWithRouter(<MoviesSection recentMovies={singleMovie} upcomingMovies={[]} />);

      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(1);
      expect(screen.getByText('Fight Club')).toBeInTheDocument();
    });

    it('should handle single upcoming movie', () => {
      const singleMovie = [mockUpcomingMovies[0]];

      const { container } = renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={singleMovie} />);

      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(1);
      expect(screen.getByText('Upcoming Movie 1')).toBeInTheDocument();
    });

    it('should handle many recent movies', () => {
      const manyMovies = Array.from({ length: 10 }, (_, i) => ({
        ...mockRecentMovies[0],
        id: i + 1,
        title: `Movie ${i + 1}`,
      }));

      const { container } = renderWithRouter(<MoviesSection recentMovies={manyMovies} upcomingMovies={[]} />);

      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(10);
    });

    it('should handle many upcoming movies', () => {
      const manyMovies = Array.from({ length: 5 }, (_, i) => ({
        ...mockUpcomingMovies[0],
        id: i + 1,
        title: `Upcoming ${i + 1}`,
      }));

      const { container } = renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={manyMovies} />);

      const movieCards = container.querySelectorAll('[data-testid="movie-card"]');
      expect(movieCards).toHaveLength(5);
    });
  });

  describe('accessibility', () => {
    it('should have accessible section headers', () => {
      renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />);

      expect(screen.getByText('Recent Movies')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Movies')).toBeInTheDocument();
    });

    it('should have accessible links', () => {
      renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(2);
    });

    it('should have accessible empty state messages', () => {
      renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={[]} />);

      expect(screen.getByText('No recent movie releases')).toBeInTheDocument();
      expect(screen.getByText('No upcoming movie releases')).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(
        <MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle unmounting gracefully', () => {
      const { unmount } = renderWithRouter(
        <MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />
      );

      unmount();

      expect(screen.queryByText('Recent Movies')).not.toBeInTheDocument();
      expect(screen.queryByText('Upcoming Movies')).not.toBeInTheDocument();
    });

    it('should re-render with updated recent movies', () => {
      const { rerender } = renderWithRouter(<MoviesSection recentMovies={mockRecentMovies} upcomingMovies={[]} />);

      expect(screen.getByText('Fight Club')).toBeInTheDocument();

      const newRecentMovies = [
        {
          ...mockRecentMovies[0],
          id: 999,
          title: 'New Movie',
        },
      ];

      rerender(
        <BrowserRouter>
          <MoviesSection recentMovies={newRecentMovies} upcomingMovies={[]} />
        </BrowserRouter>
      );

      expect(screen.queryByText('Fight Club')).not.toBeInTheDocument();
      expect(screen.getByText('New Movie')).toBeInTheDocument();
    });

    it('should re-render with updated upcoming movies', () => {
      const { rerender } = renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={mockUpcomingMovies} />);

      expect(screen.getByText('Upcoming Movie 1')).toBeInTheDocument();

      const newUpcomingMovies = [
        {
          ...mockUpcomingMovies[0],
          id: 999,
          title: 'New Upcoming',
        },
      ];

      rerender(
        <BrowserRouter>
          <MoviesSection recentMovies={[]} upcomingMovies={newUpcomingMovies} />
        </BrowserRouter>
      );

      expect(screen.queryByText('Upcoming Movie 1')).not.toBeInTheDocument();
      expect(screen.getByText('New Upcoming')).toBeInTheDocument();
    });

    it('should transition from empty to filled state', () => {
      const { rerender } = renderWithRouter(<MoviesSection recentMovies={[]} upcomingMovies={[]} />);

      expect(screen.getByText('No recent movie releases')).toBeInTheDocument();
      expect(screen.getByText('No upcoming movie releases')).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <MoviesSection recentMovies={mockRecentMovies} upcomingMovies={mockUpcomingMovies} />
        </BrowserRouter>
      );

      expect(screen.queryByText('No recent movie releases')).not.toBeInTheDocument();
      expect(screen.queryByText('No upcoming movie releases')).not.toBeInTheDocument();
      expect(screen.getByText('Fight Club')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Movie 1')).toBeInTheDocument();
    });
  });
});
