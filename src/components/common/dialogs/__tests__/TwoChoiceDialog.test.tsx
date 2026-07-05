import { render, screen } from '@testing-library/react';

import { TwoChoiceDialog } from '../TwoChoiceDialog';
import userEvent from '@testing-library/user-event';

describe('TwoChoiceDialog', () => {
  const mockOnPrimary = jest.fn();
  const mockOnSecondary = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    open: true,
    title: 'Pick one',
    body: 'Choose an option below.',
    primaryLabel: 'Do the primary thing',
    onPrimary: mockOnPrimary,
    secondaryLabel: 'Do the secondary thing',
    onSecondary: mockOnSecondary,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and body', () => {
    render(<TwoChoiceDialog {...defaultProps} />);

    expect(screen.getByText('Pick one')).toBeInTheDocument();
    expect(screen.getByText('Choose an option below.')).toBeInTheDocument();
  });

  it('renders both choice buttons', () => {
    render(<TwoChoiceDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Do the primary thing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Do the secondary thing' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<TwoChoiceDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Pick one')).not.toBeInTheDocument();
  });

  it('calls onPrimary when the primary button is clicked', async () => {
    const user = userEvent.setup();
    render(<TwoChoiceDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Do the primary thing' }));

    expect(mockOnPrimary).toHaveBeenCalledTimes(1);
    expect(mockOnSecondary).not.toHaveBeenCalled();
  });

  it('calls onSecondary when the secondary button is clicked', async () => {
    const user = userEvent.setup();
    render(<TwoChoiceDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Do the secondary thing' }));

    expect(mockOnSecondary).toHaveBeenCalledTimes(1);
    expect(mockOnPrimary).not.toHaveBeenCalled();
  });

  it('calls onClose when the dialog backdrop is clicked', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<TwoChoiceDialog {...defaultProps} />);

    const backdrop = baseElement.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });
});
