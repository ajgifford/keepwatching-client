import { act, render, screen, waitFor } from '@testing-library/react';

import ActivityNotificationBar from '../activityNotificationBar';
import userEvent from '@testing-library/user-event';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockState),
}));

let mockState: {
  activityNotification: {
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
} = {
  activityNotification: {
    open: false,
    message: '',
    type: 'success',
  },
};

describe('ActivityNotificationBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockState = {
      activityNotification: {
        open: false,
        message: '',
        type: 'success',
      },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic rendering', () => {
    it('should not show snackbar when open is false', () => {
      render(<ActivityNotificationBar />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show snackbar when open is true', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test notification',
        type: 'success',
      };

      render(<ActivityNotificationBar />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should display the notification message', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test notification message',
        type: 'success',
      };

      render(<ActivityNotificationBar />);

      expect(screen.getByText('Test notification message')).toBeInTheDocument();
    });
  });

  describe('severity types', () => {
    it('should render success severity', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Success message',
        type: 'success',
      };

      const { container } = render(<ActivityNotificationBar />);

      const alert = container.querySelector('.MuiAlert-filledSuccess');
      expect(alert).toBeInTheDocument();
    });

    it('should render error severity', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Error message',
        type: 'error',
      };

      const { container } = render(<ActivityNotificationBar />);

      const alert = container.querySelector('.MuiAlert-filledError');
      expect(alert).toBeInTheDocument();
    });

    it('should render warning severity', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Warning message',
        type: 'warning',
      };

      const { container } = render(<ActivityNotificationBar />);

      const alert = container.querySelector('.MuiAlert-filledWarning');
      expect(alert).toBeInTheDocument();
    });

    it('should render info severity', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Info message',
        type: 'info',
      };

      const { container } = render(<ActivityNotificationBar />);

      const alert = container.querySelector('.MuiAlert-filledInfo');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('close functionality', () => {
    it('should dispatch hideActivityNotification when close button clicked', async () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test notification',
        type: 'success',
      };

      const user = userEvent.setup({ delay: null });
      render(<ActivityNotificationBar />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('hideActivityNotification'),
        })
      );
    });

    it('should auto-hide after 3500ms', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test notification',
        type: 'success',
      };

      render(<ActivityNotificationBar />);

      act(() => {
        jest.advanceTimersByTime(3500);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('hideActivityNotification'),
        })
      );
    });

    it('should not hide on clickaway', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test notification',
        type: 'success',
      };

      const { container } = render(<ActivityNotificationBar />);

      // Simulate clickaway by clicking outside
      const outsideElement = container.parentElement;
      if (outsideElement) {
        outsideElement.click();
      }

      // Should not dispatch hide action
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('layout and styling', () => {
    it('should render Snackbar component', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test message',
        type: 'success',
      };

      const { container } = render(<ActivityNotificationBar />);

      const snackbar = container.querySelector('.MuiSnackbar-root');
      expect(snackbar).toBeInTheDocument();
    });

    it('should render Alert component', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test message',
        type: 'success',
      };

      const { container } = render(<ActivityNotificationBar />);

      const alert = container.querySelector('.MuiAlert-root');
      expect(alert).toBeInTheDocument();
    });

    it('should render Stack component', () => {
      const { container } = render(<ActivityNotificationBar />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });

    it('should position snackbar at top center', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test message',
        type: 'success',
      };

      const { container } = render(<ActivityNotificationBar />);

      const snackbar = container.querySelector('.MuiSnackbar-anchorOriginTopCenter');
      expect(snackbar).toBeInTheDocument();
    });

    it('should render alert with filled variant', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test message',
        type: 'success',
      };

      const { container } = render(<ActivityNotificationBar />);

      const alert = container.querySelector('.MuiAlert-filled');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      mockState.activityNotification = {
        open: true,
        message: '',
        type: 'success',
      };

      render(<ActivityNotificationBar />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('');
    });

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(500);
      mockState.activityNotification = {
        open: true,
        message: longMessage,
        type: 'success',
      };

      render(<ActivityNotificationBar />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test <b>HTML</b> & "Special" chars!',
        type: 'success',
      };

      render(<ActivityNotificationBar />);

      expect(screen.getByText('Test <b>HTML</b> & "Special" chars!')).toBeInTheDocument();
    });

    it('should handle multiple state updates', async () => {
      mockState.activityNotification = {
        open: true,
        message: 'First message',
        type: 'success',
      };

      const { rerender } = render(<ActivityNotificationBar />);

      expect(screen.getByText('First message')).toBeInTheDocument();

      mockState.activityNotification = {
        open: true,
        message: 'Second message',
        type: 'error',
      };

      rerender(<ActivityNotificationBar />);

      expect(screen.getByText('Second message')).toBeInTheDocument();
    });

    it('should handle rapid open/close cycles', async () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test message',
        type: 'success',
      };

      const { rerender } = render(<ActivityNotificationBar />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      mockState.activityNotification = {
        open: false,
        message: 'Test message',
        type: 'success',
      };

      rerender(<ActivityNotificationBar />);

      // Snackbar has exit animation, wait for it to complete
      await waitFor(
        () => {
          expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('accessibility', () => {
    it('should have role="alert" for screen readers', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test message',
        type: 'success',
      };

      render(<ActivityNotificationBar />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have close button with accessible name', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test message',
        type: 'success',
      };

      render(<ActivityNotificationBar />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      render(<ActivityNotificationBar />);

      const { container } = render(<ActivityNotificationBar />);
      expect(container).toBeInTheDocument();
    });

    it('should handle unmounting while open', () => {
      mockState.activityNotification = {
        open: true,
        message: 'Test message',
        type: 'success',
      };

      const { unmount } = render(<ActivityNotificationBar />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      unmount();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
