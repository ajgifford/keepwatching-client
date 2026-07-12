import { RootState } from '../../store';
import badgeNotificationReducer, {
  UnlockedBadgeSummary,
  hideBadgeUnlockNotification,
  selectBadgeNotificationAdditionalCount,
  selectBadgeNotificationBadge,
  selectBadgeNotificationOpen,
  showBadgeUnlockNotification,
} from '../badgeNotificationSlice';

describe('badgeNotificationSlice', () => {
  const mockBadge: UnlockedBadgeSummary = {
    id: 'episodes-250',
    category: 'episodes',
    tier: 'silver',
    title: '250 Episodes Watched',
    achievedDate: '2026-07-11T00:00:00.000Z',
  };

  it('returns the initial state', () => {
    const state = badgeNotificationReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ open: false, badge: null, additionalCount: 0 });
  });

  describe('showBadgeUnlockNotification', () => {
    it('opens the notification with the given badge and additional count', () => {
      const state = badgeNotificationReducer(
        undefined,
        showBadgeUnlockNotification({ badge: mockBadge, additionalCount: 2 })
      );

      expect(state).toEqual({ open: true, badge: mockBadge, additionalCount: 2 });
    });

    it('overwrites an already-open notification in place rather than queueing', () => {
      const firstBadge: UnlockedBadgeSummary = { ...mockBadge, id: 'movies-5', title: '5 Movies Watched' };
      let state = badgeNotificationReducer(
        undefined,
        showBadgeUnlockNotification({ badge: firstBadge, additionalCount: 0 })
      );

      state = badgeNotificationReducer(state, showBadgeUnlockNotification({ badge: mockBadge, additionalCount: 1 }));

      expect(state).toEqual({ open: true, badge: mockBadge, additionalCount: 1 });
    });
  });

  describe('hideBadgeUnlockNotification', () => {
    it('closes the notification but keeps the last badge so the exit transition has content', () => {
      const openState = badgeNotificationReducer(
        undefined,
        showBadgeUnlockNotification({ badge: mockBadge, additionalCount: 0 })
      );

      const state = badgeNotificationReducer(openState, hideBadgeUnlockNotification());

      expect(state.open).toBe(false);
      expect(state.badge).toEqual(mockBadge);
    });
  });

  describe('selectors', () => {
    it('read open/badge/additionalCount from state', () => {
      const rootState = {
        badgeNotification: { open: true, badge: mockBadge, additionalCount: 3 },
      } as RootState;

      expect(selectBadgeNotificationOpen(rootState)).toBe(true);
      expect(selectBadgeNotificationBadge(rootState)).toEqual(mockBadge);
      expect(selectBadgeNotificationAdditionalCount(rootState)).toBe(3);
    });
  });
});
