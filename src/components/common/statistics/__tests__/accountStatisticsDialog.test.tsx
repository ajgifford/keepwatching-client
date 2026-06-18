import { act, render, screen, waitFor } from '@testing-library/react';

import AccountStatisticsDialog from '../accountStatisticsDialog';
import userEvent from '@testing-library/user-event';

const mockAxiosGet = jest.fn();

jest.mock('../../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
  },
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  EnhancedAccountStatisticsDashboard: ({ statistics, isLoading, enhancedStatistics, isLoadingEnhancedStats }: any) => (
    <div data-testid="account-stats-dashboard">
      {isLoading && <div data-testid="base-stats-loading" />}
      {isLoadingEnhancedStats && <div data-testid="enhanced-stats-loading" />}
      {statistics && <div data-testid="base-statistics-loaded" />}
      {enhancedStatistics?.velocity && <div data-testid="velocity-loaded" />}
    </div>
  ),
}));

const mockOnClose = jest.fn();

const defaultProps = {
  open: true,
  title: 'Account Statistics',
  accountId: 42,
  onClose: mockOnClose,
};

const mockBaseStats = { totalShows: 10, totalMovies: 5 };

function setupSuccessfulMocks() {
  mockAxiosGet.mockImplementation((url: string) => {
    if (url === '/accounts/42/statistics') {
      return Promise.resolve({ data: { results: mockBaseStats } });
    }
    return Promise.resolve({ data: { results: { data: 'enhanced-result' } } });
  });
}

describe('AccountStatisticsDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders dialog when open is true', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<AccountStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render dialog when open is false', () => {
      render(<AccountStatisticsDialog {...defaultProps} open={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders the provided title', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<AccountStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByText('Account Statistics')).toBeInTheDocument();
    });

    it('renders the Close button', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<AccountStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('renders the statistics dashboard component', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<AccountStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByTestId('account-stats-dashboard')).toBeInTheDocument();
    });

    it('renders the time window selector', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<AccountStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByRole('group', { name: /stats time window/i })).toBeInTheDocument();
    });

    it('defaults the time window selector to 30D', async () => {
      setupSuccessfulMocks();
      await act(async () => {
        render(<AccountStatisticsDialog {...defaultProps} />);
      });
      expect(screen.getByRole('button', { name: /30d/i })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('close behavior', () => {
    it('calls onClose when Close button is clicked', async () => {
      const user = userEvent.setup();
      setupSuccessfulMocks();
      render(<AccountStatisticsDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('data fetching', () => {
    it('fetches base statistics when opened', async () => {
      setupSuccessfulMocks();
      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics');
      });
    });

    it('fetches all enhanced statistics endpoints with 30-day velocity by default', async () => {
      setupSuccessfulMocks();
      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/velocity', { params: { days: 30 } });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/activity/timeline', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/binge', { params: { days: 30 } });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/streaks', { params: { days: 30 } });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/time-to-watch', { params: { days: 30 } });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/seasonal', { params: { days: 30 } });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/milestones');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/content-depth', { params: { days: 30 } });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/content-discovery', {
          params: { days: 30 },
        });
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/abandonment-risk');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/unaired-content');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/profile-comparison');
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/rewatches');
      });
    });

    it('does not fetch when dialog is closed', () => {
      render(<AccountStatisticsDialog {...defaultProps} open={false} />);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('does not fetch when accountId is 0', () => {
      render(<AccountStatisticsDialog {...defaultProps} accountId={0} />);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('re-fetches when accountId changes', async () => {
      setupSuccessfulMocks();
      const { rerender } = render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics');
      });

      mockAxiosGet.mockClear();
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: { results: {} } }));
      rerender(<AccountStatisticsDialog {...defaultProps} accountId={99} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/99/statistics');
      });
    });

    it('re-fetches when dialog is reopened', async () => {
      setupSuccessfulMocks();
      const { rerender } = render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics');
      });

      mockAxiosGet.mockClear();
      rerender(<AccountStatisticsDialog {...defaultProps} open={false} />);
      rerender(<AccountStatisticsDialog {...defaultProps} open={true} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics');
      });
    });

    it('re-fetches velocity with new days when time window is changed to 90D', async () => {
      const user = userEvent.setup();
      setupSuccessfulMocks();
      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/velocity', { params: { days: 30 } });
      });

      mockAxiosGet.mockClear();
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: { results: {} } }));

      await user.click(screen.getByRole('button', { name: /90d/i }));

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/velocity', { params: { days: 90 } });
      });
    });

    it('re-fetches velocity with 36500 days when time window is changed to All', async () => {
      const user = userEvent.setup();
      setupSuccessfulMocks();
      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/velocity', { params: { days: 30 } });
      });

      mockAxiosGet.mockClear();
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: { results: {} } }));

      await user.click(screen.getByRole('button', { name: /all/i }));

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/42/statistics/velocity', { params: { days: 36500 } });
      });
    });
  });

  describe('loading state', () => {
    it('shows loading state while base stats are being fetched', async () => {
      mockAxiosGet.mockImplementation(() => new Promise(() => {}));
      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('base-stats-loading')).toBeInTheDocument();
      });
    });

    it('hides loading state after stats are loaded', async () => {
      setupSuccessfulMocks();
      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByTestId('base-stats-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('data display', () => {
    it('passes fetched base statistics to the dashboard', async () => {
      setupSuccessfulMocks();
      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('base-statistics-loaded')).toBeInTheDocument();
      });
    });

    it('passes enhanced statistics to the dashboard', async () => {
      mockAxiosGet.mockImplementation((url: string) => {
        if (url === '/accounts/42/statistics') {
          return Promise.resolve({ data: { results: mockBaseStats } });
        }
        if (url.includes('velocity')) {
          return Promise.resolve({ data: { results: { rate: 2.5 } } });
        }
        return Promise.resolve({ data: { results: {} } });
      });

      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('velocity-loaded')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('still renders dashboard when some enhanced stats fail', async () => {
      mockAxiosGet.mockImplementation((url: string) => {
        if (url === '/accounts/42/statistics') {
          return Promise.resolve({ data: { results: mockBaseStats } });
        }
        if (url.includes('velocity')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ data: { results: {} } });
      });

      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('account-stats-dashboard')).toBeInTheDocument();
      });
    });

    it('still renders dashboard when base stats fetch fails', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Server error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('account-stats-dashboard')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('clears loading state after fetch error', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Server error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<AccountStatisticsDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByTestId('base-stats-loading')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });
});
