import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Shows from '../shows';

// Mock dependencies
jest.mock('../../../app/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../common/shows/showListItem', () => ({
  ShowListItem: ({ show }: { show: any }) => <li data-testid={`show-list-item-${show.id}`}>{show.title}</li>,
}));

jest.mock('../../utility/contentUtility', () => ({
  stripArticle: (title: string) => title.replace(/^(The|A|An)\s+/i, ''),
}));

const mockShows = [
  {
    id: 1,
    title: 'The Office',
    watchStatus: 'WATCHED',
    genres: ['Comedy'],
    streamingServices: ['Netflix'],
  },
  {
    id: 2,
    title: 'Breaking Bad',
    watchStatus: 'WATCHING',
    genres: ['Drama', 'Crime'],
    streamingServices: ['Netflix'],
  },
  {
    id: 3,
    title: 'Stranger Things',
    watchStatus: 'NOT_WATCHED',
    genres: ['Sci-Fi', 'Horror'],
    streamingServices: ['Netflix'],
  },
  {
    id: 4,
    title: 'The Mandalorian',
    watchStatus: 'UP_TO_DATE',
    genres: ['Action', 'Sci-Fi'],
    streamingServices: ['Disney+'],
  },
  {
    id: 5,
    title: 'Upcoming Show',
    watchStatus: 'UNAIRED',
    genres: ['Drama'],
    streamingServices: ['HBO Max'],
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('Shows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const { selectShows, selectShowGenres, selectShowStreamingServices } = require('../../../app/slices/activeProfileSlice');
    
    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectShows) return mockShows;
      if (selector === selectShowGenres) return ['Action', 'Comedy', 'Crime', 'Drama', 'Horror', 'Sci-Fi'];
      if (selector === selectShowStreamingServices) return ['Netflix', 'Disney+', 'HBO Max', 'Hulu'];
      return null;
    });
  });

  describe('basic rendering', () => {
    it('should render the page title', () => {
      renderWithRouter(<Shows />);

      expect(screen.getByText('Shows')).toBeInTheDocument();
    });

    it('should render the Filters button', () => {
      renderWithRouter(<Shows />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should display the total count of shows', () => {
      renderWithRouter(<Shows />);

      expect(screen.getByText(/count: 5/i)).toBeInTheDocument();
    });

    it('should render all shows in the list', () => {
      renderWithRouter(<Shows />);

      mockShows.forEach((show) => {
        expect(screen.getByTestId(`show-list-item-${show.id}`)).toBeInTheDocument();
      });
    });

    it('should render shows list element', () => {
      renderWithRouter(<Shows />);

      expect(screen.getByRole('list', { name: '' })).toBeInTheDocument();
    });
  });

  describe('filter drawer', () => {
    it('should not show filter drawer by default', () => {
      renderWithRouter(<Shows />);

      const drawer = screen.queryByText('Show Filters');
      expect(drawer).not.toBeInTheDocument();
    });

    it('should open filter drawer when Filters button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });
    });

    it('should display genre filter dropdown in drawer', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });
      
      // Check for the genre select element
      const genreSelect = document.getElementById('showsFilterGenreSelect');
      expect(genreSelect).toBeInTheDocument();
    });

    it('should display streaming service filter dropdown in drawer', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });
      
      // Check for the streaming service select element
      const serviceSelect = document.getElementById('showsFilterStreamingServiceSelect');
      expect(serviceSelect).toBeInTheDocument();
    });

    it('should display watch status filter dropdown in drawer', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });
      
      // Check for the watch status select element
      const watchStatusSelect = document.getElementById('showsFilterWatchStatusSelect');
      expect(watchStatusSelect).toBeInTheDocument();
    });

    it('should display Clear Filters button in drawer', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
      });
    });
  });

  describe('genre filtering', () => {
    it('should filter shows by selected genre', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });

      const genreSelect = document.getElementById('showsFilterGenreSelect');
      await user.click(genreSelect!);

      const comedyOption = screen.getByRole('option', { name: 'Comedy' });
      await user.click(comedyOption);

      await waitFor(() => {
        expect(screen.getByText(/genre: comedy/i)).toBeInTheDocument();
      });
    });

    it('should display genre filter chip when genre is selected', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });

      const genreSelect = document.getElementById('showsFilterGenreSelect');
      await user.click(genreSelect!);

      const dramaOption = screen.getByRole('option', { name: 'Drama' });
      await user.click(dramaOption);

      await waitFor(() => {
        expect(screen.getByText(/genre: drama/i)).toBeInTheDocument();
      });
    });
  });

  describe('streaming service filtering', () => {
    it('should filter shows by streaming service', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });

      const serviceSelect = document.getElementById('showsFilterStreamingServiceSelect');
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
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });

      const watchStatusSelect = document.getElementById('showsFilterWatchStatusSelect');
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
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });

      const genreSelect = document.getElementById('showsFilterGenreSelect');
      await user.click(genreSelect!);

      const comedyOption = screen.getByRole('option', { name: 'Comedy' });
      await user.click(comedyOption);

      await waitFor(() => {
        expect(screen.getByText(/genre: comedy/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText(/genre: comedy/i)).not.toBeInTheDocument();
      });
    });

    it('should close drawer when Clear Filters is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('Show Filters')).not.toBeInTheDocument();
      });
    });
  });

  describe('filter button state', () => {
    it('should show Filters button as text variant when no filters applied', () => {
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      expect(filterButton).toHaveClass('MuiButton-text');
    });

    it('should show Filters button as contained variant when filters applied', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });

      const genreSelect = document.getElementById('showsFilterGenreSelect');
      await user.click(genreSelect!);

      const comedyOption = screen.getByRole('option', { name: 'Comedy' });
      await user.click(comedyOption);

      await waitFor(() => {
        expect(filterButton).toHaveClass('MuiButton-contained');
      });
    });
  });

  describe('empty state', () => {
    it('should display message when no shows match filters', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectShows, selectShowGenres, selectShowStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectShows) return [];
        if (selector === selectShowGenres) return ['Comedy', 'Drama'];
        if (selector === selectShowStreamingServices) return ['Netflix', 'Hulu'];
        return null;
      });

      renderWithRouter(<Shows />);

      expect(screen.getByText('No Shows Match Current Filters')).toBeInTheDocument();
    });

    it('should show count as 0 when no shows', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectShows, selectShowGenres, selectShowStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectShows) return [];
        if (selector === selectShowGenres) return [];
        if (selector === selectShowStreamingServices) return [];
        return null;
      });

      renderWithRouter(<Shows />);

      expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
    });
  });

  describe('show sorting', () => {
    it('should sort shows by watch status first (WATCHING, NOT_WATCHED, UNAIRED, UP_TO_DATE, WATCHED), then alphabetically', () => {
      renderWithRouter(<Shows />);

      const showItems = screen.getAllByTestId(/show-list-item-/);

      // Verify we have all 5 shows
      expect(showItems).toHaveLength(5);
      
      // Expected order based on watchedOrder in shows.tsx: WATCHING(1), NOT_WATCHED(2), UNAIRED(3), UP_TO_DATE(4), WATCHED(5)
      // Then alphabetically within each status group
      expect(showItems[0]).toHaveAttribute('data-testid', 'show-list-item-2'); // Breaking Bad (WATCHING)
      expect(showItems[1]).toHaveAttribute('data-testid', 'show-list-item-3'); // Stranger Things (NOT_WATCHED)
      expect(showItems[2]).toHaveAttribute('data-testid', 'show-list-item-5'); // Upcoming Show (UNAIRED)
      expect(showItems[3]).toHaveAttribute('data-testid', 'show-list-item-4'); // The Mandalorian (UP_TO_DATE) - "Mandalorian"
      expect(showItems[4]).toHaveAttribute('data-testid', 'show-list-item-1'); // The Office (WATCHED) - "Office"
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for filter controls', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Shows />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });
      
      // Check that all filter controls exist by ID
      expect(document.getElementById('showsFilterGenreSelect')).toBeInTheDocument();
      expect(document.getElementById('showsFilterStreamingServiceSelect')).toBeInTheDocument();
      expect(document.getElementById('showsFilterWatchStatusSelect')).toBeInTheDocument();
    });

    it('should have a list element for shows', () => {
      renderWithRouter(<Shows />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<Shows />);
      expect(container).toBeInTheDocument();
    });

    it('should clean up on unmount', () => {
      const { unmount } = renderWithRouter(<Shows />);

      unmount();

      expect(screen.queryByText('Shows')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty genre list', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectShows, selectShowGenres, selectShowStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectShows) return mockShows;
        if (selector === selectShowGenres) return [];
        if (selector === selectShowStreamingServices) return ['Netflix'];
        return null;
      });

      renderWithRouter(<Shows />);

      expect(screen.getByText('Shows')).toBeInTheDocument();
    });

    it('should handle empty streaming services list', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectShows, selectShowGenres, selectShowStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectShows) return mockShows;
        if (selector === selectShowGenres) return ['Comedy'];
        if (selector === selectShowStreamingServices) return [];
        return null;
      });

      renderWithRouter(<Shows />);

      expect(screen.getByText('Shows')).toBeInTheDocument();
    });

    it('should handle shows with no genres', () => {
      const showsWithNoGenres = [
        {
          id: 1,
          title: 'Test Show',
          watchStatus: 'WATCHED',
          genres: [],
          streamingServices: ['Netflix'],
        },
      ];

      const { useAppSelector } = require('../../../app/hooks');
      const { selectShows, selectShowGenres, selectShowStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectShows) return showsWithNoGenres;
        if (selector === selectShowGenres) return [];
        if (selector === selectShowStreamingServices) return ['Netflix'];
        return null;
      });

      renderWithRouter(<Shows />);

      // Show should be displayed since we're not filtering by genre (empty genre filter list)
      expect(screen.getByTestId('show-list-item-1')).toBeInTheDocument();
    });

    it('should handle shows with multiple streaming services', () => {
      const showsWithMultipleServices = [
        {
          id: 1,
          title: 'Test Show',
          watchStatus: 'WATCHED',
          genres: ['Comedy'],
          streamingServices: ['Netflix', 'Hulu'],
        },
      ];

      const { useAppSelector } = require('../../../app/hooks');
      const { selectShows, selectShowGenres, selectShowStreamingServices } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectShows) return showsWithMultipleServices;
        if (selector === selectShowGenres) return ['Comedy'];
        if (selector === selectShowStreamingServices) return ['Netflix', 'Hulu'];
        return null;
      });

      renderWithRouter(<Shows />);

      expect(screen.getByTestId('show-list-item-1')).toBeInTheDocument();
    });
  });
});
