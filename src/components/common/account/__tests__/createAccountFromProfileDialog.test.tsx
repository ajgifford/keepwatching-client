import { fireEvent, render, screen } from '@testing-library/react';

import CreateAccountFromProfileDialog from '../createAccountFromProfileDialog';
import userEvent from '@testing-library/user-event';

const mockProfile = {
  id: 1,
  accountId: 10,
  name: "Jamie's Profile",
  image: undefined,
};

const otherProfiles = [
  { id: 2, accountId: 10, name: 'Parent Profile', image: undefined },
  { id: 3, accountId: 10, name: 'Sibling Profile', image: undefined },
];

describe('CreateAccountFromProfileDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    open: true,
    profile: mockProfile,
    isCurrentDefault: false,
    otherProfiles,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(<CreateAccountFromProfileDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Create Independent Account/)).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(<CreateAccountFromProfileDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not show a default-profile picker when the profile is not the account default', () => {
    render(<CreateAccountFromProfileDialog {...defaultProps} />);
    expect(screen.queryByLabelText(/choose a new default/i)).not.toBeInTheDocument();
  });

  it('shows a required default-profile picker when the profile is the account default', () => {
    render(<CreateAccountFromProfileDialog {...defaultProps} isCurrentDefault />);
    expect(screen.getByLabelText(/choose a new default/i)).toBeInTheDocument();
  });

  it('disables Send Invitation until a valid email is entered', () => {
    render(<CreateAccountFromProfileDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeDisabled();
  });

  it('calls onSubmit with the entered email when not the default profile', async () => {
    const user = userEvent.setup();
    render(<CreateAccountFromProfileDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/new owner's email/i), 'jamie@example.com');
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith('jamie@example.com', undefined, undefined);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('includes the optional name when provided', async () => {
    const user = userEvent.setup();
    render(<CreateAccountFromProfileDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/new owner's email/i), 'jamie@example.com');
    await user.type(screen.getByLabelText(/new owner's name/i), 'Jamie');
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith('jamie@example.com', 'Jamie', undefined);
  });

  it('requires a replacement default profile before submitting when transferring the default profile', async () => {
    const user = userEvent.setup();
    render(<CreateAccountFromProfileDialog {...defaultProps} isCurrentDefault />);

    await user.type(screen.getByLabelText(/new owner's email/i), 'jamie@example.com');
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeDisabled();

    await user.click(screen.getByLabelText(/choose a new default/i));
    await user.click(await screen.findByRole('option', { name: 'Parent Profile' }));

    expect(screen.getByRole('button', { name: /send invitation/i })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith('jamie@example.com', undefined, 2);
  });

  it('calls onClose without submitting when Cancel is clicked', () => {
    render(<CreateAccountFromProfileDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('resets fields when the dialog reopens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CreateAccountFromProfileDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/new owner's email/i), 'jamie@example.com');
    rerender(<CreateAccountFromProfileDialog {...defaultProps} open={false} />);
    rerender(<CreateAccountFromProfileDialog {...defaultProps} open={true} />);

    expect(screen.getByLabelText(/new owner's email/i)).toHaveValue('');
  });
});
