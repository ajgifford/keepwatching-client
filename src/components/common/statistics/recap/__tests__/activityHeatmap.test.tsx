import { render, screen } from '@testing-library/react';

import { ActivityHeatmap } from '../activityHeatmap';

describe('ActivityHeatmap', () => {
  it('renders nothing when the breakdown is empty', () => {
    const { container } = render(<ActivityHeatmap activityBreakdown={[]} period="month" periodLabel="July 2026" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when every bucket is zero', () => {
    const { container } = render(
      <ActivityHeatmap
        activityBreakdown={Array.from({ length: 30 }, (_, i) => ({ period: i + 1, episodesWatched: 0 }))}
        period="month"
        periodLabel="July 2026"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a labeled section and one cell per bucket for a monthly recap', () => {
    const breakdown = Array.from({ length: 30 }, (_, i) => ({ period: i + 1, episodesWatched: i === 4 ? 6 : 0 }));
    render(<ActivityHeatmap activityBreakdown={breakdown} period="month" periodLabel="July 2026" />);

    expect(screen.getByText('July 2026 activity')).toBeInTheDocument();
    expect(screen.getByTitle('Day 5: 6 episodes')).toBeInTheDocument();
    expect(screen.getByTitle('Day 1: 0 episodes')).toBeInTheDocument();
  });

  it('renders month abbreviations for a yearly recap', () => {
    const breakdown = Array.from({ length: 12 }, (_, i) => ({ period: i + 1, episodesWatched: i === 0 ? 12 : 0 }));
    render(<ActivityHeatmap activityBreakdown={breakdown} period="year" periodLabel="2026" />);

    expect(screen.getByText('2026 activity')).toBeInTheDocument();
    expect(screen.getByTitle('Jan: 12 episodes')).toBeInTheDocument();
    expect(screen.getByTitle('Dec: 0 episodes')).toBeInTheDocument();
  });

  it('uses singular wording for exactly one episode', () => {
    const breakdown = [{ period: 1, episodesWatched: 1 }];
    render(<ActivityHeatmap activityBreakdown={breakdown} period="month" periodLabel="July 2026" />);

    expect(screen.getByTitle('Day 1: 1 episode')).toBeInTheDocument();
  });
});
