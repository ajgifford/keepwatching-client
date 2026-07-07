import { act, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useAppDispatch } from '../../../../app/hooks';
import { addToWatchlist } from '../../../../app/slices/watchlistSlice';
import WatchlistPoolItem from '../watchlistPoolItem';
import { WatchStatus, WatchlistItem } from '@ajgifford/keepwatching-types';

const mockDispatch = jest.fn();

jest.mock('../../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../../app/slices/watchlistSlice', () => ({
  addToWatchlist: jest.fn((args) => ({ type: 'watchlist/addItem', payload: args })),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: (_path: string, _size: string) => 'https://image.tmdb.org/test.jpg',
  WatchStatusIcon: () => null,
  getWatchStatusDisplay: (status: string) => status,
}));

jest.mock('../../../utility/contentUtility', () => ({
  calculateRuntimeDisplay: (runtime: number) => `${Math.floor(runtime / 60)}h ${runtime % 60}m`,
}));

const makeItem = (overrides: Partial<WatchlistItem> = {}): WatchlistItem => ({
  id: 1,
  profileId: 5,
  contentType: 'show',
  contentId: 10,
  priority: 0,
  addedAt: '2024-01-01T00:00:00Z',
  title: 'Test Show',
  posterImage: '/poster.jpg',
  genres: 'Drama,Crime',
  streamingServices: 'Netflix',
  runtime: 45,
  currentWatchStatus: WatchStatus.NOT_WATCHED,
  ...overrides,
});

function renderItem(item: WatchlistItem) {
  return render(
    <BrowserRouter>
      <WatchlistPoolItem item={item} />
    </BrowserRouter>
  );
}

describe('WatchlistPoolItem', () => {
  beforeEach(() => mockDispatch.mockClear());

  it('renders title and genres', () => {
    renderItem(makeItem());
    expect(screen.getByText('Test Show')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Crime')).toBeInTheDocument();
  });

  it('renders streaming services', () => {
    renderItem(makeItem());
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('displays show runtime as min/ep', () => {
    renderItem(makeItem({ contentType: 'show', runtime: 45 }));
    expect(screen.getByText('~45 min/ep')).toBeInTheDocument();
  });

  it('displays movie runtime via calculateRuntimeDisplay', () => {
    renderItem(makeItem({ contentType: 'movie', runtime: 120 }));
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
  });

  it('displays — when runtime is null', () => {
    renderItem(makeItem({ runtime: null }));
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows a status chip when currentWatchStatus is not NOT_WATCHED', () => {
    renderItem(makeItem({ currentWatchStatus: WatchStatus.WATCHING }));
    expect(screen.getByText(WatchStatus.WATCHING)).toBeInTheDocument();
  });

  it('does not show a status chip when currentWatchStatus is NOT_WATCHED', () => {
    renderItem(makeItem());
    expect(screen.queryByText(WatchStatus.WATCHING)).not.toBeInTheDocument();
    expect(screen.queryByText(WatchStatus.NOT_WATCHED)).not.toBeInTheDocument();
  });

  it('renders Add to Watchlist button', () => {
    renderItem(makeItem());
    expect(screen.getByRole('button', { name: /add to watchlist/i })).toBeInTheDocument();
  });

  it('dispatches addToWatchlist with correct args on click', async () => {
    mockDispatch.mockReturnValue(Promise.resolve());
    const item = makeItem({ profileId: 5, contentType: 'show', contentId: 10 });
    renderItem(item);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add to watchlist/i }));
    });
    expect(mockDispatch).toHaveBeenCalledWith(addToWatchlist({ profileId: 5, contentType: 'show', contentId: 10 }));
  });

  it('dispatches addToWatchlist for a movie', async () => {
    mockDispatch.mockReturnValue(Promise.resolve());
    const item = makeItem({ profileId: 3, contentType: 'movie', contentId: 20 });
    renderItem(item);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add to watchlist/i }));
    });
    expect(mockDispatch).toHaveBeenCalledWith(addToWatchlist({ profileId: 3, contentType: 'movie', contentId: 20 }));
  });

  it('title links to correct show route', () => {
    const item = makeItem({ contentType: 'show', contentId: 10, profileId: 5 });
    renderItem(item);
    expect(screen.getByRole('link', { name: 'Test Show' })).toHaveAttribute('href', '/shows/10/5');
  });

  it('title links to correct movie route', () => {
    const item = makeItem({ contentType: 'movie', contentId: 20, profileId: 5, title: 'Test Movie' });
    renderItem(item);
    expect(screen.getByRole('link', { name: 'Test Movie' })).toHaveAttribute('href', '/movies/20/5');
  });
});
