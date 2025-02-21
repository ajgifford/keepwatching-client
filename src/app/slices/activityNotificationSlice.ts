import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export enum ActivityNotificationType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

type ActivityNotification = {
  open: boolean;
  message: string;
  type: ActivityNotificationType;
};

type ShowActivityNotification = Omit<ActivityNotification, 'open'>;

const initialState = {
  open: false,
  message: '',
  type: ActivityNotificationType.Success,
};

const activityNotificationSlice = createSlice({
  name: 'activityNotification',
  initialState,
  reducers: {
    showActivityNotification: (state, action: PayloadAction<ShowActivityNotification>) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    hideActivityNotification: (state) => {
      state.open = false;
      state.message = '';
    },
  },
});

export const { showActivityNotification, hideActivityNotification } = activityNotificationSlice.actions;
export default activityNotificationSlice.reducer;
