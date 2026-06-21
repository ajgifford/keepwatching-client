import { act, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import {
  addToWatchlist,
  clearWizard,
  closeWizard,
  selectNotWatchedPool,
  selectWatchlistItems,
  selectWizardFilters,
  selectWizardResult,
  selectWizardStep,
  setWizardFilters,
  setWizardResult,
  setWizardStep,
} from '../../../../app/slices/watchlistSlice';
import { computeWizardResult } from '../whatShouldIWatchWizard';
import WhatShouldIWatchWizard from '../whatShouldIWatchWizard';
import { WatchlistItem } from '@ajgifford/keepwatching-types';

const mockDispatch = jest.fn();

jest.mock('../../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../../app/slices/watchlistSlice', () => ({
  selectNotWatchedPool: jest.fn(),
  selectWatchlistItems: jest.fn(),
  selectWizardStep: jest.fn(),
  selectWizardFilters: jest.fn(),
  selectWizardResult: jest.fn(),
  addToWatchlist: jest.fn((v) => ({ type: 'watchlist/addItem', payload: v })),
  setWizardStep: jest.fn((v) => ({ type: 'watchlist/setWizardStep', payload: v })),
  setWizardFilters: jest.fn((v) => ({ type: 'watchlist/setWizardFilters', payload: v })),
  setWizardResult: jest.fn((v) => ({ type: 'watchlist/setWizardResult', payload: v })),
  closeWizard: jest.fn(() => ({ type: 'watchlist/closeWizard' })),
  clearWizard: jest.fn(() => ({ type: 'watchlist/clearWizard' })),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: (_path: string) => 'https://image.tmdb.org/test.jpg',
}));

jest.mock('../../../utility/contentUtility', () => ({
  calculateRuntimeDisplay: (runtime: number) => `${runtime}m`,
}));

const makeItem = (overrides: Partial<WatchlistItem> = {}): WatchlistItem => ({
  id: 1,
  profileId: 1,
  contentType: 'show',
  contentId: 1,
  priority: 0,
  addedAt: '',
  title: 'Test Show',
  posterImage: '/poster.jpg',
  genres: 'Drama',
  streamingServices: 'Netflix',
  runtime: 45,
  hasNewSeason: false,
  ...overrides,
});

const defaultFilters = {
  contentType: 'both' as const,
  genres: [] as string[],
  maxRuntime: null,
  epicRuntime: false,
};

function setupMocks(
  overrides: {
    pool?: WatchlistItem[];
    watchlistItems?: WatchlistItem[];
    step?: number;
    filters?: {
      contentType: 'both' | 'show' | 'movie';
      genres: string[];
      maxRuntime: number | null;
      epicRuntime: boolean;
    };
    result?: WatchlistItem[] | null;
  } = {}
) {
  (useAppSelector as unknown as jest.Mock).mockImplementation((selector: (s: unknown) => unknown) => {
    if (selector === selectNotWatchedPool) return overrides.pool ?? [];
    if (selector === selectWatchlistItems) return overrides.watchlistItems ?? [];
    if (selector === selectWizardStep) return overrides.step ?? 0;
    if (selector === selectWizardFilters) return overrides.filters ?? defaultFilters;
    if (selector === selectWizardResult) return overrides.result ?? null;
    return null;
  });
}

function renderWizard() {
  return render(
    <BrowserRouter>
      <WhatShouldIWatchWizard />
    </BrowserRouter>
  );
}

describe('WhatShouldIWatchWizard', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    setupMocks();
  });

  describe('step 0 — content type', () => {
    it('renders stepper and content type toggle', () => {
      renderWizard();
      expect(screen.getByText('Content Type')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Shows/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Movies/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Either/i })).toBeInTheDocument();
    });

    it('dispatches setWizardFilters when content type changes', () => {
      renderWizard();
      fireEvent.click(screen.getByRole('button', { name: /Shows/i }));
      expect(mockDispatch).toHaveBeenCalledWith(setWizardFilters({ contentType: 'show' }));
    });

    it('Back button is disabled on step 0', () => {
      renderWizard();
      expect(screen.getByRole('button', { name: /Back/i })).toBeDisabled();
    });

    it('dispatches setWizardStep(1) when Next is clicked', () => {
      renderWizard();
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      expect(mockDispatch).toHaveBeenCalledWith(setWizardStep(1));
    });
  });

  describe('step 1 — genre', () => {
    it('renders genre chips derived from pool', () => {
      setupMocks({
        step: 1,
        pool: [makeItem({ genres: 'Drama,Crime' }), makeItem({ id: 2, genres: 'Action' })],
      });
      renderWizard();
      expect(screen.getByText('No preference')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Crime')).toBeInTheDocument();
      expect(screen.getByText('Drama')).toBeInTheDocument();
    });

    it('dispatches setWizardFilters adding genre when chip clicked', () => {
      setupMocks({ step: 1, pool: [makeItem({ genres: 'Drama' })] });
      renderWizard();
      fireEvent.click(screen.getByText('Drama'));
      expect(mockDispatch).toHaveBeenCalledWith(setWizardFilters({ genres: ['Drama'] }));
    });

    it('dispatches setWizardFilters removing genre when selected chip clicked again', () => {
      setupMocks({ step: 1, pool: [makeItem()], filters: { ...defaultFilters, genres: ['Drama'] } });
      renderWizard();
      fireEvent.click(screen.getByText('Drama'));
      expect(mockDispatch).toHaveBeenCalledWith(setWizardFilters({ genres: [] }));
    });

    it('dispatches setWizardFilters with empty genres for No preference', () => {
      setupMocks({ step: 1, pool: [makeItem()], filters: { ...defaultFilters, genres: ['Drama'] } });
      renderWizard();
      fireEvent.click(screen.getByText('No preference'));
      expect(mockDispatch).toHaveBeenCalledWith(setWizardFilters({ genres: [] }));
    });

    it('dispatches setWizardStep(0) when Back clicked', () => {
      setupMocks({ step: 1 });
      renderWizard();
      fireEvent.click(screen.getByRole('button', { name: /Back/i }));
      expect(mockDispatch).toHaveBeenCalledWith(setWizardStep(0));
    });
  });

  describe('step 2 — time available', () => {
    it('renders movie time options when contentType is movie', () => {
      setupMocks({ step: 2, filters: { ...defaultFilters, contentType: 'movie' as const } });
      renderWizard();
      expect(screen.getByText(/Quick \(< 90 min\)/)).toBeInTheDocument();
      expect(screen.getByText(/Epic \(150\+ min\)/)).toBeInTheDocument();
    });

    it('renders show episode length options when contentType is show', () => {
      setupMocks({ step: 2, filters: { ...defaultFilters, contentType: 'show' as const } });
      renderWizard();
      expect(screen.getByText(/Quick \(< 30 min\/ep\)/)).toBeInTheDocument();
      expect(screen.getByText(/Any length/)).toBeInTheDocument();
    });

    it('Find Something button on last step computes and dispatches setWizardResult', () => {
      const pool = [makeItem({ runtime: 45 })];
      setupMocks({ step: 2, pool });
      renderWizard();
      fireEvent.click(screen.getByRole('button', { name: /Find Something/i }));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'watchlist/setWizardResult' }));
    });
  });

  describe('results view', () => {
    it('renders result cards', () => {
      setupMocks({ result: [makeItem({ title: 'Great Show' })] });
      renderWizard();
      expect(screen.getByText('Great Show')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add to Watchlist/i })).toBeInTheDocument();
    });

    it('dispatches addToWatchlist for a show when button clicked', async () => {
      setupMocks({ result: [makeItem({ contentType: 'show', contentId: 10, profileId: 5 })] });
      renderWizard();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add to Watchlist/i }));
      });
      expect(mockDispatch).toHaveBeenCalledWith(addToWatchlist({ profileId: 5, contentType: 'show', contentId: 10 }));
    });

    it('dispatches addToWatchlist for a movie when button clicked', async () => {
      setupMocks({ result: [makeItem({ contentType: 'movie', contentId: 20, profileId: 5, title: 'Film' })] });
      renderWizard();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add to Watchlist/i }));
      });
      expect(mockDispatch).toHaveBeenCalledWith(addToWatchlist({ profileId: 5, contentType: 'movie', contentId: 20 }));
    });

    it('disables button and shows "In Watchlist" when item is already in watchlist', () => {
      const item = makeItem({ contentType: 'show', contentId: 10, profileId: 5 });
      setupMocks({
        result: [item],
        watchlistItems: [{ ...item, id: 99 }],
      });
      renderWizard();
      const button = screen.getByRole('button', { name: /In Watchlist/i });
      expect(button).toBeDisabled();
    });

    it('shows no-matches fallback when result is empty array', () => {
      setupMocks({ result: [] });
      renderWizard();
      expect(screen.getByText(/No matches/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Broaden Search/i })).toBeInTheDocument();
    });

    it('Broaden Search dispatches setWizardFilters and setWizardResult', () => {
      setupMocks({ result: [], pool: [makeItem()] });
      renderWizard();
      fireEvent.click(screen.getByRole('button', { name: /Broaden Search/i }));
      expect(mockDispatch).toHaveBeenCalledWith(
        setWizardFilters(expect.objectContaining({ genres: [], maxRuntime: null }))
      );
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'watchlist/setWizardResult' }));
    });

    it('Try Again dispatches clearWizard and setWizardStep(0)', () => {
      setupMocks({ result: [makeItem()] });
      renderWizard();
      fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
      expect(mockDispatch).toHaveBeenCalledWith(clearWizard());
      expect(mockDispatch).toHaveBeenCalledWith(setWizardStep(0));
    });

    it('Close dispatches closeWizard', () => {
      setupMocks({ result: [makeItem()] });
      renderWizard();
      fireEvent.click(screen.getByRole('button', { name: /^Close$/i }));
      expect(mockDispatch).toHaveBeenCalledWith(closeWizard());
    });
  });

  describe('close button', () => {
    it('close icon dispatches closeWizard', () => {
      renderWizard();
      fireEvent.click(screen.getByRole('button', { name: /close wizard/i }));
      expect(mockDispatch).toHaveBeenCalledWith(closeWizard());
    });
  });
});

