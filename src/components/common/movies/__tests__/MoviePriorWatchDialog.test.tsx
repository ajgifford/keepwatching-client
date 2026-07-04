import { render, screen } from '@testing-library/react';

import MoviePriorWatchDialog from '../MoviePriorWatchDialog';
import userEvent from '@testing-library/user-event';

describe('MoviePriorWatchDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnJustWatched = jest.fn();
  const mockOnPriorWatch = jest.fn();

  const defaultProps = {
    open: true,
    movieTitle: 'The Matrix',
    releaseDate: '1999-03-31',
    onJustWatched: mockOnJustWatched,
    onPriorWatch: mockOnPriorWatch,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the dialog title with the movie title', () => {
      render(<MoviePriorWatchDialog {...defaultProps} />);

      expect(screen.getByText('Have you seen The Matrix before?')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<MoviePriorWatchDialog {...defaultProps} open={false} />);

      expect(screen.queryByText('Have you seen The Matrix before?')).not.toBeInTheDocument();
    });

    it('does not show the date picker or split notice by default', () => {
      render(<MoviePriorWatchDialog {...defaultProps} />);

      expect(screen.queryByLabelText(/when did you watch it/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/marked watched only/i)).not.toBeInTheDocument();
    });

    it('shows the date picker and air-date split notice when "prior watch" is selected', async () => {
      const user = userEvent.setup();
      render(<MoviePriorWatchDialog {...defaultProps} />);

      await user.click(screen.getByLabelText(/seen it before/i));

      expect(screen.getByLabelText(/when did you watch it/i)).toBeInTheDocument();
      expect(screen.getByText(/marked watched only/i)).toBeInTheDocument();
      expect(screen.getByText(/backdated but treated like any other watch/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onJustWatched and onClose when confirming the default "I just watched it" choice', async () => {
      const user = userEvent.setup();
      render(<MoviePriorWatchDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockOnJustWatched).toHaveBeenCalledTimes(1);
      expect(mockOnPriorWatch).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onPriorWatch with the selected date when confirming the "prior watch" choice', async () => {
      const user = userEvent.setup();
      render(<MoviePriorWatchDialog {...defaultProps} />);

      await user.click(screen.getByLabelText(/seen it before/i));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockOnPriorWatch).toHaveBeenCalledWith('1999-03-31');
      expect(mockOnJustWatched).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<MoviePriorWatchDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnJustWatched).not.toHaveBeenCalled();
    });
  });
});
