import axiosInstance from '../api/axiosInstance';
import { Account } from '../model/account';
import { RootState } from '../store';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

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
  account: null, //localStorage.getItem('account') ? JSON.parse(localStorage.getItem('account') as string) : null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk('login', async (data: LoginAccount) => {
  const response = await axiosInstance.post('/api/login', data);
  const resData = response.data;

  localStorage.setItem('acocunt', resData);

  return resData;
});

export const register = createAsyncThunk('register', async (data: NewAccount) => {
  const response = await axiosInstance.post('api/account/', data);
  const resData = response.data;

  localStorage.setItem('account', resData);

  return resData;
});

export const logout = createAsyncThunk('logout', async () => {
  const response = await axiosInstance.post('/api/logout', {});
  const resData = response.data;

  localStorage.removeItem('acocunt');

  return resData;
});

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
        state.error = action.error.message || 'Login failed';
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
        state.error = action.error.message || 'Registration failed';
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
        state.error = action.error.message || 'Logout failed';
      });
  },
});

export const selectCurrentAccount = (state: RootState) => state.auth.account;

export default authSlice.reducer;
