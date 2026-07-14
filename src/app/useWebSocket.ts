import { useCallback, useEffect, useMemo, useRef } from 'react';

import { BACKEND_WEBSOCKET_URL } from './constants/constants';
import { useAppDispatch, useAppSelector } from './hooks';
import { defaultProfileIdUpdatedRemotely, selectCurrentAccount } from './slices/accountSlice';
import {
  reloadActiveProfile,
  reloadProfileEpisodes,
  selectActiveProfile,
  setActiveProfile,
  updateAfterAddShowFavorite,
} from './slices/activeProfileSlice';
import { ActivityNotificationType, showActivityNotification } from './slices/activityNotificationSlice';
import { profileRemovedRemotely } from './slices/profilesSlice';
import { updateNotifications } from './slices/systemNotificationsSlice';
import { AccountNotification, ProfileShow } from '@ajgifford/keepwatching-types';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { Socket, io } from 'socket.io-client';

export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);
  const activeProfile = useAppSelector(selectActiveProfile);
  const auth = getAuth();

  const socketRef = useRef<Socket | null>(null);
  const currentUserRef = useRef<User | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract only the account ID to prevent unnecessary re-renders
  const accountId = useMemo(() => account?.id, [account?.id]);
  const defaultProfileId = useMemo(() => account?.defaultProfileId, [account?.defaultProfileId]);
  const activeProfileId = useMemo(() => activeProfile?.id, [activeProfile?.id]);

  // The socket connection is set up once and its listeners are never re-bound on later renders
  // (see setupSocket below — reconnection is deliberately avoided to keep a stable connection).
  // Handlers that need the *current* account/profile must therefore read from refs rather than
  // closing over the values above, or they'd keep acting on whatever was true at connect time.
  const accountIdRef = useRef(accountId);
  const defaultProfileIdRef = useRef(defaultProfileId);
  const activeProfileIdRef = useRef(activeProfileId);

  useEffect(() => {
    accountIdRef.current = accountId;
  }, [accountId]);
  useEffect(() => {
    defaultProfileIdRef.current = defaultProfileId;
  }, [defaultProfileId]);
  useEffect(() => {
    activeProfileIdRef.current = activeProfileId;
  }, [activeProfileId]);

  // Stable event handlers that don't change on account updates
  const handleShowsUpdate = useCallback(() => {
    dispatch(reloadActiveProfile());
  }, [dispatch]);

  const handleMoviesUpdate = useCallback(() => {
    dispatch(reloadActiveProfile());
  }, [dispatch]);

  const handleUpdateShowFavorite = useCallback(
    async (data: { show: ProfileShow }) => {
      await dispatch(updateAfterAddShowFavorite(data.show));
      await dispatch(reloadProfileEpisodes());
    },
    [dispatch]
  );

  const handleUpdateNotifications = useCallback(
    async (data: { notifications: AccountNotification[] }) => {
      await dispatch(updateNotifications(data.notifications));
    },
    [dispatch]
  );

  const handleProfileTransferred = useCallback(
    (data: { profileId: number; newDefaultProfileId?: number }) => {
      dispatch(profileRemovedRemotely(data.profileId));

      if (data.newDefaultProfileId) {
        dispatch(defaultProfileIdUpdatedRemotely(data.newDefaultProfileId));
      }

      // If this device was actively viewing the profile that just moved, it's no longer usable
      // here at all — switch away from it instead of leaving the UI pointed at a dead profile.
      const currentAccountId = accountIdRef.current;
      if (currentAccountId && activeProfileIdRef.current === data.profileId) {
        const fallbackProfileId = data.newDefaultProfileId ?? defaultProfileIdRef.current;
        if (fallbackProfileId) {
          dispatch(setActiveProfile({ accountId: currentAccountId, profileId: fallbackProfileId }));
        }
        dispatch(
          showActivityNotification({
            message: 'This profile is no longer part of your account. Switched to your default profile.',
            type: ActivityNotificationType.Info,
          })
        );
      }
    },
    [dispatch]
  );

  const setupSocket = useCallback(
    async (user: User, forceReconnect: boolean = false) => {
      try {
        if (!accountId) return;

        // Check if we already have a connected socket for the same user
        if (
          !forceReconnect &&
          socketRef.current &&
          socketRef.current.connected &&
          currentUserRef.current?.uid === user.uid
        ) {
          return; // Socket is already connected for the same user
        }

        // Clear any pending reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Disconnect existing socket if any
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }

        const token = await user.getIdToken(forceReconnect);
        currentUserRef.current = user;

        socketRef.current = io(BACKEND_WEBSOCKET_URL, {
          auth: { token: token, account_id: accountId },
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          forceNew: true,
        });

        socketRef.current.on('disconnect', (reason) => {
          // Only attempt to reconnect for certain disconnect reasons
          if (reason === 'io server disconnect' || reason === 'transport close') {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (currentUserRef.current && accountId) {
                setupSocket(currentUserRef.current, true);
              }
            }, 3000);
          }
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
        });

        socketRef.current.on('showsUpdate', handleShowsUpdate);
        socketRef.current.on('moviesUpdate', handleMoviesUpdate);
        socketRef.current.on('updateShowFavorite', handleUpdateShowFavorite);
        socketRef.current.on('newNotifications', handleUpdateNotifications);
        socketRef.current.on('updateNotifications', handleUpdateNotifications);
        socketRef.current.on('profileTransferred', handleProfileTransferred);
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    },
    [
      accountId,
      handleShowsUpdate,
      handleMoviesUpdate,
      handleUpdateShowFavorite,
      handleUpdateNotifications,
      handleProfileTransferred,
    ]
  );

  useEffect(() => {
    if (!accountId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      currentUserRef.current = null;
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && accountId) {
        // Only setup socket if we don't have one or the user changed
        if (!currentUserRef.current || currentUserRef.current.uid !== user.uid) {
          setupSocket(user);
        }
      } else if (!user) {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        currentUserRef.current = null;
      }
    });

    // Initial setup if user is already authenticated
    const currentUser = auth.currentUser;
    if (currentUser && accountId && !socketRef.current) {
      setupSocket(currentUser);
    }

    return () => {
      unsubscribe();

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [accountId, auth, setupSocket]); // Only depend on accountId, not the full account object

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      currentUserRef.current = null;
    };
  }, []);
};
