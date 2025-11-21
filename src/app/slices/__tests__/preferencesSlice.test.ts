import { DEFAULT_PREFERENCES } from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';

import { createMockStore } from '../../testUtils';
import {
  fetchAccountPreferences,
  selectDisplayPreferences,
  selectEmailPreferences,
  selectNotificationPreferences,
  selectPreferences,
  selectPreferencesError,
  selectPreferencesLoading,
  selectPrivacyPreferences,
  updateEmailPreferences,
  updateMultiplePreferences,
  updatePreferences,
} from '../preferencesSlice';
import { deleteAccount, logout } from '../accountSlice';

// Mock axios
jest.mock('../../api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

import axiosInstance from '../../api/axiosInstance';

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('preferencesSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('fetchAccountPreferences', () => {
    it('should fetch preferences successfully', async () => {
      const mockPreferences = {
        email: { dailyDigest: true, weeklyDigest: false },
        display: { theme: 'dark' },
        notification: { push: true },
        privacy: { shareData: false },
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { preferences: mockPreferences },
      });

      const store = createMockStore();
      await store.dispatch(fetchAccountPreferences(1));

      const state = store.getState().preferences;
      expect(state.loading).toBe(false);
      expect(state.preferences).toEqual(mockPreferences);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to fetch' };
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(fetchAccountPreferences(1));

      const state = store.getState().preferences;
      expect(state.loading).toBe(false);
      // The error is handled by the rejected case reducer
      expect(state.error?.message).toBe('Failed to load preferences');
    });

    it('should save preferences to localStorage on success', async () => {
      const mockPreferences = {
        email: { dailyDigest: true },
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { preferences: mockPreferences },
      });

      const store = createMockStore();
      await store.dispatch(fetchAccountPreferences(1));

      const saved = localStorage.getItem('preferences');
      expect(saved).toBe(JSON.stringify(mockPreferences));
    });

    it('should handle unexpected errors', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

      const store = createMockStore();
      await store.dispatch(fetchAccountPreferences(1));

      const state = store.getState().preferences;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBe('Failed to load preferences');
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const mockUpdatedPreferences = {
        email: { dailyDigest: false },
      };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { preferences: mockUpdatedPreferences },
      });

      const store = createMockStore();
      await store.dispatch(
        updatePreferences({
          accountId: 1,
          preferenceType: 'email',
          updates: { dailyDigest: false },
        })
      );

      const state = store.getState().preferences;
      expect(state.preferences).toEqual(mockUpdatedPreferences);
      expect(state.error).toBeNull();
    });

    it('should handle update error', async () => {
      const mockError: ApiErrorResponse = { message: 'Update failed' };
      mockAxiosInstance.put.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(
        updatePreferences({
          accountId: 1,
          preferenceType: 'email',
          updates: { dailyDigest: false },
        })
      );

      const state = store.getState().preferences;
      expect(state.error?.message).toBe('Failed to update preferences');
    });

    it('should save preferences to localStorage on success', async () => {
      const mockUpdatedPreferences = {
        email: { dailyDigest: false },
      };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { preferences: mockUpdatedPreferences },
      });

      const store = createMockStore();
      await store.dispatch(
        updatePreferences({
          accountId: 1,
          preferenceType: 'email',
          updates: { dailyDigest: false },
        })
      );

      const saved = localStorage.getItem('preferences');
      expect(saved).toBe(JSON.stringify(mockUpdatedPreferences));
    });

    it('should handle unexpected errors', async () => {
      mockAxiosInstance.put.mockRejectedValueOnce(new Error('Network error'));

      const store = createMockStore();
      await store.dispatch(
        updatePreferences({
          accountId: 1,
          preferenceType: 'email',
          updates: { dailyDigest: false },
        })
      );

      const state = store.getState().preferences;
      expect(state.error?.message).toBe('Failed to update preferences');
    });
  });

  describe('updateMultiplePreferences', () => {
    it('should update multiple preferences successfully', async () => {
      const mockUpdatedPreferences = {
        email: { dailyDigest: false },
        display: { theme: 'light' },
        notification: { push: false },
      };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { preferences: mockUpdatedPreferences },
      });

      const store = createMockStore();
      await store.dispatch(
        updateMultiplePreferences({
          accountId: 1,
          preferences: {
            email: { dailyDigest: false },
            display: { theme: 'light' },
          },
        })
      );

      const state = store.getState().preferences;
      expect(state.preferences).toEqual(mockUpdatedPreferences);
      expect(state.error).toBeNull();
    });

    it('should handle update error', async () => {
      const mockError: ApiErrorResponse = { message: 'Update failed' };
      mockAxiosInstance.put.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(
        updateMultiplePreferences({
          accountId: 1,
          preferences: { email: { dailyDigest: false } },
        })
      );

      const state = store.getState().preferences;
      expect(state.error?.message).toBe('Failed to update preferences');
    });

    it('should save preferences to localStorage on success', async () => {
      const mockUpdatedPreferences = {
        email: { dailyDigest: false },
        display: { theme: 'light' },
      };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { preferences: mockUpdatedPreferences },
      });

      const store = createMockStore();
      await store.dispatch(
        updateMultiplePreferences({
          accountId: 1,
          preferences: mockUpdatedPreferences,
        })
      );

      const saved = localStorage.getItem('preferences');
      expect(saved).toBe(JSON.stringify(mockUpdatedPreferences));
    });

    it('should handle unexpected errors', async () => {
      mockAxiosInstance.put.mockRejectedValueOnce(new Error('Network error'));

      const store = createMockStore();
      await store.dispatch(
        updateMultiplePreferences({
          accountId: 1,
          preferences: { email: { dailyDigest: false } },
        })
      );

      const state = store.getState().preferences;
      expect(state.error?.message).toBe('Failed to update preferences');
    });
  });

  describe('updateEmailPreferences', () => {
    it('should update email preferences successfully', async () => {
      const mockUpdatedPreferences = {
        email: { dailyDigest: false, weeklyDigest: true },
      };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { preferences: mockUpdatedPreferences },
      });

      const store = createMockStore();
      await store.dispatch(
        updateEmailPreferences({
          accountId: 1,
          emailPreferences: { dailyDigest: false, weeklyDigest: true },
        })
      );

      const state = store.getState().preferences;
      expect(state.preferences).toEqual(mockUpdatedPreferences);
      expect(state.error).toBeNull();
    });

    it('should handle update error', async () => {
      const mockError: ApiErrorResponse = { message: 'Email update failed' };
      mockAxiosInstance.put.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(
        updateEmailPreferences({
          accountId: 1,
          emailPreferences: { dailyDigest: false },
        })
      );

      const state = store.getState().preferences;
      expect(state.error?.message).toBe('Failed to update email preferences');
    });
  });

  describe('logout and deleteAccount', () => {
    it('should clear preferences from localStorage on logout', async () => {
      // Set some preferences in localStorage first
      const mockPreferences = { email: { dailyDigest: true } };
      localStorage.setItem('preferences', JSON.stringify(mockPreferences));

      const store = createMockStore({
        preferences: {
          preferences: mockPreferences,
          loading: false,
          error: null,
        },
      });

      // Dispatch logout action (this is mocked but the reducer will handle it)
      store.dispatch({ type: logout.fulfilled.type });

      const saved = localStorage.getItem('preferences');
      expect(saved).toBeNull();

      const state = store.getState().preferences;
      expect(state.preferences).toEqual({});
    });

    it('should clear preferences from localStorage on deleteAccount', async () => {
      // Set some preferences in localStorage first
      const mockPreferences = { email: { dailyDigest: true } };
      localStorage.setItem('preferences', JSON.stringify(mockPreferences));

      const store = createMockStore({
        preferences: {
          preferences: mockPreferences,
          loading: false,
          error: null,
        },
      });

      // Dispatch deleteAccount action (this is mocked but the reducer will handle it)
      store.dispatch({ type: deleteAccount.fulfilled.type });

      const saved = localStorage.getItem('preferences');
      expect(saved).toBeNull();

      const state = store.getState().preferences;
      expect(state.preferences).toEqual({});
    });
  });

  describe('selectors', () => {
    it('should select preferences', () => {
      const mockPreferences = { email: { dailyDigest: true } };
      const store = createMockStore({
        preferences: {
          preferences: mockPreferences,
          loading: false,
          error: null,
        },
      });

      expect(selectPreferences(store.getState())).toEqual(mockPreferences);
    });

    it('should select email preferences with defaults', () => {
      const store = createMockStore({
        preferences: {
          preferences: {},
          loading: false,
          error: null,
        },
      });

      expect(selectEmailPreferences(store.getState())).toEqual(DEFAULT_PREFERENCES.email);
    });

    it('should select display preferences with defaults', () => {
      const store = createMockStore({
        preferences: {
          preferences: {},
          loading: false,
          error: null,
        },
      });

      expect(selectDisplayPreferences(store.getState())).toEqual(DEFAULT_PREFERENCES.display);
    });

    it('should select notification preferences with defaults', () => {
      const store = createMockStore({
        preferences: {
          preferences: {},
          loading: false,
          error: null,
        },
      });

      expect(selectNotificationPreferences(store.getState())).toEqual(DEFAULT_PREFERENCES.notification);
    });

    it('should select privacy preferences with defaults', () => {
      const store = createMockStore({
        preferences: {
          preferences: {},
          loading: false,
          error: null,
        },
      });

      expect(selectPrivacyPreferences(store.getState())).toEqual(DEFAULT_PREFERENCES.privacy);
    });

    it('should select loading state', () => {
      const store = createMockStore({
        preferences: {
          preferences: {},
          loading: true,
          error: null,
        },
      });

      expect(selectPreferencesLoading(store.getState())).toBe(true);
    });

    it('should select error state', () => {
      const mockError = { message: 'Test error' };
      const store = createMockStore({
        preferences: {
          preferences: {},
          loading: false,
          error: mockError,
        },
      });

      expect(selectPreferencesError(store.getState())).toEqual(mockError);
    });
  });
});
