import { fireEvent, screen, waitFor } from '@testing-library/react';

import axiosInstance from '../../../../app/api/axiosInstance';
import { renderWithProviders } from '../../../../app/testUtils';
import WatchlistButton from '../watchlistButton';
import { WatchStatus } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

const mockProfile = {
  id: 1,
  accountId: 1,
  name: 'Test Profile',
  image: '',
};

const baseActiveProfileState = {
  profile: mockProfile,
  shows: [],
  showGenres: [],
  showStreamingServices: [],
  movies: [],
  movieGenres: [],
  movieStreamingServices: [],
  upcomingEpisodes: [],
  recentEpisodes: [],
  nextUnwatchedEpisodes: [],
  recentMovies: [],
  upcomingMovies: [],
  milestoneStats: null,
  lastUpdated: null,
  loading: false,
  error: null,
};

const authState = {
  account: { id: 1, email: 'test@test.com', uid: 'test-uid', image: '', name: 'Test User', defaultProfileId: 0 },
  loading: false,
  error: null,
};

describe('WatchlistButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render an enabled button for content not yet on the watchlist', () => {
      renderWithProviders(<WatchlistButton id={123} searchType="shows" />, {
        preloadedState: { activeProfile: baseActiveProfileState, auth: authState },
      });

      const button = screen.getByRole('button', { name: /add to watchlist/i });
      expect(button).toBeEnabled();
    });

    it('should render a check icon when content is already on the watchlist', () => {
      const favoritedShow: any = { id: 1, tmdbId: 123, title: 'Test Show', watchStatus: WatchStatus.NOT_WATCHED };

      renderWithProviders(<WatchlistButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: { ...baseActiveProfileState, shows: [favoritedShow] },
          auth: authState,
          watchlist: {
            items: [
              {
                id: -1,
                profileId: 1,
                contentType: 'show',
                contentId: 1,
                priority: 0,
                addedAt: '',
                title: 'Test Show',
                posterImage: '',
                genres: '',
                streamingServices: '',
                runtime: null,
                currentWatchStatus: WatchStatus.NOT_WATCHED,
              },
            ],
            loading: false,
            error: null,
            wizardOpen: false,
            wizardStep: 0,
            wizardFilters: { contentType: 'both', genres: [], maxRuntime: null, epicRuntime: false },
            wizardResult: null,
          },
        },
      });

      const button = screen.getByRole('button', { name: /already on watchlist/i });
      expect(button).toBeEnabled();
      expect(screen.getByTestId('PlaylistAddCheckIcon')).toBeInTheDocument();
    });

    it('should render a disabled button for already-watched content', () => {
      const watchedShow: any = { id: 1, tmdbId: 123, title: 'Test Show', watchStatus: WatchStatus.WATCHED };

      renderWithProviders(<WatchlistButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: { ...baseActiveProfileState, shows: [watchedShow] },
          auth: authState,
        },
      });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('click handling', () => {
    it('favorites then adds to the watchlist for a not-yet-favorited show', async () => {
      const user = userEvent.setup();
      const postSpy = jest
        .spyOn(axiosInstance, 'post')
        .mockResolvedValueOnce({
          data: {
            addedShow: { id: 42, tmdbId: 123, title: 'Breaking Bad' },
            episodes: { upcomingEpisodes: [], recentEpisodes: [], nextUnwatchedEpisodes: [] },
            hasSurvivingHistory: false,
          },
        })
        .mockResolvedValueOnce({
          data: {
            message: 'Added to watchlist',
            item: {
              id: 7,
              profileId: 1,
              contentType: 'show',
              contentId: 42,
              priority: 0,
              addedAt: '2026-07-09',
              title: 'Breaking Bad',
              posterImage: '',
              genres: '',
              streamingServices: '',
              runtime: null,
              currentWatchStatus: WatchStatus.NOT_WATCHED,
            },
          },
        });

      const { store } = renderWithProviders(<WatchlistButton id={123} searchType="shows" />, {
        preloadedState: { activeProfile: baseActiveProfileState, auth: authState },
      });

      await user.click(screen.getByRole('button', { name: /add to watchlist/i }));

      await waitFor(() => expect(postSpy).toHaveBeenCalledTimes(2));
      expect(postSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('/shows/favorites'), {
        showTMDBId: 123,
        restoreFromHistory: undefined,
      });
      expect(postSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('/watchlist'), {
        contentType: 'show',
        contentId: 42,
      });
      await waitFor(() => expect(store.getState().watchlist.items).toHaveLength(1));
    });

    it('adds directly to the watchlist for an already-favorited movie', async () => {
      const user = userEvent.setup();
      const favoritedMovie: any = { id: 9, tmdbId: 456, title: 'Inception', watchStatus: WatchStatus.NOT_WATCHED };
      const postSpy = jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce({
        data: {
          message: 'Added to watchlist',
          item: {
            id: 3,
            profileId: 1,
            contentType: 'movie',
            contentId: 9,
            priority: 0,
            addedAt: '2026-07-09',
            title: 'Inception',
            posterImage: '',
            genres: '',
            streamingServices: '',
            runtime: null,
            currentWatchStatus: WatchStatus.NOT_WATCHED,
          },
        },
      });

      renderWithProviders(<WatchlistButton id={456} searchType="movies" />, {
        preloadedState: {
          activeProfile: { ...baseActiveProfileState, movies: [favoritedMovie] },
          auth: authState,
        },
      });

      await user.click(screen.getByRole('button', { name: /add to watchlist/i }));

      await waitFor(() => expect(postSpy).toHaveBeenCalledTimes(1));
      expect(postSpy).toHaveBeenCalledWith(expect.stringContaining('/watchlist'), {
        contentType: 'movie',
        contentId: 9,
      });
    });

    it('does not call the watchlist endpoint when favoriting fails', async () => {
      const user = userEvent.setup();
      const postSpy = jest.spyOn(axiosInstance, 'post').mockRejectedValueOnce({
        response: { data: { message: 'Failed to favorite' } },
      });

      renderWithProviders(<WatchlistButton id={123} searchType="shows" />, {
        preloadedState: { activeProfile: baseActiveProfileState, auth: authState },
      });

      await user.click(screen.getByRole('button', { name: /add to watchlist/i }));

      await waitFor(() => expect(postSpy).toHaveBeenCalledTimes(1));
      expect(postSpy).toHaveBeenCalledWith(expect.stringContaining('/shows/favorites'), expect.any(Object));
    });

    it('does nothing when clicking a disabled button for already-watched content', () => {
      const watchedMovie: any = { id: 9, tmdbId: 456, title: 'Inception', watchStatus: WatchStatus.WATCHED };
      const postSpy = jest.spyOn(axiosInstance, 'post');

      renderWithProviders(<WatchlistButton id={456} searchType="movies" />, {
        preloadedState: {
          activeProfile: { ...baseActiveProfileState, movies: [watchedMovie] },
          auth: authState,
        },
      });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      fireEvent.click(button);

      expect(postSpy).not.toHaveBeenCalled();
    });

    it('does nothing when clicked while already on the watchlist', async () => {
      const user = userEvent.setup();
      const favoritedShow: any = { id: 1, tmdbId: 123, title: 'Test Show', watchStatus: WatchStatus.NOT_WATCHED };
      const postSpy = jest.spyOn(axiosInstance, 'post');

      const { store } = renderWithProviders(<WatchlistButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: { ...baseActiveProfileState, shows: [favoritedShow] },
          auth: authState,
          watchlist: {
            items: [
              {
                id: -1,
                profileId: 1,
                contentType: 'show',
                contentId: 1,
                priority: 0,
                addedAt: '',
                title: 'Test Show',
                posterImage: '',
                genres: '',
                streamingServices: '',
                runtime: null,
                currentWatchStatus: WatchStatus.NOT_WATCHED,
              },
            ],
            loading: false,
            error: null,
            wizardOpen: false,
            wizardStep: 0,
            wizardFilters: { contentType: 'both', genres: [], maxRuntime: null, epicRuntime: false },
            wizardResult: null,
          },
        },
      });

      const initialItemsCount = store.getState().watchlist.items.length;

      await user.click(screen.getByRole('button', { name: /already on watchlist/i }));

      expect(postSpy).not.toHaveBeenCalled();
      expect(store.getState().watchlist.items).toHaveLength(initialItemsCount);
    });
  });
});
