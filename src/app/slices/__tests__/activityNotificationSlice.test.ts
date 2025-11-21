import activityNotificationReducer, {
  ActivityNotificationType,
  hideActivityNotification,
  showActivityNotification,
} from '../activityNotificationSlice';

describe('activityNotificationSlice', () => {
  const initialState = {
    open: false,
    message: '',
    type: ActivityNotificationType.Success,
  };

  it('should return the initial state', () => {
    expect(activityNotificationReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('showActivityNotification', () => {
    it('should show success notification', () => {
      const actual = activityNotificationReducer(
        initialState,
        showActivityNotification({
          message: 'Success message',
          type: ActivityNotificationType.Success,
        })
      );
      expect(actual.open).toBe(true);
      expect(actual.message).toBe('Success message');
      expect(actual.type).toBe(ActivityNotificationType.Success);
    });

    it('should show error notification', () => {
      const actual = activityNotificationReducer(
        initialState,
        showActivityNotification({
          message: 'Error message',
          type: ActivityNotificationType.Error,
        })
      );
      expect(actual.open).toBe(true);
      expect(actual.message).toBe('Error message');
      expect(actual.type).toBe(ActivityNotificationType.Error);
    });

    it('should show warning notification', () => {
      const actual = activityNotificationReducer(
        initialState,
        showActivityNotification({
          message: 'Warning message',
          type: ActivityNotificationType.Warning,
        })
      );
      expect(actual.open).toBe(true);
      expect(actual.message).toBe('Warning message');
      expect(actual.type).toBe(ActivityNotificationType.Warning);
    });

    it('should show info notification', () => {
      const actual = activityNotificationReducer(
        initialState,
        showActivityNotification({
          message: 'Info message',
          type: ActivityNotificationType.Info,
        })
      );
      expect(actual.open).toBe(true);
      expect(actual.message).toBe('Info message');
      expect(actual.type).toBe(ActivityNotificationType.Info);
    });

    it('should replace existing notification', () => {
      const existingState = {
        open: true,
        message: 'Old message',
        type: ActivityNotificationType.Success,
      };
      const actual = activityNotificationReducer(
        existingState,
        showActivityNotification({
          message: 'New message',
          type: ActivityNotificationType.Error,
        })
      );
      expect(actual.open).toBe(true);
      expect(actual.message).toBe('New message');
      expect(actual.type).toBe(ActivityNotificationType.Error);
    });
  });

  describe('hideActivityNotification', () => {
    it('should hide notification and clear message', () => {
      const stateWithNotification = {
        open: true,
        message: 'Test message',
        type: ActivityNotificationType.Success,
      };
      const actual = activityNotificationReducer(stateWithNotification, hideActivityNotification());
      expect(actual.open).toBe(false);
      expect(actual.message).toBe('');
      expect(actual.type).toBe(ActivityNotificationType.Success);
    });

    it('should handle hiding when already hidden', () => {
      const actual = activityNotificationReducer(initialState, hideActivityNotification());
      expect(actual.open).toBe(false);
      expect(actual.message).toBe('');
    });
  });
});
