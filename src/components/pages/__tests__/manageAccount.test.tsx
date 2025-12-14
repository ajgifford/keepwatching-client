import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import ManageAccount from '../manageAccount';
import userEvent from '@testing-library/user-event';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      emailVerified: false,
      email: 'test@example.com',
    },
  })),
}));

jest.mock('../../../app/slices/accountSlice', () => ({
  selectCurrentAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  updateAccountImage: jest.fn(),
  removeAccountImage: jest.fn(),
  verifyEmail: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
  selectLastUpdated: jest.fn(),
  setActiveProfile: jest.fn(),
}));

jest.mock('../../../app/slices/profilesSlice', () => ({
  selectAllProfiles: jest.fn(),
  selectProfileById: jest.fn(),
  addProfile: jest.fn(),
  deleteProfile: jest.fn(),
  editProfile: jest.fn(),
}));

jest.mock('../../common/account/nameEditDialog', () => ({
  __esModule: true,
  default: ({ open, onSave, onClose }: any) =>
    open ? (
      <div data-testid="name-edit-dialog">
        <button onClick={() => onSave('New Name')}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('../../common/account/preferencesDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="preferences-dialog">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('../../common/account/profileCard', () => ({
  ProfileCard: ({ profile, handleEdit, handleDelete, handleSetDefault, handleSetActive, handleViewStats }: any) => (
    <div data-testid={`profile-card-${profile.id}`}>
      <span>{profile.name}</span>
      <button onClick={() => handleEdit(profile)}>Edit</button>
      <button onClick={() => handleDelete(profile)}>Delete</button>
      <button onClick={() => handleSetDefault(profile)}>Set Default</button>
      <button onClick={() => handleSetActive(profile)}>Set Active</button>
      <button onClick={() => handleViewStats(profile)}>View Stats</button>
    </div>
  ),
}));

jest.mock('../../common/statistics/accountStatisticsDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="account-statistics-dialog">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('../../common/statistics/profileStatisticsDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="profile-statistics-dialog">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  ErrorComponent: ({ error }: { error: string }) => <div data-testid="error-component">{error}</div>,
  getAccountImageUrl: (image: string) => image || 'default-image.jpg',
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ManageAccount', () => {
  const mockAccount = {
    id: 100,
    email: 'test@example.com',
    name: 'Test Account',
    defaultProfileId: 1,
    image: 'account-image.jpg',
  };

  const mockProfiles = [
    { id: 1, accountId: 100, name: 'Profile 1', avatarColor: '#FF0000' },
    { id: 2, accountId: 100, name: 'Profile 2', avatarColor: '#00FF00' },
    { id: 3, accountId: 100, name: 'Profile 3', avatarColor: '#0000FF' },
  ];

  const mockActiveProfile = mockProfiles[0];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the selector functions directly
    const accountSlice = require('../../../app/slices/accountSlice');
    const activeProfileSlice = require('../../../app/slices/activeProfileSlice');
    const profilesSlice = require('../../../app/slices/profilesSlice');

    accountSlice.selectCurrentAccount.mockReturnValue(mockAccount);
    activeProfileSlice.selectActiveProfile.mockReturnValue(mockActiveProfile);
    activeProfileSlice.selectLastUpdated.mockReturnValue('2025-01-01 12:00:00');
    profilesSlice.selectAllProfiles.mockReturnValue(mockProfiles);
    profilesSlice.selectProfileById.mockReturnValue(mockProfiles[0]);

    // Mock useAppSelector to call the selector with a mock state
    const { useAppSelector } = require('../../../app/hooks');
    useAppSelector.mockImplementation((selector: any) => {
      return selector({});
    });
  });

  describe('basic rendering', () => {
    it('should render account information', () => {
      renderWithRouter(<ManageAccount />);

      expect(screen.getByText(mockAccount.name)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });

    it('should render account image', () => {
      renderWithRouter(<ManageAccount />);

      const image = screen.getByAltText(mockAccount.name);
      expect(image).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      renderWithRouter(<ManageAccount />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render profiles section', () => {
      renderWithRouter(<ManageAccount />);

      expect(screen.getByText('Profiles')).toBeInTheDocument();
    });

    it('should render all profile cards', () => {
      renderWithRouter(<ManageAccount />);

      mockProfiles.forEach((profile) => {
        expect(screen.getByTestId(`profile-card-${profile.id}`)).toBeInTheDocument();
      });
    });

    it('should render Add Profile chip', () => {
      renderWithRouter(<ManageAccount />);

      expect(screen.getByText('Add')).toBeInTheDocument();
    });
  });

  describe('error states', () => {
    it('should render error when account is null', () => {
      const accountSlice = require('../../../app/slices/accountSlice');
      accountSlice.selectCurrentAccount.mockReturnValue(null);

      renderWithRouter(<ManageAccount />);

      expect(screen.getByTestId('error-component')).toBeInTheDocument();
    });

    it('should render error when active profile is null', () => {
      const activeProfileSlice = require('../../../app/slices/activeProfileSlice');
      activeProfileSlice.selectActiveProfile.mockReturnValue(null);

      renderWithRouter(<ManageAccount />);

      expect(screen.getByTestId('error-component')).toBeInTheDocument();
    });
  });

  describe('email verification', () => {
    it('should show Verify Email button when email is not verified', () => {
      renderWithRouter(<ManageAccount />);

      expect(screen.getByText('(Verify Email)')).toBeInTheDocument();
    });

    it('should show Email Verified when email is verified', () => {
      jest.requireMock('firebase/auth').getAuth.mockReturnValue({
        currentUser: {
          emailVerified: true,
          email: 'test@example.com',
        },
      });

      renderWithRouter(<ManageAccount />);

      expect(screen.getByText('(Email Verified)')).toBeInTheDocument();
    });
  });

  describe('account name editing', () => {
    it('should open name edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const editAccountButton = screen.getByLabelText('Edit Account Name');
      await user.click(editAccountButton);

      await waitFor(() => {
        expect(screen.getByTestId('name-edit-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('profile management', () => {
    it('should open add profile dialog when Add chip is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const addChip = screen.getByText('Add');
      await user.click(addChip);

      await waitFor(() => {
        expect(screen.getByTestId('name-edit-dialog')).toBeInTheDocument();
      });
    });

    it('should open edit profile dialog when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const editButton = screen.getAllByText('Edit')[0];
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('name-edit-dialog')).toBeInTheDocument();
      });
    });

    it('should open delete profile dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Profile Deletion/i)).toBeInTheDocument();
      });
    });
  });

  describe('delete profile dialog', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Profile Deletion/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Confirm Profile Deletion/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('preferences', () => {
    it('should open preferences dialog when preferences button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const preferencesButton = screen.getByLabelText('Preferences');
      await user.click(preferencesButton);

      await waitFor(() => {
        expect(screen.getByTestId('preferences-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('statistics', () => {
    it('should open account statistics dialog when stats button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const statsButton = screen.getByLabelText('View Account Stats');
      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.getByTestId('account-statistics-dialog')).toBeInTheDocument();
      });
    });

    it('should open profile statistics dialog when profile stats button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const viewStatsButton = screen.getAllByText('View Stats')[0];
      await user.click(viewStatsButton);

      await waitFor(() => {
        expect(screen.getByTestId('profile-statistics-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('delete account', () => {
    it('should open delete account dialog when delete account button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const deleteAccountButton = screen.getByLabelText('Delete Account');
      await user.click(deleteAccountButton);

      await waitFor(() => {
        expect(screen.getByText(/Delete Account - Test Account/i)).toBeInTheDocument();
      });
    });

    it('should require account name confirmation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const deleteAccountButton = screen.getByLabelText('Delete Account');
      await user.click(deleteAccountButton);

      await waitFor(() => {
        expect(screen.getByText(/Delete Account - Test Account/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button when correct account name is entered', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const deleteAccountButton = screen.getByLabelText('Delete Account');
      await user.click(deleteAccountButton);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');
      await user.type(input, mockAccount.name);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete account/i });
        expect(deleteButton).not.toBeDisabled();
      });
    });
  });

  describe('account image management', () => {
    it('should show hover overlay on account image', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const image = screen.getByAltText(mockAccount.name);
      await user.hover(image.parentElement!);

      await waitFor(() => {
        expect(screen.getByText('Manage Image')).toBeInTheDocument();
      });
    });
  });

  describe('profile actions', () => {
    it('should dispatch setActiveProfile when Set Active is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const setActiveButtons = screen.getAllByText('Set Active');
      await user.click(setActiveButtons[1]); // Click on second profile

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should dispatch updateAccount when Set Default is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ManageAccount />);

      const setDefaultButtons = screen.getAllByText('Set Default');
      await user.click(setDefaultButtons[1]);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<ManageAccount />);
      expect(container).toBeInTheDocument();
    });

    it('should clean up on unmount', () => {
      const { unmount } = renderWithRouter(<ManageAccount />);

      unmount();

      expect(screen.queryByText(mockAccount.name)).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty profiles list', () => {
      const profilesSlice = require('../../../app/slices/profilesSlice');
      profilesSlice.selectAllProfiles.mockReturnValue([]);

      renderWithRouter(<ManageAccount />);

      expect(screen.getByText('Profiles')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-card-1')).not.toBeInTheDocument();
    });

    it('should handle account without custom image', () => {
      const accountSlice = require('../../../app/slices/accountSlice');
      accountSlice.selectCurrentAccount.mockReturnValue({ ...mockAccount, image: 'https://placehold.co/400' });

      renderWithRouter(<ManageAccount />);

      const image = screen.getByAltText(mockAccount.name);
      expect(image).toBeInTheDocument();
    });

    it('should display last updated timestamp when available', () => {
      renderWithRouter(<ManageAccount />);

      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
      expect(screen.getByText(/2025-01-01 12:00:00/i)).toBeInTheDocument();
    });

    it('should not display last updated when not available', () => {
      const activeProfileSlice = require('../../../app/slices/activeProfileSlice');
      activeProfileSlice.selectLastUpdated.mockReturnValue(null);

      renderWithRouter(<ManageAccount />);

      expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();
    });
  });
});
