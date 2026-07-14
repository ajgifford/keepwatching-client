import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import axiosInstance from '../../../app/api/axiosInstance';
import { renderWithProviders } from '../../../app/testUtils';
import ClaimProfileTransfer from '../claimProfileTransfer';
import userEvent from '@testing-library/user-event';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

jest.mock('../../../app/firebaseConfig', () => ({
  auth: {},
  getFirebaseAuthErrorMessage: jest.fn(() => 'Firebase error'),
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  updateProfile: jest.fn(),
  sendEmailVerification: jest.fn(),
  getAdditionalUserInfo: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockCreateUser = createUserWithEmailAndPassword as jest.Mock;
const mockSignInWithPopup = signInWithPopup as jest.Mock;

const mockPreview = {
  profileName: "Jamie's Profile",
  sourceAccountName: 'The Smith Family',
  targetEmail: 'jamie@example.com',
  targetName: 'Jamie',
  expiresAt: '2026-07-19T00:00:00.000Z',
};

const mockAccount = {
  id: 99,
  uid: 'firebase-uid-123',
  email: 'jamie@example.com',
  name: 'Jamie',
  image: '',
  defaultProfileId: 10,
};

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/claim/raw-token']}>
      <Routes>
        <Route path="/claim/:token" element={<ClaimProfileTransfer />} />
        <Route path="/home" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ClaimProfileTransfer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while the preview is fetched', () => {
    mockAxiosInstance.get.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText(/claim your profile/i)).toBeInTheDocument();
  });

  it('renders the invitation preview once loaded', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { preview: mockPreview } });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/The Smith Family/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Jamie's Profile/)).toBeInTheDocument();
    expect(screen.getByText(/jamie@example.com/)).toBeInTheDocument();
  });

  it('pre-fills the name field from the invitation', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { preview: mockPreview } });
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/your name/i)).toHaveValue('Jamie');
    });
  });

  it('leaves the name field blank when the invitation has no target name', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { preview: { ...mockPreview, targetName: null } } });
    renderPage();

    await waitFor(() => expect(screen.getByText(/jamie@example.com/)).toBeInTheDocument());
    expect(screen.getByLabelText(/your name/i)).toHaveValue('');
  });

  it('shows an error state when the invitation is no longer available', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce({
      response: { data: { error: { message: 'This invitation has expired' } } },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('This invitation has expired')).toBeInTheDocument();
    });
  });

  it('creates the account with a password and navigates home on success', async () => {
    const user = userEvent.setup();
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { preview: mockPreview } });
    mockCreateUser.mockResolvedValueOnce({ user: { uid: 'firebase-uid-123', delete: jest.fn() } });
    mockAxiosInstance.post.mockResolvedValueOnce({ data: { account: mockAccount, message: 'Welcome!' } });

    renderPage();

    await waitFor(() => expect(screen.getByText(/jamie@example.com/)).toBeInTheDocument());

    await user.type(screen.getByLabelText(/create a password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/profileTransferInvitations/raw-token/claim', {
        name: 'Jamie',
      });
    });
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('does not navigate when the password claim fails', async () => {
    const user = userEvent.setup();
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { preview: mockPreview } });
    mockCreateUser.mockResolvedValueOnce({ user: { uid: 'firebase-uid-123', delete: jest.fn() } });
    mockAxiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: 'Sign in with the email the invitation was sent to' } },
    });

    renderPage();

    await waitFor(() => expect(screen.getByText(/jamie@example.com/)).toBeInTheDocument());

    await user.type(screen.getByLabelText(/create a password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });
    expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
  });

  it('claims via Google and navigates home on success', async () => {
    const user = userEvent.setup();
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { preview: mockPreview } });
    mockSignInWithPopup.mockResolvedValueOnce({
      user: { uid: 'firebase-uid-123', displayName: 'Jamie', delete: jest.fn() },
    });
    mockAxiosInstance.post.mockResolvedValueOnce({ data: { account: mockAccount, message: 'Welcome!' } });

    renderPage();

    await waitFor(() => expect(screen.getByText(/jamie@example.com/)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('disables the password submit button until 8+ characters are entered', async () => {
    const user = userEvent.setup();
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { preview: mockPreview } });
    renderPage();

    await waitFor(() => expect(screen.getByText(/jamie@example.com/)).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
    await user.type(screen.getByLabelText(/create a password/i), 'short');
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
  });
});
