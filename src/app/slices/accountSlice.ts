import axiosInstance from '../api/axiosInstance';
import { auth, getFirebaseAuthErrorMessage } from '../firebaseConfig';
import { ACCOUNT_KEY, Account } from '../model/account';
import { RootState } from '../store';
import { setActiveProfile } from './activeProfileSlice';
import { ActivityNotificationType, showActivityNotification } from './activityNotificationSlice';
import { fetchProfiles } from './profilesSlice';
import { fetchSystemNotifications } from './systemNotificationsSlice';
import { PayloadAction, ThunkDispatch, UnknownAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
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

type LoginData = {
  email: string;
  password: string;
};

type NewAccountData = LoginData & {
  name: string;
};

type AccountState = {
  account?: Account | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
};

const initialState: AccountState = {
  account: localStorage.getItem(ACCOUNT_KEY) ? JSON.parse(localStorage.getItem(ACCOUNT_KEY) as string) : null,
  status: 'idle',
  error: null,
};

type ErrorResponse = {
  message: string;
};

function initializeAccount(dispatch: ThunkDispatch<unknown, unknown, UnknownAction>, account: Account) {
  dispatch(fetchProfiles(account.id));
  dispatch(
    setActiveProfile({
      accountId: account.id,
      profileId: account.default_profile_id,
    }),
  );
  dispatch(fetchSystemNotifications(account.id));
}

export const login = createAsyncThunk('account/login', async (data: LoginData, { dispatch, rejectWithValue }) => {
  let userCredential = null;
  try {
    userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
  } catch (error) {
    const errorMessage = getFirebaseAuthErrorMessage(
      error as FirebaseError,
      'An unknown error occurred during login. Please try again.',
    );
    dispatch(
      showActivityNotification({
        message: errorMessage,
        type: ActivityNotificationType.Error,
      }),
    );
    return rejectWithValue({ message: errorMessage });
  }

  try {
    const response = await axiosInstance.post('/login', { uid: userCredential.user.uid });
    const loginResult: Account = response.data.result;

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(loginResult));
    dispatch(
      showActivityNotification({
        message: response.data.message || 'Success',
        type: ActivityNotificationType.Success,
      }),
    );

    initializeAccount(dispatch, loginResult);

    return loginResult;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorResponse = error.response.data;
      dispatch(
        showActivityNotification({
          message: errorResponse.message,
          type: ActivityNotificationType.Error,
        }),
      );
      return rejectWithValue(errorResponse);
    }
    dispatch(
      showActivityNotification({
        message: 'An error occurred',
        type: ActivityNotificationType.Error,
      }),
    );

    console.error(error);
    return rejectWithValue({ message: 'Login: Unexpected Error' });
  }
});

export const register = createAsyncThunk(
  'acocunt/register',
  async (data: NewAccountData, { dispatch, rejectWithValue }) => {
    let userCredential = null;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
      await sendEmailVerification(userCredential.user);
    } catch (error) {
      const errorMessage = getFirebaseAuthErrorMessage(
        error as FirebaseError,
        'An unknown error occurred during registration. Please try again.',
      );
      dispatch(
        showActivityNotification({
          message: errorMessage,
          type: ActivityNotificationType.Error,
        }),
      );
      return rejectWithValue({ message: errorMessage });
    }

    try {
      const response = await axiosInstance.post('/accounts', {
        email: data.email,
        uid: userCredential.user.uid,
        name: data.name,
      });
      const resgisterResult: Account = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(resgisterResult));
      dispatch(
        showActivityNotification({
          message: response.data.message || 'Success',
          type: ActivityNotificationType.Success,
        }),
      );

      initializeAccount(dispatch, resgisterResult);

      return resgisterResult;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          }),
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        }),
      );

      console.error(error);
      return rejectWithValue({ message: 'Register: Unexpected Error' });
    }
  },
);

