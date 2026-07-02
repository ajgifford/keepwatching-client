import { fireEvent, screen, waitFor } from '@testing-library/react';

import axiosInstance from '../../../../app/api/axiosInstance';
import { renderWithProviders } from '../../../../app/testUtils';
import { ContentRatingWidget } from '../contentRatingWidget';
import { ContentRating } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../app/api/axiosInstance');

const mockRating: ContentRating = {
  id: 1,
  profileId: 10,
  contentType: 'show',
  contentId: 42,
  contentTitle: 'Breaking Bad',
  posterImage: '/poster.jpg',
  rating: 4,
  note: 'Great show',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const defaultProps = {
  profileId: 10,
  contentType: 'show' as const,
  contentId: 42,
  contentTitle: 'Breaking Bad',
  posterImage: '/poster.jpg',
};

const ratingsState = (ratings: ContentRating[] = []) => ({
  ratings: { ratings, loading: false, error: null },
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
});

describe('ContentRatingWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders "Your rating" label', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState(),
      });
      expect(screen.getByText('Your rating')).toBeInTheDocument();
    });

    it('renders notes text field', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState(),
      });
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });

    it('save button is disabled when no stars selected', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState(),
      });
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    it('save button is enabled when existing rating present', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState([mockRating]),
      });
      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
    });

    it('delete button hidden when no existing rating', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState(),
      });
      // Only the Save button should be visible
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('delete button shown when existing rating present', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState([mockRating]),
      });
      // Save + delete
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('pre-fills notes field from existing rating', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState([mockRating]),
      });
      expect(screen.getByLabelText(/notes/i)).toHaveValue('Great show');
    });
  });

  describe('star interaction', () => {
    it('enables save button after selecting a star rating via fireEvent', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState(),
      });
      const threeStars = screen.getByRole('radio', { name: /3 stars/i });
      fireEvent.click(threeStars);
      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
    });
  });

  describe('save', () => {
    it('calls upsertRating with the existing rating value on save', async () => {
      const user = userEvent.setup();
      // Preload an existing 4-star rating to pre-fill the widget
      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: { rating: mockRating },
      });
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState([mockRating]),
      });
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/123/profiles/10/ratings', {
          contentType: 'show',
          contentId: 42,
          rating: 4,
          note: 'Great show',
          contentTitle: 'Breaking Bad',
          posterImage: '/poster.jpg',
        });
      });
    });

    it('sends null note when note field is cleared', async () => {
      const user = userEvent.setup();
      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: { rating: { ...mockRating, note: null } },
      });
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState([mockRating]),
      });
      // Clear the note field
      await user.clear(screen.getByLabelText(/notes/i));
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ note: null }));
      });
    });

    it('does not call API when save button is disabled', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState(),
      });
      // Button is disabled with no stars selected - just verify it's disabled
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
      expect(axiosInstance.post).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('calls deleteRating with existing rating id', async () => {
      const user = userEvent.setup();
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState([mockRating]),
      });
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons[1]; // second button is delete
      await user.click(deleteButton);
      await waitFor(() => {
        expect(axiosInstance.delete).toHaveBeenCalledWith('/accounts/123/profiles/10/ratings/1');
      });
    });
  });

  describe('autoSaveRating', () => {
    it('persists the rating immediately on star selection without clicking Save', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: { rating: { ...mockRating, note: null } },
      });
      renderWithProviders(<ContentRatingWidget {...defaultProps} autoSaveRating />, {
        preloadedState: ratingsState(),
      });

      const threeStars = screen.getByRole('radio', { name: /3 stars/i });
      fireEvent.click(threeStars);

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          '/accounts/123/profiles/10/ratings',
          expect.objectContaining({ rating: 3 })
        );
      });
    });

    it('does not auto-save when autoSaveRating is not set', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} />, {
        preloadedState: ratingsState(),
      });

      const threeStars = screen.getByRole('radio', { name: /3 stars/i });
      fireEvent.click(threeStars);

      expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    it('disables Save right after the rating auto-saves, since there is nothing left to save', () => {
      renderWithProviders(<ContentRatingWidget {...defaultProps} autoSaveRating />, {
        preloadedState: ratingsState(),
      });

      fireEvent.click(screen.getByRole('radio', { name: /3 stars/i }));

      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    it('re-enables Save once the note is edited after an auto-saved rating', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentRatingWidget {...defaultProps} autoSaveRating />, {
        preloadedState: ratingsState(),
      });

      fireEvent.click(screen.getByRole('radio', { name: /3 stars/i }));
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

      await user.type(screen.getByLabelText(/notes/i), 'Great episode');

      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
    });
  });

  describe('onDirtyChange', () => {
    it('reports dirty when the note differs from the saved note', async () => {
      const user = userEvent.setup();
      const onDirtyChange = jest.fn();
      renderWithProviders(<ContentRatingWidget {...defaultProps} onDirtyChange={onDirtyChange} />, {
        preloadedState: ratingsState([mockRating]),
      });

      onDirtyChange.mockClear();
      await user.type(screen.getByLabelText(/notes/i), '!');

      expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    });

    it('reports not dirty when autoSaveRating is set and only the rating changes', () => {
      const onDirtyChange = jest.fn();
      renderWithProviders(<ContentRatingWidget {...defaultProps} autoSaveRating onDirtyChange={onDirtyChange} />, {
        preloadedState: ratingsState(),
      });

      onDirtyChange.mockClear();
      fireEvent.click(screen.getByRole('radio', { name: /3 stars/i }));

      expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    });

    it('reports dirty when a rating is chosen without autoSaveRating', () => {
      const onDirtyChange = jest.fn();
      renderWithProviders(<ContentRatingWidget {...defaultProps} onDirtyChange={onDirtyChange} />, {
        preloadedState: ratingsState(),
      });

      onDirtyChange.mockClear();
      fireEvent.click(screen.getByRole('radio', { name: /3 stars/i }));

      expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    });
  });
});
