import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import ManageAccount from '../manageAccount';

// Mock Firebase Auth
const mockCurrentUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: mockCurrentUser,
  })),
  initializeApp: jest.fn(),
}));

// Mock keepwatching-ui functions
jest.mock('@ajgifford/keepwatching-ui', () => ({
  ErrorComponent: ({ error }: { error: string }) => <div data-testid="error-component">{error}</div>,
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
  getAccountImageUrl: jest.fn((image: string | null, staticUrl: string) => 
    image || `${staticUrl}/default-account-image.png`
  ),
}));

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/accountSlice', () => ({
  selectCurrentAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  updateAccountImage: jest.fn(),
  removeAccountImage: jest.fn(),
  verifyEmail: jest.fn(),
}));

jest.mock('../../../app/slices/profilesSlice', () => ({
  addProfile: jest.fn(() => ({
    type: 'profiles/add',
  })),
  deleteProfile: jest.fn(() => ({
    type: 'profiles/delete',
  })),
  editProfile: jest.fn(() => ({
    type: 'profiles/edit',
  })),
  selectAllProfiles: jest.fn(),
  selectProfileById: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
  selectLastUpdated: jest.fn(),
  setActiveProfile: jest.fn(),
}));

jest.mock('../../common/account/profileCard', () => ({
  ProfileCard: ({ profile }: any) => <div data-testid="profile-card">{profile.name}</div>,
}));

jest.mock('../../common/account/nameEditDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="name-edit-dialog">NameEditDialog</div>,
}));

jest.mock('../../common/account/preferencesDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="preferences-dialog">PreferencesDialog</div>,
}));

jest.mock('../../common/statistics/accountStatisticsDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="account-statistics-dialog">AccountStatisticsDialog</div>,
}));

jest.mock('../../common/statistics/profileStatisticsDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-statistics-dialog">ProfileStatisticsDialog</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ManageAccount - Snapshots', () => {
  const mockAccount = {
    id: 100,
    email: 'test@example.com',
    name: 'Test User',
    defaultProfileId: 1,
    image: null,
  };

  const mockProfiles = [
    { id: 1, accountId: 100, name: 'Profile 1', avatarColor: '#FF0000' },
    { id: 2, accountId: 100, name: 'Profile 2', avatarColor: '#00FF00' },
  ];

  const mockActiveProfile = {
    id: 1,
    accountId: 100,
    name: 'Profile 1',
    avatarColor: '#FF0000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const { selectCurrentAccount } = require('../../../app/slices/accountSlice');
    const { selectAllProfiles, selectProfileById } = require('../../../app/slices/profilesSlice');
    const { selectActiveProfile, selectLastUpdated } = require('../../../app/slices/activeProfileSlice');

    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectCurrentAccount) return mockAccount;
      if (selector === selectAllProfiles) return mockProfiles;
      if (selector === selectActiveProfile) return mockActiveProfile;
      if (selector === selectLastUpdated) return '2024-01-01';
      if (typeof selector === 'function') {
        // Handle selectProfileById
        return mockProfiles[0];
      }
      return null;
    });
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<ManageAccount />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of account section', () => {
    const { container } = renderWithRouter(<ManageAccount />);
    const accountSection = container.querySelector('[data-testid="account-section"]') || container.firstChild;
    expect(accountSection).toMatchSnapshot();
  });
});
