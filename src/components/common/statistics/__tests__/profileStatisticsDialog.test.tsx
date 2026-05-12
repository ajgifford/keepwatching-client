import { act, render, screen, waitFor } from '@testing-library/react';

import ProfileStatisticsDialog from '../profileStatisticsDialog';
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

const mockOnClose = jest.fn();

const defaultProps = {
  open: true,
  title: 'Profile Statistics',
  accountId: 42,
  profileId: 7,
  onClose: mockOnClose,
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

describe('ProfileStatisticsDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders dialog when open is true', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<ProfileStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render dialog when open is false', () => {
      render(<ProfileStatisticsDialog {...defaultProps} open={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders the provided title', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<ProfileStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByText('Profile Statistics')).toBeInTheDocument();
    });

    it('renders the Close button', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<ProfileStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('renders the statistics dashboard component', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<ProfileStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByTestId('profile-stats-dashboard')).toBeInTheDocument();
    });
  });

  describe('close behavior', () => {
    it('calls onClose when Close button is clicked', async () => {
      const user = userEvent.setup();
      setupSuccessfulMocks();
      render(<ProfileStatisticsDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('data fetching', () => {
    it('fetches base statistics using the profile endpoint', async () => {
      setupSuccessfulMocks();
      render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics');
      });
    });

    it('fetches all enhanced statistics endpoints', async () => {
      setupSuccessfulMocks();
      render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/velocity', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/activity/timeline');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/binge');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/streaks');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/time-to-watch');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/seasonal');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/milestones');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/content-depth');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/content-discovery');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/abandonment-risk');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/unaired-content');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics/rewatches');
      });
    });

    it('does not fetch when dialog is closed', () => {
      render(<ProfileStatisticsDialog {...defaultProps} open={false} />);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('does not fetch when accountId is 0', () => {
      render(<ProfileStatisticsDialog {...defaultProps} accountId={0} />);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('does not fetch when profileId is 0', () => {
      render(<ProfileStatisticsDialog {...defaultProps} profileId={0} />);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('re-fetches when profileId changes', async () => {
      setupSuccessfulMocks();
      const { rerender } = render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics');
      });

      mockAxiosGet.mockClear();
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: { results: {} } }));
      rerender(<ProfileStatisticsDialog {...defaultProps} profileId={99} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/99/statistics');
      });
    });

    it('re-fetches when accountId changes', async () => {
      setupSuccessfulMocks();
      const { rerender } = render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics');
      });

      mockAxiosGet.mockClear();
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: { results: {} } }));
      rerender(<ProfileStatisticsDialog {...defaultProps} accountId={55} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/55/profiles/7/statistics');
      });
    });

    it('re-fetches when dialog is reopened', async () => {
      setupSuccessfulMocks();
      const { rerender } = render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics');
      });

      mockAxiosGet.mockClear();
      rerender(<ProfileStatisticsDialog {...defaultProps} open={false} />);
      rerender(<ProfileStatisticsDialog {...defaultProps} open={true} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/profiles/7/statistics');
      });
    });
  });

  describe('loading state', () => {
    it('shows loading state while stats are being fetched', async () => {
      mockAxiosGet.mockImplementation(() => new Promise(() => {}));
      render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('base-stats-loading')).toBeInTheDocument();
      });
    });

    it('hides loading state after stats are loaded', async () => {
      setupSuccessfulMocks();
      render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByTestId('base-stats-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('data display', () => {
    it('passes fetched base statistics to the dashboard', async () => {
      setupSuccessfulMocks();
      render(<ProfileStatisticsDialog {...defaultProps} />);

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

      render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-stats-dashboard')).toBeInTheDocument();
      });
    });

    it('still renders dashboard when base stats fetch fails', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Server error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-stats-dashboard')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('clears loading state after fetch error', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Server error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<ProfileStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByTestId('base-stats-loading')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });
});
