import { useEffect } from 'react';

import { BACKEND_WEBSOCKET_URL } from './constants/constants';
import { useAppDispatch, useAppSelector } from './hooks';
import { selectCurrentAccount } from './slices/accountSlice';
import { reloadActiveProfile, reloadNextWatchEpisodes, updateAfterAddShowFavorite } from './slices/activeProfileSlice';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Socket, io } from 'socket.io-client';

let socket: Socket | null = null;

export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);
  const auth = getAuth();

  useEffect(() => {
    if (!account) return;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();

        socket = io(BACKEND_WEBSOCKET_URL, {
          auth: { token: token, account_id: account.id },
          reconnectionAttempts: 5, // Limits to 5 reconnection attempts
          reconnectionDelay: 2000, // Wait 2 seconds before retrying
        });

        socket.on('showsUpdate', () => {
          dispatch(reloadActiveProfile());
        });

        socket.on('moviesUpdate', () => {
          dispatch(reloadActiveProfile());
        });

        socket.on('updateShowFavorite', async (data) => {
          await dispatch(updateAfterAddShowFavorite(data.show));
          await dispatch(reloadNextWatchEpisodes());
        });
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [dispatch, account, auth]);
};
