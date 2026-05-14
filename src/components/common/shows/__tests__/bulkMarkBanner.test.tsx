import { render, screen } from '@testing-library/react';

import BulkMarkBanner from '../BulkMarkBanner';
import userEvent from '@testing-library/user-event';

describe('BulkMarkBanner', () => {
  const mockOnFix = jest.fn();
  const mockOnDismiss = jest.fn();

  const defaultProps = {
    onFix: mockOnFix,
    onDismiss: mockOnDismiss,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the alert title', () => {
      render(<BulkMarkBanner {...defaultProps} />);

      expect(screen.getByText('Improve your watch history accuracy')).toBeInTheDocument();
    });

    it('renders the body text', () => {
      render(<BulkMarkBanner {...defaultProps} />);

      expect(
        screen.getByText(/many episodes of this show were marked as watched on the same day/i)
      ).toBeInTheDocument();
    });

    it('renders the Fix watch dates button', () => {
      render(<BulkMarkBanner {...defaultProps} />);

      expect(screen.getByRole('button', { name: /fix watch dates/i })).toBeInTheDocument();
    });

    it('renders the Dismiss button', () => {
      render(<BulkMarkBanner {...defaultProps} />);

      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('renders as an info alert', () => {
      const { container } = render(<BulkMarkBanner {...defaultProps} />);

      const alert = container.querySelector('.MuiAlert-colorInfo');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onFix when Fix watch dates button is clicked', async () => {
      const user = userEvent.setup();
      render(<BulkMarkBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /fix watch dates/i }));

      expect(mockOnFix).toHaveBeenCalledTimes(1);
    });

    it('calls onDismiss when Dismiss button is clicked', async () => {
      const user = userEvent.setup();
      render(<BulkMarkBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not call onFix when Dismiss is clicked', async () => {
      const user = userEvent.setup();
      render(<BulkMarkBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(mockOnFix).not.toHaveBeenCalled();
    });

    it('does not call onDismiss when Fix watch dates is clicked', async () => {
      const user = userEvent.setup();
      render(<BulkMarkBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /fix watch dates/i }));

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });
});
