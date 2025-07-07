import { useCallback, useEffect, useMemo, useRef } from 'react';

import { BACKEND_WEBSOCKET_URL } from './constants/constants';
import { useAppDispatch, useAppSelector } from './hooks';
import { selectCurrentAccount } from './slices/accountSlice';
import { reloadActiveProfile, reloadProfileEpisodes, updateAfterAddShowFavorite } from './slices/activeProfileSlice';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { Socket, io } from 'socket.io-client';

export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);
  const auth = getAuth();

  const socketRef = useRef<Socket | null>(null);
  const currentUserRef = useRef<User | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract only the account ID to prevent unnecessary re-renders
  const accountId = useMemo(() => account?.id, [account?.id]);

  // Stable event handlers that don't change on account updates
  const handleShowsUpdate = useCallback(() => {
    dispatch(reloadActiveProfile());
  }, [dispatch]);

  const handleMoviesUpdate = useCallback(() => {
    dispatch(reloadActiveProfile());
  }, [dispatch]);

  const handleUpdateShowFavorite = useCallback(
    async (data: any) => {
      await dispatch(updateAfterAddShowFavorite(data.show));
      await dispatch(reloadProfileEpisodes());
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
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    },
    [accountId, handleShowsUpdate, handleMoviesUpdate, handleUpdateShowFavorite]
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
