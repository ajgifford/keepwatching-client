import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useAppSelector } from '../../../../app/hooks';
import { selectActiveProfile } from '../../../../app/slices/activeProfileSlice';
import {
  defaultCalendarEnd,
  defaultCalendarStart,
  fetchCalendarContent,
  selectCalendarDays,
  selectCalendarError,
  selectCalendarFetchedRange,
  selectCalendarLastFetched,
  selectCalendarLoading,
} from '../../../../app/slices/calendarSlice';
import { downloadTextFile } from '../../../utility/downloadFileUtility';
import { generateIcsCalendar } from '../../../utility/icsExportUtility';
import { ContentCalendar } from '../contentCalendar';
import userEvent from '@testing-library/user-event';

const mockDispatch = jest.fn();

jest.mock('../../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../../app/slices/calendarSlice', () => ({
  defaultCalendarStart: jest.fn(() => '2026-06-08'),
  defaultCalendarEnd: jest.fn(() => '2026-09-06'),
  fetchCalendarContent: jest.fn(() => ({ type: 'calendar/fetchContent' })),
  selectCalendarDays: jest.fn(),
  selectCalendarError: jest.fn(),
  selectCalendarFetchedRange: jest.fn(),
  selectCalendarLastFetched: jest.fn(),
  selectCalendarLoading: jest.fn(),
}));

jest.mock('../../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  LoadingComponent: () => <div data-testid="loading">Loading...</div>,
  ErrorComponent: ({ error }: { error: any }) => <div data-testid="error">Error: {error.message}</div>,
}));

jest.mock('../calendarAgendaView', () => ({
  CalendarAgendaView: () => <div data-testid="agenda-view">Agenda View</div>,
}));

jest.mock('../calendarGridView', () => ({
  CalendarGridView: () => <div data-testid="grid-view">Grid View</div>,
}));

jest.mock('../calendarRangeControls', () => ({
  CalendarRangeControls: () => <div data-testid="range-controls">Range Controls</div>,
}));

jest.mock('../../../utility/icsExportUtility', () => ({
  generateIcsCalendar: jest.fn(() => 'BEGIN:VCALENDAR\r\nEND:VCALENDAR'),
}));

jest.mock('../../../utility/downloadFileUtility', () => ({
  downloadTextFile: jest.fn(),
}));

const mockProfile = { id: 5, accountId: 1, name: 'Test Profile', image: '' };

const renderWithRouter = (component: React.ReactElement) => render(<BrowserRouter>{component}</BrowserRouter>);

interface SelectorConfig {
  profile?: any;
  loading?: boolean;
  error?: any;
  lastFetched?: string | null;
  fetchedRange?: { startDate: string | null; endDate: string | null };
  days?: any[];
}

// Use reference equality (===) to map selectors to values — avoids object key collision
// since jest mock functions all stringify identically.
const setupSelector = (overrides: SelectorConfig = {}) => {
  const profile = 'profile' in overrides ? overrides.profile : mockProfile;
  const loading = overrides.loading ?? false;
  const error = overrides.error ?? null;
  const lastFetched = 'lastFetched' in overrides ? overrides.lastFetched : null;
  const fetchedRange = overrides.fetchedRange ?? { startDate: null, endDate: null };
  const days = overrides.days ?? [];

  jest.mocked(useAppSelector).mockImplementation((selector: any) => {
    if (selector === selectActiveProfile) return profile;
    if (selector === selectCalendarLoading) return loading;
    if (selector === selectCalendarError) return error;
    if (selector === selectCalendarLastFetched) return lastFetched;
    if (selector === selectCalendarFetchedRange) return fetchedRange;
    if (selector === selectCalendarDays) return days;
    return null;
  });
};

