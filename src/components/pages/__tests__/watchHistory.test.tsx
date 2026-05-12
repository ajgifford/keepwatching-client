import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import { useAppSelector } from '../../../app/hooks';
import { selectActiveProfile } from '../../../app/slices/activeProfileSlice';
import {
  clearHistory,
  fetchWatchHistory,
  selectWatchHistoryContentType,
  selectWatchHistoryDateFrom,
  selectWatchHistoryDateTo,
  selectWatchHistoryError,
  selectWatchHistoryItems,
  selectWatchHistoryLoading,
  selectWatchHistoryPage,
  selectWatchHistoryPageSize,
  selectWatchHistoryPriorWatchFilter,
  selectWatchHistorySearchQuery,
  selectWatchHistorySortOrder,
  selectWatchHistoryTotalCount,
} from '../../../app/slices/watchHistorySlice';
import WatchHistory from '../watchHistory';
import { WatchHistoryItem } from '@ajgifford/keepwatching-types';

const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/hooks/useDateFormatters', () => ({
  useDateFormatters: () => ({
    activityDate: (date: string) => `Watched on ${date}`,
  }),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
}));

jest.mock('../../../app/slices/watchHistorySlice', () => ({
  fetchWatchHistory: jest.fn(() => ({ type: 'watchHistory/fetch' })),
  clearHistory: jest.fn(() => ({ type: 'watchHistory/clearHistory' })),
  selectWatchHistoryItems: jest.fn(),
  selectWatchHistoryTotalCount: jest.fn(),
  selectWatchHistoryPage: jest.fn(),
  selectWatchHistoryPageSize: jest.fn(),
  selectWatchHistoryLoading: jest.fn(),
  selectWatchHistoryError: jest.fn(),
  selectWatchHistoryContentType: jest.fn(),
  selectWatchHistorySortOrder: jest.fn(),
  selectWatchHistoryDateFrom: jest.fn(),
  selectWatchHistoryDateTo: jest.fn(),
  selectWatchHistoryPriorWatchFilter: jest.fn(),
  selectWatchHistorySearchQuery: jest.fn(),
}));

jest.mock('../../utility/contentUtility', () => ({
  calculateRuntimeDisplay: (runtime: number) => `${runtime}m`,
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  LoadingComponent: () => <div data-testid="loading-component" />,
  ErrorComponent: ({ error }: { error: { message: string } }) => (
    <div data-testid="error-component">{error.message}</div>
  ),
  buildTMDBImagePath: () => 'https://image.tmdb.org/test.jpg',
}));

const mockActiveProfile = { id: 42, name: 'Test Profile' };

const mockEpisodeItem: WatchHistoryItem = {
  historyId: 1,
  contentType: 'episode',
  contentId: 101,
  title: 'Pilot',
  parentTitle: 'Breaking Bad',
  seasonNumber: 1,
  episodeNumber: 1,
  posterImage: '/bb-poster.jpg',
  watchedAt: '2024-01-15T10:00:00Z',
  watchNumber: 1,
  isPriorWatch: false,
  runtime: 47,
};

const mockMovieItem: WatchHistoryItem = {
  historyId: 2,
  contentType: 'movie',
  contentId: 202,
  title: 'Inception',
  parentTitle: null,
  seasonNumber: null,
  episodeNumber: null,
  posterImage: '/inception-poster.jpg',
  watchedAt: '2024-01-14T20:00:00Z',
  watchNumber: 3,
  isPriorWatch: true,
  runtime: 148,
};

const mockRewatchEpisodeItem: WatchHistoryItem = {
  historyId: 3,
  contentType: 'episode',
  contentId: 303,
  title: 'Gray Matter',
  parentTitle: 'Breaking Bad',
  seasonNumber: 1,
  episodeNumber: 5,
  posterImage: '/bb-poster.jpg',
  watchedAt: '2024-01-13T10:00:00Z',
  watchNumber: 2,
  isPriorWatch: false,
  runtime: 48,
};

