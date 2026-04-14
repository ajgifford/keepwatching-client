import { screen, waitFor, within } from '@testing-library/react';

import axiosInstance from '../../../../app/api/axiosInstance';
import { renderWithProviders } from '../../../../app/testUtils';
import { CommunityRecommendationsSection } from '../communityRecommendationsSection';
import { CommunityRecommendation, RatingContentType } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../app/api/axiosInstance');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', state: null }),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: (path: string) => `https://image.tmdb.org/t/p/w500${path}`,
}));

const mockShow: CommunityRecommendation = {
  id: 1,
  contentType: 'show',
  contentId: 42,
  tmdbId: 1396,
  contentTitle: 'Breaking Bad',
  posterImage: '/breaking-bad.jpg',
  releaseDate: '2008-01-20',
  genres: 'Drama',
  recommendationCount: 3,
  averageRating: 4.5,
  ratingCount: 2,
  messageCount: 1,
  createdAt: '2026-04-01T00:00:00.000Z',
};

const mockMovie: CommunityRecommendation = {
  id: 2,
  contentType: 'movie',
  contentId: 99,
  tmdbId: 27205,
  contentTitle: 'Inception',
  posterImage: '/inception.jpg',
  releaseDate: '2010-07-16',
  genres: 'Action',
  recommendationCount: 1,
  averageRating: null,
  ratingCount: 0,
  messageCount: 0,
  createdAt: '2026-04-01T00:00:00.000Z',
};

const mockProfile = {
  id: 10,
  accountId: 1,
  name: 'Test Profile',
  image: undefined,
  avatar: null,
};

