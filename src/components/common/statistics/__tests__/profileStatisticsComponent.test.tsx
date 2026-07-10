import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ProfileStatisticsComponent from '../profileStatisticsComponent';
import userEvent from '@testing-library/user-event';

const mockAxiosGet = jest.fn();

jest.mock('../../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
  },
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  EnhancedProfileStatisticsDashboard: ({ statistics, isLoading, isLoadingEnhancedStats }: any) => (
    <div data-testid="profile-stats-dashboard">
      {isLoading && <div data-testid="base-stats-loading" />}
      {isLoadingEnhancedStats && <div data-testid="enhanced-stats-loading" />}
      {statistics && <div data-testid="base-statistics-loaded" />}
    </div>
  ),
}));

const defaultProps = {
  accountId: 42,
  profileId: 7,
};

const mockBaseStats = { totalShows: 5, totalMovies: 3 };

function setupSuccessfulMocks() {
  mockAxiosGet.mockImplementation((url: string) => {
    if (url === '/accounts/42/profiles/7/statistics') {
      return Promise.resolve({ data: { results: mockBaseStats } });
    }
    return Promise.resolve({ data: { results: { data: 'enhanced-result' } } });
  });
}

describe('ProfileStatisticsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the statistics dashboard', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(
          <MemoryRouter>
            <ProfileStatisticsComponent {...defaultProps} />
          </MemoryRouter>
        );
      });
      expect(screen.getByTestId('profile-stats-dashboard')).toBeInTheDocument();
    });

    it('renders without a dialog wrapper', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(
          <MemoryRouter>
            <ProfileStatisticsComponent {...defaultProps} />
          </MemoryRouter>
        );
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders the time window selector', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(
          <MemoryRouter>
            <ProfileStatisticsComponent {...defaultProps} />
          </MemoryRouter>
        );
      });
      expect(screen.getByRole('group', { name: /stats time window/i })).toBeInTheDocument();
    });

    it('defaults the time window selector to 30D', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(
          <MemoryRouter>
            <ProfileStatisticsComponent {...defaultProps} />
          </MemoryRouter>
        );
      });
      expect(screen.getByRole('button', { name: /30d/i })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('data fetching', () => {
    it('fetches base statistics on mount', async () => {
      setupSuccessfulMocks();
      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics');
      });
    });

    it('fetches all enhanced statistics endpoints with 30-day velocity by default', async () => {
      setupSuccessfulMocks();
      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/velocity', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/activity/timeline', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/binge', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/streaks', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/time-to-watch', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/seasonal', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/milestones');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/content-depth', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/content-discovery', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/abandonment-risk');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/unaired-content');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/rewatches');
      });
    });

    it('does not fetch when accountId is 0', () => {
      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} accountId={0} />
        </MemoryRouter>
      );
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('does not fetch when profileId is 0', () => {
      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} profileId={0} />
        </MemoryRouter>
      );
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('re-fetches when profileId changes', async () => {
      setupSuccessfulMocks();
      const { rerender } = render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics');
      });

      mockAxiosGet.mockClear();
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: { results: {} } }));
      rerender(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} profileId={99} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/99/statistics');
      });
    });

    it('re-fetches when accountId changes', async () => {
      setupSuccessfulMocks();
      const { rerender } = render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics');
      });

      mockAxiosGet.mockClear();
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: { results: {} } }));
      rerender(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} accountId={55} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/55/profiles/7/statistics');
      });
    });

    it('re-fetches velocity with new days when time window is changed to 6M', async () => {
      const user = userEvent.setup();
      setupSuccessfulMocks();
      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/velocity', {
          params: { days: 30 },
        });
      });

      mockAxiosGet.mockClear();
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: { results: {} } }));

      await user.click(screen.getByRole('button', { name: /6m/i }));

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/velocity', {
          params: { days: 180 },
        });
      });
    });
  });

  describe('loading state', () => {
    it('shows loading state while stats are being fetched', async () => {
      mockAxiosGet.mockImplementation(() => new Promise(() => {}));
      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('base-stats-loading')).toBeInTheDocument();
      });
    });

    it('hides loading state after stats are loaded', async () => {
      setupSuccessfulMocks();
      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('base-stats-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('data display', () => {
    it('passes fetched base statistics to the dashboard', async () => {
      setupSuccessfulMocks();
      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('base-statistics-loaded')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('still renders dashboard when some enhanced stats fail', async () => {
      mockAxiosGet.mockImplementation((url: string) => {
        if (url === '/accounts/42/profiles/7/statistics') {
          return Promise.resolve({ data: { results: mockBaseStats } });
        }
        if (url.includes('velocity')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ data: { results: {} } });
      });

      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile-stats-dashboard')).toBeInTheDocument();
      });
    });

    it('still renders dashboard when base stats fetch fails', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Server error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile-stats-dashboard')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('clears loading state after fetch error', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Server error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <MemoryRouter>
          <ProfileStatisticsComponent {...defaultProps} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('base-stats-loading')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });
});