describe('ContentCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    setupSelector();
  });

  describe('loading state', () => {
    it('should render the loading component when loading is true', () => {
      setupSelector({ loading: true });
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should not render calendar content while loading', () => {
      setupSelector({ loading: true });
      renderWithRouter(<ContentCalendar />);
      expect(screen.queryByText('Content Calendar')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should render the error component when there is an error', () => {
      setupSelector({ error: { message: 'Failed to load' } });
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to load')).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('should render the "Content Calendar" heading', () => {
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByText('Content Calendar')).toBeInTheDocument();
    });

    it('should display total item count from all days', () => {
      setupSelector({
        days: [{ date: '2024-01-10', items: [{ type: 'episode' }, { type: 'movie' }] }],
      });
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByText('2 items')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('should not show view toggle buttons in compact mode', () => {
      renderWithRouter(<ContentCalendar compact />);
      expect(screen.queryByRole('button', { name: /agenda view/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /calendar grid view/i })).not.toBeInTheDocument();
    });

    it('should show a "View Full Calendar" link in compact mode', () => {
      renderWithRouter(<ContentCalendar compact />);
      expect(screen.getByRole('link', { name: /view full calendar/i })).toBeInTheDocument();
    });

    it('should link "View Full Calendar" to /calendar', () => {
      renderWithRouter(<ContentCalendar compact />);
      expect(screen.getByRole('link', { name: /view full calendar/i })).toHaveAttribute('href', '/calendar');
    });

    it('should always render the agenda view in compact mode', () => {
      renderWithRouter(<ContentCalendar compact />);
      expect(screen.getByTestId('agenda-view')).toBeInTheDocument();
    });
  });

  describe('full mode', () => {
    it('should show view toggle buttons in full mode', () => {
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByRole('button', { name: /agenda view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /calendar grid view/i })).toBeInTheDocument();
    });

    it('should not show the "View Full Calendar" link in full mode', () => {
      renderWithRouter(<ContentCalendar />);
      expect(screen.queryByText(/view full calendar/i)).not.toBeInTheDocument();
    });

    it('should default to agenda view', () => {
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByTestId('agenda-view')).toBeInTheDocument();
      expect(screen.queryByTestId('grid-view')).not.toBeInTheDocument();
    });

    it('should switch to grid view when the grid toggle is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ContentCalendar />);

      await user.click(screen.getByRole('button', { name: /calendar grid view/i }));

      await waitFor(() => {
        expect(screen.getByTestId('grid-view')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('agenda-view')).not.toBeInTheDocument();
    });

    it('should default to grid view when localStorage has "grid" saved', () => {
      localStorage.setItem('calendarViewMode', 'grid');
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByTestId('grid-view')).toBeInTheDocument();
    });

    it('should persist the selected view mode to localStorage', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ContentCalendar />);

      await user.click(screen.getByRole('button', { name: /calendar grid view/i }));

      expect(localStorage.getItem('calendarViewMode')).toBe('grid');
    });
  });

  describe('data fetching', () => {
    beforeEach(() => {
      localStorage.removeItem('calendarDateRange');
    });

    it('should dispatch fetchCalendarContent on mount when data has never been fetched', () => {
      setupSelector({ lastFetched: null });
      renderWithRouter(<ContentCalendar />);
      expect(fetchCalendarContent).toHaveBeenCalledWith({
        profileId: mockProfile.id,
        startDate: defaultCalendarStart(),
        endDate: defaultCalendarEnd(),
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch fetchCalendarContent when the cached data is stale (> 5 minutes old)', () => {
      const staleTimestamp = new Date(Date.now() - 6 * 60 * 1000).toISOString();
      setupSelector({ lastFetched: staleTimestamp });
      renderWithRouter(<ContentCalendar />);
      expect(fetchCalendarContent).toHaveBeenCalledWith({
        profileId: mockProfile.id,
        startDate: defaultCalendarStart(),
        endDate: defaultCalendarEnd(),
      });
    });

    it('should not dispatch fetchCalendarContent when the cached data is still fresh', () => {
      const freshTimestamp = new Date().toISOString();
      setupSelector({ lastFetched: freshTimestamp });
      renderWithRouter(<ContentCalendar />);
      expect(fetchCalendarContent).not.toHaveBeenCalled();
    });

    it('should not dispatch fetchCalendarContent when there is no active profile', () => {
      setupSelector({ profile: null });
      renderWithRouter(<ContentCalendar />);
      expect(fetchCalendarContent).not.toHaveBeenCalled();
    });

    it('should dispatch fetchCalendarContent with the resolved dates from a persisted custom range on mount', () => {
      localStorage.setItem(
        'calendarDateRange',
        JSON.stringify({ preset: 'custom', customStart: '2026-01-01', customEnd: '2026-02-01' })
      );
      setupSelector({ lastFetched: null });
      renderWithRouter(<ContentCalendar />);
      expect(fetchCalendarContent).toHaveBeenCalledWith({
        profileId: mockProfile.id,
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      });
    });
  });

  describe('range controls', () => {
    it('should show range controls in agenda view (full mode)', () => {
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByTestId('range-controls')).toBeInTheDocument();
    });

    it('should not show range controls in grid view', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ContentCalendar />);
      await user.click(screen.getByRole('button', { name: /calendar grid view/i }));
      await waitFor(() => {
        expect(screen.queryByTestId('range-controls')).not.toBeInTheDocument();
      });
    });

    it('should not show range controls in compact mode', () => {
      renderWithRouter(<ContentCalendar compact />);
      expect(screen.queryByTestId('range-controls')).not.toBeInTheDocument();
    });
  });

  describe('export', () => {
    it('should show the Export button in full mode (agenda and grid)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ContentCalendar />);
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /calendar grid view/i }));
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('should not show the Export button in compact mode', () => {
      renderWithRouter(<ContentCalendar compact />);
      expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
    });

    it('should generate and download an ics file with the currently loaded days when clicked', async () => {
      const user = userEvent.setup();
      const days = [{ date: '2026-07-10', items: [] }];
      setupSelector({ days });
      renderWithRouter(<ContentCalendar />);

      await user.click(screen.getByRole('button', { name: /export/i }));

      expect(generateIcsCalendar).toHaveBeenCalledWith(days);
      expect(downloadTextFile).toHaveBeenCalledWith(
        'BEGIN:VCALENDAR\r\nEND:VCALENDAR',
        'keepwatching-calendar.ics',
        'text/calendar'
      );
    });
  });
});
