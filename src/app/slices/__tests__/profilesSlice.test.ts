import { Profile } from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';

import { createMockStore } from '../../testUtils';
import {
  addProfile,
  deleteProfile,
  editProfile,
  fetchProfiles,
  removeProfileImage,
  selectAllProfiles,
  selectProfileById,
  selectProfilesError,
  selectProfilesLoading,
  updateProfileImage,
} from '../profilesSlice';

// Mock axios
jest.mock('../../api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import axiosInstance from '../../api/axiosInstance';

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('profilesSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const mockProfile: Profile = {
    id: 1,
    accountId: 1,
    name: 'Test Profile',
    avatar: 'avatar.png',
  };

  describe('fetchProfiles', () => {
    it('should fetch profiles successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { profiles: [mockProfile] },
      });

      const store = createMockStore();
      await store.dispatch(fetchProfiles(1));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(selectAllProfiles(store.getState())).toEqual([mockProfile]);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to fetch' };
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(fetchProfiles(1));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });

    it('should save profiles to localStorage on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { profiles: [mockProfile] },
      });

      const store = createMockStore();
      await store.dispatch(fetchProfiles(1));

      const saved = localStorage.getItem('profiles');
      expect(saved).toBe(JSON.stringify([mockProfile]));
    });

  });

  describe('addProfile', () => {
    it('should add profile successfully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { profile: mockProfile },
      });

      const store = createMockStore();
      await store.dispatch(addProfile({ accountId: 1, newProfileName: 'Test Profile' }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(selectAllProfiles(store.getState())).toContainEqual(mockProfile);
      expect(state.error).toBeNull();
    });

    it('should handle add error', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to add' };
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(addProfile({ accountId: 1, newProfileName: 'Test' }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('deleteProfile', () => {
    it('should delete profile successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({});

      // Initialize store with a profile
      const store = createMockStore({
        profiles: {
          ids: [1],
          entities: { 1: mockProfile },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(deleteProfile({ accountId: 1, profileId: 1 }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(selectAllProfiles(store.getState())).toHaveLength(0);
      expect(state.error).toBeNull();
    });

    it('should handle delete error', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to delete' };
      mockAxiosInstance.delete.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(deleteProfile({ accountId: 1, profileId: 1 }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('editProfile', () => {
    it('should edit profile successfully', async () => {
      const updatedProfile = { ...mockProfile, name: 'Updated Name' };
      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { profile: updatedProfile },
      });

      const store = createMockStore({
        profiles: {
          ids: [1],
          entities: { 1: mockProfile },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(editProfile({ accountId: 1, profileId: 1, name: 'Updated Name' }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(selectProfileById(store.getState(), 1)?.name).toBe('Updated Name');
      expect(state.error).toBeNull();
    });

    it('should handle edit error', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to edit' };
      mockAxiosInstance.put.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(editProfile({ accountId: 1, profileId: 1, name: 'New Name' }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('updateProfileImage', () => {
    it('should update profile image successfully', async () => {
      const updatedProfile = { ...mockProfile, avatar: 'new-avatar.png' };
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { profile: updatedProfile },
      });

      const store = createMockStore({
        profiles: {
          ids: [1],
          entities: { 1: mockProfile },
          loading: false,
          error: null,
        },
      });

      const mockFile = new File([''], 'avatar.png', { type: 'image/png' });
      await store.dispatch(updateProfileImage({ accountId: 1, profileId: 1, file: mockFile }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle update image error', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to update image' };
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      const mockFile = new File([''], 'avatar.png', { type: 'image/png' });
      await store.dispatch(updateProfileImage({ accountId: 1, profileId: 1, file: mockFile }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('removeProfileImage', () => {
    it('should remove profile image successfully', async () => {
      const updatedProfile = { ...mockProfile, avatar: null };
      mockAxiosInstance.delete.mockResolvedValueOnce({
        data: { profile: updatedProfile },
      });

      const store = createMockStore({
        profiles: {
          ids: [1],
          entities: { 1: mockProfile },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(removeProfileImage({ accountId: 1, profileId: 1 }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle remove image error', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to remove image' };
      mockAxiosInstance.delete.mockRejectedValueOnce({
        response: { data: mockError },
      });

      const store = createMockStore();
      await store.dispatch(removeProfileImage({ accountId: 1, profileId: 1 }));

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('selectors', () => {
    it('should select all profiles', () => {
      const store = createMockStore({
        profiles: {
          ids: [1, 2],
          entities: {
            1: mockProfile,
            2: { ...mockProfile, id: 2, name: 'Profile 2' },
          },
          loading: false,
          error: null,
        },
      });

      expect(selectAllProfiles(store.getState())).toHaveLength(2);
    });

    it('should select profile by id', () => {
      const store = createMockStore({
        profiles: {
          ids: [1],
          entities: { 1: mockProfile },
          loading: false,
          error: null,
        },
      });

      expect(selectProfileById(store.getState(), 1)).toEqual(mockProfile);
    });

    it('should select loading state', () => {
      const store = createMockStore({
        profiles: {
          ids: [],
          entities: {},
          loading: true,
          error: null,
        },
      });

      expect(selectProfilesLoading(store.getState())).toBe(true);
    });

    it('should select error state', () => {
      const mockError = { message: 'Test error' };
      const store = createMockStore({
        profiles: {
          ids: [],
          entities: {},
          loading: false,
          error: mockError,
        },
      });

      expect(selectProfilesError(store.getState())).toEqual(mockError);
    });
  });
});
