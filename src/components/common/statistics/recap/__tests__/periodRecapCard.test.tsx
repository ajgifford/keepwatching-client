import { render, screen } from '@testing-library/react';

import {
  PeriodRecapCard,
  accentGradientStops,
  calculatePercentChange,
  formatPercentChange,
  formatWatchedCaption,
  recapPeriodLabel,
} from '../periodRecapCard';
import { ProfileRecapResponse } from '@ajgifford/keepwatching-types';

const yearlyActivityBreakdown = Array.from({ length: 12 }, (_, i) => ({
  period: i + 1,
  episodesWatched: i === 6 ? 40 : i * 2,
}));

const mockRecap: ProfileRecapResponse = {
  profileId: 1,
  period: 'year',
  year: 2026,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  hoursWatched: 120,
  episodesWatched: 200,
  moviesWatched: 15,
  topGenres: [
    { genre: 'Drama', count: 40 },
    { genre: 'Comedy', count: 20 },
  ],
  topShow: { showId: 7, title: 'Breaking Bad', episodesWatched: 62 },
  topMovie: { movieId: 3, title: 'Inception' },
  longestStreak: { days: 14, startDate: '2026-07-01', endDate: '2026-07-14' },
  busiestBingeDay: { date: '2026-07-04', episodesWatched: 11 },
  firstWatchDate: '2026-01-03',
  activityBreakdown: yearlyActivityBreakdown,
};

describe('recapPeriodLabel', () => {
  it('returns the year for a yearly period', () => {
    expect(recapPeriodLabel('year', 2026)).toBe('2026');
  });

  it('returns "Month Year" for a monthly period', () => {
    expect(recapPeriodLabel('month', 2026, 7)).toBe('July 2026');
  });
});

describe('accentGradientStops', () => {
  it('uses the accent color itself as the middle stop', () => {
    const stops = accentGradientStops('#7b1fa2');
    expect(stops.mid).toBe('#7b1fa2');
  });

  it('derives a darker shade for the start stop', () => {
    const stops = accentGradientStops('#7b1fa2');
    expect(stops.start).not.toBe(stops.mid);
    expect(stops.start.toLowerCase()).not.toBe(stops.end.toLowerCase());
  });

  it('produces a different gradient for a different accent color', () => {
    const purple = accentGradientStops('#7b1fa2');
    const teal = accentGradientStops('#00897b');
    expect(purple).not.toEqual(teal);
  });
});

describe('formatWatchedCaption', () => {
  it('shows both counts when both are nonzero', () => {
    expect(formatWatchedCaption(194, 5)).toBe('194 episodes · 5 movies');
  });

  it('omits movies when there are none', () => {
    expect(formatWatchedCaption(194, 0)).toBe('194 episodes');
  });

  it('omits episodes when there are none', () => {
    expect(formatWatchedCaption(0, 5)).toBe('5 movies');
  });

  it('uses singular wording for exactly one', () => {
    expect(formatWatchedCaption(1, 0)).toBe('1 episode');
    expect(formatWatchedCaption(0, 1)).toBe('1 movie');
  });
});

describe('calculatePercentChange', () => {
  it('returns null when there is no previous value', () => {
    expect(calculatePercentChange(50, undefined)).toBeNull();
    expect(calculatePercentChange(50, null)).toBeNull();
  });

  it('returns null when the previous value is zero (a quiet prior period is not remarkable)', () => {
    expect(calculatePercentChange(50, 0)).toBeNull();
  });

  it('computes a positive percent change', () => {
    expect(calculatePercentChange(120, 100)).toBe(20);
  });

  it('computes a negative percent change', () => {
    expect(calculatePercentChange(80, 100)).toBe(-20);
  });

  it('rounds to the nearest whole percent', () => {
    expect(calculatePercentChange(110, 100)).toBe(10);
    expect(calculatePercentChange(103, 100)).toBe(3);
  });

  it('is unbounded for large increases (formatting handles the display cap)', () => {
    expect(calculatePercentChange(194, 13)).toBe(1392);
  });
});

describe('formatPercentChange', () => {
  it('shows the exact value under the cap', () => {
    expect(formatPercentChange(20)).toBe('20%');
    expect(formatPercentChange(500)).toBe('500%');
  });

  it('caps large increases at ">500%"', () => {
    expect(formatPercentChange(1392)).toBe('>500%');
    expect(formatPercentChange(501)).toBe('>500%');
  });

  it('shows the absolute value for decreases without a cap (bounded to -100% already)', () => {
    expect(formatPercentChange(-20)).toBe('20%');
    expect(formatPercentChange(-100)).toBe('100%');
  });
});

