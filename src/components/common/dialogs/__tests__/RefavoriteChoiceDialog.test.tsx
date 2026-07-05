import { render, screen } from '@testing-library/react';

import { RefavoriteChoiceDialog } from '../RefavoriteChoiceDialog';
import userEvent from '@testing-library/user-event';

describe('RefavoriteChoiceDialog', () => {
  const mockOnRestore = jest.fn();
  const mockOnStartFresh = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    open: true,
    contentTitle: 'Breaking Bad',
    contentLabel: 'show' as const,
    onRestore: mockOnRestore,
    onStartFresh: mockOnStartFresh,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title with the content title', () => {
    render(<RefavoriteChoiceDialog {...defaultProps} />);

    expect(screen.getByText("You've watched 'Breaking Bad' before")).toBeInTheDocument();
  });

  it('renders both choice buttons', () => {
    render(<RefavoriteChoiceDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: /restore previous watch status/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start fresh/i })).toBeInTheDocument();
  });

  it('calls onRestore when "Restore previous watch status" is clicked', async () => {
    const user = userEvent.setup();
    render(<RefavoriteChoiceDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /restore previous watch status/i }));

    expect(mockOnRestore).toHaveBeenCalledTimes(1);
    expect(mockOnStartFresh).not.toHaveBeenCalled();
  });

  it('calls onStartFresh when "Start fresh" is clicked', async () => {
    const user = userEvent.setup();
    render(<RefavoriteChoiceDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /start fresh/i }));

    expect(mockOnStartFresh).toHaveBeenCalledTimes(1);
    expect(mockOnRestore).not.toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    render(<RefavoriteChoiceDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("You've watched 'Breaking Bad' before")).not.toBeInTheDocument();
  });
});
