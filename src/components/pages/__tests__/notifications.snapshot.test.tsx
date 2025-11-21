import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Notifications from '../notifications';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/systemNotificationsSlice', () => ({
  fetchSystemNotifications: jest.fn(() => ({
    type: 'systemNotifications/fetch',
  })),
  markSystemNotificationRead: jest.fn(() => ({
    type: 'systemNotifications/markAsRead',
  })),
  dismissSystemNotification: jest.fn(() => ({
    type: 'systemNotifications/dismiss',
  })),
  markAllSystemNotificationsRead: jest.fn(() => ({
    type: 'systemNotifications/markAllRead',
  })),
  dismissAllSystemNotifications: jest.fn(() => ({
    type: 'systemNotifications/dismissAll',
  })),
  selectSystemNotifications: jest.fn(),
}));

jest.mock('../../../app/slices/accountSlice', () => ({
  selectCurrentAccount: jest.fn(),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  ErrorComponent: ({ error }: { error: string }) => <div data-testid="error-component">{error}</div>,
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Notifications - Snapshots', () => {
  const mockNotifications = [
    {
      id: 1,
      accountId: 100,
      title: 'New Episode Available',
      message: 'Test notification 1',
      type: 'tv' as const,
      read: false,
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-12-31T00:00:00Z'),
      active: true,
    },
    {
      id: 2,
      accountId: 100,
      title: 'System Update',
      message: 'Test notification 2',
      type: 'feature' as const,
      read: true,
      startDate: new Date('2024-01-02T00:00:00Z'),
      endDate: new Date('2024-12-31T00:00:00Z'),
      active: true,
    },
  ];

  const mockAccount = {
    id: 100,
    email: 'test@example.com',
    displayName: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const { selectSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');
    const { selectCurrentAccount } = require('../../../app/slices/accountSlice');

    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectSystemNotifications) return mockNotifications;
      if (selector === selectCurrentAccount) return mockAccount;
      return null;
    });
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<Notifications />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of notifications list', () => {
    const { container } = renderWithRouter(<Notifications />);
    const notificationsList = container.querySelector('[data-testid="notifications-list"]') || container.firstChild;
    expect(notificationsList).toMatchSnapshot();
  });
});
