import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import Home from '../home';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  fetchMilestoneStats: jest.fn(() => ({
    type: 'activeProfile/fetchMilestoneStats',
  })),
  selectActiveProfile: jest.fn(),
  selectActiveProfileError: jest.fn(),
  selectActiveProfileLoading: jest.fn(),
  selectMilestoneStats: jest.fn(),
  selectMovieWatchCounts: jest.fn(),
  selectMoviesByIds: jest.fn(),
  selectRecentEpisodes: jest.fn(),
  selectRecentMovies: jest.fn(),
  selectShowWatchCounts: jest.fn(),
  selectUpcomingEpisodes: jest.fn(),
  selectUpcomingMovies: jest.fn(),
}));

jest.mock('../../common/media/streamingServiceSection', () => ({
  __esModule: true,
  default: () => <div data-testid="streaming-service-section">StreamingServiceSection</div>,
}));

jest.mock('../../common/movies/moviesSection', () => ({
  MoviesSection: () => <div data-testid="movies-section">MoviesSection</div>,
}));

jest.mock('../../common/profile/dashboardProfileCard', () => ({
  __esModule: true,
  default: ({ onNavigateToStats }: { onNavigateToStats: () => void }) => (
    <div data-testid="dashboard-profile-card">
      <button onClick={onNavigateToStats}>Navigate to Stats</button>
    </div>
  ),
}));

jest.mock('../../common/shows/episodeSection', () => ({
  EpisodesSection: () => <div data-testid="episodes-section">EpisodesSection</div>,
}));

jest.mock('../../common/shows/keepWatchingProfileComponent', () => ({
  KeepWatchingProfileComponent: () => <div data-testid="keep-watching-component">KeepWatchingProfileComponent</div>,
}));

jest.mock('../../common/statistics/profileStatisticsComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-statistics-component">ProfileStatisticsComponent</div>,
}));

