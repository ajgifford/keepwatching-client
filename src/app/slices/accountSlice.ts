import axiosInstance from '../api/axiosInstance';
import { auth, getFirebaseAuthErrorMessage } from '../firebaseConfig';
import { ApiErrorResponse } from '../model/errors';
import { RootState } from '../store';
import { setActiveProfile } from './activeProfileSlice';
import { ActivityNotificationType, showActivityNotification } from './activityNotificationSlice';
import { fetchProfiles } from './profilesSlice';
import { fetchSystemNotifications } from './systemNotificationsSlice';
import { Account, AccountResponse } from '@ajgifford/keepwatching-types';
import { ThunkDispatch, UnknownAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

const ACCOUNT_KEY = 'account';

type LoginData = {
  email: string;
  password: string;
};

type NewAccountData = LoginData & {
  name: string;
};

type AccountState = {
  account?: Account | null;
  loading: boolean;
  error: ApiErrorResponse | null;
};

const initialState: AccountState = {
  account: localStorage.getItem(ACCOUNT_KEY) ? JSON.parse(localStorage.getItem(ACCOUNT_KEY) as string) : null,
  loading: false,
  error: null,
};

function initializeAccount(dispatch: ThunkDispatch<unknown, unknown, UnknownAction>, account: Account) {
  const accountId = account.id;
  const profileId = account.defaultProfileId;
  dispatch(fetchProfiles(accountId));
  dispatch(
    setActiveProfile({
      accountId,
      profileId,
    })
  );
  dispatch(fetchSystemNotifications(accountId));
}

export const login = createAsyncThunk<Account, LoginData, { rejectValue: ApiErrorResponse }>(
  'account/login',
  async (data: LoginData, { dispatch, rejectWithValue }) => {
    let userCredential = null;
    try {
      userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      const errorMessage = getFirebaseAuthErrorMessage(
        error as FirebaseError,
        'An unknown error occurred during login. Please try again.'
      );
      dispatch(
        showActivityNotification({
          message: errorMessage,
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue({ message: errorMessage });
    }

    try {
      const response: AxiosResponse<AccountResponse> = await axiosInstance.post('/accounts/login', {
        uid: userCredential.user.uid,
      });
      const account = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
      dispatch(
        showActivityNotification({
          message: response.data.message || 'Success',
          type: ActivityNotificationType.Success,
        })
      );

      initializeAccount(dispatch, account);

      return account;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        })
      );

      return rejectWithValue({ message: 'Login: Unexpected Error' });
    }
  }
);

export const register = createAsyncThunk<Account, NewAccountData, { rejectValue: ApiErrorResponse }>(
  'account/register',
  async (data: NewAccountData, { dispatch, rejectWithValue }) => {
    let userCredential = null;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
      await sendEmailVerification(userCredential.user);
    } catch (error) {
      const errorMessage = getFirebaseAuthErrorMessage(
        error as FirebaseError,
        'An unknown error occurred during registration. Please try again.'
      );
      dispatch(
        showActivityNotification({
          message: errorMessage,
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue({ message: errorMessage });
    }

    try {
      const response: AxiosResponse<AccountResponse> = await axiosInstance.post('/accounts/register', {
        email: data.email,
        uid: userCredential.user.uid,
        name: data.name,
      });
      const account = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
      dispatch(
        showActivityNotification({
          message: response.data.message || 'Success',
          type: ActivityNotificationType.Success,
        })
      );

      initializeAccount(dispatch, account);

      return account;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        })
      );

      return rejectWithValue({ message: 'Register: Unexpected Error' });
    }
  }
);

