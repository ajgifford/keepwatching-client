import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { RecapNavigator } from '../recapNavigator';
import userEvent from '@testing-library/user-event';

const mockAxiosGet = jest.fn();

jest.mock('../../../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
  },
}));

const mockAvailable = {
  years: [2025, 2026],
  months: [
    { year: 2026, month: 6 },
    { year: 2026, month: 7 },
  ],
};

const mockYearlyRecap = (year: number) => ({
  profileId: 1,
  period: 'year',
  year,
  startDate: `${year}-01-01`,
  endDate: `${year}-12-31`,
  hoursWatched: 100,
  episodesWatched: 150,
  moviesWatched: 10,
  topGenres: [],
  topShow: null,
  topMovie: null,
  longestStreak: null,
  busiestBingeDay: null,
  firstWatchDate: null,
  activityBreakdown: [],
});

function setupMocks() {
  mockAxiosGet.mockImplementation((url: string, config?: any) => {
    if (url.endsWith('/recap/available')) {
      return Promise.resolve({ data: { results: mockAvailable } });
    }
    if (url.endsWith('/recap')) {
      return Promise.resolve({ data: { results: mockYearlyRecap(config.params.year) } });
    }
    return Promise.reject(new Error(`Unhandled URL: ${url}`));
  });
}

describe('RecapNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state before available periods are fetched', () => {
    mockAxiosGet.mockReturnValue(new Promise(() => {}));
    render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    expect(screen.getByText(/loading your recap history/i)).toBeInTheDocument();
  });

  it('shows an empty state when there are no available periods', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: { years: [], months: [] } } });
    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    });
    expect(screen.getByText(/no yearly recap available yet/i)).toBeInTheDocument();
  });

  it('defaults to the most recent year and fetches its recap', async () => {
    setupMocks();
    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    });

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/accounts/1/profiles/2/statistics/recap',
        expect.objectContaining({ params: expect.objectContaining({ period: 'year', year: 2026 }) })
      );
    });

    expect(await screen.findByText("Andy's 2026")).toBeInTheDocument();
  });

  it('switches to monthly periods when the Monthly toggle is clicked', async () => {
    setupMocks();
    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    });
    await screen.findByText("Andy's 2026");

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /monthly/i }));

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/accounts/1/profiles/2/statistics/recap',
        expect.objectContaining({ params: expect.objectContaining({ period: 'month', year: 2026, month: 7 }) })
      );
    });
  });

  it('navigates to the previous period when the left arrow is clicked', async () => {
    setupMocks();
    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    });
    await screen.findByText("Andy's 2026");

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /previous recap/i }));

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/accounts/1/profiles/2/statistics/recap',
        expect.objectContaining({ params: expect.objectContaining({ period: 'year', year: 2025 }) })
      );
    });
  });

  it('disables download/share until the focused recap has loaded', async () => {
    setupMocks();
    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download as image/i })).not.toBeDisabled();
    });
  });

  it('does not snap back when a scroll event fires mid-animation after navigating forward', async () => {
    // Regression test: clicking an arrow used to fight its own smooth-scroll animation.
    // Programmatically scrolling to the target card fires intermediate `scroll` events with a
    // partial scrollLeft; without guarding against self-triggered scrolls, that recomputed a
    // stale "nearest index" and snapped focus back to the previous card.
    setupMocks();
    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    });
    // Defaults to the most recent year (2026); step back to 2025 first so we can navigate forward.
    await screen.findByText("Andy's 2026");
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /previous recap/i }));
    await screen.findByText("Andy's 2025");

    const track = screen.getByTestId('recap-scroll-track');
    Object.defineProperty(track, 'clientWidth', { value: 400, configurable: true });

    await user.click(screen.getByRole('button', { name: /next recap/i }));
    await screen.findByText("Andy's 2026");

    // Simulate the browser mid-animation: scrollLeft still close to the *previous* card's
    // position, which would resolve to index 0 if handleScroll weren't guarded.
    Object.defineProperty(track, 'scrollLeft', { value: 20, configurable: true });
    fireEvent.scroll(track);

    // The focused period should still be 2026, not reverted to 2025 by the stray scroll event.
    // (Both cards stay mounted in the scroll track, so assert on the focused-period label rather
    // than card presence.)
    expect(screen.getByTestId('focused-period-label')).toHaveTextContent('2026');
  });

  it('prefetches the previous calendar period alongside the focused one for the comparison badge', async () => {
    setupMocks();
    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    });
    await screen.findByText("Andy's 2026");

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/accounts/1/profiles/2/statistics/recap',
        expect.objectContaining({ params: expect.objectContaining({ period: 'year', year: 2025 }) })
      );
    });

    // Both years return identical stats in the mock, so once the prefetched 2025 data lands, a
    // 0%-change badge (not "no badge") on both headline numbers confirms the comparison actually
    // picked up the cached previous-period recap rather than treating it as missing.
    const badges = await screen.findAllByText(/0% vs last year/);
    expect(badges).toHaveLength(2);
  });

  it('prefetches December of the prior year as "previous" for a January monthly recap', async () => {
    mockAxiosGet.mockImplementation((url: string, config?: any) => {
      if (url.endsWith('/recap/available')) {
        return Promise.resolve({
          data: {
            results: {
              years: [2026],
              months: [
                { year: 2025, month: 12 },
                { year: 2026, month: 1 },
              ],
            },
          },
        });
      }
      if (url.endsWith('/recap')) {
        return Promise.resolve({ data: { results: mockYearlyRecap(config.params.year) } });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="month" />);
    });

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/accounts/1/profiles/2/statistics/recap',
        expect.objectContaining({ params: expect.objectContaining({ period: 'month', year: 2025, month: 12 }) })
      );
    });
  });

  it('shows the Yearly/Monthly toggle by default (both period types allowed)', async () => {
    setupMocks();
    await act(async () => {
      render(<RecapNavigator accountId={1} profileId={2} profileName="Andy" initialPeriodType="year" />);
    });
    await screen.findByText("Andy's 2026");

    expect(screen.getByRole('button', { name: /yearly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
  });

  it('hides the toggle entirely when only one period type is allowed', async () => {
    setupMocks();
    await act(async () => {
      render(
        <RecapNavigator
          accountId={1}
          profileId={2}
          profileName="Andy"
          initialPeriodType="month"
          initialYear={2026}
          initialMonth={7}
          allowedPeriodTypes={['month']}
        />
      );
    });
    await screen.findByText("Andy's July 2026");

    expect(screen.queryByRole('button', { name: /yearly/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /monthly/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('shows the toggle when explicitly allowed both period types (December overlap window)', async () => {
    setupMocks();
    await act(async () => {
      render(
        <RecapNavigator
          accountId={1}
          profileId={2}
          profileName="Andy"
          initialPeriodType="year"
          allowedPeriodTypes={['year', 'month']}
        />
      );
    });
    await screen.findByText("Andy's 2026");

    expect(screen.getByRole('button', { name: /yearly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
  });
});
