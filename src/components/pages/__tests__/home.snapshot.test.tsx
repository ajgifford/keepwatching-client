import { render } from '@testing-library/react';
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

describe('Home - Snapshots', () => {
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
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<Home />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of Keep Watching tab', () => {
    const { container } = renderWithRouter(<Home />);
    const tabpanel = container.querySelector('[role="tabpanel"]');
    expect(tabpanel).toMatchSnapshot();
  });
});
