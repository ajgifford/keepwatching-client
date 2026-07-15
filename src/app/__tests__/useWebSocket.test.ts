import { act, renderHook, waitFor } from '@testing-library/react';

import { useAppDispatch, useAppSelector } from '../hooks';
import { defaultProfileIdUpdatedRemotely, selectCurrentAccount } from '../slices/accountSlice';
import {
  reloadActiveProfile,
  reloadProfileEpisodes,
  selectActiveProfile,
  setActiveProfile,
  updateAfterAddShowFavorite,
} from '../slices/activeProfileSlice';
import { ActivityNotificationType, showActivityNotification } from '../slices/activityNotificationSlice';
import { profileRemovedRemotely } from '../slices/profilesSlice';
import { updateNotifications } from '../slices/systemNotificationsSlice';
import { useWebSocket } from '../useWebSocket';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { io } from 'socket.io-client';

jest.mock('../hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

jest.mock('../slices/accountSlice', () => ({
  selectCurrentAccount: jest.fn(),
  defaultProfileIdUpdatedRemotely: jest.fn((payload) => ({ type: 'account/defaultProfileIdUpdatedRemotely', payload })),
}));

jest.mock('../slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
  setActiveProfile: jest.fn((payload) => ({ type: 'activeProfile/setActiveProfile', payload })),
  reloadActiveProfile: jest.fn(() => ({ type: 'activeProfile/reloadActiveProfile' })),
  reloadProfileEpisodes: jest.fn(() => ({ type: 'activeProfile/reloadProfileEpisodes' })),
  updateAfterAddShowFavorite: jest.fn((payload) => ({ type: 'activeProfile/updateAfterAddShowFavorite', payload })),
}));

jest.mock('../slices/activityNotificationSlice', () => ({
  ActivityNotificationType: { Success: 'success', Info: 'info', Error: 'error' },
  showActivityNotification: jest.fn((payload) => ({ type: 'activityNotification/show', payload })),
}));

jest.mock('../slices/profilesSlice', () => ({
  profileRemovedRemotely: jest.fn((payload) => ({ type: 'profiles/profileRemovedRemotely', payload })),
}));

jest.mock('../slices/systemNotificationsSlice', () => ({
  updateNotifications: jest.fn((payload) => ({ type: 'systemNotifications/updateNotifications', payload })),
}));

type SocketHandlers = Record<string, (...args: any[]) => void>;

function createMockSocket() {
  const handlers: SocketHandlers = {};
  const socket = {
    connected: false,
    on: jest.fn((event: string, cb: (...args: any[]) => void) => {
      handlers[event] = cb;
    }),
    disconnect: jest.fn(),
    emit: (event: string, ...args: any[]) => handlers[event]?.(...args),
    _handlers: handlers,
  };
  return socket;
}

function createMockUser(uid: string): User {
  return {
    uid,
    getIdToken: jest.fn().mockResolvedValue(`token-${uid}`),
  } as unknown as User;
}

