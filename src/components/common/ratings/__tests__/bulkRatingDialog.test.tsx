import { fireEvent, screen, waitFor } from '@testing-library/react';

import axiosInstance from '../../../../app/api/axiosInstance';
import { renderWithProviders } from '../../../../app/testUtils';
import { BulkRatingDialog } from '../bulkRatingDialog';
import { ProfileMovie, ProfileShow, WatchStatus } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../app/api/axiosInstance');

const mockWatchedShow: ProfileShow = {
  id: 1,
  title: 'Breaking Bad',
  posterImage: '/poster.jpg',
  watchStatus: WatchStatus.WATCHED,
} as any;

const mockWatchedMovie: ProfileMovie = {
  id: 99,
  title: 'Inception',
  posterImage: '/inception.jpg',
  watchStatus: WatchStatus.WATCHED,
} as any;

const baseState = (shows: ProfileShow[] = [], movies: ProfileMovie[] = []) => ({
  auth: {
    account: {
      id: 123,
      uid: 'firebase-uid-123',
      name: 'Test User',
      email: 'test@example.com',
      image: '',
      defaultProfileId: 10,
    },
    loading: false,
    error: null,
  },
  ratings: { ratings: [], loading: false, error: null },
  activeProfile: {
    profile: null,
    shows,
    showGenres: [],
    showStreamingServices: [],
    movies,
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
});

const defaultProps = {
  profileId: 10,
  open: true,
  onClose: jest.fn(),
};

describe('BulkRatingDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the first unrated item with its title, rating widget, and position', () => {
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
    });
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Your rating')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('disables Back/First but enables Next/Last on the first item', () => {
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
    });
    expect(screen.getByRole('button', { name: 'First' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Last' })).toBeEnabled();
  });

  it('shows a message when there is nothing to rate', () => {
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([], []) as any,
    });
    expect(screen.getByText(/nothing to rate/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('advances to the next item when Next is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
    });

    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
  });

  it('returns to the previous item when Back is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Inception')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('jumps to the last and first item via Last/First', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
    });

    await user.click(screen.getByRole('button', { name: 'Last' }));
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'First' }));
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
  });

  it('keeps the current item in place after saving a rating rather than auto-advancing', async () => {
    (axiosInstance.post as jest.Mock).mockResolvedValue({
      data: {
        rating: {
          id: 1,
          profileId: 10,
          contentType: 'show',
          contentId: 1,
          contentTitle: 'Breaking Bad',
          posterImage: '/poster.jpg',
          rating: 5,
          note: null,
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        },
      },
    });
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
    });

    // Rating auto-saves on star selection; no Save click needed.
    const fiveStars = screen.getByRole('radio', { name: /5 stars/i });
    fireEvent.click(fiveStars);

    await waitFor(() => {
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('shows a success message at the end when every item has been rated', async () => {
    (axiosInstance.post as jest.Mock).mockResolvedValue({
      data: {
        rating: {
          id: 1,
          profileId: 10,
          contentType: 'show',
          contentId: 1,
          contentTitle: 'Breaking Bad',
          posterImage: '/poster.jpg',
          rating: 5,
          note: null,
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        },
      },
    });
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], []) as any,
    });

    // Single-item queue: already on the last item. Rating auto-saves on star selection.
    const fiveStars = screen.getByRole('radio', { name: /5 stars/i });
    fireEvent.click(fiveStars);

    await waitFor(() => {
      expect(screen.getByText(/all done!/i)).toBeInTheDocument();
    });
  });

  it('shows an unrated-count message at the end when items are still unrated', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
    });

    await user.click(screen.getByRole('button', { name: 'Last' }));
    expect(screen.getByText(/2 items still unrated/i)).toBeInTheDocument();
  });

  it('calls onClose when Close is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWithProviders(<BulkRatingDialog {...defaultProps} onClose={onClose} />, {
      preloadedState: baseState([mockWatchedShow], []) as any,
    });
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('auto-saves the rating as soon as a star is picked, without clicking Save', async () => {
    (axiosInstance.post as jest.Mock).mockResolvedValue({
      data: {
        rating: {
          id: 1,
          profileId: 10,
          contentType: 'show',
          contentId: 1,
          contentTitle: 'Breaking Bad',
          posterImage: '/poster.jpg',
          rating: 4,
          note: null,
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        },
      },
    });
    renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
      preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
    });

    fireEvent.click(screen.getByRole('radio', { name: /4 stars/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/accounts/123/profiles/10/ratings',
        expect.objectContaining({ rating: 4 })
      );
    });
  });

  describe('unsaved note guard', () => {
    it('confirms before navigating away from an unsaved note', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
        preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
      });

      await user.type(screen.getByLabelText(/notes/i), 'Loved it');
      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(screen.getByText(/discard unsaved note/i)).toBeInTheDocument();
      // Still on the original item since navigation hasn't been confirmed yet.
      expect(screen.getByText('1 of 2')).toBeInTheDocument();
    });

    it('Cancel keeps the current item and the unsaved note', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
        preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
      });

      await user.type(screen.getByLabelText(/notes/i), 'Loved it');
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // MUI's Dialog stays in the DOM during its exit transition, so we only assert
      // that Cancel didn't navigate away and the note survived — not that it's unmounted.
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toHaveValue('Loved it');
    });

    it('Discard proceeds with navigation and drops the note', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
        preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
      });

      await user.type(screen.getByLabelText(/notes/i), 'Loved it');
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: /discard/i }));

      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.getByText('2 of 2')).toBeInTheDocument();
    });

    it('confirms before closing the dialog with an unsaved note', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      renderWithProviders(<BulkRatingDialog {...defaultProps} onClose={onClose} />, {
        preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
      });

      await user.type(screen.getByLabelText(/notes/i), 'Loved it');
      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText(/discard unsaved note/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /discard/i }));
      expect(onClose).toHaveBeenCalled();
    });

    it('does not prompt when navigating without an unsaved note', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BulkRatingDialog {...defaultProps} />, {
        preloadedState: baseState([mockWatchedShow], [mockWatchedMovie]) as any,
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(screen.queryByText(/discard unsaved note/i)).not.toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
  });
});
