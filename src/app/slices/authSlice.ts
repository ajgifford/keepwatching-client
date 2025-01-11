import axiosInstance from '../api/axiosInstance';
import { ACCOUNT_KEY, Account } from '../model/account';
import { RootState } from '../store';
import { NotificationType, showNotification } from './notificationSlice';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

type LoginAccount = {
  email: string;
  password: string;
};

type NewAccount = LoginAccount & {
  name: string;
};

type AuthApiState = {
  account?: Account | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
};

const initialState: AuthApiState = {
  account: localStorage.getItem(ACCOUNT_KEY) ? JSON.parse(localStorage.getItem(ACCOUNT_KEY) as string) : null,
  status: 'idle',
  error: null,
};

type ErrorResponse = {
  message: string;
};

export const login = createAsyncThunk('login', async (data: LoginAccount, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/api/login', data);
    const loginResult = response.data.result;

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(loginResult));
    dispatch(
      showNotification({
        message: response.data.message || 'Success',
        type: NotificationType.Success,
      }),
    );

    return loginResult;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorResponse = error.response.data;
      dispatch(
        showNotification({
          message: errorResponse.message,
          type: NotificationType.Error,
        }),
      );
      return rejectWithValue(errorResponse);
    }
    dispatch(
      showNotification({
        message: 'An error occurred',
        type: NotificationType.Error,
      }),
    );

    throw error;
  }
});

export const register = createAsyncThunk('register', async (data: NewAccount, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('api/accounts/', data);
    const resgisterResult = response.data.result;

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(resgisterResult));
    dispatch(
      showNotification({
        message: response.data.message || 'Success',
        type: NotificationType.Success,
      }),
    );

    return resgisterResult;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorResponse = error.response.data;
      dispatch(
        showNotification({
          message: errorResponse.message,
          type: NotificationType.Error,
        }),
      );
      return rejectWithValue(errorResponse);
    }
    dispatch(
      showNotification({
        message: 'An error occurred',
        type: NotificationType.Error,
      }),
    );

    throw error;
  }
});

export const logout = createAsyncThunk('logout', async (_, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/api/logout', {});

    localStorage.removeItem(ACCOUNT_KEY);
    dispatch(
      showNotification({
        message: response.data.message || 'Success',
        type: NotificationType.Success,
      }),
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorResponse = error.response.data;
      dispatch(
        showNotification({
          message: errorResponse.message,
          type: NotificationType.Error,
        }),
      );
      return rejectWithValue(errorResponse);
    }
    dispatch(
      showNotification({
        message: 'An error occurred',
        type: NotificationType.Error,
      }),
    );

    throw error;
  }
});

export const updateAccountImage = createAsyncThunk(
  'updateAccountImage',
  async ({ accountId, file }: { accountId: string; file: File }, { dispatch, rejectWithValue }) => {
    try {
      const formData: FormData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(`/api/upload/account/${accountId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const loginResult = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(loginResult));
      dispatch(
        showNotification({
          message: `Account image updated successfully`,
          type: NotificationType.Success,
        }),
      );
      return loginResult;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Login Failed';
        } else {
          state.error = action.error.message || 'Login Failed';
        }
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Registration Failed';
        } else {
          state.error = action.error.message || 'Registration Failed';
        }
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.status = 'idle';
        state.account = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Logout Failed';
        } else {
          state.error = action.error.message || 'Logout Failed';
        }
      })
      .addCase(updateAccountImage.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAccountImage.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(updateAccountImage.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Account Image Update Failed';
        } else {
          state.error = action.error.message || 'Account Image Update Failed';
        }
      });
  },
});

export const selectCurrentAccount = (state: RootState) => state.auth.account;

export default authSlice.reducer;
