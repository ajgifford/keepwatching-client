import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!account) return;

    let unsubscribe: () => void;

    const setupSocket = async (user: User) => {
      if (!socketRef.current || !socketRef.current.connected) {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        const token = await user.getIdToken();

        socketRef.current = io(BACKEND_WEBSOCKET_URL, {
          auth: { token: token, account_id: account.id },
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        socketRef.current.on('showsUpdate', () => {
          dispatch(reloadActiveProfile());
        });

        socketRef.current.on('moviesUpdate', () => {
          dispatch(reloadActiveProfile());
        });

        socketRef.current.on('updateShowFavorite', async (data) => {
          await dispatch(updateAfterAddShowFavorite(data.show));
          await dispatch(reloadProfileEpisodes());
        });
      }
    };

    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setupSocket(user).catch(console.error);
      } else if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [dispatch, account, auth]);
};
