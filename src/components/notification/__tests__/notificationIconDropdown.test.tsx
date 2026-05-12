import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useAppSelector } from '../../../app/hooks';
import { selectCurrentAccount } from '../../../app/slices/accountSlice';
import {
  dismissAllSystemNotifications,
  dismissSystemNotification,
  markAllSystemNotificationsRead,
  markSystemNotificationRead,
  selectSystemNotifications,
} from '../../../app/slices/systemNotificationsSlice';
import NotificationIconDropdown from '../notificationIconDropdown';
import { AccountNotification } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockNotificationTimestamp = jest.fn(() => '2 hours ago');

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../app/hooks/useDateFormatters', () => ({
  useDateFormatters: () => ({
    notificationTimestamp: mockNotificationTimestamp,
  }),
}));

jest.mock('../../../app/slices/accountSlice', () => ({
  selectCurrentAccount: jest.fn(),
}));

jest.mock('../../../app/slices/systemNotificationsSlice', () => ({
  markSystemNotificationRead: jest.fn(),
  markAllSystemNotificationsRead: jest.fn(),
  dismissSystemNotification: jest.fn(),
  dismissAllSystemNotifications: jest.fn(),
  selectSystemNotifications: jest.fn(),
}));

const mockAccount = { id: 100, email: 'test@example.com', name: 'Test User' };

const mockNotifications: AccountNotification[] = [
  {
    id: 1,
    title: 'New Episode Available',
    message: 'Season 5, Episode 3 of Breaking Bad is now available',
    type: 'tv',
    read: false,
    startDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    dismissed: false,
    endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  },
  {
    id: 2,
    title: 'New Movie Added',
    message: 'Inception is now available to watch',
    type: 'movie',
    read: true,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    dismissed: false,
    endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  },
  {
    id: 3,
    title: 'System Update',
    message: 'New features have been added to the application',
    type: 'feature',
    read: false,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    dismissed: false,
    endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  },
  {
    id: 4,
    title: 'Issue Detected',
    message: 'There was a problem updating your watchlist',
    type: 'issue',
    read: true,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    dismissed: false,
    endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  },
];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <NotificationIconDropdown />
    </BrowserRouter>
  );

const setupSelectors = (notifications: AccountNotification[] = mockNotifications, account = mockAccount) => {
  jest.mocked(useAppSelector).mockImplementation((selector: any) => {
    if (selector === selectCurrentAccount) return account;
    if (selector === selectSystemNotifications) return notifications;
    return null;
  });
};

