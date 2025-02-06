import { useEffect } from 'react';

import { BACKEND_WEBSOCKET_URL } from './constants/constants';
import { useAppDispatch, useAppSelector } from './hooks';
import { selectCurrentAccount } from './slices/accountSlice';
import { setActiveProfile } from './slices/activeProfileSlice';
import { io } from 'socket.io-client';

export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);

  useEffect(() => {
    const socket = io(BACKEND_WEBSOCKET_URL);
    socket.on('globalUpdate', () => {
      if (account) {
        dispatch(setActiveProfile({ accountId: account.id, profileId: account.default_profile_id }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, account]);
};
