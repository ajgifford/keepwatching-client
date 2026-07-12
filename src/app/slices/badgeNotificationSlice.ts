import { BadgeCategory } from '../../components/common/achievements/badgeDefinitions';
import { RootState } from '../store';
import { BadgeTier } from '@ajgifford/keepwatching-types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface UnlockedBadgeSummary {
  id: string;
  category: BadgeCategory;
  tier: BadgeTier;
  title: string;
  achievedDate: string;
}

interface BadgeNotificationState {
  open: boolean;
  badge: UnlockedBadgeSummary | null;
  additionalCount: number;
}

type ShowBadgeUnlockNotification = {
  badge: UnlockedBadgeSummary;
  additionalCount: number;
};

const initialState: BadgeNotificationState = {
  open: false,
  badge: null,
  additionalCount: 0,
};

const badgeNotificationSlice = createSlice({
  name: 'badgeNotification',
  initialState,
  reducers: {
    showBadgeUnlockNotification: (state, action: PayloadAction<ShowBadgeUnlockNotification>) => {
      state.open = true;
      state.badge = action.payload.badge;
      state.additionalCount = action.payload.additionalCount;
    },
    hideBadgeUnlockNotification: (state) => {
      state.open = false;
    },
  },
});

export const { showBadgeUnlockNotification, hideBadgeUnlockNotification } = badgeNotificationSlice.actions;

export const selectBadgeNotificationOpen = (state: RootState) => state.badgeNotification.open;
export const selectBadgeNotificationBadge = (state: RootState) => state.badgeNotification.badge;
export const selectBadgeNotificationAdditionalCount = (state: RootState) => state.badgeNotification.additionalCount;

export default badgeNotificationSlice.reducer;
