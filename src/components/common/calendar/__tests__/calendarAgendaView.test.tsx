import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { CalendarDay } from '../../../../app/slices/calendarSlice';
import { CalendarAgendaView } from '../calendarAgendaView';

// scrollIntoView is not implemented in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

const renderWithRouter = (component: React.ReactElement) => render(<BrowserRouter>{component}</BrowserRouter>);

// Use dates well outside the range of any realistic test execution date
// so the TODAY module-level constant doesn't affect these tests.
const PAST_DATE = '1990-06-01';
const FUTURE_DATE_1 = '2099-06-01';
const FUTURE_DATE_2 = '2099-06-02';

const makeDay = (date: string, showName = 'Test Show'): CalendarDay => ({
  date,
  items: [
    {
      type: 'episode' as const,
      date,
      data: {
        profileId: 1,
        showId: 1,
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
    },
  ],
});

describe('CalendarAgendaView', () => {
  describe('compact mode', () => {
    it('should show empty state when there are no upcoming days', () => {
      renderWithRouter(<CalendarAgendaView days={[makeDay(PAST_DATE)]} profileId={1} compact />);
      expect(screen.getByText('No upcoming content scheduled')).toBeInTheDocument();
    });

    it('should show empty state when days array is empty', () => {
      renderWithRouter(<CalendarAgendaView days={[]} profileId={1} compact />);
      expect(screen.getByText('No upcoming content scheduled')).toBeInTheDocument();
    });

    it('should render future days in compact mode', () => {
      const days = [makeDay(FUTURE_DATE_1, 'Future Show')];
      renderWithRouter(<CalendarAgendaView days={days} profileId={1} compact />);
      expect(screen.getByText('Future Show')).toBeInTheDocument();
    });

    it('should not render past days in compact mode', () => {
      const days = [makeDay(PAST_DATE, 'Past Show'), makeDay(FUTURE_DATE_1, 'Future Show')];
      renderWithRouter(<CalendarAgendaView days={days} profileId={1} compact />);
      expect(screen.queryByText('Past Show')).not.toBeInTheDocument();
      expect(screen.getByText('Future Show')).toBeInTheDocument();
    });

    it('should show at most 10 days in compact mode', () => {
      const days = Array.from({ length: 15 }, (_, i) => ({
        ...makeDay(`2099-07-${String(i + 1).padStart(2, '0')}`),
        items: [
          {
            type: 'episode' as const,
            date: `2099-07-${String(i + 1).padStart(2, '0')}`,
            data: {
              profileId: 1,
              showId: i + 1,
              showName: `Show ${i + 1}`,
              streamingServices: 'Netflix',
              network: 'AMC',
              episodeTitle: 'Ep',
              airDate: `2099-07-${String(i + 1).padStart(2, '0')}`,
              runtime: 45,
              episodeNumber: 1,
              seasonNumber: 1,
              episodeStillImage: '',
            },
          },
        ],
      }));

      renderWithRouter(<CalendarAgendaView days={days} profileId={1} compact />);

      expect(screen.getByText('Show 1')).toBeInTheDocument();
      expect(screen.getByText('Show 10')).toBeInTheDocument();
      expect(screen.queryByText('Show 11')).not.toBeInTheDocument();
    });
  });

  describe('full mode', () => {
    it('should show empty state when days array is empty', () => {
      renderWithRouter(<CalendarAgendaView days={[]} profileId={1} />);
      expect(screen.getByText('No content scheduled in this date range')).toBeInTheDocument();
    });

    it('should render past days', () => {
      renderWithRouter(<CalendarAgendaView days={[makeDay(PAST_DATE, 'Past Show')]} profileId={1} />);
      expect(screen.getByText('Past Show')).toBeInTheDocument();
    });

    it('should render future days', () => {
      renderWithRouter(<CalendarAgendaView days={[makeDay(FUTURE_DATE_1, 'Future Show')]} profileId={1} />);
      expect(screen.getByText('Future Show')).toBeInTheDocument();
    });

    it('should render both past and future days together', () => {
      const days = [makeDay(PAST_DATE, 'Past Show'), makeDay(FUTURE_DATE_1, 'Future Show')];
      renderWithRouter(<CalendarAgendaView days={days} profileId={1} />);
      expect(screen.getByText('Past Show')).toBeInTheDocument();
      expect(screen.getByText('Future Show')).toBeInTheDocument();
    });

    it('should show singular "past day" in the divider for 1 past day', () => {
      renderWithRouter(<CalendarAgendaView days={[makeDay(PAST_DATE)]} profileId={1} />);
      expect(screen.getByText('1 past day')).toBeInTheDocument();
    });

    it('should show plural "past days" in the divider for multiple past days', () => {
      const days = [makeDay(PAST_DATE, 'Show A'), makeDay('1990-06-02', 'Show B')];
      renderWithRouter(<CalendarAgendaView days={days} profileId={1} />);
      expect(screen.getByText('2 past days')).toBeInTheDocument();
    });

    it('should not show the past-days divider when there are no past days', () => {
      renderWithRouter(<CalendarAgendaView days={[makeDay(FUTURE_DATE_1)]} profileId={1} />);
      expect(screen.queryByText(/past day/)).not.toBeInTheDocument();
    });
  });
});