export const googleLogin = createAsyncThunk<Account, void, { rejectValue: ApiErrorResponse }>(
  'account/googleLogin',
  async (_, { dispatch, rejectWithValue }) => {
    let user = null;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      user = result.user;
    } catch (error) {
      const errorMessage = getFirebaseAuthErrorMessage(
        error as FirebaseError,
        'An unknown error occurred during Google login. Please try again.'
      );
      dispatch(
        showActivityNotification({
          message: errorMessage,
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue({ message: errorMessage });
    }

    try {
      const response: AxiosResponse<AccountResponse> = await axiosInstance.post('/accounts/googleLogin', {
        email: user.email,
        uid: user.uid,
        name: user.displayName,
        photoURL: user.photoURL,
      });
      const account = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
      dispatch(
        showActivityNotification({
          message: response.data.message || 'Success',
          type: ActivityNotificationType.Success,
        })
      );

      initializeAccount(dispatch, account);

      return account;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        })
      );

      return rejectWithValue({ message: 'Register: Unexpected Error' });
    }
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: ApiErrorResponse }>(
  'account/logout',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      await signOut(auth);
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      await axiosInstance.post('/accounts/logout', { accountId: accountId });

      localStorage.removeItem(ACCOUNT_KEY);
      dispatch(
        showActivityNotification({
          message: 'Successfully logged out',
          type: ActivityNotificationType.Success,
        })
      );

      return;
    } catch (error) {
      const errorMessage = getFirebaseAuthErrorMessage(
        error as FirebaseError,
        'An unknown error occurred during logout. Please try again.'
      );
      dispatch(
        showActivityNotification({
          message: errorMessage,
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue({ message: errorMessage });
    }
  }
);

export const updateAccountImage = createAsyncThunk<
  Account,
  { accountId: number; file: File },
  { rejectValue: ApiErrorResponse }
>(
  'account/updateImage',
  async ({ accountId, file }: { accountId: number; file: File }, { dispatch, rejectWithValue }) => {
    try {
      const formData: FormData = new FormData();
      formData.append('file', file);
      const response: AxiosResponse<AccountResponse> = await axiosInstance.post(
        `/upload/accounts/${accountId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const account = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
      dispatch(
        showActivityNotification({
          message: response.data.message || `Account image updated successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return account;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        })
      );
      console.error(error);
      return rejectWithValue({ message: 'UpdateImage: Unexpected Error' });
    }
  }
);

export const removeAccountImage = createAsyncThunk<Account, { accountId: number }, { rejectValue: ApiErrorResponse }>(
  'account/removeImage',
  async ({ accountId }: { accountId: number }, { dispatch, rejectWithValue }) => {
    try {
      const response: AxiosResponse<AccountResponse> = await axiosInstance.delete(
        `/upload/accounts/${accountId}/image`
      );
      const account = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
      dispatch(
        showActivityNotification({
          message: response.data.message || `Account image removed successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return account;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred removing the account image',
          type: ActivityNotificationType.Error,
        })
      );
      console.error(error);
      return rejectWithValue({ message: 'RemoveAccountImage: Unexpected Error' });
    }
  }
);

export const verifyEmail = createAsyncThunk<void, User, { rejectValue: ApiErrorResponse }>(
  'account/verifyEmail',
  async (user: User, { dispatch, rejectWithValue }) => {
    try {
      await sendEmailVerification(user);
      dispatch(
        showActivityNotification({
          message: `Verification email sent`,
          type: ActivityNotificationType.Success,
        })
      );
    } catch (error) {
      const errorMessage = getFirebaseAuthErrorMessage(
        error as FirebaseError,
        'An unknown error occurred changing the password. Please try again.'
      );
      dispatch(
        showActivityNotification({
          message: errorMessage,
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue({ message: errorMessage });
    }
  }
);

export const updateAccount = createAsyncThunk<
  Account,
  { account_id: number; name: string; defaultProfileId: number },
  { rejectValue: ApiErrorResponse }
>(
  'account/update',
  async (
    { account_id, name, defaultProfileId }: { account_id: number; name: string; defaultProfileId: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response: AxiosResponse<AccountResponse> = await axiosInstance.put(`/accounts/${account_id}/`, {
        name,
        defaultProfileId,
      });
      const account = response.data.result;
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
      dispatch(
        showActivityNotification({
          message: response.data.message || `Account edited successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return account;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        })
      );
      console.error(error);
      return rejectWithValue({ message: 'Update Account: Unexpected Error' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Login Failed' };
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Registration Failed' };
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Google Login Failed' };
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.account = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Logout Failed' };
      })
      .addCase(updateAccountImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccountImage.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(updateAccountImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Account Image Update Failed' };
      })
      .addCase(removeAccountImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAccountImage.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(removeAccountImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Account Image Removal Failed' };
      })
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload || { message: 'Account Update Failed' };
      });
  },
});

export const selectCurrentAccount = (state: RootState) => state.auth.account;
export const selectAccountLoading = (state: RootState) => state.auth.loading;
export const selectAccountError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