const activeProfileState = {
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

const mockAccount = {
  id: 1,
  name: 'Test Account',
  email: 'test@example.com',
  uid: 'firebase-uid-123',
  image: '',
  defaultProfileId: 10,
};

const buildState = (contentTypeFilter: RatingContentType | null = null) => ({
  communityRecommendations: {
    communityRecommendations: [],
    communityLoading: false,
    communityError: null,
    contentTypeFilter,
    profileRecommendations: [],
    profileRecsLoading: false,
    sendLoading: false,
  },
  activeProfile: activeProfileState,
});

const buildStateWithFavoritedShow = (contentTypeFilter: RatingContentType | null = null) => ({
  ...buildState(contentTypeFilter),
  activeProfile: {
    ...activeProfileState,
    shows: [{ tmdbId: mockShow.tmdbId } as any],
  },
  auth: { account: mockAccount, loading: false, error: null },
});

const buildStateWithFavoritedMovie = (contentTypeFilter: RatingContentType | null = null) => ({
  ...buildState(contentTypeFilter),
  activeProfile: {
    ...activeProfileState,
    movies: [{ tmdbId: mockMovie.tmdbId } as any],
  },
  auth: { account: mockAccount, loading: false, error: null },
});

// Waits for the loading spinner to disappear after the mount-fetch completes
const waitForLoaded = () => waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

describe('CommunityRecommendationsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: returns empty list so tests that set up their own data aren't polluted
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [] } });
  });

  describe('loading state', () => {
    it('shows loading spinner while fetch is in flight', () => {
      // Keep the promise pending so loading state stays visible
      (axiosInstance.get as jest.Mock).mockReturnValue(new Promise(() => {}));
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no recommendations returned', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitForLoaded();
      expect(screen.getByText(/no community recommendations yet/i)).toBeInTheDocument();
    });
  });

  describe('recommendation cards', () => {
    it('renders the section heading', async () => {
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      expect(screen.getByText('Community Picks')).toBeInTheDocument();
      await waitForLoaded();
    });

    it('renders a card for each recommendation', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow, mockMovie] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitFor(() => expect(screen.getByText('Breaking Bad')).toBeInTheDocument());
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    it('shows review link when messageCount > 0', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitFor(() => expect(screen.getByText('1 review')).toBeInTheDocument());
    });

    it('does not show review link when messageCount is 0', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockMovie] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitForLoaded();
      expect(screen.queryByText(/review/i)).not.toBeInTheDocument();
    });

    it('shows plural reviews text for multiple messages', async () => {
      const multiReviewRec = { ...mockShow, messageCount: 3 };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [multiReviewRec] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitFor(() => expect(screen.getByText('3 reviews')).toBeInTheDocument());
    });
  });

  describe('navigation', () => {
    it('navigates to show detail on show card click when favorited', async () => {
      const user = userEvent.setup();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildStateWithFavoritedShow(),
      });
      await waitFor(() => screen.getByText('Breaking Bad'));
      const cardArea = screen.getByText('Breaking Bad').closest('button') as HTMLElement;
      await user.click(cardArea);
      expect(mockNavigate).toHaveBeenCalledWith(
        `/shows/${mockShow.contentId}/${mockProfile.id}`,
        expect.objectContaining({ state: { returnPath: '/home' } })
      );
    });

    it('navigates to movie detail on movie card click when favorited', async () => {
      const user = userEvent.setup();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockMovie] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildStateWithFavoritedMovie(),
      });
      await waitFor(() => screen.getByText('Inception'));
      const cardArea = screen.getByText('Inception').closest('button') as HTMLElement;
      await user.click(cardArea);
      expect(mockNavigate).toHaveBeenCalledWith(
        `/movies/${mockMovie.contentId}/${mockProfile.id}`,
        expect.objectContaining({ state: { returnPath: '/home' } })
      );
    });

    it('does not navigate when no active profile even if content is favorited', async () => {
      const user = userEvent.setup();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: {
          ...buildStateWithFavoritedShow(),
          activeProfile: { ...activeProfileState, profile: null, shows: [{ tmdbId: mockShow.tmdbId } as any] },
        },
      });
      await waitFor(() => screen.getByText('Breaking Bad'));
      const cardArea = screen.getByText('Breaking Bad').closest('button') as HTMLElement;
      await user.click(cardArea);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('filter toggle', () => {
    it('renders All, Shows, Movies toggle buttons', async () => {
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /shows/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /movies/i })).toBeInTheDocument();
      await waitForLoaded();
    });

    it('re-fetches with contentType param when Shows filter clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitForLoaded();
      await user.click(screen.getByRole('button', { name: /shows/i }));
      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith(expect.stringContaining('contentType=show'));
      });
      // Drain Redux state updates from the resolved fetch before exiting
      await waitForLoaded();
    });
  });

  describe('favorite state', () => {
    it('card action area is disabled when content is not in profile favorites', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitFor(() => screen.getByText('Breaking Bad'));
      const cardArea = screen.getByText('Breaking Bad').closest('button') as HTMLElement;
      expect(cardArea).toBeDisabled();
    });

    it('card action area is enabled when content is in profile favorites', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildStateWithFavoritedShow(),
      });
      await waitFor(() => screen.getByText('Breaking Bad'));
      const cardArea = screen.getByText('Breaking Bad').closest('button') as HTMLElement;
      expect(cardArea).toBeEnabled();
    });

    it('shows empty star button when content is not favorited', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitFor(() => screen.getByText('Breaking Bad'));
      expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
    });

    it('shows filled star button when content is favorited', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildStateWithFavoritedShow(),
      });
      await waitFor(() => screen.getByText('Breaking Bad'));
      expect(screen.getByRole('button', { name: /already in favorites/i })).toBeInTheDocument();
    });

    it('add-to-favorites button is disabled when content is already favorited', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildStateWithFavoritedShow(),
      });
      await waitFor(() => screen.getByText('Breaking Bad'));
      expect(screen.getByRole('button', { name: /already in favorites/i })).toBeDisabled();
    });

    it('dispatches addShowFavorite when add-to-favorites clicked for a show', async () => {
      const user = userEvent.setup();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockShow] } });
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: {} });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: { ...buildState(), auth: { account: mockAccount, loading: false, error: null } },
      });
      await waitFor(() => screen.getByText('Breaking Bad'));
      await user.click(screen.getByRole('button', { name: /add to favorites/i }));
      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          expect.stringContaining('/shows/favorites'),
          expect.objectContaining({ showTMDBId: mockShow.tmdbId })
        );
      });
    });

    it('dispatches addMovieFavorite when add-to-favorites clicked for a movie', async () => {
      const user = userEvent.setup();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockMovie] } });
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: {} });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: { ...buildState(), auth: { account: mockAccount, loading: false, error: null } },
      });
      await waitFor(() => screen.getByText('Inception'));
      await user.click(screen.getByRole('button', { name: /add to favorites/i }));
      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          expect.stringContaining('/movies/favorites'),
          expect.objectContaining({ movieTMDBId: mockMovie.tmdbId })
        );
      });
    });
  });

  describe('details dialog', () => {
    it('opens recommendation details dialog when review link clicked', async () => {
      const user = userEvent.setup();
      (axiosInstance.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/community/recommendations/show/42')) {
          return Promise.resolve({ data: { details: [] } });
        }
        return Promise.resolve({ data: { recommendations: [mockShow] } });
      });
      renderWithProviders(<CommunityRecommendationsSection />, {
        preloadedState: buildState(),
      });
      await waitFor(() => screen.getByText('1 review'));
      await user.click(screen.getByText('1 review'));
      // Wait for the dialog AND its internal fetch to settle so all state updates are within act
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/no reviews found/i)).toBeInTheDocument();
      });
    });
  });
});
