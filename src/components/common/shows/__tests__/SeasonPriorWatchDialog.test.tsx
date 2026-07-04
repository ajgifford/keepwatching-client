import { render, screen } from '@testing-library/react';

import SeasonPriorWatchDialog from '../SeasonPriorWatchDialog';
import userEvent from '@testing-library/user-event';

describe('SeasonPriorWatchDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnWatchedWhenAired = jest.fn();
  const mockOnWatchedNow = jest.fn();

  const defaultProps = {
    open: true,
    seasonName: 'Season 4',
    onClose: mockOnClose,
    onWatchedWhenAired: mockOnWatchedWhenAired,
    onWatchedNow: mockOnWatchedNow,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the dialog title with season name', () => {
      render(<SeasonPriorWatchDialog {...defaultProps} />);

      expect(screen.getByText('What did you do with Season 4?')).toBeInTheDocument();
    });

    it('renders the air-date explanation', () => {
      render(<SeasonPriorWatchDialog {...defaultProps} />);

      expect(screen.getByText(/logs each episode using its original air date/i)).toBeInTheDocument();
      expect(screen.getByText(/marked watched only/i)).toBeInTheDocument();
      expect(screen.getByText(/backdated but treated like any other watch/i)).toBeInTheDocument();
    });

    it('renders the "Previously watched" button', () => {
      render(<SeasonPriorWatchDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /previously watched/i })).toBeInTheDocument();
    });

    it('renders the "I just watched it" button', () => {
      render(<SeasonPriorWatchDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /i just watched it/i })).toBeInTheDocument();
    });

    it('does not render a skip button', () => {
      render(<SeasonPriorWatchDialog {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<SeasonPriorWatchDialog {...defaultProps} open={false} />);

      expect(screen.queryByText('What did you do with Season 4?')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onWatchedWhenAired when "Previously watched" is clicked', async () => {
      const user = userEvent.setup();
      render(<SeasonPriorWatchDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /previously watched/i }));

      expect(mockOnWatchedWhenAired).toHaveBeenCalledTimes(1);
    });

    it('calls onWatchedNow when "I just watched it" is clicked', async () => {
      const user = userEvent.setup();
      render(<SeasonPriorWatchDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /i just watched it/i }));

      expect(mockOnWatchedNow).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the dialog backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { baseElement } = render(<SeasonPriorWatchDialog {...defaultProps} />);

      const backdrop = baseElement.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });
  });
});
