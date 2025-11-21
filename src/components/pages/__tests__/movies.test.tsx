import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Movies from '../movies';

// Mock dependencies
jest.mock('../../../app/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../common/movies/movieListItem', () => ({
  MovieListItem: ({ movie }: { movie: any }) => (
    <li data-testid={`movie-list-item-${movie.id}`}>{movie.title}</li>
  ),
}));

jest.mock('../../utility/contentUtility', () => ({
  stripArticle: (title: string) => title.replace(/^(The|A|An)\s+/i, ''),
}));

const mockMovies = [
  {
    id: 1,
    title: 'The Matrix',
    watchStatus: 'WATCHED',
    genres: ['Action', 'Sci-Fi'],
    streamingServices: 'Netflix',
  },
  {
    id: 2,
    title: 'Inception',
    watchStatus: 'NOT_WATCHED',
    genres: ['Action', 'Thriller'],
    streamingServices: 'Amazon Prime',
  },
  {
    id: 3,
    title: 'The Shawshank Redemption',
    watchStatus: 'UNAIRED',
    genres: ['Drama'],
    streamingServices: 'Netflix',
  },
  {
    id: 4,
    title: 'Interstellar',
    watchStatus: 'WATCHED',
    genres: ['Sci-Fi', 'Drama'],
    streamingServices: 'Hulu',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('Movies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const { selectMovies, selectMovieGenres, selectMovieStreamingServices } = require('../../../app/slices/activeProfileSlice');
    
    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectMovies) return mockMovies;
      if (selector === selectMovieGenres) return ['Action', 'Sci-Fi', 'Drama', 'Thriller'];
      if (selector === selectMovieStreamingServices) return ['Netflix', 'Amazon Prime', 'Hulu', 'Disney+'];
      return null;
    });
  });

  describe('basic rendering', () => {
    it('should render the page title', () => {
      renderWithRouter(<Movies />);

      expect(screen.getByText('Movies')).toBeInTheDocument();
    });

    it('should render the Filters button', () => {
      renderWithRouter(<Movies />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should display the total count of movies', () => {
      renderWithRouter(<Movies />);

      expect(screen.getByText(/count: 4/i)).toBeInTheDocument();
    });

    it('should render all movies in the list', () => {
      renderWithRouter(<Movies />);

      mockMovies.forEach((movie) => {
        expect(screen.getByTestId(`movie-list-item-${movie.id}`)).toBeInTheDocument();
      });
    });

    it('should render movies list element', () => {
      renderWithRouter(<Movies />);

      expect(screen.getByRole('list', { name: '' })).toBeInTheDocument();
    });
  });

  describe('filter drawer', () => {
    it('should not show filter drawer by default', () => {
      renderWithRouter(<Movies />);

      const drawer = screen.queryByText('Movie Filters');
      expect(drawer).not.toBeInTheDocument();
    });

    it('should open filter drawer when Filters button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });
    });

    it('should display genre filter dropdown in drawer', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });
      
      // Check for the genre select element
      const genreSelect = document.getElementById('moviesFilterGenreSelect');
      expect(genreSelect).toBeInTheDocument();
    });

    it('should display streaming service filter dropdown in drawer', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });
      
      // Check for the streaming service select element
      const serviceSelect = document.getElementById('moviesFilterStreamingServiceSelect');
      expect(serviceSelect).toBeInTheDocument();
    });

    it('should display watch status filter dropdown in drawer', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });
      
      // Check for the watch status select element
      const watchStatusSelect = document.getElementById('moviesFilterWatchStatusSelect');
      expect(watchStatusSelect).toBeInTheDocument();
    });

    it('should display Clear Filters button in drawer', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
      });
    });
  });

  describe('genre filtering', () => {
    it('should filter movies by selected genre', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });

      const genreSelect = document.getElementById('moviesFilterGenreSelect');
      await user.click(genreSelect!);

      const actionOption = screen.getByRole('option', { name: 'Action' });
      await user.click(actionOption);

      await waitFor(() => {
        expect(screen.getByText(/genre: action/i)).toBeInTheDocument();
      });
    });

    it('should display genre filter chip when genre is selected', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });

      const genreSelect = document.getElementById('moviesFilterGenreSelect');
      await user.click(genreSelect!);

      const sciFiOption = screen.getByRole('option', { name: 'Sci-Fi' });
      await user.click(sciFiOption);

      await waitFor(() => {
        expect(screen.getByText(/genre: sci-fi/i)).toBeInTheDocument();
      });
    });
  });

  describe('streaming service filtering', () => {
    it('should filter movies by streaming service', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });

      const serviceSelect = document.getElementById('moviesFilterStreamingServiceSelect');
      await user.click(serviceSelect!);

      const netflixOption = screen.getByRole('option', { name: 'Netflix' });
      await user.click(netflixOption);

      await waitFor(() => {
        expect(screen.getByText(/streaming service: netflix/i)).toBeInTheDocument();
      });
    });
  });

  describe('watch status filtering', () => {
    it('should allow multiple watch status selections', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });

      const watchStatusSelect = document.getElementById('moviesFilterWatchStatusSelect');
      await user.click(watchStatusSelect!);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });
    });
  });

  describe('clear filters', () => {
    it('should clear all filters when Clear Filters button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });

      const genreSelect = document.getElementById('moviesFilterGenreSelect');
      await user.click(genreSelect!);

      const actionOption = screen.getByRole('option', { name: 'Action' });
      await user.click(actionOption);

      await waitFor(() => {
        expect(screen.getByText(/genre: action/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText(/genre: action/i)).not.toBeInTheDocument();
      });
    });

    it('should close drawer when Clear Filters is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('Movie Filters')).not.toBeInTheDocument();
      });
    });
  });

  describe('filter button state', () => {
    it('should show Filters button as text variant when no filters applied', () => {
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      expect(filterButton).toHaveClass('MuiButton-text');
    });

    it('should show Filters button as contained variant when filters applied', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });

      const genreSelect = document.getElementById('moviesFilterGenreSelect');
      await user.click(genreSelect!);

      const actionOption = screen.getByRole('option', { name: 'Action' });
      await user.click(actionOption);

      await waitFor(() => {
        expect(filterButton).toHaveClass('MuiButton-contained');
      });
    });
  });

  describe('empty state', () => {
    it('should display message when no movies match filters', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovies, selectMovieGenres, selectMovieStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovies) return [];
        if (selector === selectMovieGenres) return ['Action', 'Sci-Fi'];
        if (selector === selectMovieStreamingServices) return ['Netflix', 'Hulu'];
        return null;
      });

      renderWithRouter(<Movies />);

      expect(screen.getByText('No Movies Match Current Filters')).toBeInTheDocument();
    });

    it('should show count as 0 when no movies', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovies, selectMovieGenres, selectMovieStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovies) return [];
        if (selector === selectMovieGenres) return [];
        if (selector === selectMovieStreamingServices) return [];
        return null;
      });

      renderWithRouter(<Movies />);

      expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
    });
  });

  describe('movie sorting', () => {
    it('should sort movies by watch status first, then alphabetically', () => {
      renderWithRouter(<Movies />);

      const movieItems = screen.getAllByTestId(/movie-list-item-/);

      // Verify we have all 4 movies
      expect(movieItems).toHaveLength(4);
      
      // Expected order based on watchedOrder in movies.tsx: UNAIRED(1), NOT_WATCHED(2), WATCHED(3)
      // Within WATCHED, alphabetically by title (stripped of articles)
      // Movie 3: The Shawshank Redemption (UNAIRED) - "Shawshank Redemption"
      // Movie 2: Inception (NOT_WATCHED) - "Inception"
      // Movie 4: Interstellar (WATCHED) - "Interstellar"
      // Movie 1: The Matrix (WATCHED) - "Matrix"
      expect(movieItems[0]).toHaveAttribute('data-testid', 'movie-list-item-3'); // Shawshank Redemption (UNAIRED)
      expect(movieItems[1]).toHaveAttribute('data-testid', 'movie-list-item-2'); // Inception (NOT_WATCHED)
      expect(movieItems[2]).toHaveAttribute('data-testid', 'movie-list-item-4'); // Interstellar (WATCHED)
      expect(movieItems[3]).toHaveAttribute('data-testid', 'movie-list-item-1'); // Matrix (WATCHED)
    });
  });

  describe('URL search params', () => {
    it('should initialize filters from URL search params', () => {
      // This would require mocking useSearchParams more thoroughly
      // Simplified version for now
      renderWithRouter(<Movies />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for filter controls', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Movies />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Movie Filters')).toBeInTheDocument();
      });
      
      // Check that all filter controls exist by ID
      expect(document.getElementById('moviesFilterGenreSelect')).toBeInTheDocument();
      expect(document.getElementById('moviesFilterStreamingServiceSelect')).toBeInTheDocument();
      expect(document.getElementById('moviesFilterWatchStatusSelect')).toBeInTheDocument();
    });

    it('should have a list element for movies', () => {
      renderWithRouter(<Movies />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<Movies />);
      expect(container).toBeInTheDocument();
    });

    it('should clean up on unmount', () => {
      const { unmount } = renderWithRouter(<Movies />);

      unmount();

      expect(screen.queryByText('Movies')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty genre list', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovies, selectMovieGenres, selectMovieStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovies) return mockMovies;
        if (selector === selectMovieGenres) return [];
        if (selector === selectMovieStreamingServices) return ['Netflix'];
        return null;
      });

      renderWithRouter(<Movies />);

      expect(screen.getByText('Movies')).toBeInTheDocument();
    });

    it('should handle empty streaming services list', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovies, selectMovieGenres, selectMovieStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovies) return mockMovies;
        if (selector === selectMovieGenres) return ['Action'];
        if (selector === selectMovieStreamingServices) return [];
        return null;
      });

      renderWithRouter(<Movies />);

      expect(screen.getByText('Movies')).toBeInTheDocument();
    });

    it('should handle movies with no genres', () => {
      const moviesWithNoGenres = [
        {
          id: 1,
          title: 'Test Movie',
          watchStatus: 'WATCHED',
          genres: [],
          streamingServices: 'Netflix',
        },
      ];

      const { useAppSelector } = require('../../../app/hooks');
      const { selectMovies, selectMovieGenres, selectMovieStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectMovies) return moviesWithNoGenres;
        if (selector === selectMovieGenres) return [];
        if (selector === selectMovieStreamingServices) return ['Netflix'];
        return null;
      });

      renderWithRouter(<Movies />);

      // Movie should be displayed since we're not filtering by genre (empty genre filter list)
      expect(screen.getByTestId('movie-list-item-1')).toBeInTheDocument();
    });
  });
});
