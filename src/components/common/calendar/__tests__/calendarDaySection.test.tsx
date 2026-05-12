import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { CalendarDay } from '../../../../app/slices/calendarSlice';
import { CalendarDaySection } from '../calendarDaySection';

const renderWithRouter = (component: React.ReactElement) => render(<BrowserRouter>{component}</BrowserRouter>);

const makeDay = (date: string, showNames: string[] = ['Test Show']): CalendarDay => ({
  date,
  items: showNames.map((showName, i) => ({
    type: 'episode' as const,
    date,
    data: {
      profileId: 1,
      showId: i + 1,
      showName,
      streamingServices: 'Netflix',
      network: 'AMC',
      episodeTitle: 'Episode 1',
      airDate: date,
      runtime: 45,
      episodeNumber: 1,
      seasonNumber: 1,
      episodeStillImage: '',
    },
  })),
});

describe('CalendarDaySection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 0, 15).getTime()); // Jan 15, 2024
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('date label formatting', () => {
    it('should display "Today" label for today\'s date', () => {
      const day = makeDay('2024-01-15');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      const todayLabels = screen.getAllByText('Today');
      expect(todayLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('should display "Tomorrow" for the next day', () => {
      const day = makeDay('2024-01-16');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    });

    it('should display "Yesterday" for the previous day', () => {
      const day = makeDay('2024-01-14');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.getByText('Yesterday')).toBeInTheDocument();
    });

    it('should display a locale-formatted date for other days', () => {
      const day = makeDay('2024-01-10');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.getByText('Wed, Jan 10')).toBeInTheDocument();
    });

    it('should display a locale-formatted date for a future day beyond tomorrow', () => {
      const day = makeDay('2024-01-20');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.getByText('Sat, Jan 20')).toBeInTheDocument();
    });
  });

  describe('"Today" chip', () => {
    it('should show the "Today" chip for today\'s date', () => {
      const day = makeDay('2024-01-15');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      const chips = screen.getAllByText('Today');
      expect(chips.length).toBeGreaterThanOrEqual(1);
    });

    it('should not show the "Today" chip for other dates', () => {
      const day = makeDay('2024-01-16');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.queryByText('Today')).not.toBeInTheDocument();
    });
  });

  describe('item count chip', () => {
    it('should show "1 item" for a single item', () => {
      const day = makeDay('2024-01-20', ['Show A']);
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.getByText('1 item')).toBeInTheDocument();
    });

    it('should show "N items" for multiple items', () => {
      const day = makeDay('2024-01-20', ['Show A', 'Show B', 'Show C']);
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.getByText('3 items')).toBeInTheDocument();
    });
  });

  describe('month/year display', () => {
    it('should show the month and year for non-today dates', () => {
      const day = makeDay('2024-03-20');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.getByText('March 2024')).toBeInTheDocument();
    });

    it('should not show the month and year for today', () => {
      const day = makeDay('2024-01-15');
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.queryByText('January 2024')).not.toBeInTheDocument();
    });
  });

  describe('content items', () => {
    it('should render all items in the day', () => {
      const day = makeDay('2024-01-20', ['Breaking Bad', 'The Wire']);
      renderWithRouter(<CalendarDaySection day={day} profileId={1} />);
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('The Wire')).toBeInTheDocument();
    });

    it('should pass the profileId to each content item link', () => {
      const day = makeDay('2024-01-20', ['My Show']);
      const { container } = renderWithRouter(<CalendarDaySection day={day} profileId={7} />);
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/shows/1/7');
    });
  });
});
