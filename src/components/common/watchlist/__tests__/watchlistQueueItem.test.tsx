import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useAppDispatch } from '../../../../app/hooks';
import { removeFromWatchlist, updateWatchlistPriorities } from '../../../../app/slices/watchlistSlice';
import WatchlistQueueItem from '../watchlistQueueItem';
import { WatchStatus, WatchlistItem } from '@ajgifford/keepwatching-types';

const mockDispatch = jest.fn();

jest.mock('../../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../../app/slices/watchlistSlice', () => ({
  updateWatchlistPriorities: jest.fn((args) => ({ type: 'watchlist/updatePriorities', payload: args })),
  removeFromWatchlist: jest.fn((args) => ({ type: 'watchlist/removeItem', payload: args })),
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

function renderItem(item: WatchlistItem, allItems: WatchlistItem[], isFirst = false, isLast = false) {
  return render(
    <BrowserRouter>
      <WatchlistQueueItem item={item} allItems={allItems} isFirst={isFirst} isLast={isLast} />
    </BrowserRouter>
  );
}

describe('WatchlistQueueItem', () => {
  beforeEach(() => mockDispatch.mockClear());

  it('renders title and genres', () => {
    const item = makeItem();
    renderItem(item, [item]);
    expect(screen.getByText('Test Show')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Crime')).toBeInTheDocument();
  });

  it('shows a status chip when currentWatchStatus is not NOT_WATCHED', () => {
    const item = makeItem({ currentWatchStatus: WatchStatus.WATCHED });
    renderItem(item, [item]);
    expect(screen.getByText(WatchStatus.WATCHED)).toBeInTheDocument();
  });

  it('does not show a status chip when currentWatchStatus is NOT_WATCHED', () => {
    renderItem(makeItem(), [makeItem()]);
    expect(screen.queryByText(WatchStatus.WATCHED)).not.toBeInTheDocument();
    expect(screen.queryByText(WatchStatus.NOT_WATCHED)).not.toBeInTheDocument();
  });

  it('displays movie runtime via calculateRuntimeDisplay', () => {
    const item = makeItem({ contentType: 'movie', runtime: 120 });
    renderItem(item, [item]);
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
  });

  it('displays show runtime as min/ep', () => {
    renderItem(makeItem({ contentType: 'show', runtime: 45 }), [makeItem()]);
    expect(screen.getByText('~45 min/ep')).toBeInTheDocument();
  });

  it('displays — when runtime is null', () => {
    renderItem(makeItem({ runtime: null }), [makeItem()]);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('move up button is disabled when isFirst', () => {
    renderItem(makeItem(), [makeItem()], true, false);
    expect(screen.getByRole('button', { name: /move up/i })).toBeDisabled();
  });

  it('move down button is disabled when isLast', () => {
    renderItem(makeItem(), [makeItem()], false, true);
    expect(screen.getByRole('button', { name: /move down/i })).toBeDisabled();
  });

  it('move up button is enabled when not first', () => {
    const item1 = makeItem({ id: 1, priority: 0 });
    const item2 = makeItem({ id: 2, priority: 1 });
    renderItem(item2, [item1, item2], false, true);
    expect(screen.getByRole('button', { name: /move up/i })).not.toBeDisabled();
  });

  it('dispatches updateWatchlistPriorities on move up', () => {
    const item1 = makeItem({ id: 1, priority: 0, title: 'A' });
    const item2 = makeItem({ id: 2, priority: 1, title: 'B' });
    renderItem(item2, [item1, item2], false, true);
    fireEvent.click(screen.getByRole('button', { name: /move up/i }));
    expect(mockDispatch).toHaveBeenCalledWith(
      updateWatchlistPriorities({
        profileId: 5,
        priorities: [
          { id: 2, priority: 0 },
          { id: 1, priority: 1 },
        ],
      })
    );
  });

  it('dispatches updateWatchlistPriorities on move down', () => {
    const item1 = makeItem({ id: 1, priority: 0, title: 'A' });
    const item2 = makeItem({ id: 2, priority: 1, title: 'B' });
    renderItem(item1, [item1, item2], true, false);
    fireEvent.click(screen.getByRole('button', { name: /move down/i }));
    expect(mockDispatch).toHaveBeenCalledWith(
      updateWatchlistPriorities({
        profileId: 5,
        priorities: [
          { id: 2, priority: 0 },
          { id: 1, priority: 1 },
        ],
      })
    );
  });

  it('dispatches removeFromWatchlist on delete', () => {
    const item = makeItem({ id: 7, profileId: 5 });
    renderItem(item, [item]);
    fireEvent.click(screen.getByRole('button', { name: /remove from watchlist/i }));
    expect(mockDispatch).toHaveBeenCalledWith(removeFromWatchlist({ profileId: 5, itemId: 7 }));
  });

  it('title links to correct show route', () => {
    const item = makeItem({ contentType: 'show', contentId: 10, profileId: 5 });
    renderItem(item, [item]);
    const link = screen.getByRole('link', { name: 'Test Show' });
    expect(link).toHaveAttribute('href', '/shows/10/5');
  });

  it('title links to correct movie route', () => {
    const item = makeItem({ contentType: 'movie', contentId: 20, profileId: 5, title: 'Test Movie' });
    renderItem(item, [item]);
    const link = screen.getByRole('link', { name: 'Test Movie' });
    expect(link).toHaveAttribute('href', '/movies/20/5');
  });
});