// -----------------------------------------------------------------------
// computeWizardResult pure function tests
// -----------------------------------------------------------------------
describe('computeWizardResult', () => {
  const show = (overrides: Partial<WatchlistItem> = {}): WatchlistItem =>
    makeItem({ contentType: 'show', ...overrides });
  const movie = (overrides: Partial<WatchlistItem> = {}): WatchlistItem =>
    makeItem({ id: 99, contentType: 'movie', title: 'Movie', genres: 'Action', runtime: 100, ...overrides });

  it('returns up to 3 results', () => {
    const pool = [1, 2, 3, 4].map((id) => show({ id }));
    const results = computeWizardResult(pool, {
      contentType: 'both',
      genres: [],
      maxRuntime: null,
      epicRuntime: false,
    });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('filters by contentType show', () => {
    const pool = [show({ id: 1 }), movie({ id: 2 })];
    const results = computeWizardResult(pool, {
      contentType: 'show',
      genres: [],
      maxRuntime: null,
      epicRuntime: false,
    });
    expect(results.every((i) => i.contentType === 'show')).toBe(true);
  });

  it('filters by contentType movie', () => {
    const pool = [show({ id: 1 }), movie({ id: 2 })];
    const results = computeWizardResult(pool, {
      contentType: 'movie',
      genres: [],
      maxRuntime: null,
      epicRuntime: false,
    });
    expect(results.every((i) => i.contentType === 'movie')).toBe(true);
  });

  it('filters by a single genre', () => {
    const pool = [show({ id: 1, genres: 'Drama' }), show({ id: 2, genres: 'Action' })];
    const results = computeWizardResult(pool, {
      contentType: 'both',
      genres: ['Drama'],
      maxRuntime: null,
      epicRuntime: false,
    });
    expect(results).toHaveLength(1);
    expect(results[0].genres).toContain('Drama');
  });

  it('filters by multiple genres (OR logic)', () => {
    const pool = [
      show({ id: 1, genres: 'Drama' }),
      show({ id: 2, genres: 'Action' }),
      show({ id: 3, genres: 'Comedy' }),
    ];
    const results = computeWizardResult(pool, {
      contentType: 'both',
      genres: ['Drama', 'Action'],
      maxRuntime: null,
      epicRuntime: false,
    });
    expect(results).toHaveLength(2);
  });

  it('filters by maxRuntime', () => {
    const pool = [show({ id: 1, runtime: 25 }), show({ id: 2, runtime: 55 })];
    const results = computeWizardResult(pool, { contentType: 'both', genres: [], maxRuntime: 30, epicRuntime: false });
    expect(results).toHaveLength(1);
    expect(results[0].runtime).toBe(25);
  });

  it('filters epic (150+ min)', () => {
    const pool = [movie({ id: 1, runtime: 120 }), movie({ id: 2, runtime: 160 })];
    const results = computeWizardResult(pool, {
      contentType: 'both',
      genres: [],
      maxRuntime: null,
      epicRuntime: true,
    });
    expect(results).toHaveLength(1);
    expect(results[0].runtime).toBe(160);
  });

  it('items with null runtime pass through runtime filters', () => {
    const pool = [show({ id: 1, runtime: null })];
    const results = computeWizardResult(pool, { contentType: 'both', genres: [], maxRuntime: 30, epicRuntime: false });
    expect(results).toHaveLength(1);
  });

  it('returns empty array when no candidates match', () => {
    const pool = [show({ id: 1, genres: 'Drama' })];
    const results = computeWizardResult(pool, {
      contentType: 'both',
      genres: ['Horror'],
      maxRuntime: null,
      epicRuntime: false,
    });
    expect(results).toHaveLength(0);
  });
});
