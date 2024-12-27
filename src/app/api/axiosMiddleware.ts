import { NotificationType, showNotification } from '../slices/notificationSlice';
import { Middleware } from '@reduxjs/toolkit';

export const axiosMiddleware: Middleware =
  ({ dispatch }) =>
  (next) =>
  async (action: any) => {
    if (action.type.endsWith('/rejected')) {
      const errorMessage: string = action.payload?.message || 'An error occurred!';

      dispatch(
        showNotification({
          type: NotificationType.Error,
          message: errorMessage,
        }),
      );
    } else if (action.type.endsWith('/fulfilled')) {
      const successMessage: string = action.payload?.message || 'Success!';

      dispatch(
        showNotification({
          type: NotificationType.Success,
          message: successMessage,
        }),
      );
    }

    return next(action);
  };
