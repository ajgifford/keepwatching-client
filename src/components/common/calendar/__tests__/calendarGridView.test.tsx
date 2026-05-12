import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { CalendarDay } from '../../../../app/slices/calendarSlice';
import { CalendarGridView } from '../calendarGridView';
import userEvent from '@testing-library/user-event';

const renderWithRouter = (component: React.ReactElement) => render(<BrowserRouter>{component}</BrowserRouter>);

const makeGridProps = (overrides: Partial<React.ComponentProps<typeof CalendarGridView>> = {}) => ({
  days: [] as CalendarDay[],
  profileId: 1,
  viewYear: 2024,
  viewMonth: 0, // January 2024
  onPrevMonth: jest.fn(),
  onNextMonth: jest.fn(),
  onJumpToToday: jest.fn(),
  ...overrides,
});

const makeDayWithItems = (date: string, count = 1): CalendarDay => ({
  date,
  items: Array.from({ length: count }, (_, i) => ({
    type: 'episode' as const,
    date,
    data: {
      profileId: 1,
      showId: i + 1,
      showName: `Show ${i + 1}`,
      streamingServices: 'Netflix',
      network: 'AMC',
      episodeTitle: `Episode ${i + 1}`,
      airDate: date,
      runtime: 45,
      episodeNumber: i + 1,
      seasonNumber: 1,
      episodeStillImage: '',
    },
  })),
});

describe('CalendarGridView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 0, 15).getTime()); // Jan 15, 2024
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('month header', () => {
    it('should display the correct month label', () => {
      renderWithRouter(<CalendarGridView {...makeGridProps()} />);
      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('should display a different month label when viewMonth changes', () => {
      renderWithRouter(<CalendarGridView {...makeGridProps({ viewYear: 2024, viewMonth: 5 })} />);
      expect(screen.getByText('June 2024')).toBeInTheDocument();
    });

    it('should display a different year when viewYear changes', () => {
      renderWithRouter(<CalendarGridView {...makeGridProps({ viewYear: 2025, viewMonth: 0 })} />);
      expect(screen.getByText('January 2025')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should call onPrevMonth when the previous month button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onPrevMonth = jest.fn();
      renderWithRouter(<CalendarGridView {...makeGridProps({ onPrevMonth })} />);
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);
      expect(onPrevMonth).toHaveBeenCalledTimes(1);
    });

    it('should call onNextMonth when the next month button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onNextMonth = jest.fn();
      renderWithRouter(<CalendarGridView {...makeGridProps({ onNextMonth })} />);
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);
      expect(onNextMonth).toHaveBeenCalledTimes(1);
    });

    it('should call onJumpToToday when the "Today" chip is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onJumpToToday = jest.fn();
      renderWithRouter(<CalendarGridView {...makeGridProps({ onJumpToToday })} />);
      await user.click(screen.getByText('Today'));
      expect(onJumpToToday).toHaveBeenCalledTimes(1);
    });
  });

  describe('day-of-week headers', () => {
    it('should display all seven day-of-week labels', () => {
      renderWithRouter(<CalendarGridView {...makeGridProps()} />);
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('grid cells', () => {
    it('should display the first and last day numbers of the month', () => {
      renderWithRouter(<CalendarGridView {...makeGridProps()} />);
      // January 2024 has 31 days
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument();
    });
  });

  describe('content overflow indicator', () => {
    it('should show "+N" overflow when a day has more than 3 items', () => {
      const days = [makeDayWithItems('2024-01-10', 5)];
      renderWithRouter(<CalendarGridView {...makeGridProps({ days })} />);
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should not show overflow for exactly 3 items', () => {
      const days = [makeDayWithItems('2024-01-10', 3)];
      renderWithRouter(<CalendarGridView {...makeGridProps({ days })} />);
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });
  });

  describe('legend', () => {
    it('should display the "Episode" legend label', () => {
      renderWithRouter(<CalendarGridView {...makeGridProps()} />);
      expect(screen.getByText('Episode')).toBeInTheDocument();
    });

    it('should display the "Movie" legend label', () => {
      renderWithRouter(<CalendarGridView {...makeGridProps()} />);
      expect(screen.getByText('Movie')).toBeInTheDocument();
    });
  });

  describe('day popover', () => {
    it('should open a popover showing items when a day with content is clicked', async () => {
      const days = [makeDayWithItems('2024-01-10', 1)];
      renderWithRouter(<CalendarGridView {...makeGridProps({ days })} />);

      // Find day "10" cell — January 2024 has firstDow=1 so cell index 10 = day 10
      fireEvent.click(screen.getByText('10'));

      await waitFor(() => {
        expect(screen.getByText('Show 1')).toBeInTheDocument();
      });
    });

    it('should show the full date in the popover header', async () => {
      const days = [makeDayWithItems('2024-01-10', 1)];
      renderWithRouter(<CalendarGridView {...makeGridProps({ days })} />);

      fireEvent.click(screen.getByText('10'));

      await waitFor(() => {
        expect(screen.getByText('Wednesday, January 10, 2024')).toBeInTheDocument();
      });
    });

    it('should close the popover when an item link is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const days = [makeDayWithItems('2024-01-10', 1)];
      renderWithRouter(<CalendarGridView {...makeGridProps({ days })} />);

      fireEvent.click(screen.getByText('10'));

      await waitFor(() => {
        expect(screen.getByText('Show 1')).toBeInTheDocument();
      });

      // Clicking a list item calls handlePopoverClose
      const listItem = screen.getByText('Show 1').closest('li');
      if (listItem) fireEvent.click(listItem);

      await waitFor(() => {
        expect(screen.queryByText('Wednesday, January 10, 2024')).not.toBeInTheDocument();
      });
    });
  });
});