jest.mock('../../common/tabs/tabPanel', () => ({
  TabPanel: ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </div>
  ),
  a11yProps: (index: number) => ({
    id: `home-tab-${index}`,
    'aria-controls': `home-tabpanel-${index}`,
  }),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  ErrorComponent: ({ error }: { error: string }) => <div data-testid="error-component">{error}</div>,
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Home', () => {
  const mockProfile = {
    id: 1,
    accountId: 100,
    name: 'Test Profile',
    avatarColor: '#FF0000',
  };

  const mockMilestoneStats = {
    totalShows: 10,
    totalMovies: 5,
  };

  const mockRecentEpisodes = [
    { id: 1, title: 'Episode 1' },
    { id: 2, title: 'Episode 2' },
  ];

  const mockUpcomingEpisodes = [
    { id: 3, title: 'Episode 3' },
    { id: 4, title: 'Episode 4' },
  ];

  const mockRecentMovies = [
    { id: 1, title: 'Movie 1' },
    { id: 2, title: 'Movie 2' },
  ];

  const mockUpcomingMovies = [
    { id: 3, title: 'Movie 3' },
    { id: 4, title: 'Movie 4' },
  ];

  const mockShowWatchCounts = {
    watched: 5,
    upToDate: 3,
    watching: 2,
    notWatched: 1,
    unaired: 1,
  };

  const mockMovieWatchCounts = {
    watched: 3,
    notWatched: 2,
    unaired: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const { 
      selectActiveProfile,
      selectActiveProfileError,
      selectActiveProfileLoading,
      selectMilestoneStats,
      selectMovieWatchCounts,
      selectMoviesByIds,
      selectRecentEpisodes,
      selectRecentMovies,
      selectShowWatchCounts,
      selectUpcomingEpisodes,
      selectUpcomingMovies,
    } = require('../../../app/slices/activeProfileSlice');
    
    useAppSelector.mockImplementation((selector: any) => {
      // These selectors are called before any conditional rendering, so always return valid values
      if (selector === selectShowWatchCounts) return mockShowWatchCounts;
      if (selector === selectMovieWatchCounts) return mockMovieWatchCounts;
      
      if (selector === selectActiveProfileLoading) return false;
      if (selector === selectActiveProfileError) return null;
      if (selector === selectActiveProfile) return mockProfile;
      if (selector === selectMilestoneStats) return mockMilestoneStats;
      if (selector === selectRecentEpisodes) return mockRecentEpisodes;
      if (selector === selectUpcomingEpisodes) return mockUpcomingEpisodes;
      if (selector === selectRecentMovies) return [1, 2];
      if (selector === selectUpcomingMovies) return [3, 4];
      
      // Handle arrow function selectors like (state) => selectMoviesByIds(state, recentMovieIds)
      if (typeof selector === 'function' && selector.toString().includes('selectMoviesByIds')) {
        const selectorStr = selector.toString();
        if (selectorStr.includes('recentMovieIds')) {
          return mockRecentMovies;
        }
        if (selectorStr.includes('upcomingMovieIds')) {
          return mockUpcomingMovies;
        }
      }
      
      // Default fallback
      return [];
    });
  });

  describe('basic rendering', () => {
    it('should render DashboardProfileCard', () => {
      renderWithRouter(<Home />);

      expect(screen.getByTestId('dashboard-profile-card')).toBeInTheDocument();
    });

    it('should render all 5 tabs', () => {
      renderWithRouter(<Home />);

      expect(screen.getByRole('tab', { name: /keep watching/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /tv shows/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /movies/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /by service/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /statistics/i })).toBeInTheDocument();
    });

    it('should render tabs container with correct aria-label', () => {
      renderWithRouter(<Home />);

      const tabsContainer = screen.getByRole('tablist', { name: /home content tabs/i });
      expect(tabsContainer).toBeInTheDocument();
    });

    it('should render Keep Watching tab content by default', () => {
      renderWithRouter(<Home />);

      expect(screen.getByTestId('keep-watching-component')).toBeInTheDocument();
    });
  });

  describe('loading and error states', () => {
    it('should render LoadingComponent when activeProfileLoading is true', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { 
        selectActiveProfileLoading,
        selectShowWatchCounts,
        selectMovieWatchCounts,
      } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectActiveProfileLoading) return true;
        if (selector === selectShowWatchCounts) return mockShowWatchCounts;
        if (selector === selectMovieWatchCounts) return mockMovieWatchCounts;
        return null;
      });

      renderWithRouter(<Home />);

      expect(screen.getByTestId('loading-component')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-profile-card')).not.toBeInTheDocument();
    });

    it('should render ErrorComponent when activeProfileError exists', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { 
        selectActiveProfileLoading,
        selectActiveProfileError,
        selectShowWatchCounts,
        selectMovieWatchCounts,
      } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectActiveProfileLoading) return false;
        if (selector === selectActiveProfileError) return 'Error loading profile';
        if (selector === selectShowWatchCounts) return mockShowWatchCounts;
        if (selector === selectMovieWatchCounts) return mockMovieWatchCounts;
        return null;
      });

      renderWithRouter(<Home />);

      expect(screen.getByTestId('error-component')).toBeInTheDocument();
      expect(screen.getByText('Error loading profile')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-profile-card')).not.toBeInTheDocument();
    });

    it('should render LoadingComponent when profile is null', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { 
        selectActiveProfileLoading,
        selectActiveProfileError,
        selectActiveProfile,
        selectShowWatchCounts,
        selectMovieWatchCounts,
      } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectActiveProfileLoading) return false;
        if (selector === selectActiveProfileError) return null;
        if (selector === selectActiveProfile) return null;
        if (selector === selectShowWatchCounts) return mockShowWatchCounts;
        if (selector === selectMovieWatchCounts) return mockMovieWatchCounts;
        return null;
      });

      renderWithRouter(<Home />);

      expect(screen.getByTestId('loading-component')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-profile-card')).not.toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('should default to Keep Watching tab (index 0)', () => {
      renderWithRouter(<Home />);

      const keepWatchingTab = screen.getByRole('tab', { name: /keep watching/i });
      expect(keepWatchingTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to TV Shows tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      await user.click(tvShowsTab);

      await waitFor(() => {
        expect(tvShowsTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(screen.getByTestId('episodes-section')).toBeInTheDocument();
    });

    it('should switch to Movies tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      await waitFor(() => {
        expect(moviesTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(screen.getByTestId('movies-section')).toBeInTheDocument();
    });

    it('should switch to By Service tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const byServiceTab = screen.getByRole('tab', { name: /by service/i });
      await user.click(byServiceTab);

      await waitFor(() => {
        expect(byServiceTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(screen.getByTestId('streaming-service-section')).toBeInTheDocument();
    });

    it('should switch to Statistics tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const statisticsTab = screen.getByRole('tab', { name: /statistics/i });
      await user.click(statisticsTab);

      await waitFor(() => {
        expect(statisticsTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(screen.getByTestId('profile-statistics-component')).toBeInTheDocument();
    });

    it('should hide previous tab content when switching tabs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      // Initially on Keep Watching tab
      expect(screen.getByTestId('keep-watching-component')).toBeInTheDocument();

      // Switch to TV Shows tab
      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      await user.click(tvShowsTab);

      await waitFor(() => {
        expect(screen.queryByTestId('keep-watching-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('data loading', () => {
    it('should dispatch fetchMilestoneStats on mount when profile exists', () => {
      const { fetchMilestoneStats } = require('../../../app/slices/activeProfileSlice');
      renderWithRouter(<Home />);

      expect(fetchMilestoneStats).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should not dispatch fetchMilestoneStats when profile is null', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { 
        fetchMilestoneStats,
        selectActiveProfileLoading,
        selectActiveProfileError,
        selectActiveProfile,
        selectShowWatchCounts,
        selectMovieWatchCounts,
      } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectActiveProfileLoading) return false;
        if (selector === selectActiveProfileError) return null;
        if (selector === selectActiveProfile) return null;
        if (selector === selectShowWatchCounts) return mockShowWatchCounts;
        if (selector === selectMovieWatchCounts) return mockMovieWatchCounts;
        return null;
      });

      renderWithRouter(<Home />);

      expect(fetchMilestoneStats).not.toHaveBeenCalled();
    });

    it('should re-dispatch fetchMilestoneStats when profile changes', () => {
      const { fetchMilestoneStats } = require('../../../app/slices/activeProfileSlice');
      const { rerender } = renderWithRouter(<Home />);

      expect(fetchMilestoneStats).toHaveBeenCalledTimes(1);

      // Change profile
      const { useAppSelector } = require('../../../app/hooks');
      const { 
        selectActiveProfile,
        selectActiveProfileLoading,
        selectActiveProfileError,
        selectShowWatchCounts,
        selectMovieWatchCounts,
        selectMilestoneStats,
        selectRecentEpisodes,
        selectUpcomingEpisodes,
        selectRecentMovies,
        selectUpcomingMovies,
      } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectActiveProfile) return { ...mockProfile, id: 2 };
        if (selector === selectActiveProfileLoading) return false;
        if (selector === selectActiveProfileError) return null;
        if (selector === selectShowWatchCounts) return mockShowWatchCounts;
        if (selector === selectMovieWatchCounts) return mockMovieWatchCounts;
        if (selector === selectMilestoneStats) return mockMilestoneStats;
        if (selector === selectRecentEpisodes) return mockRecentEpisodes;
        if (selector === selectUpcomingEpisodes) return mockUpcomingEpisodes;
        if (selector === selectRecentMovies) return [1, 2];
        if (selector === selectUpcomingMovies) return [3, 4];
        
        if (typeof selector === 'function' && selector.toString().includes('selectMoviesByIds')) {
          const selectorStr = selector.toString();
          if (selectorStr.includes('recentMovieIds')) {
            return mockRecentMovies;
          }
          if (selectorStr.includes('upcomingMovieIds')) {
            return mockUpcomingMovies;
          }
        }
        
        return [];
      });

      rerender(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );

      expect(fetchMilestoneStats).toHaveBeenCalledTimes(2);
    });
  });

  describe('navigation to statistics', () => {
    it('should navigate to Statistics tab when handleNavigateToStats is called', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      // Click the Navigate to Stats button in the mocked DashboardProfileCard
      const navigateButton = screen.getByText('Navigate to Stats');
      await user.click(navigateButton);

      await waitFor(() => {
        const statisticsTab = screen.getByRole('tab', { name: /statistics/i });
        expect(statisticsTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(screen.getByTestId('profile-statistics-component')).toBeInTheDocument();
    });
  });

  describe('component rendering with data', () => {
    it('should render KeepWatchingProfileComponent with correct profileId', () => {
      renderWithRouter(<Home />);

      expect(screen.getByTestId('keep-watching-component')).toBeInTheDocument();
    });

    it('should render EpisodesSection in TV Shows tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      await user.click(tvShowsTab);

      await waitFor(() => {
        expect(screen.getByTestId('episodes-section')).toBeInTheDocument();
      });
    });

    it('should render MoviesSection in Movies tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      await user.click(moviesTab);

      await waitFor(() => {
        expect(screen.getByTestId('movies-section')).toBeInTheDocument();
      });
    });

    it('should render StreamingServiceSection in By Service tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const byServiceTab = screen.getByRole('tab', { name: /by service/i });
      await user.click(byServiceTab);

      await waitFor(() => {
        expect(screen.getByTestId('streaming-service-section')).toBeInTheDocument();
      });
    });

    it('should render ProfileStatisticsComponent in Statistics tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const statisticsTab = screen.getByRole('tab', { name: /statistics/i });
      await user.click(statisticsTab);

      await waitFor(() => {
        expect(screen.getByTestId('profile-statistics-component')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have accessible tabs with proper roles', () => {
      renderWithRouter(<Home />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
    });

    it('should have tablist with aria-label', () => {
      renderWithRouter(<Home />);

      const tablist = screen.getByRole('tablist', { name: /home content tabs/i });
      expect(tablist).toBeInTheDocument();
    });

    it('should have tabpanels with proper roles', () => {
      renderWithRouter(<Home />);

      const tabpanels = screen.getAllByRole('tabpanel');
      expect(tabpanels.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid tab switching', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Home />);

      const tvShowsTab = screen.getByRole('tab', { name: /tv shows/i });
      const moviesTab = screen.getByRole('tab', { name: /movies/i });
      const byServiceTab = screen.getByRole('tab', { name: /by service/i });

      await user.click(tvShowsTab);
      await user.click(moviesTab);
      await user.click(byServiceTab);

      await waitFor(() => {
        expect(byServiceTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should handle empty milestone stats', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { 
        selectActiveProfile,
        selectActiveProfileLoading,
        selectActiveProfileError,
        selectShowWatchCounts,
        selectMovieWatchCounts,
        selectMilestoneStats,
        selectRecentEpisodes,
        selectUpcomingEpisodes,
        selectRecentMovies,
        selectUpcomingMovies,
      } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectShowWatchCounts) return mockShowWatchCounts;
        if (selector === selectMovieWatchCounts) return mockMovieWatchCounts;
        if (selector === selectActiveProfileLoading) return false;
        if (selector === selectActiveProfileError) return null;
        if (selector === selectActiveProfile) return mockProfile;
        if (selector === selectMilestoneStats) return null;
        if (selector === selectRecentEpisodes) return mockRecentEpisodes;
        if (selector === selectUpcomingEpisodes) return mockUpcomingEpisodes;
        if (selector === selectRecentMovies) return [1, 2];
        if (selector === selectUpcomingMovies) return [3, 4];
        
        if (typeof selector === 'function' && selector.toString().includes('selectMoviesByIds')) {
          const selectorStr = selector.toString();
          if (selectorStr.includes('recentMovieIds')) {
            return mockRecentMovies;
          }
          if (selectorStr.includes('upcomingMovieIds')) {
            return mockUpcomingMovies;
          }
        }
        
        return [];
      });

      renderWithRouter(<Home />);

      expect(screen.getByTestId('dashboard-profile-card')).toBeInTheDocument();
    });

    it('should handle empty episodes and movies', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { 
        selectActiveProfile,
        selectActiveProfileLoading,
        selectActiveProfileError,
        selectShowWatchCounts,
        selectMovieWatchCounts,
        selectMilestoneStats,
        selectRecentEpisodes,
        selectUpcomingEpisodes,
        selectRecentMovies,
        selectUpcomingMovies,
      } = require('../../../app/slices/activeProfileSlice');
      
      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectShowWatchCounts) return mockShowWatchCounts;
        if (selector === selectMovieWatchCounts) return mockMovieWatchCounts;
        if (selector === selectActiveProfileLoading) return false;
        if (selector === selectActiveProfileError) return null;
        if (selector === selectActiveProfile) return mockProfile;
        if (selector === selectRecentEpisodes) return [];
        if (selector === selectUpcomingEpisodes) return [];
        if (selector === selectRecentMovies) return [];
        if (selector === selectUpcomingMovies) return [];
        if (selector === selectMilestoneStats) return mockMilestoneStats;
        
        if (typeof selector === 'function' && selector.toString().includes('selectMoviesByIds')) {
          return [];
        }
        
        return [];
      });

      renderWithRouter(<Home />);

      expect(screen.getByTestId('dashboard-profile-card')).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<Home />);
      expect(container).toBeInTheDocument();
    });

    it('should clean up on unmount', () => {
      const { unmount } = renderWithRouter(<Home />);

      unmount();

      expect(screen.queryByTestId('dashboard-profile-card')).not.toBeInTheDocument();
    });
  });
});