describe('PeriodRecapCard', () => {
  it('shows a loading spinner while loading', () => {
    render(<PeriodRecapCard profileName="Andy" period="year" year={2026} recap={null} isLoading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows skeletons when not loading but no recap data yet', () => {
    const { container } = render(
      <PeriodRecapCard profileName="Andy" period="year" year={2026} recap={null} isLoading={false} />
    );
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  it('renders the yearly recap stats', () => {
    render(<PeriodRecapCard profileName="Andy" period="year" year={2026} recap={mockRecap} isLoading={false} />);

    expect(screen.getByText("Andy's 2026")).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText(/200 episodes/)).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText(/Breaking Bad/)).toBeInTheDocument();
    expect(screen.getByText(/Inception/)).toBeInTheDocument();
    expect(screen.getByText(/14 days/)).toBeInTheDocument();
  });

  it('uses a gradient derived from the profile accent color when provided', () => {
    render(
      <PeriodRecapCard
        profileName="Andy"
        profileAccentColor="#7b1fa2"
        period="year"
        year={2026}
        recap={mockRecap}
        isLoading={false}
      />
    );

    const card = screen.getByTestId('period-recap-card');
    const backgroundImage = window.getComputedStyle(card).backgroundImage;

    expect(backgroundImage.toLowerCase()).toContain('#7b1fa2');
  });

  it('does not use the accent color in the gradient when none is provided', () => {
    render(<PeriodRecapCard profileName="Andy" period="year" year={2026} recap={mockRecap} isLoading={false} />);

    const card = screen.getByTestId('period-recap-card');
    const backgroundImage = window.getComputedStyle(card).backgroundImage;

    expect(backgroundImage.toLowerCase()).not.toContain('#7b1fa2');
  });

  it('also shows a longest streak callout for monthly recaps', () => {
    render(
      <PeriodRecapCard
        profileName="Andy"
        period="month"
        year={2026}
        month={7}
        recap={{ ...mockRecap, period: 'month', month: 7 }}
        isLoading={false}
      />
    );

    expect(screen.getByText("Andy's July 2026")).toBeInTheDocument();
    expect(screen.getByText(/Longest streak/)).toBeInTheDocument();
  });

  it('renders the activity heatmap when there is activity in the breakdown', () => {
    render(<PeriodRecapCard profileName="Andy" period="year" year={2026} recap={mockRecap} isLoading={false} />);

    expect(screen.getByText('2026 activity')).toBeInTheDocument();
  });

  it('does not render the activity heatmap when the breakdown is entirely zero', () => {
    render(
      <PeriodRecapCard
        profileName="Andy"
        period="year"
        year={2026}
        recap={{
          ...mockRecap,
          activityBreakdown: Array.from({ length: 12 }, (_, i) => ({ period: i + 1, episodesWatched: 0 })),
        }}
        isLoading={false}
      />
    );

    expect(screen.queryByText('2026 activity')).not.toBeInTheDocument();
  });

  it('does not render top genres, top show, or top movie when absent', () => {
    render(
      <PeriodRecapCard
        profileName="Andy"
        period="year"
        year={2026}
        recap={{
          ...mockRecap,
          topGenres: [],
          topShow: null,
          topMovie: null,
          longestStreak: null,
          busiestBingeDay: null,
        }}
        isLoading={false}
      />
    );

    expect(screen.queryByText('Top genres')).not.toBeInTheDocument();
    expect(screen.queryByText(/Most watched/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Standout movie/)).not.toBeInTheDocument();
  });

  it('shows comparison badges against the previous period when provided', () => {
    render(
      <PeriodRecapCard
        profileName="Andy"
        period="year"
        year={2026}
        recap={mockRecap}
        previousRecap={{ ...mockRecap, year: 2025, hoursWatched: 100, episodesWatched: 150, moviesWatched: 10 }}
        isLoading={false}
      />
    );

    // hours: 120 vs 100 -> +20%; items: 215 vs 160 -> +34%
    expect(screen.getByText(/20% vs last year/)).toBeInTheDocument();
    expect(screen.getByText(/34% vs last year/)).toBeInTheDocument();
  });

  it('shows a down arrow badge when the period declined', () => {
    render(
      <PeriodRecapCard
        profileName="Andy"
        period="month"
        year={2026}
        month={7}
        recap={{ ...mockRecap, period: 'month', month: 7, hoursWatched: 40 }}
        previousRecap={{ ...mockRecap, period: 'month', month: 6, hoursWatched: 80 }}
        isLoading={false}
      />
    );

    expect(screen.getByText(/50% vs last month/)).toBeInTheDocument();
  });

  it('does not show a comparison badge when there is no previous recap', () => {
    render(
      <PeriodRecapCard
        profileName="Andy"
        period="year"
        year={2026}
        recap={mockRecap}
        previousRecap={null}
        isLoading={false}
      />
    );

    expect(screen.queryByText(/vs last/)).not.toBeInTheDocument();
  });

  it('does not show a comparison badge when the previous period had zero activity', () => {
    render(
      <PeriodRecapCard
        profileName="Andy"
        period="year"
        year={2026}
        recap={mockRecap}
        previousRecap={{ ...mockRecap, year: 2025, hoursWatched: 0, episodesWatched: 0, moviesWatched: 0 }}
        isLoading={false}
      />
    );

    expect(screen.queryByText(/vs last/)).not.toBeInTheDocument();
  });
});
