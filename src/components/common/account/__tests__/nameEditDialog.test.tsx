import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NameEditDialog from '../nameEditDialog';

describe('NameEditDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const defaultProps = {
    open: true,
    title: 'Edit Name',
    initialName: 'John Doe',
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(<NameEditDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Name')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(<NameEditDialog {...defaultProps} open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays initial name in text field', () => {
    render(<NameEditDialog {...defaultProps} />);

    const input = screen.getByRole('textbox', { name: /name/i });
    expect(input).toHaveValue('John Doe');
  });

  it('updates name when user types', async () => {
    const user = userEvent.setup();
    render(<NameEditDialog {...defaultProps} />);

    const input = screen.getByRole('textbox', { name: /name/i });
    await user.clear(input);
    await user.type(input, 'Jane Smith');

    expect(input).toHaveValue('Jane Smith');
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<NameEditDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with new name and onClose when Save button is clicked', async () => {
    const user = userEvent.setup();
    render(<NameEditDialog {...defaultProps} />);

    const input = screen.getByRole('textbox', { name: /name/i });
    await user.clear(input);
    await user.type(input, 'Jane Smith');

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('Jane Smith');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with initial name if user does not change it', () => {
    render(<NameEditDialog {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('John Doe');
  });

  it('resets to initialName when dialog reopens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NameEditDialog {...defaultProps} />);

    // Change the name
    const input = screen.getByRole('textbox', { name: /name/i });
    await user.clear(input);
    await user.type(input, 'Changed Name');
    expect(input).toHaveValue('Changed Name');

    // Close dialog
    rerender(<NameEditDialog {...defaultProps} open={false} />);

    // Reopen dialog with new initial name
    rerender(<NameEditDialog {...defaultProps} open={true} initialName="New Name" />);

    await waitFor(() => {
      const updatedInput = screen.getByRole('textbox', { name: /name/i });
      expect(updatedInput).toHaveValue('New Name');
    });
  });

  it('text field has correct attributes', () => {
    render(<NameEditDialog {...defaultProps} />);

    const input = screen.getByRole('textbox', { name: /name/i });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toBeRequired();
  });

  it('Save button has correct styling attributes', () => {
    render(<NameEditDialog {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toHaveClass('MuiButton-contained');
  });

  it('Cancel button has correct styling attributes', () => {
    render(<NameEditDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toHaveClass('MuiButton-outlined');
  });
});
