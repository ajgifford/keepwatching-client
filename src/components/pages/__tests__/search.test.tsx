import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import Search from '../search';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/personSearchSlice', () => ({
  clearPersonSearch: jest.fn(() => ({
    type: 'personSearch/clearPersonSearch',
  })),
}));

jest.mock('../../common/search/contentSearchTab', () => ({
  ContentSearchTab: ({ searchType }: { searchType: string }) => (
    <div data-testid={`content-search-tab-${searchType}`}>ContentSearchTab - {searchType}</div>
  ),
}));

jest.mock('../../common/search/personSearchTab', () => ({
  PersonSearchTab: () => <div data-testid="person-search-tab">PersonSearchTab</div>,
}));

jest.mock('../../common/tabs/tabPanel', () => ({
  TabPanel: ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </div>
  ),
  a11yProps: (index: number) => ({
    id: `search-tab-${index}`,
    'aria-controls': `search-tabpanel-${index}`,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render the page title', () => {
      renderWithRouter(<Search />);

      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('should render all three tabs', () => {
      renderWithRouter(<Search />);

      expect(screen.getByRole('tab', { name: /tv shows/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /movies/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /people/i })).toBeInTheDocument();
    });

    it('should render tabs container with correct aria-label', () => {
      renderWithRouter(<Search />);

      const tabsContainer = screen.getByRole('tablist', { name: /search type tabs/i });
      expect(tabsContainer).toBeInTheDocument();
    });

    it('should render TV Shows tab content by default', () => {
      renderWithRouter(<Search />);

      expect(screen.getByTestId('content-search-tab-shows')).toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('should default to TV Shows tab (index 0)', () => {
      renderWithRouter(<Search />);

      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      expect(tvShowsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to Movies tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      await waitFor(() => {
        expect(moviesTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(screen.getByTestId('content-search-tab-movies')).toBeInTheDocument();
    });

    it('should switch to People tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      const peopleTab = screen.getByRole('tab', { name: /people/i });
      await user.click(peopleTab);

      await waitFor(() => {
        expect(peopleTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(screen.getByTestId('person-search-tab')).toBeInTheDocument();
    });

    it('should hide previous tab content when switching tabs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      // Initially on TV Shows tab
      const showsContent = screen.getByTestId('content-search-tab-shows');
      expect(showsContent).toBeInTheDocument();

      // Switch to Movies tab
      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      await waitFor(() => {
        // After switching, the shows content should no longer be in the document
        expect(screen.queryByTestId('content-search-tab-shows')).not.toBeInTheDocument();
        expect(screen.getByTestId('content-search-tab-movies')).toBeInTheDocument();
      });
    });
  });

  describe('person search clear', () => {
    it('should dispatch clearPersonSearch when switching from People tab', async () => {
      const user = userEvent.setup();
      const { clearPersonSearch } = require('../../../app/slices/personSearchSlice');
      renderWithRouter(<Search />);

      // Switch to People tab
      const peopleTab = screen.getByRole('tab', { name: /people/i });
      await user.click(peopleTab);

      expect(clearPersonSearch).toHaveBeenCalled();
    });

    it('should dispatch clearPersonSearch when switching to Movies tab', async () => {
      const user = userEvent.setup();
      const { clearPersonSearch } = require('../../../app/slices/personSearchSlice');
      renderWithRouter(<Search />);

      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      expect(clearPersonSearch).toHaveBeenCalled();
    });

    it('should dispatch clearPersonSearch when switching between any tabs', async () => {
      const user = userEvent.setup();
      const { clearPersonSearch } = require('../../../app/slices/personSearchSlice');
      renderWithRouter(<Search />);

      // Switch to Movies
      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      expect(clearPersonSearch).toHaveBeenCalledTimes(1);

      // Switch to People
      const peopleTab = screen.getByRole('tab', { name: /people/i });
      await user.click(peopleTab);

      expect(clearPersonSearch).toHaveBeenCalledTimes(2);

      // Switch to TV Shows
      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      await user.click(tvShowsTab);

      expect(clearPersonSearch).toHaveBeenCalledTimes(3);
    });
  });

  describe('tab content rendering', () => {
    it('should render ContentSearchTab with shows type for TV Shows tab', () => {
      renderWithRouter(<Search />);

      expect(screen.getByTestId('content-search-tab-shows')).toBeInTheDocument();
      expect(screen.getByText(/ContentSearchTab - shows/i)).toBeInTheDocument();
    });

    it('should render ContentSearchTab with movies type for Movies tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      await waitFor(() => {
        expect(screen.getByTestId('content-search-tab-movies')).toBeInTheDocument();
        expect(screen.getByText(/ContentSearchTab - movies/i)).toBeInTheDocument();
      });
    });

    it('should render PersonSearchTab for People tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      const peopleTab = screen.getByRole('tab', { name: /people/i });
      await user.click(peopleTab);

      await waitFor(() => {
        expect(screen.getByTestId('person-search-tab')).toBeInTheDocument();
        expect(screen.getByText('PersonSearchTab')).toBeInTheDocument();
      });
    });
  });

  describe('tab icons', () => {
    it('should render TV icon for TV Shows tab', () => {
      renderWithRouter(<Search />);

      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      const svg = tvShowsTab.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render Movie icon for Movies tab', () => {
      renderWithRouter(<Search />);

      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      const svg = moviesTab.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render Person icon for People tab', () => {
      renderWithRouter(<Search />);

      const peopleTab = screen.getByRole('tab', { name: /people/i });
      const svg = peopleTab.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible tabs with proper roles', () => {
      renderWithRouter(<Search />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should have tablist with aria-label', () => {
      renderWithRouter(<Search />);

      const tablist = screen.getByRole('tablist', { name: /search type tabs/i });
      expect(tablist).toBeInTheDocument();
    });

    it('should have tabpanels with proper roles', () => {
      renderWithRouter(<Search />);

      const tabpanels = screen.getAllByRole('tabpanel');
      expect(tabpanels.length).toBeGreaterThan(0);
    });

    it('should have proper aria-selected attributes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      const moviesTab = screen.getByRole('tab', { name: /movies/i });

      expect(tvShowsTab).toHaveAttribute('aria-selected', 'true');
      expect(moviesTab).toHaveAttribute('aria-selected', 'false');

      await user.click(moviesTab);

      await waitFor(() => {
        expect(moviesTab).toHaveAttribute('aria-selected', 'true');
        expect(tvShowsTab).toHaveAttribute('aria-selected', 'false');
      });
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<Search />);
      expect(container).toBeInTheDocument();
    });

    it('should clean up on unmount', () => {
      const { unmount } = renderWithRouter(<Search />);

      unmount();

      expect(screen.queryByText('Search')).not.toBeInTheDocument();
    });
  });

  describe('tab switching behavior', () => {
    it('should handle rapid tab switching', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      const peopleTab = screen.getByRole('tab', { name: /people/i });
      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });

      await user.click(moviesTab);
      await user.click(peopleTab);
      await user.click(tvShowsTab);

      await waitFor(() => {
        expect(tvShowsTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(screen.getByTestId('content-search-tab-shows')).toBeInTheDocument();
    });

    it('should maintain state when switching back to previous tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      await waitFor(() => {
        expect(screen.getByTestId('content-search-tab-movies')).toBeInTheDocument();
      });

      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      await user.click(tvShowsTab);

      await waitFor(() => {
        expect(screen.getByTestId('content-search-tab-shows')).toBeInTheDocument();
      });
    });
  });

  describe('tab panel visibility', () => {
    it('should only show active tab panel', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Search />);

      // Check initial state - only TV Shows content is rendered
      expect(screen.getByTestId('content-search-tab-shows')).toBeInTheDocument();
      expect(screen.queryByTestId('content-search-tab-movies')).not.toBeInTheDocument();
      expect(screen.queryByTestId('person-search-tab')).not.toBeInTheDocument();

      // Switch to Movies
      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      await waitFor(() => {
        expect(screen.queryByTestId('content-search-tab-shows')).not.toBeInTheDocument();
        expect(screen.getByTestId('content-search-tab-movies')).toBeInTheDocument();
        expect(screen.queryByTestId('person-search-tab')).not.toBeInTheDocument();
      });

      // Switch to People
      const peopleTab = screen.getByRole('tab', { name: /people/i });
      await user.click(peopleTab);

      await waitFor(() => {
        expect(screen.queryByTestId('content-search-tab-shows')).not.toBeInTheDocument();
        expect(screen.queryByTestId('content-search-tab-movies')).not.toBeInTheDocument();
        expect(screen.getByTestId('person-search-tab')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle clicking on already selected tab', async () => {
      const user = userEvent.setup();
      const { clearPersonSearch } = require('../../../app/slices/personSearchSlice');
      renderWithRouter(<Search />);

      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      
      // Clear the mock to check if it gets called again
      clearPersonSearch.mockClear();
      
      await user.click(tvShowsTab);

      // Clicking an already selected tab should NOT trigger onChange, so clearPersonSearch should NOT be called
      expect(clearPersonSearch).not.toHaveBeenCalled();
      expect(tvShowsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle all tab values correctly', () => {
      renderWithRouter(<Search />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });
  });

  describe('responsive behavior', () => {
    it('should render tabs in standard mode by default', () => {
      renderWithRouter(<Search />);

      const tabsContainer = screen.getByRole('tablist');
      expect(tabsContainer).toBeInTheDocument();
    });
  });
});
