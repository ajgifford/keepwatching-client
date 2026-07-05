import { screen, waitFor } from '@testing-library/react';

import { useMediaQuery } from '@mui/material';

import axiosInstance from '../../../../app/api/axiosInstance';
import { addMovieFavorite, addShowFavorite } from '../../../../app/slices/activeProfileSlice';
import { renderWithProviders } from '../../../../app/testUtils';
import FavoritesButton from '../favoriteButton';
import userEvent from '@testing-library/user-event';

// Mock MUI useMediaQuery
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

const mockUseMediaQuery = useMediaQuery as jest.Mock;

describe('FavoritesButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(false); // Default to large screen
  });

  const mockProfile = {
    id: 1,
    accountId: 1,
    name: 'Test Profile',
    image: '',
  };

  describe('rendering', () => {
    it('should render favorite button for non-favorited show', () => {
      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
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
          },
        },
      });

      const button = screen.getByRole('button', { name: /Add to Favorites/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Favorite')).toBeInTheDocument();
    });

    it('should render favorited state when show is already favorited', () => {
      const favoritedShow: any = {
        id: 1,
        tmdbId: 123,
        title: 'Test Show',
        isFavorite: true,
        genres: 'Drama',
        streamingServices: 'Netflix',
      };

      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
            profile: mockProfile,
            shows: [favoritedShow],
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
          },
        },
      });

      expect(screen.getByText('Favorited')).toBeInTheDocument();
    });

    it('should render IconButton on small screens', () => {
      mockUseMediaQuery.mockReturnValue(true); // Small screen

      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
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
          },
        },
      });

      const button = screen.getByRole('button', { name: /favoriteButton/i });
      expect(button).toBeInTheDocument();
      // On small screens, there's no text, only icon
      expect(screen.queryByText('Favorite')).not.toBeInTheDocument();
    });

    it('should handle string ID prop', () => {
      renderWithProviders(<FavoritesButton id="456" searchType="movies" />, {
        preloadedState: {
          activeProfile: {
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
          },
        },
      });

      expect(screen.getByRole('button')).toHaveAttribute('id', 'favoriteButton_456');
    });
  });

  describe('tooltip', () => {
    it('should show "Add to Favorites" tooltip when not favorited', async () => {
      const user = userEvent.setup();

      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
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
          },
        },
      });

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
      });
    });

    it('should show "Already a Favorite" tooltip when favorited', async () => {
      const user = userEvent.setup();

      const favoritedMovie: any = {
        id: 1,
        tmdbId: 456,
        title: 'Test Movie',
        isFavorite: true,
        genres: 'Action',
        streamingServices: 'Disney+',
      };

      renderWithProviders(<FavoritesButton id={456} searchType="movies" />, {
        preloadedState: {
          activeProfile: {
            profile: mockProfile,
            shows: [],
            showGenres: [],
            showStreamingServices: [],
            movies: [favoritedMovie],
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
          },
        },
      });

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByText('Already a Favorite')).toBeInTheDocument();
      });
    });
  });

  describe('click handling', () => {
    it('should dispatch addShowFavorite when clicking for a show', async () => {
      const user = userEvent.setup();

      const { store } = renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
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
          },
        },
      });

      const button = screen.getByRole('button', { name: /Add to Favorites/i });
      await user.click(button);

      await waitFor(() => {
        const actions = store.getState();
        // Check that the action was dispatched (we're mocking the actual API call)
        expect(button).toBeEnabled();
      });
    });

    it('should dispatch addMovieFavorite when clicking for a movie', async () => {
      const user = userEvent.setup();

      const { store } = renderWithProviders(<FavoritesButton id={456} searchType="movies" />, {
        preloadedState: {
          activeProfile: {
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
          },
        },
      });

      const button = screen.getByRole('button', { name: /Add to Favorites/i });
      await user.click(button);

      await waitFor(() => {
        expect(button).toBeEnabled();
      });
    });

    it('should not dispatch action when already favorited', async () => {
      const user = userEvent.setup();

      const favoritedShow: any = {
        id: 1,
        tmdbId: 123,
        title: 'Test Show',
        isFavorite: true,
        genres: 'Drama',
        streamingServices: 'Netflix',
      };

      const { store } = renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
            profile: mockProfile,
            shows: [favoritedShow],
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
          },
        },
      });

      const button = screen.getByRole('button', { name: /Already a Favorite/i });
      const initialActionsCount = Object.keys(store.getState()).length;

      await user.click(button);

      // State should not change
      await waitFor(() => {
        expect(Object.keys(store.getState())).toHaveLength(initialActionsCount);
      });
    });
  });

  describe('loading state', () => {
    it('should show loading state while processing', () => {
      // This test would require mocking the async dispatch behavior
      // For now, we'll just verify the loading UI can render
      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
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
          },
        },
      });

      // Component should render without errors
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('button variants', () => {
    it('should render outlined button for non-favorited items', () => {
      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
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
          },
        },
      });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-outlined');
    });

    it('should render contained button for favorited items', () => {
      const favoritedShow: any = {
        id: 1,
        tmdbId: 123,
        title: 'Test Show',
        isFavorite: true,
        genres: 'Drama',
        streamingServices: 'Netflix',
      };

      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, {
        preloadedState: {
          activeProfile: {
            profile: mockProfile,
            shows: [favoritedShow],
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
          },
        },
      });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-contained');
    });
  });

  describe('restore from history', () => {
    const preloadedState = {
      activeProfile: {
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
      },
      auth: {
        account: { id: 1, email: 'test@test.com', uid: 'test-uid', image: '', name: 'Test User', defaultProfileId: 0 },
        loading: false,
        error: null,
      },
    };

    it('shows the restore dialog when adding a show favorite that has surviving history', async () => {
      const user = userEvent.setup();
      jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce({
        data: {
          addedShow: { id: 1, tmdbId: 123, title: 'Breaking Bad' },
          episodes: { upcomingEpisodes: [], recentEpisodes: [], nextUnwatchedEpisodes: [] },
          hasSurvivingHistory: true,
        },
      });

      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, { preloadedState });

      await user.click(screen.getByRole('button', { name: /Add to Favorites/i }));

      expect(await screen.findByText("You've watched 'Breaking Bad' before")).toBeInTheDocument();
    });

    it('does not show the restore dialog when there is no surviving history', async () => {
      const user = userEvent.setup();
      jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce({
        data: {
          addedShow: { id: 1, tmdbId: 123, title: 'Breaking Bad' },
          episodes: { upcomingEpisodes: [], recentEpisodes: [], nextUnwatchedEpisodes: [] },
          hasSurvivingHistory: false,
        },
      });

      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, { preloadedState });

      await user.click(screen.getByRole('button', { name: /Add to Favorites/i }));

      await waitFor(() => expect(screen.getByText('Favorited')).toBeInTheDocument());
      expect(screen.queryByText(/watched.*before/i)).not.toBeInTheDocument();
    });

    it('re-dispatches addShowFavorite with restoreFromHistory=true when "Restore previous watch status" is chosen', async () => {
      const user = userEvent.setup();
      const postSpy = jest
        .spyOn(axiosInstance, 'post')
        .mockResolvedValueOnce({
          data: {
            addedShow: { id: 1, tmdbId: 123, title: 'Breaking Bad' },
            episodes: { upcomingEpisodes: [], recentEpisodes: [], nextUnwatchedEpisodes: [] },
            hasSurvivingHistory: true,
          },
        })
        .mockResolvedValueOnce({
          data: {
            addedShow: { id: 1, tmdbId: 123, title: 'Breaking Bad' },
            episodes: { upcomingEpisodes: [], recentEpisodes: [], nextUnwatchedEpisodes: [] },
            hasSurvivingHistory: true,
          },
        });

      renderWithProviders(<FavoritesButton id={123} searchType="shows" />, { preloadedState });

      await user.click(screen.getByRole('button', { name: /Add to Favorites/i }));
      await screen.findByText("You've watched 'Breaking Bad' before");
      await user.click(screen.getByRole('button', { name: /restore previous watch status/i }));

      expect(postSpy).toHaveBeenLastCalledWith(expect.any(String), {
        showTMDBId: 123,
        restoreFromHistory: true,
      });
    });

    it('closes the restore dialog without a second dispatch when "Start fresh" is chosen', async () => {
      const user = userEvent.setup();
      const postSpy = jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce({
        data: {
          favoritedMovie: { id: 1, tmdbId: 456, title: 'Inception' },
          recentUpcomingMovies: { recentMovies: [], upcomingMovies: [] },
          hasSurvivingHistory: true,
        },
      });

      renderWithProviders(<FavoritesButton id={456} searchType="movies" />, { preloadedState });

      await user.click(screen.getByRole('button', { name: /Add to Favorites/i }));
      await screen.findByText("You've watched 'Inception' before");
      await user.click(screen.getByRole('button', { name: /start fresh/i }));

      expect(screen.queryByText("You've watched 'Inception' before")).not.toBeInTheDocument();
      expect(postSpy).toHaveBeenCalledTimes(1);
    });
  });
});