export const googleLogin = createAsyncThunk('account/googleLogin', async (_, { dispatch, rejectWithValue }) => {
  let user = null;
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    user = result.user;
  } catch (error) {
    const errorMessage = getFirebaseAuthErrorMessage(
      error as FirebaseError,
      'An unknown error occurred during Google login. Please try again.',
    );
    dispatch(
      showActivityNotification({
        message: errorMessage,
        type: ActivityNotificationType.Error,
      }),
    );
    return rejectWithValue({ message: errorMessage });
  }

  try {
    const response = await axiosInstance.post('/googleLogin', {
      email: user.email,
      uid: user.uid,
      name: user.displayName,
      photoURL: user.photoURL,
    });
    const googleResult: Account = response.data.result;

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(googleResult));
    dispatch(
      showActivityNotification({
        message: response.data.message || 'Success',
        type: ActivityNotificationType.Success,
      }),
    );

    initializeAccount(dispatch, googleResult);

    return googleResult;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorResponse = error.response.data;
      dispatch(
        showActivityNotification({
          message: errorResponse.message,
          type: ActivityNotificationType.Error,
        }),
      );
      return rejectWithValue(errorResponse);
    }
    dispatch(
      showActivityNotification({
        message: 'An error occurred',
        type: ActivityNotificationType.Error,
      }),
    );

    console.error(error);
    return rejectWithValue({ message: 'Register: Unexpected Error' });
  }
});

export const logout = createAsyncThunk('account/logout', async (_, { dispatch, rejectWithValue }) => {
  try {
    await signOut(auth);

    localStorage.removeItem(ACCOUNT_KEY);
    dispatch(
      showActivityNotification({
        message: 'Successfully logged out',
        type: ActivityNotificationType.Success,
      }),
    );

    return;
  } catch (error) {
    const errorMessage = getFirebaseAuthErrorMessage(
      error as FirebaseError,
      'An unknown error occurred during logout. Please try again.',
    );
    dispatch(
      showActivityNotification({
        message: errorMessage,
        type: ActivityNotificationType.Error,
      }),
    );
    return rejectWithValue({ message: errorMessage });
  }
});

export const updateAccountImage = createAsyncThunk(
  'account/updateImage',
  async ({ accountId, file }: { accountId: string; file: File }, { dispatch, rejectWithValue }) => {
    try {
      const formData: FormData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(`/upload/accounts/${accountId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(result));
      dispatch(
        showActivityNotification({
          message: `Account image updated successfully`,
          type: ActivityNotificationType.Success,
        }),
      );
      return result;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          }),
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        }),
      );
      console.error(error);
      return rejectWithValue({ message: 'UpdateImage: Unexpected Error' });
    }
  },
);

export const verifyEmail = createAsyncThunk(
  'account/verifyEmail',
  async (user: User, { dispatch, rejectWithValue }) => {
    try {
      await sendEmailVerification(user);
      dispatch(
        showActivityNotification({
          message: `Verification email sent`,
          type: ActivityNotificationType.Success,
        }),
      );
    } catch (error) {
      const errorMessage = getFirebaseAuthErrorMessage(
        error as FirebaseError,
        'An unknown error occurred changing the password. Please try again.',
      );
      dispatch(
        showActivityNotification({
          message: errorMessage,
          type: ActivityNotificationType.Error,
        }),
      );
      return rejectWithValue({ message: errorMessage });
    }
  },
);

export const updateAccount = createAsyncThunk(
  'account/update',
  async (
    {
      account_id,
      account_name,
      default_profile_id,
    }: { account_id: string; account_name: string; default_profile_id: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.put(`/accounts/${account_id}/`, { account_name, default_profile_id });
      const updateResult = response.data.result;
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updateResult));
      dispatch(
        showActivityNotification({
          message: `Account edited successfully`,
          type: ActivityNotificationType.Success,
        }),
      );
      return updateResult;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          }),
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        }),
      );
      console.error(error);
      return rejectWithValue({ message: 'Update Account: Unexpected Error' });
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
      .addCase(googleLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Google Login Failed';
        } else {
          state.error = action.error.message || 'Google Login Failed';
        }
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
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
      })
      .addCase(updateAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Account Update Failed';
        } else {
          state.error = action.error.message || 'Account Update Failed';
        }
      });
  },
});

export const selectCurrentAccount = (state: RootState) => state.auth.account;

export default authSlice.reducer;
