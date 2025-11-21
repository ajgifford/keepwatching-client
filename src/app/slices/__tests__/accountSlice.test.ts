import { Account } from '@ajgifford/keepwatching-types';

// Mock Firebase
jest.mock('../../firebaseConfig', () => ({
  auth: {},
  getFirebaseAuthErrorMessage: jest.fn(() => 'Firebase error'),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  sendEmailVerification: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

import axiosInstance from '../../api/axiosInstance';
import { createMockStore } from '../../testUtils';
import {
  deleteAccount,
  googleLogin,
  login,
  logout,
  register,
  removeAccountImage,
  selectAccountError,
  selectAccountLoading,
  selectCurrentAccount,
  updateAccount,
  updateAccountImage,
  verifyEmail,
} from '../accountSlice';

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockSignIn = signInWithEmailAndPassword as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockCreateUser = createUserWithEmailAndPassword as jest.Mock;
const mockUpdateProfile = updateProfile as jest.Mock;
const mockSendEmailVerification = sendEmailVerification as jest.Mock;
const mockSignInWithPopup = signInWithPopup as jest.Mock;
const mockGoogleAuthProvider = GoogleAuthProvider as jest.Mock;

describe('accountSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  const mockAccount: Account = {
    id: 1,
    uid: 'firebase-uid-123',
    email: 'test@test.com',
    name: 'Test User',
    image: null,
    defaultProfileId: 1,
  };

  describe('login', () => {
    it('should login successfully', async () => {
      mockSignIn.mockResolvedValueOnce({
        user: { uid: 'firebase-uid-123' },
      });

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          result: mockAccount,
          message: 'Login successful',
        },
      });

      const store = createMockStore();
      await store.dispatch(login({ email: 'test@test.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(selectCurrentAccount(store.getState())).toEqual(mockAccount);
      expect(state.error).toBeNull();
    });

    it('should save account to localStorage on login', async () => {
      mockSignIn.mockResolvedValueOnce({
        user: { uid: 'firebase-uid-123' },
      });

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          result: mockAccount,
          message: 'Login successful',
        },
      });

      const store = createMockStore();
      await store.dispatch(login({ email: 'test@test.com', password: 'password123' }));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('account', JSON.stringify(mockAccount));
    });

    it('should handle Firebase login error', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

      const store = createMockStore();
      await store.dispatch(login({ email: 'test@test.com', password: 'wrong' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });

    it('should handle backend error after Firebase success', async () => {
      mockSignIn.mockResolvedValueOnce({
        user: { uid: 'firebase-uid-123' },
      });

      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Account not found' } },
      });

      const store = createMockStore();
      await store.dispatch(login({ email: 'test@test.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      mockCreateUser.mockResolvedValueOnce({
        user: { uid: 'firebase-uid-123' },
      });
      mockUpdateProfile.mockResolvedValueOnce(undefined);
      mockSendEmailVerification.mockResolvedValueOnce(undefined);

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          result: mockAccount,
          message: 'Registration successful',
        },
      });

      const store = createMockStore();
      await store.dispatch(
        register({ email: 'test@test.com', password: 'password123', name: 'Test User' })
      );

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(selectCurrentAccount(store.getState())).toEqual(mockAccount);
      expect(state.error).toBeNull();
    });

    it('should save account to localStorage on register', async () => {
      mockCreateUser.mockResolvedValueOnce({
        user: { uid: 'firebase-uid-123' },
      });
      mockUpdateProfile.mockResolvedValueOnce(undefined);
      mockSendEmailVerification.mockResolvedValueOnce(undefined);

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          result: mockAccount,
          message: 'Registration successful',
        },
      });

      const store = createMockStore();
      await store.dispatch(
        register({ email: 'test@test.com', password: 'password123', name: 'Test User' })
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith('account', JSON.stringify(mockAccount));
    });

    it('should handle Firebase registration error', async () => {
      mockCreateUser.mockRejectedValueOnce(new Error('Email already in use'));

      const store = createMockStore();
      await store.dispatch(
        register({ email: 'test@test.com', password: 'password123', name: 'Test User' })
      );

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });

    it('should handle backend error after Firebase registration success', async () => {
      mockCreateUser.mockResolvedValueOnce({
        user: { uid: 'firebase-uid-123' },
      });
      mockUpdateProfile.mockResolvedValueOnce(undefined);
      mockSendEmailVerification.mockResolvedValueOnce(undefined);

      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Account creation failed' } },
      });

      const store = createMockStore();
      await store.dispatch(
        register({ email: 'test@test.com', password: 'password123', name: 'Test User' })
      );

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });

    it('should handle unexpected errors during registration', async () => {
      mockCreateUser.mockResolvedValueOnce({
        user: { uid: 'firebase-uid-123' },
      });
      mockUpdateProfile.mockResolvedValueOnce(undefined);
      mockSendEmailVerification.mockResolvedValueOnce(undefined);

      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network error'));

      const store = createMockStore();
      await store.dispatch(
        register({ email: 'test@test.com', password: 'password123', name: 'Test User' })
      );

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBe('Register: Unexpected Error');
    });
  });

  describe('googleLogin', () => {
    it('should login with Google successfully', async () => {
      mockSignInWithPopup.mockResolvedValueOnce({
        user: {
          uid: 'firebase-uid-123',
          email: 'test@test.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
        },
      });

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          result: mockAccount,
          message: 'Google login successful',
        },
      });

      const store = createMockStore();
      await store.dispatch(googleLogin());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(selectCurrentAccount(store.getState())).toEqual(mockAccount);
      expect(state.error).toBeNull();
    });

    it('should save account to localStorage on Google login', async () => {
      mockSignInWithPopup.mockResolvedValueOnce({
        user: {
          uid: 'firebase-uid-123',
          email: 'test@test.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
        },
      });

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          result: mockAccount,
          message: 'Google login successful',
        },
      });

      const store = createMockStore();
      await store.dispatch(googleLogin());

      expect(localStorageMock.setItem).toHaveBeenCalledWith('account', JSON.stringify(mockAccount));
    });

    it('should handle Firebase Google login error', async () => {
      mockSignInWithPopup.mockRejectedValueOnce(new Error('Popup closed by user'));

      const store = createMockStore();
      await store.dispatch(googleLogin());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });

    it('should handle backend error after Google sign-in success', async () => {
      mockSignInWithPopup.mockResolvedValueOnce({
        user: {
          uid: 'firebase-uid-123',
          email: 'test@test.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
        },
      });

      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Account creation failed' } },
      });

      const store = createMockStore();
      await store.dispatch(googleLogin());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });

    it('should handle unexpected errors during Google login', async () => {
      mockSignInWithPopup.mockResolvedValueOnce({
        user: {
          uid: 'firebase-uid-123',
          email: 'test@test.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
        },
      });

      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network error'));

      const store = createMockStore();
      await store.dispatch(googleLogin());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBe('Register: Unexpected Error');
    });
  });

  describe('verifyEmail', () => {
    const mockUser = {
      uid: 'firebase-uid-123',
      email: 'test@test.com',
      emailVerified: false,
    } as any;

    it('should send verification email successfully', async () => {
      mockSendEmailVerification.mockResolvedValueOnce(undefined);

      const store = createMockStore();
      const result = await store.dispatch(verifyEmail(mockUser));

      expect(result.type).toBe('account/verifyEmail/fulfilled');
      expect(mockSendEmailVerification).toHaveBeenCalledWith(mockUser, expect.any(Object));
    });

    it('should handle verification email error', async () => {
      mockSendEmailVerification.mockRejectedValueOnce(new Error('Too many requests'));

      const store = createMockStore();
      const result = await store.dispatch(verifyEmail(mockUser));

      expect(result.type).toBe('account/verifyEmail/rejected');
      expect(result.payload?.message).toBeTruthy();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockSignOut.mockResolvedValueOnce(undefined);
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { message: 'Logged out' },
      });

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(selectCurrentAccount(store.getState())).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('account');
    });

    it('should handle logout error', async () => {
      mockSignOut.mockRejectedValueOnce(new Error('Logout failed'));

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const updatedAccount = { ...mockAccount, name: 'Updated Name' };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: {
          result: updatedAccount,
          message: 'Account updated',
        },
      });

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(updateAccount({ account_id: 1, name: 'Updated Name', defaultProfileId: 1 }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(selectCurrentAccount(store.getState())?.name).toBe('Updated Name');
    });

    it('should handle update error', async () => {
      mockAxiosInstance.put.mockRejectedValueOnce({
        response: { data: { message: 'Update failed' } },
      });

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(updateAccount({ account_id: 1, name: 'New Name', defaultProfileId: 1 }));

      const state = store.getState().auth;
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('updateAccountImage', () => {
    it('should update account image successfully', async () => {
      const updatedAccount = { ...mockAccount, image: 'new-image.jpg' };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          result: updatedAccount,
          message: 'Image updated',
        },
      });

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      const mockFile = new File([''], 'image.jpg', { type: 'image/jpeg' });
      await store.dispatch(updateAccountImage({ accountId: 1, file: mockFile }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(selectCurrentAccount(store.getState())?.image).toBe('new-image.jpg');
    });

    it('should handle update image error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Image upload failed' } },
      });

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      const mockFile = new File([''], 'image.jpg', { type: 'image/jpeg' });
      await store.dispatch(updateAccountImage({ accountId: 1, file: mockFile }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });

    it('should handle unexpected errors during image update', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network error'));

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      const mockFile = new File([''], 'image.jpg', { type: 'image/jpeg' });
      await store.dispatch(updateAccountImage({ accountId: 1, file: mockFile }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBe('UpdateImage: Unexpected Error');
    });
  });

  describe('removeAccountImage', () => {
    it('should remove account image successfully', async () => {
      const updatedAccount = { ...mockAccount, image: null };

      mockAxiosInstance.delete.mockResolvedValueOnce({
        data: {
          result: updatedAccount,
          message: 'Image removed',
        },
      });

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(removeAccountImage({ accountId: 1 }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(selectCurrentAccount(store.getState())?.image).toBeNull();
    });

    it('should handle remove image error', async () => {
      mockAxiosInstance.delete.mockRejectedValueOnce({
        response: { data: { message: 'Image removal failed' } },
      });

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(removeAccountImage({ accountId: 1 }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });

    it('should handle unexpected errors during image removal', async () => {
      mockAxiosInstance.delete.mockRejectedValueOnce(new Error('Network error'));

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(removeAccountImage({ accountId: 1 }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBe('RemoveAccountImage: Unexpected Error');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({
        data: { message: 'Account deleted' },
      });
      mockSignOut.mockResolvedValueOnce(undefined);

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(deleteAccount({ accountId: 1 }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(selectCurrentAccount(store.getState())).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('account');
    });

    it('should handle delete error', async () => {
      mockAxiosInstance.delete.mockRejectedValueOnce({
        response: { data: { message: 'Delete failed' } },
      });

      const store = createMockStore({
        auth: {
          account: mockAccount,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(deleteAccount({ accountId: 1 }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        account: mockAccount,
        loading: false,
        error: { message: 'Test error' },
      },
    };

    it('should select current account', () => {
      const store = createMockStore(mockState);
      expect(selectCurrentAccount(store.getState())).toEqual(mockAccount);
    });

    it('should select loading state', () => {
      const store = createMockStore(mockState);
      expect(selectAccountLoading(store.getState())).toBe(false);
    });

    it('should select error state', () => {
      const store = createMockStore(mockState);
      expect(selectAccountError(store.getState())).toEqual({ message: 'Test error' });
    });
  });
});