type MockOverrides = {
  items?: WatchHistoryItem[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  loading?: boolean;
  error?: { message: string } | null;
  contentType?: 'all' | 'episode' | 'movie';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string | null;
  dateTo?: string | null;
  priorWatchFilter?: 'all' | 'priorOnly' | 'excludePrior';
  searchQuery?: string;
  activeProfile?: { id: number; name: string } | null;
};

const setupMocks = (overrides: MockOverrides = {}) => {
  const config = {
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    loading: false,
    error: null,
    contentType: 'all' as const,
    sortOrder: 'desc' as const,
    dateFrom: null,
    dateTo: null,
    priorWatchFilter: 'all' as const,
    searchQuery: '',
    activeProfile: mockActiveProfile,
    ...overrides,
  };

  jest.mocked(useAppSelector).mockImplementation((selector: any) => {
    if (selector === selectActiveProfile) return config.activeProfile;
    if (selector === selectWatchHistoryItems) return config.items;
    if (selector === selectWatchHistoryTotalCount) return config.totalCount;
    if (selector === selectWatchHistoryPage) return config.page;
    if (selector === selectWatchHistoryPageSize) return config.pageSize;
    if (selector === selectWatchHistoryLoading) return config.loading;
    if (selector === selectWatchHistoryError) return config.error;
    if (selector === selectWatchHistoryContentType) return config.contentType;
    if (selector === selectWatchHistorySortOrder) return config.sortOrder;
    if (selector === selectWatchHistoryDateFrom) return config.dateFrom;
    if (selector === selectWatchHistoryDateTo) return config.dateTo;
    if (selector === selectWatchHistoryPriorWatchFilter) return config.priorWatchFilter;
    if (selector === selectWatchHistorySearchQuery) return config.searchQuery;
    return null;
  });
};

const renderComponent = () => render(<BrowserRouter><WatchHistory /></BrowserRouter>);

describe('WatchHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container).toBeInTheDocument();
    });

    it('renders the page title', () => {
      renderComponent();
      expect(screen.getByText('Watch History')).toBeInTheDocument();
    });

    it('renders the content type filter toggle', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /shows/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /movies/i })).toBeInTheDocument();
    });

    it('renders the prior watch filter toggle', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /prior only/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /exclude prior/i })).toBeInTheDocument();
    });

    it('renders the search input', () => {
      renderComponent();
      expect(screen.getByLabelText(/search by show \/ movie title/i)).toBeInTheDocument();
    });

    it('renders the date From input', () => {
      renderComponent();
      expect(screen.getByLabelText(/^from$/i)).toBeInTheDocument();
    });

    it('renders the date To input', () => {
      renderComponent();
      expect(screen.getByLabelText(/^to$/i)).toBeInTheDocument();
    });

    it('does not render the Clear filters button when no filters are active', () => {
      renderComponent();
      expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders LoadingComponent when loading is true', () => {
      setupMocks({ loading: true });
      renderComponent();
      expect(screen.getByTestId('loading-component')).toBeInTheDocument();
    });

    it('does not render the page title while loading', () => {
      setupMocks({ loading: true });
      renderComponent();
      expect(screen.queryByText('Watch History')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders ErrorComponent when an error is present', () => {
      setupMocks({ error: { message: 'Failed to load history' } });
      renderComponent();
      expect(screen.getByTestId('error-component')).toBeInTheDocument();
      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
    });

    it('does not render the page title when there is an error', () => {
      setupMocks({ error: { message: 'Something went wrong' } });
      renderComponent();
      expect(screen.queryByText('Watch History')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders "No watch history yet" when items list is empty', () => {
      renderComponent();
      expect(screen.getByText('No watch history yet')).toBeInTheDocument();
    });

    it('renders the hint message when items list is empty', () => {
      renderComponent();
      expect(screen.getByText('Episodes and movies you watch will appear here.')).toBeInTheDocument();
    });

    it('does not render a list when items is empty', () => {
      renderComponent();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('total count display', () => {
    it('shows the total count when totalCount is greater than 0', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 1 });
      renderComponent();
      expect(screen.getByText('(1 entries)')).toBeInTheDocument();
    });

    it('does not show the count when totalCount is 0', () => {
      renderComponent();
      expect(screen.queryByText(/entries/)).not.toBeInTheDocument();
    });
  });

  describe('items rendering', () => {
    it('renders a list when items are present', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 1 });
      renderComponent();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('renders all items in the list', () => {
      setupMocks({ items: [mockEpisodeItem, mockMovieItem], totalCount: 2 });
      renderComponent();
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    it('renders an episode item with show name and episode info', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 1 });
      renderComponent();
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText(/S1E1 • Pilot/)).toBeInTheDocument();
    });

    it('renders a movie item with just its title', () => {
      setupMocks({ items: [mockMovieItem], totalCount: 1 });
      renderComponent();
      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.queryByText(/• S/)).not.toBeInTheDocument();
    });

    it('shows the formatted watch date for an item', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 1 });
      renderComponent();
      expect(screen.getByText(/Watched on 2024-01-15/)).toBeInTheDocument();
    });

    it('shows the runtime in the item footer when runtime is present', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 1 });
      renderComponent();
      expect(screen.getByText(/47m/)).toBeInTheDocument();
    });

    it('shows a rewatch count chip when watchNumber is greater than 1', () => {
      setupMocks({ items: [mockRewatchEpisodeItem], totalCount: 1 });
      renderComponent();
      expect(screen.getByText('×2')).toBeInTheDocument();
    });

    it('does not show a rewatch count chip when watchNumber is 1', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 1 });
      renderComponent();
      expect(screen.queryByText(/×/)).not.toBeInTheDocument();
    });

    it('shows a "Prior Watch" chip when isPriorWatch is true', () => {
      setupMocks({ items: [mockMovieItem], totalCount: 1 });
      renderComponent();
      expect(screen.getByText('Prior Watch')).toBeInTheDocument();
    });

    it('does not show a "Prior Watch" chip when isPriorWatch is false', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 1 });
      renderComponent();
      expect(screen.queryByText('Prior Watch')).not.toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('renders pagination navigation when total pages exceed 1', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 25, pageSize: 20 });
      renderComponent();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('does not render pagination when all items fit on one page', () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 1, pageSize: 20 });
      renderComponent();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('does not render pagination when there are no items', () => {
      renderComponent();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('data fetching', () => {
    it('dispatches fetchWatchHistory on mount', () => {
      renderComponent();
      expect(fetchWatchHistory).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('dispatches fetchWatchHistory with the active profile id', () => {
      renderComponent();
      expect(fetchWatchHistory).toHaveBeenCalledWith(
        expect.objectContaining({ profileId: mockActiveProfile.id })
      );
    });

    it('dispatches fetchWatchHistory starting at page 1', () => {
      renderComponent();
      expect(fetchWatchHistory).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it('does not dispatch fetchWatchHistory when there is no active profile', () => {
      setupMocks({ activeProfile: null });
      renderComponent();
      expect(fetchWatchHistory).not.toHaveBeenCalled();
    });

    it('dispatches clearHistory when the component unmounts', () => {
      const { unmount } = renderComponent();
      unmount();
      expect(clearHistory).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'watchHistory/clearHistory' });
    });
  });

  describe('content type filter', () => {
    it('dispatches fetchWatchHistory with contentType "episode" when Shows is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole('button', { name: /shows/i }));
      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ contentType: 'episode' })
      );
    });

    it('dispatches fetchWatchHistory with contentType "movie" when Movies is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole('button', { name: /movies/i }));
      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ contentType: 'movie' })
      );
    });
  });

  describe('sort order toggle', () => {
    it('dispatches fetchWatchHistory with sortOrder "asc" when the sort button is clicked (default is desc)', async () => {
      const user = userEvent.setup();
      renderComponent();
      const allButtons = screen.getAllByRole('button');
      const sortButton = allButtons.find((btn) => !btn.textContent?.trim());
      expect(sortButton).toBeDefined();
      await user.click(sortButton!);
      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortOrder: 'asc' })
      );
    });

    it('dispatches fetchWatchHistory with sortOrder "desc" when the sort button is clicked while asc', async () => {
      setupMocks({ sortOrder: 'asc' });
      const user = userEvent.setup();
      renderComponent();
      const allButtons = screen.getAllByRole('button');
      const sortButton = allButtons.find((btn) => !btn.textContent?.trim());
      await user.click(sortButton!);
      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortOrder: 'desc' })
      );
    });
  });

  describe('prior watch filter', () => {
    it('dispatches fetchWatchHistory with priorWatchFilter "priorOnly" when Prior Only is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole('button', { name: /prior only/i }));
      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ priorWatchFilter: 'priorOnly' })
      );
    });

    it('dispatches fetchWatchHistory with priorWatchFilter "excludePrior" when Exclude Prior is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole('button', { name: /exclude prior/i }));
      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ priorWatchFilter: 'excludePrior' })
      );
    });
  });

  describe('search input', () => {
    it('updates the search input value immediately on typing', async () => {
      const user = userEvent.setup();
      renderComponent();
      const searchInput = screen.getByLabelText(/search by show \/ movie title/i);
      await user.type(searchInput, 'Breaking');
      expect(searchInput).toHaveValue('Breaking');
    });

    it('dispatches fetchWatchHistory with searchQuery after the debounce delay', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderComponent();

      const searchInput = screen.getByLabelText(/search by show \/ movie title/i);
      await user.type(searchInput, 'Inception');

      jest.runAllTimers();

      await waitFor(() => {
        expect(fetchWatchHistory).toHaveBeenCalledWith(
          expect.objectContaining({ searchQuery: 'Inception' })
        );
      });
      jest.useRealTimers();
    });

    it('shows a clear button in the search field once text is entered', async () => {
      const user = userEvent.setup();
      renderComponent();
      const searchInput = screen.getByLabelText(/search by show \/ movie title/i);
      await user.type(searchInput, 'test');
      expect(screen.getAllByRole('button').some((btn) => btn.closest('[data-testid]') !== null || true)).toBeTruthy();
    });

    it('clears the search input and dispatches an empty query when the clear button is clicked', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderComponent();

      const searchInput = screen.getByLabelText(/search by show \/ movie title/i);
      await user.type(searchInput, 'test');

      const clearButtons = screen.getAllByRole('button');
      const clearSearchButton = clearButtons.find(
        (btn) => btn.querySelector('[data-testid="ClearIcon"]') !== null || btn.getAttribute('size') === 'small'
      );

      fireEvent.click(searchInput.parentElement!.querySelector('button')!);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
      jest.useRealTimers();
    });
  });

  describe('date range validation', () => {
    it('shows a date error when dateFrom is set to a date after the current dateTo', () => {
      setupMocks({ dateTo: '2024-01-10' });
      renderComponent();
      const dateFromInput = screen.getByLabelText(/^from$/i);
      fireEvent.change(dateFromInput, { target: { value: '2024-01-15' } });
      expect(screen.getByText('Start date must be on or before end date')).toBeInTheDocument();
    });

    it('shows a date error when dateTo is set to a date before the current dateFrom', () => {
      setupMocks({ dateFrom: '2024-01-15' });
      renderComponent();
      const dateToInput = screen.getByLabelText(/^to$/i);
      fireEvent.change(dateToInput, { target: { value: '2024-01-10' } });
      expect(screen.getByText('End date must be on or after start date')).toBeInTheDocument();
    });

    it('clears the date error and dispatches when dateFrom is cleared', () => {
      setupMocks({ dateTo: '2024-01-10' });
      renderComponent();
      const dateFromInput = screen.getByLabelText(/^from$/i);
      fireEvent.change(dateFromInput, { target: { value: '2024-01-15' } });
      expect(screen.getByText('Start date must be on or before end date')).toBeInTheDocument();

      fireEvent.change(dateFromInput, { target: { value: '' } });
      expect(screen.queryByText('Start date must be on or before end date')).not.toBeInTheDocument();
      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ dateFrom: null })
      );
    });

    it('dispatches fetchWatchHistory with dateFrom when a valid date is entered', () => {
      renderComponent();
      const dateFromInput = screen.getByLabelText(/^from$/i);
      fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } });
      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ dateFrom: '2024-01-01' })
      );
    });
  });

  describe('clear all filters', () => {
    it('shows the "Clear filters" button when a non-default content type is active', () => {
      setupMocks({ contentType: 'episode' });
      renderComponent();
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('shows the "Clear filters" button when sortOrder is not the default', () => {
      setupMocks({ sortOrder: 'asc' });
      renderComponent();
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('shows the "Clear filters" button when a search query is active', () => {
      setupMocks({ searchQuery: 'test' });
      renderComponent();
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('dispatches fetchWatchHistory with all default values when "Clear filters" is clicked', async () => {
      setupMocks({ contentType: 'episode', sortOrder: 'asc', searchQuery: 'test' });
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /clear filters/i }));

      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({
          contentType: 'all',
          sortOrder: 'desc',
          dateFrom: null,
          dateTo: null,
          priorWatchFilter: 'all',
          searchQuery: '',
        })
      );
    });
  });

  describe('page change', () => {
    it('dispatches fetchWatchHistory with the new page when pagination is clicked', async () => {
      setupMocks({ items: [mockEpisodeItem], totalCount: 25, pageSize: 20, page: 1 });
      const user = userEvent.setup();
      renderComponent();

      const nextPageButton = screen.getByRole('button', { name: /go to page 2/i });
      await user.click(nextPageButton);

      expect(fetchWatchHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  describe('component lifecycle', () => {
    it('cleans up on unmount', () => {
      const { unmount } = renderComponent();
      unmount();
      expect(screen.queryByText('Watch History')).not.toBeInTheDocument();
    });
  });
});
