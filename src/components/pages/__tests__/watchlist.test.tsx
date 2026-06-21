import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useAppSelector } from '../../../app/hooks';
import { selectActiveProfile } from '../../../app/slices/activeProfileSlice';
import {
  fetchWatchlist,
  openWizard,
  selectFilteredNotWatchedPool,
  selectWatchlistError,
  selectWatchlistItems,
  selectWatchlistLoading,
  selectWatchlistMovies,
  selectWatchlistShows,
  selectWizardOpen,
} from '../../../app/slices/watchlistSlice';
import Watchlist from '../watchlist';
import { WatchlistItem } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
}));

jest.mock('../../../app/slices/watchlistSlice', () => ({
  fetchWatchlist: jest.fn(() => ({ type: 'watchlist/fetchWatchlist' })),
  openWizard: jest.fn(() => ({ type: 'watchlist/openWizard' })),
  selectWatchlistItems: jest.fn(),
  selectWatchlistShows: jest.fn(),
  selectWatchlistMovies: jest.fn(),
  selectFilteredNotWatchedPool: jest.fn(),
  selectWatchlistLoading: jest.fn(),
  selectWatchlistError: jest.fn(),
  selectWizardOpen: jest.fn(),
}));

jest.mock('../../../components/common/watchlist/watchlistQueueItem', () => ({
  __esModule: true,
  default: ({ item }: { item: WatchlistItem }) => <div data-testid="queue-item">{item.title}</div>,
}));

jest.mock('../../../components/common/watchlist/watchlistPoolItem', () => ({
  __esModule: true,
  default: ({ item }: { item: WatchlistItem }) => <div data-testid="pool-item">{item.title}</div>,
}));

jest.mock('../../../components/common/watchlist/whatShouldIWatchWizard', () => ({
  __esModule: true,
  default: () => <div data-testid="wizard" />,
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  LoadingComponent: () => <div data-testid="loading" />,
  ErrorComponent: ({ error }: { error: { message: string } }) => <div data-testid="error">{error.message}</div>,
}));

const mockItem = (id: number, contentType: 'show' | 'movie' = 'show'): WatchlistItem => ({
  id,
  profileId: 1,
  contentType,
  contentId: id,
  priority: id - 1,
  addedAt: '2024-01-01T00:00:00Z',
  title: contentType === 'show' ? `Show ${id}` : `Movie ${id}`,
  posterImage: '/poster.jpg',
  genres: 'Drama',
  streamingServices: 'Netflix',
  runtime: 45,
  hasNewSeason: false,
});

type MockOverrides = {
  profile?: { id: number; name: string } | null;
  items?: WatchlistItem[];
  shows?: WatchlistItem[];
  movies?: WatchlistItem[];
  pool?: WatchlistItem[];
  loading?: boolean;
  error?: { message: string } | null;
  wizardOpen?: boolean;
};

function setupMocks({
  profile = { id: 1, name: 'Test' },
  items = [],
  shows = [],
  movies = [],
  pool = [],
  loading = false,
  error = null,
  wizardOpen = false,
}: MockOverrides = {}) {
  (useAppSelector as unknown as jest.Mock).mockImplementation((selector: (s: unknown) => unknown) => {
    if (selector === selectActiveProfile) return profile;
    if (selector === selectWatchlistItems) return items;
    if (selector === selectWatchlistShows) return shows;
    if (selector === selectWatchlistMovies) return movies;
    if (selector === selectFilteredNotWatchedPool) return pool;
    if (selector === selectWatchlistLoading) return loading;
    if (selector === selectWatchlistError) return error;
    if (selector === selectWizardOpen) return wizardOpen;
    return null;
  });
}

function renderWatchlist() {
  return render(
    <BrowserRouter>
      <Watchlist />
    </BrowserRouter>
  );
}