describe('NotificationIconDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelectors();
  });

  describe('basic rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderComponent();
      expect(container).toBeInTheDocument();
    });

    it('should render the notification icon button', () => {
      renderComponent();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show the unread count in the badge', () => {
      renderComponent();
      const unreadCount = mockNotifications.filter((n) => !n.read).length;
      expect(screen.getByText(String(unreadCount))).toBeInTheDocument();
    });

    it('should not display a badge when all notifications are read', () => {
      setupSelectors(mockNotifications.map((n) => ({ ...n, read: true })));
      renderComponent();
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('dropdown toggle', () => {
    it('should open the dropdown when the icon button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should close the dropdown when the icon button is clicked again', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Notifications')).toBeInTheDocument();

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      setupSelectors([]);
    });

    it('should show "No notifications yet" message', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });

    it('should show "0 total" in the chip', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('0 total')).toBeInTheDocument();
    });

    it('should not render notification action buttons when empty', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.queryByRole('button', { name: /mark all/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /dismiss all/i })).not.toBeInTheDocument();
    });
  });

  describe('with notifications', () => {
    it('should show the correct total count in the chip', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText(`${mockNotifications.length} total`)).toBeInTheDocument();
    });

    it('should display all notification titles', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('New Episode Available')).toBeInTheDocument();
      expect(screen.getByText('New Movie Added')).toBeInTheDocument();
      expect(screen.getByText('System Update')).toBeInTheDocument();
      expect(screen.getByText('Issue Detected')).toBeInTheDocument();
    });

    it('should show "Mark All Read" button when unread notifications exist', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument();
    });

    it('should show "Mark All Unread" button when all notifications are read', async () => {
      setupSelectors(mockNotifications.map((n) => ({ ...n, read: true })));
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('button', { name: /mark all unread/i })).toBeInTheDocument();
    });

    it('should show "Dismiss All" button', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('button', { name: /dismiss all/i })).toBeInTheDocument();
    });

    it('should show "View All" button', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
    });

    it('should call notificationTimestamp formatter for each notification', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      mockNotifications.forEach((n) => {
        expect(mockNotificationTimestamp).toHaveBeenCalledWith(n.startDate);
      });
    });
  });

  describe('mark read/unread actions', () => {
    it('should dispatch markSystemNotificationRead for an unread notification', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      const markReadButtons = screen.getAllByRole('button', { name: /mark as read/i });
      await user.click(markReadButtons[0]);

      expect(markSystemNotificationRead).toHaveBeenCalledWith({
        accountId: mockAccount.id,
        notificationId: mockNotifications[0].id,
        hasBeenRead: true,
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch markSystemNotificationRead with hasBeenRead=false for a read notification', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      const markUnreadButtons = screen.getAllByRole('button', { name: /mark as unread/i });
      await user.click(markUnreadButtons[0]);

      expect(markSystemNotificationRead).toHaveBeenCalledWith({
        accountId: mockAccount.id,
        notificationId: 2,
        hasBeenRead: false,
      });
    });

    it('should dispatch markAllSystemNotificationsRead(true) when Mark All Read is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: /mark all read/i }));

      expect(markAllSystemNotificationsRead).toHaveBeenCalledWith({
        accountId: mockAccount.id,
        hasBeenRead: true,
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch markAllSystemNotificationsRead(false) when Mark All Unread is clicked', async () => {
      setupSelectors(mockNotifications.map((n) => ({ ...n, read: true })));
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: /mark all unread/i }));

      expect(markAllSystemNotificationsRead).toHaveBeenCalledWith({
        accountId: mockAccount.id,
        hasBeenRead: false,
      });
    });

    it('should not dispatch when there is no current account', async () => {
      setupSelectors(mockNotifications, null as any);
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: /mark all read/i }));

      expect(markAllSystemNotificationsRead).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('dismiss actions', () => {
    it('should dispatch dismissSystemNotification with the correct notification id', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      const dismissButtons = screen.getAllByRole('button', { name: /dismiss notification/i });
      await user.click(dismissButtons[0]);

      expect(dismissSystemNotification).toHaveBeenCalledWith({
        accountId: mockAccount.id,
        notificationId: mockNotifications[0].id,
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch dismissAllSystemNotifications when Dismiss All is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: /dismiss all/i }));

      expect(dismissAllSystemNotifications).toHaveBeenCalledWith({ accountId: mockAccount.id });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should not dispatch dismiss when there is no current account', async () => {
      setupSelectors(mockNotifications, null as any);
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      const dismissButtons = screen.getAllByRole('button', { name: /dismiss notification/i });
      await user.click(dismissButtons[0]);

      expect(dismissSystemNotification).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should navigate to /notifications when View All is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: /view all/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/notifications');
    });

    it('should close the dropdown after View All is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Notifications')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /view all/i }));

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  describe('overflow display', () => {
    const buildNotifications = (count: number): AccountNotification[] =>
      Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        title: `Notification ${i + 1}`,
        message: `Message ${i + 1}`,
        type: 'tv' as const,
        read: false,
        startDate: new Date().toISOString(),
        dismissed: false,
        endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      }));

    it('should show "+N more notifications..." when there are more than 10', async () => {
      setupSelectors(buildNotifications(12));
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('+2 more notifications...')).toBeInTheDocument();
    });

    it('should only render the first 10 notifications in the list', async () => {
      setupSelectors(buildNotifications(12));
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Notification 10')).toBeInTheDocument();
      expect(screen.queryByText('Notification 11')).not.toBeInTheDocument();
      expect(screen.queryByText('Notification 12')).not.toBeInTheDocument();
    });

    it('should not show overflow text with exactly 10 notifications', async () => {
      setupSelectors(buildNotifications(10));
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.queryByText(/more notifications/i)).not.toBeInTheDocument();
    });
  });

  describe('notification type rendering', () => {
    it('should render a TV notification', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('New Episode Available')).toBeInTheDocument();
    });

    it('should render a movie notification', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('New Movie Added')).toBeInTheDocument();
    });

    it('should render a feature notification', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('System Update')).toBeInTheDocument();
    });

    it('should render an issue notification', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Issue Detected')).toBeInTheDocument();
    });
  });

  describe('message display', () => {
    it('should strip HTML tags from notification messages', async () => {
      setupSelectors([
        {
          id: 1,
          title: 'HTML Test',
          message: '<p>This is a <strong>test</strong> message</p>',
          type: 'tv',
          read: false,
          startDate: new Date().toISOString(),
          dismissed: false,
          endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        },
      ]);
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('This is a test message')).toBeInTheDocument();
    });

    it('should truncate secondary message text at 50 characters', async () => {
      const longMessage = 'A'.repeat(80);
      setupSelectors([
        {
          id: 1,
          title: 'Long Message Test',
          message: longMessage,
          type: 'tv',
          read: false,
          startDate: new Date().toISOString(),
          dismissed: false,
          endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        },
      ]);
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText(`${'A'.repeat(50)}...`)).toBeInTheDocument();
    });

    it('should show the title as primary text', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('New Episode Available')).toBeInTheDocument();
    });

    it('should truncate a long message to 60 chars as primary text when there is no title', async () => {
      const longMessage = 'B'.repeat(80);
      setupSelectors([
        {
          id: 1,
          title: '',
          message: longMessage,
          type: 'tv',
          read: false,
          startDate: new Date().toISOString(),
          dismissed: false,
          endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        },
      ]);
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(screen.getByText(`${'B'.repeat(60)}...`)).toBeInTheDocument();
    });
  });
});
