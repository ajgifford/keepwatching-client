import { AccountNotification } from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';

import { createMockStore } from '../../testUtils';
import {
  dismissAllSystemNotifications,
  dismissSystemNotification,
  fetchSystemNotifications,
  markAllSystemNotificationsRead,
  markSystemNotificationRead,
  selectSystemNotifications,
  selectSystemNotificationsError,
  selectSystemNotificationsLoading,
  updateNotifications,
} from '../systemNotificationsSlice';

// Mock axios
jest.mock('../../api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import axiosInstance from '../../api/axiosInstance';

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('systemNotificationsSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const mockNotifications: AccountNotification[] = [
    {
      id: 1,
      accountId: 1,
      title: 'Test Notification',
      message: 'Test message',
      hasBeenRead: false,
      createdAt: '2024-01-01',
    } as AccountNotification,
  ];

  describe('fetchSystemNotifications', () => {
    it('should fetch notifications successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { notifications: mockNotifications },
      });

      const store = createMockStore();
      await store.dispatch(fetchSystemNotifications(1));

      const state = store.getState().systemNotification;
      expect(state.loading).toBe(false);
      expect(state.systemNotifications).toEqual(mockNotifications);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to fetch' };
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(fetchSystemNotifications(1));

      const state = store.getState().systemNotification;
      expect(state.loading).toBe(false);
      expect(state.systemNotifications).toEqual([]);
      expect(state.error?.message).toBeTruthy();
    });

    it('should save notifications to localStorage on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { notifications: mockNotifications },
      });

      const store = createMockStore();
      await store.dispatch(fetchSystemNotifications(1));

      const saved = localStorage.getItem('systemNotifications');
      expect(saved).toBe(JSON.stringify(mockNotifications));
    });
  });

  describe('markSystemNotificationRead', () => {
    it('should mark notification as read', async () => {
      const updatedNotifications = [{ ...mockNotifications[0], hasBeenRead: true }];
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { notifications: updatedNotifications },
      });

      const store = createMockStore();
      await store.dispatch(
        markSystemNotificationRead({
          accountId: 1,
          notificationId: 1,
          hasBeenRead: true,
        })
      );

      const state = store.getState().systemNotification;
      expect(state.systemNotifications).toEqual(updatedNotifications);
      expect(state.error).toBeNull();
    });

    it('should handle mark read error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Failed to mark read' } },
      });

      const store = createMockStore();
      await store.dispatch(
        markSystemNotificationRead({
          accountId: 1,
          notificationId: 1,
          hasBeenRead: true,
        })
      );

      const state = store.getState().systemNotification;
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('markAllSystemNotificationsRead', () => {
    it('should mark all notifications as read', async () => {
      const updatedNotifications = mockNotifications.map((n) => ({ ...n, hasBeenRead: true }));
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { notifications: updatedNotifications },
      });

      const store = createMockStore();
      await store.dispatch(
        markAllSystemNotificationsRead({
          accountId: 1,
          hasBeenRead: true,
        })
      );

      const state = store.getState().systemNotification;
      expect(state.systemNotifications).toEqual(updatedNotifications);
      expect(state.error).toBeNull();
    });

    it('should handle mark all read error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Failed' } },
      });

      const store = createMockStore();
      await store.dispatch(
        markAllSystemNotificationsRead({
          accountId: 1,
          hasBeenRead: true,
        })
      );

      const state = store.getState().systemNotification;
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('dismissSystemNotification', () => {
    it('should dismiss a notification', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { notifications: [] },
      });

      const store = createMockStore();
      await store.dispatch(
        dismissSystemNotification({
          accountId: 1,
          notificationId: 1,
        })
      );

      const state = store.getState().systemNotification;
      expect(state.systemNotifications).toEqual([]);
      expect(state.error).toBeNull();
    });

    it('should handle dismiss error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Failed' } },
      });

      const store = createMockStore();
      await store.dispatch(
        dismissSystemNotification({
          accountId: 1,
          notificationId: 1,
        })
      );

      const state = store.getState().systemNotification;
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('dismissAllSystemNotifications', () => {
    it('should dismiss all notifications', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { notifications: [] },
      });

      const store = createMockStore();
      await store.dispatch(dismissAllSystemNotifications({ accountId: 1 }));

      const state = store.getState().systemNotification;
      expect(state.systemNotifications).toEqual([]);
      expect(state.error).toBeNull();
    });

    it('should handle dismiss all error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Failed' } },
      });

      const store = createMockStore();
      await store.dispatch(dismissAllSystemNotifications({ accountId: 1 }));

      const state = store.getState().systemNotification;
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('updateNotifications', () => {
    it('should update notifications successfully', async () => {
      const store = createMockStore();
      await store.dispatch(updateNotifications(mockNotifications));

      const state = store.getState().systemNotification;
      expect(state.systemNotifications).toEqual(mockNotifications);
      expect(state.error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('should select notifications', () => {
      const store = createMockStore({
        systemNotification: {
          systemNotifications: mockNotifications,
          loading: false,
          error: null,
        },
      });

      expect(selectSystemNotifications(store.getState())).toEqual(mockNotifications);
    });

    it('should select loading state', () => {
      const store = createMockStore({
        systemNotification: {
          systemNotifications: [],
          loading: true,
          error: null,
        },
      });

      expect(selectSystemNotificationsLoading(store.getState())).toBe(true);
    });

    it('should select error state', () => {
      const mockError = { message: 'Test error' };
      const store = createMockStore({
        systemNotification: {
          systemNotifications: [],
          loading: false,
          error: mockError,
        },
      });

      expect(selectSystemNotificationsError(store.getState())).toEqual(mockError);
    });
  });
});