describe('Watchlist page', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    setupMocks();
  });

  it('dispatches fetchWatchlist on mount with profile id', () => {
    setupMocks({ profile: { id: 42, name: 'Test' } });
    renderWatchlist();
    expect(mockDispatch).toHaveBeenCalledWith(fetchWatchlist(42));
  });

  it('shows loading component when loading', () => {
    setupMocks({ loading: true });
    renderWatchlist();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows error component when error', () => {
    setupMocks({ error: { message: 'Something went wrong' } });
    renderWatchlist();
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });

  it('renders page heading and main tabs', () => {
    setupMocks({ items: [mockItem(1), mockItem(2)], pool: [mockItem(3)] });
    renderWatchlist();
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /My Watchlist/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Unwatched/i })).toBeInTheDocument();
  });

  it('shows My Watchlist items by default', () => {
    const items = [mockItem(1), mockItem(2)];
    setupMocks({ items, shows: items });
    renderWatchlist();
    expect(screen.getAllByTestId('queue-item')).toHaveLength(2);
    expect(screen.queryByTestId('pool-item')).not.toBeInTheDocument();
  });

  it('shows My Watchlist empty state with guidance when no items', () => {
    setupMocks({ items: [], pool: [mockItem(1)] });
    renderWatchlist();
    expect(screen.getByText(/Your watchlist is empty/i)).toBeInTheDocument();
  });

  it('dispatches openWizard when Help Me Decide is clicked', async () => {
    const items = [mockItem(1)];
    setupMocks({ items, shows: items, pool: items });
    renderWatchlist();
    await userEvent.click(screen.getByRole('tab', { name: /Unwatched/i }));
    await userEvent.click(screen.getByRole('button', { name: /Help Me Decide/i }));
    expect(mockDispatch).toHaveBeenCalledWith(openWizard());
  });

  it('renders wizard when wizardOpen is true', async () => {
    const items = [mockItem(1)];
    setupMocks({ items, shows: items, pool: items, wizardOpen: true });
    renderWatchlist();
    await userEvent.click(screen.getByRole('tab', { name: /Unwatched/i }));
    expect(screen.getByTestId('wizard')).toBeInTheDocument();
  });

  it('filters My Watchlist to shows sub-tab', async () => {
    const shows = [mockItem(1, 'show')];
    const movies = [mockItem(2, 'movie')];
    const items = [...shows, ...movies];
    setupMocks({ items, shows, movies });
    renderWatchlist();
    await userEvent.click(screen.getByRole('tab', { name: /Shows/i }));
    expect(screen.getAllByTestId('queue-item')).toHaveLength(1);
    expect(screen.getByText('Show 1')).toBeInTheDocument();
  });

  it('switches to Unwatched tab and renders pool items', async () => {
    const pool = [mockItem(10), mockItem(11)];
    setupMocks({ pool });
    renderWatchlist();
    await userEvent.click(screen.getByRole('tab', { name: /Unwatched/i }));
    expect(screen.getAllByTestId('pool-item')).toHaveLength(2);
    expect(screen.queryByTestId('queue-item')).not.toBeInTheDocument();
  });

  it('shows browse empty state on Unwatched tab when pool is empty', async () => {
    setupMocks({ pool: [] });
    renderWatchlist();
    await userEvent.click(screen.getByRole('tab', { name: /Unwatched/i }));
    expect(screen.getByText(/Nothing here yet/i)).toBeInTheDocument();
  });

  it('filters Unwatched tab to shows sub-tab', async () => {
    const poolShows = [mockItem(10, 'show')];
    const poolMovies = [mockItem(11, 'movie')];
    setupMocks({ pool: [...poolShows, ...poolMovies] });
    renderWatchlist();
    await userEvent.click(screen.getByRole('tab', { name: /Unwatched/i }));
    await userEvent.click(screen.getByRole('tab', { name: /Shows/i }));
    expect(screen.getAllByTestId('pool-item')).toHaveLength(1);
    expect(screen.getByText('Show 10')).toBeInTheDocument();
  });
});
