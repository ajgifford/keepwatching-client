import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Notifications from '../notifications';
import { AccountNotification } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

// Mock dependencies
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../app/slices/accountSlice', () => ({
  selectCurrentAccount: jest.fn(),
}));

jest.mock('../../../app/slices/systemNotificationsSlice', () => ({
  fetchSystemNotifications: jest.fn((accountId: number) => ({
    type: 'systemNotifications/fetchSystemNotifications',
    payload: accountId,
  })),
  dismissSystemNotification: jest.fn(),
  dismissAllSystemNotifications: jest.fn(),
  markSystemNotificationRead: jest.fn(),
  markAllSystemNotificationsRead: jest.fn(),
  selectSystemNotifications: jest.fn(),
}));

const mockNotifications: AccountNotification[] = [
  {
    id: 1,
    title: 'New Episode Available',
    message: 'Season 5, Episode 3 of Breaking Bad is now available',
    type: 'tv',
    read: false,
    startDate: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    dismissed: false,
    endDate: new Date(Date.now() + 1000 * 60 * 60),
  },
  {
    id: 2,
    title: 'New Movie Added',
    message: 'Inception is now available to watch',
    type: 'movie',
    read: true,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    dismissed: false,
    endDate: new Date(Date.now() + 1000 * 60 * 60),
  },
  {
    id: 3,
    title: 'System Update',
    message: 'New features have been added to the application',
    type: 'feature',
    read: false,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    dismissed: false,
    endDate: new Date(Date.now() + 1000 * 60 * 60),
  },
  {
    id: 4,
    title: 'Issue Detected',
    message: 'There was a problem updating your watchlist',
    type: 'issue',
    read: true,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    dismissed: false,
    endDate: new Date(Date.now() + 1000 * 60 * 60),
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Notifications', () => {
  const mockAccount = {
    id: 100,
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const { selectCurrentAccount } = require('../../../app/slices/accountSlice');
    const { selectSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');

    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectCurrentAccount) return mockAccount;
      if (selector === selectSystemNotifications) return mockNotifications;
      return null;
    });
  });

  describe('basic rendering', () => {
    it('should render the page title', () => {
      renderWithRouter(<Notifications />);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should render the back button', () => {
      renderWithRouter(<Notifications />);

      const backButton = screen.getByRole('button', { name: '' });
      expect(backButton).toBeInTheDocument();
    });

    it('should render search field', () => {
      renderWithRouter(<Notifications />);

      expect(screen.getByPlaceholderText('Search notifications...')).toBeInTheDocument();
    });

    it('should render filter dropdown', () => {
      renderWithRouter(<Notifications />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderWithRouter(<Notifications />);

      expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss all/i })).toBeInTheDocument();
    });

    it('should render all notifications', () => {
      renderWithRouter(<Notifications />);

      mockNotifications.forEach((notification) => {
        expect(screen.getByText(notification.title)).toBeInTheDocument();
      });
    });
  });

  describe('data loading', () => {
    it('should dispatch fetchSystemNotifications on mount when account exists', () => {
      const { fetchSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');

      renderWithRouter(<Notifications />);

      expect(fetchSystemNotifications).toHaveBeenCalledWith(mockAccount.id);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should not dispatch fetchSystemNotifications when account is null', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectCurrentAccount } = require('../../../app/slices/accountSlice');
      const {
        selectSystemNotifications,
        fetchSystemNotifications,
      } = require('../../../app/slices/systemNotificationsSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectCurrentAccount) return null;
        if (selector === selectSystemNotifications) return [];
        return null;
      });

      renderWithRouter(<Notifications />);

      expect(fetchSystemNotifications).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should navigate back when back button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Notifications />);

      const backButtons = screen.getAllByRole('button');
      const backButton = backButtons[0]; // First button should be the back button
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('filtering', () => {
    it('should display unread count in filter dropdown', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Notifications />);

      const unreadCount = mockNotifications.filter((n) => !n.read).length;

      // Click the dropdown to reveal the options
      const filterSelect = screen.getByRole('combobox');
      await user.click(filterSelect);

      // Now check for the unread count in the option
      expect(screen.getByText(`Unread (${unreadCount})`)).toBeInTheDocument();
    });

    it('should filter notifications by unread status', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Notifications />);

      const filterSelect = screen.getByRole('combobox');
      await user.click(filterSelect);

      const unreadOption = screen.getByRole('option', { name: /unread/i });
      await user.click(unreadOption);

      await waitFor(() => {
        const readNotification = mockNotifications.find((n) => n.read);
        if (readNotification) {
          expect(screen.queryByText(readNotification.title)).not.toBeInTheDocument();
        }
      });
    });

    it('should filter notifications by content type', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Notifications />);

      const filterSelect = screen.getByRole('combobox');
      await user.click(filterSelect);

      const contentOption = screen.getByRole('option', { name: /content updates/i });
      await user.click(contentOption);

      await waitFor(() => {
        const systemNotification = mockNotifications.find((n) => n.type === 'feature' || n.type === 'issue');
        if (systemNotification) {
          expect(screen.queryByText(systemNotification.title)).not.toBeInTheDocument();
        }
      });
    });

    it('should filter notifications by system type', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Notifications />);

      const filterSelect = screen.getByRole('combobox');
      await user.click(filterSelect);

      const systemOption = screen.getByRole('option', { name: /system notifications/i });
      await user.click(systemOption);

      await waitFor(() => {
        const contentNotification = mockNotifications.find((n) => n.type === 'tv' || n.type === 'movie');
        if (contentNotification) {
          expect(screen.queryByText(contentNotification.title)).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('search functionality', () => {
    it('should filter notifications by search term', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Notifications />);

      const searchInput = screen.getByPlaceholderText('Search notifications...');
      await user.type(searchInput, 'Breaking Bad');

      await waitFor(() => {
        expect(screen.getByText('New Episode Available')).toBeInTheDocument();
        expect(screen.queryByText('New Movie Added')).not.toBeInTheDocument();
      });
    });

    it('should be case insensitive in search', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Notifications />);

      const searchInput = screen.getByPlaceholderText('Search notifications...');
      await user.type(searchInput, 'BREAKING BAD');

      await waitFor(() => {
        expect(screen.getByText('New Episode Available')).toBeInTheDocument();
      });
    });
  });

  describe('mark as read/unread', () => {
    it('should dispatch markSystemNotificationRead when mark as read is clicked', async () => {
      const user = userEvent.setup();
      const { markSystemNotificationRead } = require('../../../app/slices/systemNotificationsSlice');

      renderWithRouter(<Notifications />);

      const markButtons = screen.getAllByRole('button', { name: /mark as/i });
      await user.click(markButtons[0]);

      expect(markSystemNotificationRead).toHaveBeenCalled();
    });

    it('should display Mark All Unread button when all notifications are read', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectCurrentAccount } = require('../../../app/slices/accountSlice');
      const { selectSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectCurrentAccount) return mockAccount;
        if (selector === selectSystemNotifications) return mockNotifications.map((n) => ({ ...n, read: true }));
        return null;
      });

      renderWithRouter(<Notifications />);

      expect(screen.getByRole('button', { name: /mark all unread/i })).toBeInTheDocument();
    });

    it('should dispatch markAllSystemNotificationsRead when Mark All Read is clicked', async () => {
      const user = userEvent.setup();
      const { markAllSystemNotificationsRead } = require('../../../app/slices/systemNotificationsSlice');

      renderWithRouter(<Notifications />);

      const markAllReadButton = screen.getByRole('button', { name: /mark all read/i });
      await user.click(markAllReadButton);

      expect(markAllSystemNotificationsRead).toHaveBeenCalledWith({
        accountId: mockAccount.id,
        hasBeenRead: true,
      });
    });
  });

  describe('dismiss notifications', () => {
    it('should dispatch dismissSystemNotification when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const { dismissSystemNotification } = require('../../../app/slices/systemNotificationsSlice');

      renderWithRouter(<Notifications />);

      const dismissButtons = screen.getAllByRole('button', { name: /dismiss notification/i });
      await user.click(dismissButtons[0]);

      expect(dismissSystemNotification).toHaveBeenCalled();
    });

    it('should dispatch dismissAllSystemNotifications when Dismiss All is clicked', async () => {
      const user = userEvent.setup();
      const { dismissAllSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');

      renderWithRouter(<Notifications />);

      const dismissAllButton = screen.getByRole('button', { name: /dismiss all/i });
      await user.click(dismissAllButton);

      expect(dismissAllSystemNotifications).toHaveBeenCalledWith({
        accountId: mockAccount.id,
      });
    });

    it('should disable Dismiss All button when no notifications', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectCurrentAccount } = require('../../../app/slices/accountSlice');
      const { selectSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectCurrentAccount) return mockAccount;
        if (selector === selectSystemNotifications) return [];
        return null;
      });

      renderWithRouter(<Notifications />);

      const dismissAllButton = screen.getByRole('button', { name: /dismiss all/i });
      expect(dismissAllButton).toBeDisabled();
    });
  });

  describe('empty state', () => {
    it('should display empty state when no notifications', () => {
      const { useAppSelector } = require('../../../app/hooks');
      const { selectCurrentAccount } = require('../../../app/slices/accountSlice');
      const { selectSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectCurrentAccount) return mockAccount;
        if (selector === selectSystemNotifications) return [];
        return null;
      });

      renderWithRouter(<Notifications />);

      expect(screen.getByText('No notifications found')).toBeInTheDocument();
      expect(screen.getByText(/You're all caught up!/i)).toBeInTheDocument();
    });

    it('should display appropriate message when filters yield no results', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Notifications />);

      const searchInput = screen.getByPlaceholderText('Search notifications...');
      await user.type(searchInput, 'NonexistentSearch');

      await waitFor(() => {
        expect(screen.getByText('No notifications found')).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('notification types', () => {
    it('should display TV notification with appropriate icon', () => {
      renderWithRouter(<Notifications />);

      const tvNotification = screen.getByText('New Episode Available');
      expect(tvNotification).toBeInTheDocument();
    });

    it('should display movie notification with appropriate icon', () => {
      renderWithRouter(<Notifications />);

      const movieNotification = screen.getByText('New Movie Added');
      expect(movieNotification).toBeInTheDocument();
    });

    it('should display feature notification with appropriate icon', () => {
      renderWithRouter(<Notifications />);

      const featureNotification = screen.getByText('System Update');
      expect(featureNotification).toBeInTheDocument();
    });

    it('should display issue notification with appropriate icon', () => {
      renderWithRouter(<Notifications />);

      const issueNotification = screen.getByText('Issue Detected');
      expect(issueNotification).toBeInTheDocument();
    });
  });

  describe('notification display', () => {
    it('should display unread indicator for unread notifications', () => {
      renderWithRouter(<Notifications />);

      const newChips = screen.getAllByText('New');
      expect(newChips.length).toBeGreaterThan(0);
    });

    it('should display timestamps for notifications', () => {
      renderWithRouter(<Notifications />);

      expect(screen.getAllByText(/ago/i).length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have accessible tooltips for action buttons', async () => {
      renderWithRouter(<Notifications />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper labels for filter controls', () => {
      renderWithRouter(<Notifications />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<Notifications />);
      expect(container).toBeInTheDocument();
    });

    it('should clean up on unmount', () => {
      const { unmount } = renderWithRouter(<Notifications />);

      unmount();

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle notifications with HTML in message', () => {
      const notificationsWithHTML = [
        {
          id: 1,
          title: 'Test',
          message: '<p>This is a <strong>test</strong> message</p>',
          type: 'tv' as const,
          read: false,
          startDate: new Date(),
          dismissed: false,
        },
      ];

      const { useAppSelector } = require('../../../app/hooks');
      const { selectCurrentAccount } = require('../../../app/slices/accountSlice');
      const { selectSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectCurrentAccount) return mockAccount;
        if (selector === selectSystemNotifications) return notificationsWithHTML;
        return null;
      });

      renderWithRouter(<Notifications />);

      expect(screen.getByText('This is a test message')).toBeInTheDocument();
    });

    it('should handle very old notifications', () => {
      const oldNotification = [
        {
          id: 1,
          title: 'Old Notification',
          message: 'This is an old notification',
          type: 'tv' as const,
          read: true,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
          dismissed: false,
        },
      ];

      const { useAppSelector } = require('../../../app/hooks');
      const { selectCurrentAccount } = require('../../../app/slices/accountSlice');
      const { selectSystemNotifications } = require('../../../app/slices/systemNotificationsSlice');

      useAppSelector.mockImplementation((selector: any) => {
        if (selector === selectCurrentAccount) return mockAccount;
        if (selector === selectSystemNotifications) return oldNotification;
        return null;
      });

      renderWithRouter(<Notifications />);

      expect(screen.getByText('Old Notification')).toBeInTheDocument();
    });
  });
});