describe('useWebSocket', () => {
  const mockDispatch = jest.fn();
  let mockSocket: ReturnType<typeof createMockSocket>;
  let authStateCallback: ((user: User | null) => void) | null;
  const mockUnsubscribe = jest.fn();

  let currentAccount: { id: number; defaultProfileId?: number } | undefined;
  let currentActiveProfile: { id: number } | undefined;
  let authCurrentUser: User | null;

  beforeEach(() => {
    jest.clearAllMocks();

    currentAccount = { id: 1, defaultProfileId: 10 };
    currentActiveProfile = { id: 20 };
    authCurrentUser = null;
    authStateCallback = null;

    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as jest.Mock).mockImplementation((selector: any) => {
      if (selector === selectCurrentAccount) return currentAccount;
      if (selector === selectActiveProfile) return currentActiveProfile;
      return undefined;
    });

    (getAuth as jest.Mock).mockImplementation(() => ({ currentUser: authCurrentUser }));
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, cb) => {
      authStateCallback = cb;
      return mockUnsubscribe;
    });

    (io as unknown as jest.Mock).mockImplementation(() => {
      mockSocket = createMockSocket();
      return mockSocket;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not create a socket when there is no account', () => {
    currentAccount = undefined;

    renderHook(() => useWebSocket());

    expect(io).not.toHaveBeenCalled();
  });

  it('disconnects an existing socket when the account is cleared', async () => {
    authCurrentUser = createMockUser('user-1');
    const { rerender } = renderHook(() => useWebSocket());

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    const socket = mockSocket;

    currentAccount = undefined;
    rerender();

    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('sets up a socket for the already-authenticated user on mount', async () => {
    authCurrentUser = createMockUser('user-1');

    renderHook(() => useWebSocket());

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    expect(io).toHaveBeenCalledWith(
      'ws://localhost:3033/',
      expect.objectContaining({ auth: { token: 'token-user-1', account_id: 1 } })
    );
  });

  it('sets up a socket once the auth state change fires with a user', async () => {
    renderHook(() => useWebSocket());

    expect(io).not.toHaveBeenCalled();

    await act(async () => {
      authStateCallback?.(createMockUser('user-2'));
    });

    expect(io).toHaveBeenCalledWith(
      'ws://localhost:3033/',
      expect.objectContaining({ auth: { token: 'token-user-2', account_id: 1 } })
    );
  });

  it('does not reconnect when the same user is already connected', async () => {
    authCurrentUser = createMockUser('user-1');
    renderHook(() => useWebSocket());
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    mockSocket.connected = true;

    await act(async () => {
      authStateCallback?.(createMockUser('user-1'));
    });

    expect(io).toHaveBeenCalledTimes(1);
  });

  it('tears down the old socket and reconnects when the user changes', async () => {
    authCurrentUser = createMockUser('user-1');
    renderHook(() => useWebSocket());
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    const firstSocket = mockSocket;
    firstSocket.connected = true;

    await act(async () => {
      authStateCallback?.(createMockUser('user-2'));
    });

    expect(firstSocket.disconnect).toHaveBeenCalled();
    expect(io).toHaveBeenCalledTimes(2);
    expect(io).toHaveBeenLastCalledWith(
      'ws://localhost:3033/',
      expect.objectContaining({ auth: { token: 'token-user-2', account_id: 1 } })
    );
  });

  it('disconnects the socket when the user signs out', async () => {
    authCurrentUser = createMockUser('user-1');
    renderHook(() => useWebSocket());
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    const socket = mockSocket;

    await act(async () => {
      authStateCallback?.(null);
    });

    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('unsubscribes from auth changes and clears pending timers on unmount', async () => {
    authCurrentUser = createMockUser('user-1');
    const { unmount } = renderHook(() => useWebSocket());
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    const socket = mockSocket;

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(socket.disconnect).toHaveBeenCalled();
  });

  describe('reconnect on disconnect', () => {
    it('schedules a reconnect for a server-initiated disconnect', async () => {
      authCurrentUser = createMockUser('user-1');
      renderHook(() => useWebSocket());
      await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
      const firstSocket = mockSocket;

      jest.useFakeTimers();

      act(() => {
        firstSocket.emit('disconnect', 'io server disconnect');
      });

      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(io).toHaveBeenCalledTimes(2);
    });

    it('does not schedule a reconnect for a client-initiated disconnect', async () => {
      authCurrentUser = createMockUser('user-1');
      renderHook(() => useWebSocket());
      await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
      const firstSocket = mockSocket;

      jest.useFakeTimers();

      act(() => {
        firstSocket.emit('disconnect', 'io client disconnect');
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(io).toHaveBeenCalledTimes(1);
    });
  });

  describe('event handlers', () => {
    async function setup() {
      authCurrentUser = createMockUser('user-1');
      const rendered = renderHook(() => useWebSocket());
      await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
      return { socket: mockSocket, rerender: rendered.rerender };
    }

    it('reloads the active profile on showsUpdate', async () => {
      const { socket } = await setup();

      await act(async () => {
        socket.emit('showsUpdate');
      });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'activeProfile/reloadActiveProfile' });
    });

    it('reloads the active profile on moviesUpdate', async () => {
      const { socket } = await setup();

      await act(async () => {
        socket.emit('moviesUpdate');
      });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'activeProfile/reloadActiveProfile' });
    });

    it('updates the favorited show and reloads episodes on updateShowFavorite', async () => {
      const { socket } = await setup();
      const show = { id: 99 };

      await act(async () => {
        socket.emit('updateShowFavorite', { show });
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'activeProfile/updateAfterAddShowFavorite',
        payload: show,
      });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'activeProfile/reloadProfileEpisodes' });
    });

    it('updates notifications on newNotifications', async () => {
      const { socket } = await setup();
      const notifications = [{ id: 1 }];

      await act(async () => {
        socket.emit('newNotifications', { notifications });
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'systemNotifications/updateNotifications',
        payload: notifications,
      });
    });

    it('updates notifications on updateNotifications', async () => {
      const { socket } = await setup();
      const notifications = [{ id: 2 }];

      await act(async () => {
        socket.emit('updateNotifications', { notifications });
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'systemNotifications/updateNotifications',
        payload: notifications,
      });
    });

    describe('profileTransferred', () => {
      it('removes the profile and does not switch when a different profile is active', async () => {
        const { socket } = await setup();

        await act(async () => {
          socket.emit('profileTransferred', { profileId: 999 });
        });

        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'profiles/profileRemovedRemotely',
          payload: 999,
        });
        expect(mockDispatch).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'activeProfile/setActiveProfile' })
        );
      });

      it('applies the new default profile id when provided', async () => {
        const { socket } = await setup();

        await act(async () => {
          socket.emit('profileTransferred', { profileId: 999, newDefaultProfileId: 55 });
        });

        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'account/defaultProfileIdUpdatedRemotely',
          payload: 55,
        });
      });

      it('switches away and shows a notice when the removed profile is the active one', async () => {
        // currentActiveProfile.id (20) matches the profileId emitted below
        const { socket } = await setup();

        await act(async () => {
          socket.emit('profileTransferred', { profileId: 20, newDefaultProfileId: 55 });
        });

        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'activeProfile/setActiveProfile',
          payload: { accountId: 1, profileId: 55 },
        });
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'activityNotification/show',
          payload: {
            message: 'This profile is no longer part of your account. Switched to your default profile.',
            type: 'info',
          },
        });
      });

      it('falls back to the account default profile id when no new default is given', async () => {
        const { socket, rerender } = await setup();
        currentAccount = { id: 1, defaultProfileId: 77 };
        rerender();

        await act(async () => {
          socket.emit('profileTransferred', { profileId: 20 });
        });

        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'activeProfile/setActiveProfile',
          payload: { accountId: 1, profileId: 77 },
        });
      });
    });
  });
});
