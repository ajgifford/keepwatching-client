import { render, screen } from '@testing-library/react';

import { UnfavoriteChoiceDialog } from '../UnfavoriteChoiceDialog';
import userEvent from '@testing-library/user-event';

describe('UnfavoriteChoiceDialog', () => {
  const mockOnKeepHistory = jest.fn();
  const mockOnRemoveEntirely = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    open: true,
    contentTitle: 'Breaking Bad',
    contentLabel: 'show' as const,
    onKeepHistory: mockOnKeepHistory,
    onRemoveEntirely: mockOnRemoveEntirely,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title with the content title', () => {
    render(<UnfavoriteChoiceDialog {...defaultProps} />);

    expect(screen.getByText("Remove 'Breaking Bad' from favorites?")).toBeInTheDocument();
  });

  it('renders both choice buttons', () => {
    render(<UnfavoriteChoiceDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: /keep watch history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove entirely/i })).toBeInTheDocument();
  });

  it('calls onKeepHistory when "Keep watch history" is clicked', async () => {
    const user = userEvent.setup();
    render(<UnfavoriteChoiceDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /keep watch history/i }));

    expect(mockOnKeepHistory).toHaveBeenCalledTimes(1);
    expect(mockOnRemoveEntirely).not.toHaveBeenCalled();
  });

  it('calls onRemoveEntirely when "Remove entirely" is clicked', async () => {
    const user = userEvent.setup();
    render(<UnfavoriteChoiceDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /remove entirely/i }));

    expect(mockOnRemoveEntirely).toHaveBeenCalledTimes(1);
    expect(mockOnKeepHistory).not.toHaveBeenCalled();
  });

  it('adapts copy for a movie', () => {
    render(<UnfavoriteChoiceDialog {...defaultProps} contentTitle="Inception" contentLabel="movie" />);

    expect(screen.getByText("Remove 'Inception' from favorites?")).toBeInTheDocument();
    expect(screen.getByText(/removing this movie/i)).toBeInTheDocument();
  });
});
