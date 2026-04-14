import { screen, waitFor } from '@testing-library/react';

import axiosInstance from '../../../../app/api/axiosInstance';
import { renderWithProviders } from '../../../../app/testUtils';
import RecommendationDetailsDialog from '../recommendationDetailsDialog';
import { RecommendationDetail } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../app/api/axiosInstance');

const mockDetails: RecommendationDetail[] = [
  {
    rating: 5,
    message: 'Absolutely brilliant!',
    profileName: '',
    createdAt: '',
  },
  {
    rating: null,
    message: 'Worth every minute',
    profileName: '',
    createdAt: '',
  },
  {
    rating: 3,
    message: null,
    profileName: '',
    createdAt: '',
  },
];

const defaultProps = {
  open: true,
  contentType: 'show' as const,
  contentId: 42,
  contentTitle: 'Breaking Bad',
  onClose: jest.fn(),
};

describe('RecommendationDetailsDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetching', () => {
    it('fetches details from the correct endpoint when opened', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { details: mockDetails } });
      renderWithProviders(<RecommendationDetailsDialog {...defaultProps} />);
      // Wait for the fetch to complete so state updates are flushed within act
      await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
      expect(axiosInstance.get).toHaveBeenCalledWith('/community/recommendations/show/42');
    });

    it('does not fetch when dialog is closed', () => {
      renderWithProviders(<RecommendationDetailsDialog {...defaultProps} open={false} />);
      expect(axiosInstance.get).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('shows spinner while loading', async () => {
      let resolve: (value: any) => void;
      (axiosInstance.get as jest.Mock).mockReturnValue(new Promise((r) => (resolve = r)));
      renderWithProviders(<RecommendationDetailsDialog {...defaultProps} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      // Resolve and drain the resulting state updates within act
      resolve!({ data: { details: [] } });
      await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    });
  });

  describe('empty state', () => {
    it('shows "No reviews found" when details array is empty', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { details: [] } });
      renderWithProviders(<RecommendationDetailsDialog {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText(/no reviews found/i)).toBeInTheDocument();
      });
    });
  });

  describe('review display', () => {
    it('renders review messages', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { details: mockDetails } });
      renderWithProviders(<RecommendationDetailsDialog {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText(/"Absolutely brilliant!"/i)).toBeInTheDocument();
        expect(screen.getByText(/"Worth every minute"/i)).toBeInTheDocument();
      });
    });

    it('renders dialog title with content title', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { details: [] } });
      renderWithProviders(<RecommendationDetailsDialog {...defaultProps} />);
      expect(screen.getByText(/Reviews — Breaking Bad/)).toBeInTheDocument();
      // Drain pending fetch state updates before the test exits
      await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    });

    it('does not render message element for details with null message', async () => {
      const detailWithNoMessage: RecommendationDetail = {
        rating: 3,
        message: null,
        profileName: '',
        createdAt: '',
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { details: [detailWithNoMessage] } });
      renderWithProviders(<RecommendationDetailsDialog {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText(/"/)).not.toBeInTheDocument();
      });
    });
  });

  describe('close behavior', () => {
    it('calls onClose when close button clicked', async () => {
      const onClose = jest.fn();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { details: [] } });
      renderWithProviders(<RecommendationDetailsDialog {...defaultProps} onClose={onClose} />);
      // Wait for the fetch to settle before interacting to avoid act() warnings
      await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
      const closeButton = screen.getByRole('button');
      await userEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });

    it('re-fetches when reopened with same props', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { details: [] } });
      const { rerender } = renderWithProviders(<RecommendationDetailsDialog {...defaultProps} open={false} />);
      expect(axiosInstance.get).not.toHaveBeenCalled();

      rerender(<RecommendationDetailsDialog {...defaultProps} open={true} />);
      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });
      // Drain state updates from the resolved fetch before exiting
      await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    });
  });
});
