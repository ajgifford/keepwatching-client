import { screen, waitFor, within } from '@testing-library/react';

import axiosInstance from '../../../../app/api/axiosInstance';
import { renderWithProviders } from '../../../../app/testUtils';
import { RecommendButton } from '../recommendButton';
import { ContentRating, ProfileRecommendation } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../app/api/axiosInstance');

const mockProfileRec: ProfileRecommendation = {
  id: 1,
  profileId: 10,
  contentType: 'show',
  contentId: 42,
  rating: 5,
  message: 'Must watch!',
  createdAt: '2026-04-01T00:00:00.000Z',
};

const mockRating: ContentRating = {
  id: 1,
  profileId: 10,
  contentType: 'show',
  contentId: 42,
  contentTitle: 'Breaking Bad',
  posterImage: '/poster.jpg',
  rating: 4,
  note: 'Great',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const defaultProps = {
  profileId: 10,
  contentType: 'show' as const,
  contentId: 42,
  contentTitle: 'Breaking Bad',
};

const baseState = (
  profileRecommendations: ProfileRecommendation[] = [],
  ratings: ContentRating[] = [],
  sendLoading = false
) => ({
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
  communityRecommendations: {
    communityRecommendations: [],
    communityLoading: false,
    communityError: null,
    contentTypeFilter: null,
    profileRecommendations,
    profileRecsLoading: false,
    sendLoading,
  },
  ratings: { ratings, loading: false, error: null },
});

describe('RecommendButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders "Recommend" when not yet recommended', () => {
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState(),
      });
      expect(screen.getByRole('button', { name: /recommend/i })).toBeInTheDocument();
      expect(screen.getByText('Recommend')).toBeInTheDocument();
    });

    it('renders "Recommended" when already recommended', () => {
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState([mockProfileRec]),
      });
      expect(screen.getByText('Recommended')).toBeInTheDocument();
    });

    it('uses outlined variant when not recommended', () => {
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState(),
      });
      expect(screen.getByRole('button')).toHaveClass('MuiButton-outlined');
    });

    it('uses contained variant when already recommended', () => {
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState([mockProfileRec]),
      });
      expect(screen.getByRole('button')).toHaveClass('MuiButton-contained');
    });

    it('disables button when sendLoading is true', () => {
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState([], [], true),
      });
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('dialog', () => {
    it('opens dialog on click when not yet recommended', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState(),
      });
      await user.click(screen.getByRole('button', { name: /recommend/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(`Recommend ${defaultProps.contentTitle}`)).toBeInTheDocument();
    });

    it('dialog contains message text field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState(),
      });
      await user.click(screen.getByRole('button', { name: /recommend/i }));
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('dialog shows rating checkbox when user has an existing rating', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState([], [mockRating]),
      });
      await user.click(screen.getByRole('button', { name: /recommend/i }));
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/include my rating/i)).toBeInTheDocument();
    });

    it('dialog does not show rating checkbox without existing rating', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState(),
      });
      await user.click(screen.getByRole('button', { name: /recommend/i }));
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('cancel button does not submit the recommendation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState(),
      });
      await user.click(screen.getByRole('button', { name: /^recommend$/i }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
      expect(axiosInstance.post).not.toHaveBeenCalled();
    });
  });

  describe('submitting recommendation', () => {
    it('calls addRecommendation with message when submitted', async () => {
      const user = userEvent.setup();
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: { recommendation: mockProfileRec } });
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState(),
      });
      await user.click(screen.getByRole('button', { name: /^recommend$/i }));
      const dialog = screen.getByRole('dialog');
      await user.type(within(dialog).getByLabelText(/message/i), 'Must watch!');
      await user.click(within(dialog).getByRole('button', { name: /^recommend$/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/123/profiles/10/recommendations', {
          contentType: 'show',
          contentId: 42,
          rating: null,
          message: 'Must watch!',
        });
      });
    });

    it('includes rating when checkbox is pre-checked (component default when rating exists)', async () => {
      const user = userEvent.setup();
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: { recommendation: mockProfileRec } });
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState([], [mockRating]),
      });
      await user.click(screen.getByRole('button', { name: /^recommend$/i }));
      const dialog = screen.getByRole('dialog');
      // Component pre-checks includeRating when an existing rating is present
      expect(within(dialog).getByRole('checkbox')).toBeChecked();
      await user.click(within(dialog).getByRole('button', { name: /^recommend$/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ rating: mockRating.rating })
        );
      });
    });

    it('dispatches addRecommendation and resolves on successful submit', async () => {
      const user = userEvent.setup();
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: { recommendation: mockProfileRec } });
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState(),
      });
      await user.click(screen.getByRole('button', { name: /^recommend$/i }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /^recommend$/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          '/accounts/123/profiles/10/recommendations',
          expect.objectContaining({ contentType: 'show', contentId: 42 })
        );
      });
    });
  });

  describe('unrecommending', () => {
    it('calls removeRecommendation when clicking "Recommended"', async () => {
      const user = userEvent.setup();
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState([mockProfileRec]),
      });
      await user.click(screen.getByRole('button', { name: /recommended/i }));
      await waitFor(() => {
        expect(axiosInstance.delete).toHaveBeenCalledWith('/accounts/123/profiles/10/recommendations', {
          data: { contentType: 'show', contentId: 42 },
        });
      });
    });

    it('does not open dialog when already recommended', async () => {
      const user = userEvent.setup();
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });
      renderWithProviders(<RecommendButton {...defaultProps} />, {
        preloadedState: baseState([mockProfileRec]),
      });
      await user.click(screen.getByRole('button', { name: /recommended/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
