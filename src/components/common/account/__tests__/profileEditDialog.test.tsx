import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ProfileEditDialog, { ACCENT_SWATCHES } from '../profileEditDialog';
import userEvent from '@testing-library/user-event';

const mockProfile = {
  id: 1,
  accountId: 10,
  name: 'Test Profile',
  image: undefined,
  accentColor: null,
};

describe('ProfileEditDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    open: true,
    profile: mockProfile,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(<ProfileEditDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(<ProfileEditDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays initial name in text field', () => {
    render(<ProfileEditDialog {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: /name/i });
    expect(input).toHaveValue('Test Profile');
  });

  it('renders all accent swatches plus the clear option', () => {
    render(<ProfileEditDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /no accent/i })).toBeInTheDocument();
    ACCENT_SWATCHES.forEach(({ label }) => {
      expect(screen.getByRole('button', { name: new RegExp(`${label} accent`, 'i') })).toBeInTheDocument();
    });
  });

  it('calls onSave with name and null accent when Save is clicked with no accent', () => {
    render(<ProfileEditDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(mockOnSave).toHaveBeenCalledWith('Test Profile', null);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with selected accent color', () => {
    render(<ProfileEditDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /purple accent/i }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(mockOnSave).toHaveBeenCalledWith('Test Profile', '#7b1fa2');
  });

  it('preselects the profile existing accent color', () => {
    render(<ProfileEditDialog {...defaultProps} profile={{ ...mockProfile, accentColor: '#388e3c' }} />);
    const greenSwatch = screen.getByRole('button', { name: /green accent/i });
    expect(greenSwatch).toBeInTheDocument();
  });

  it('clears accent when the none button is clicked', () => {
    render(<ProfileEditDialog {...defaultProps} profile={{ ...mockProfile, accentColor: '#388e3c' }} />);
    fireEvent.click(screen.getByRole('button', { name: /no accent/i }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(mockOnSave).toHaveBeenCalledWith('Test Profile', null);
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ProfileEditDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('updates name when user types', async () => {
    const user = userEvent.setup();
    render(<ProfileEditDialog {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: /name/i });
    await user.clear(input);
    await user.type(input, 'New Name');
    expect(input).toHaveValue('New Name');
  });

  it('disables Save when name is empty', async () => {
    const user = userEvent.setup();
    render(<ProfileEditDialog {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: /name/i });
    await user.clear(input);
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('resets state when dialog reopens', async () => {
    const { rerender } = render(<ProfileEditDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /purple accent/i }));

    rerender(<ProfileEditDialog {...defaultProps} open={false} />);
    rerender(<ProfileEditDialog {...defaultProps} open={true} profile={{ ...mockProfile, name: 'Reopened' }} />);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Reopened');
    });
  });
});
