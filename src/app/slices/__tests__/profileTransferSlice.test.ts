import axiosInstance from '../../api/axiosInstance';
import { createMockStore } from '../../testUtils';
import {
  cancelProfileTransferInvitation,
  fetchProfileTransferInvitations,
  inviteProfileTransfer,
  selectPendingProfileTransferInvitationByProfileId,
  selectProfileTransferInvitations,
} from '../profileTransferSlice';
import { ProfileTransferInvitation } from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';

function mockAxiosRejection(data: ApiErrorResponse) {
  const { AxiosError } = jest.requireActual('axios');
  const axiosError = new AxiosError('Request failed');
  axiosError.response = { data } as any;
  return axiosError;
}

jest.mock('../../api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('profileTransferSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockInvitation: ProfileTransferInvitation = {
    id: 1,
    profileId: 10,
    profileName: "Jamie's Profile",
    sourceAccountId: 5,
    sourceAccountName: 'The Smith Family',
    targetEmail: 'jamie@example.com',
    targetName: 'Jamie',
    newDefaultProfileId: null,
    status: 'pending',
    expiresAt: '2026-07-19T00:00:00.000Z',
    claimedAt: null,
    createdAt: '2026-07-12T00:00:00.000Z',
  };

  describe('fetchProfileTransferInvitations', () => {
    it('should fetch invitations successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { invitations: [mockInvitation] } });

      const store = createMockStore();
      await store.dispatch(fetchProfileTransferInvitations(5));

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/accounts/5/transferInvitations');
      expect(selectProfileTransferInvitations(store.getState())).toEqual([mockInvitation]);
      expect(store.getState().profileTransfer.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(mockAxiosRejection({ message: 'Failed to fetch' }));

      const store = createMockStore();
      await store.dispatch(fetchProfileTransferInvitations(5));

      expect(store.getState().profileTransfer.error?.message).toBe('Failed to fetch');
    });
  });

  describe('inviteProfileTransfer', () => {
    it('should create an invitation successfully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { invitation: mockInvitation } });

      const store = createMockStore();
      await store.dispatch(
        inviteProfileTransfer({ accountId: 5, profileId: 10, request: { targetEmail: 'jamie@example.com' } })
      );

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/accounts/5/profiles/10/transferInvitations', {
        targetEmail: 'jamie@example.com',
      });
      expect(selectProfileTransferInvitations(store.getState())).toContainEqual(mockInvitation);
    });

    it('should handle invite error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        mockAxiosRejection({ message: 'A pending invitation already exists' })
      );

      const store = createMockStore();
      await store.dispatch(
        inviteProfileTransfer({ accountId: 5, profileId: 10, request: { targetEmail: 'jamie@example.com' } })
      );

      expect(store.getState().profileTransfer.error?.message).toBe('A pending invitation already exists');
    });
  });

  describe('cancelProfileTransferInvitation', () => {
    it('should remove the canceled invitation from state', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({});

      const store = createMockStore({
        profileTransfer: { invitations: [mockInvitation], loading: false, error: null },
      });
      await store.dispatch(cancelProfileTransferInvitation({ accountId: 5, invitationId: 1 }));

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/accounts/5/transferInvitations/1');
      expect(selectProfileTransferInvitations(store.getState())).toEqual([]);
    });

    it('should handle cancel error without removing the invitation', async () => {
      mockAxiosInstance.delete.mockRejectedValueOnce(
        mockAxiosRejection({ message: 'Only pending invitations can be canceled' })
      );

      const store = createMockStore({
        profileTransfer: { invitations: [mockInvitation], loading: false, error: null },
      });
      await store.dispatch(cancelProfileTransferInvitation({ accountId: 5, invitationId: 1 }));

      expect(store.getState().profileTransfer.error?.message).toBe('Only pending invitations can be canceled');
      expect(selectProfileTransferInvitations(store.getState())).toEqual([mockInvitation]);
    });
  });

  describe('selectPendingProfileTransferInvitationByProfileId', () => {
    it('returns the pending invitation for a profile', () => {
      const store = createMockStore({
        profileTransfer: { invitations: [mockInvitation], loading: false, error: null },
      });

      expect(selectPendingProfileTransferInvitationByProfileId(store.getState(), 10)).toEqual(mockInvitation);
    });

    it('returns undefined when there is no pending invitation for the profile', () => {
      const store = createMockStore({
        profileTransfer: { invitations: [{ ...mockInvitation, status: 'claimed' }], loading: false, error: null },
      });

      expect(selectPendingProfileTransferInvitationByProfileId(store.getState(), 10)).toBeUndefined();
    });
  });
});
