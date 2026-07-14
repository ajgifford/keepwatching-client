import axiosInstance from '../api/axiosInstance';
import { RootState } from '../store';
import { deleteAccount, logout } from './accountSlice';
import { ActivityNotificationType, showActivityNotification } from './activityNotificationSlice';
import {
  CreateProfileTransferInvitationRequest,
  ProfileTransferInvitation,
  ProfileTransferInvitationResponse,
  ProfileTransferInvitationsResponse,
} from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

interface ProfileTransferState {
  invitations: ProfileTransferInvitation[];
  loading: boolean;
  error: ApiErrorResponse | null;
}

const initialState: ProfileTransferState = {
  invitations: [],
  loading: false,
  error: null,
};

export const fetchProfileTransferInvitations = createAsyncThunk<
  ProfileTransferInvitation[],
  number,
  { rejectValue: ApiErrorResponse }
>('profileTransfer/fetchInvitations', async (accountId: number, { rejectWithValue }) => {
  try {
    const response: AxiosResponse<ProfileTransferInvitationsResponse> = await axiosInstance.get(
      `/accounts/${accountId}/transferInvitations`
    );
    return response.data.invitations;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message);
    }
    return rejectWithValue({ message: 'An unknown error occurred' });
  }
});

export const inviteProfileTransfer = createAsyncThunk<
  ProfileTransferInvitation,
  { accountId: number; profileId: number; request: CreateProfileTransferInvitationRequest },
  { rejectValue: ApiErrorResponse }
>('profileTransfer/invite', async ({ accountId, profileId, request }, { dispatch, rejectWithValue }) => {
  try {
    const response: AxiosResponse<ProfileTransferInvitationResponse> = await axiosInstance.post(
      `/accounts/${accountId}/profiles/${profileId}/transferInvitations`,
      request
    );
    dispatch(
      showActivityNotification({
        message: `Invitation sent to ${request.targetEmail}`,
        type: ActivityNotificationType.Success,
      })
    );
    return response.data.invitation;
  } catch (error: unknown) {
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
    return rejectWithValue({ message: 'An unknown error occurred' });
  }
});

export const cancelProfileTransferInvitation = createAsyncThunk<
  number,
  { accountId: number; invitationId: number },
  { rejectValue: ApiErrorResponse }
>('profileTransfer/cancel', async ({ accountId, invitationId }, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/accounts/${accountId}/transferInvitations/${invitationId}`);
    dispatch(
      showActivityNotification({
        message: 'Invitation canceled',
        type: ActivityNotificationType.Success,
      })
    );
    return invitationId;
  } catch (error: unknown) {
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
    return rejectWithValue({ message: 'An unknown error occurred' });
  }
});

const profileTransferSlice = createSlice({
  name: 'profileTransfer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(deleteAccount.fulfilled, () => initialState)
      .addCase(fetchProfileTransferInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileTransferInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.invitations = action.payload;
      })
      .addCase(fetchProfileTransferInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Get Profile Transfer Invitations Failed' };
      })
      .addCase(inviteProfileTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteProfileTransfer.fulfilled, (state, action) => {
        state.loading = false;
        state.invitations.push(action.payload);
      })
      .addCase(inviteProfileTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Invite Profile Transfer Failed' };
      })
      .addCase(cancelProfileTransferInvitation.fulfilled, (state, action) => {
        state.invitations = state.invitations.filter((invitation) => invitation.id !== action.payload);
      })
      .addCase(cancelProfileTransferInvitation.rejected, (state, action) => {
        state.error = action.payload || { message: 'Cancel Profile Transfer Invitation Failed' };
      });
  },
});

export const selectProfileTransferInvitations = (state: RootState) => state.profileTransfer.invitations;
export const selectProfileTransferLoading = (state: RootState) => state.profileTransfer.loading;

export const selectPendingProfileTransferInvitationByProfileId = (state: RootState, profileId: number) =>
  state.profileTransfer.invitations.find(
    (invitation) => invitation.profileId === profileId && invitation.status === 'pending'
  );

export default profileTransferSlice.reducer;
