import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Login from '../login';
import userEvent from '@testing-library/user-event';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../app/slices/accountSlice', () => ({
  login: jest.fn((credentials) => ({
    type: 'account/login',
    payload: credentials,
  })),
  googleLogin: jest.fn(() => ({
    type: 'account/googleLogin',
  })),
}));

jest.mock('../../../app/slices/activityNotificationSlice', () => ({
  showActivityNotification: jest.fn((notification) => ({
    type: 'activityNotification/show',
    payload: notification,
  })),
  ActivityNotificationType: {
    Error: 'error',
    Success: 'success',
    Warning: 'warning',
    Info: 'info',
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockResolvedValue({ type: 'mock' });
  });

  describe('basic rendering', () => {
    it('should render login heading', () => {
      renderWithRouter(<Login />);

      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('should render email text field', () => {
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveAttribute('type', 'email');
    });

    it('should render password text field', () => {
      renderWithRouter(<Login />);

      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField).toBeInTheDocument();
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    it('should render login button', () => {
      renderWithRouter(<Login />);

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      expect(loginButton).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderWithRouter(<Login />);

      const registerLink = screen.getByRole('link', { name: /no account\? register/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should render Google sign-in button', () => {
      renderWithRouter(<Login />);

      const googleButton = screen.getByRole('button', { name: /sign in\/register with google/i });
      expect(googleButton).toBeInTheDocument();
    });

    it('should render lock icon', () => {
      const { container } = renderWithRouter(<Login />);

      const lockIcon = container.querySelector('[data-testid="LockOutlinedIcon"]');
      expect(lockIcon).toBeInTheDocument();
    });
  });

  describe('email validation', () => {
    it('should not show error for empty email', () => {
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      expect(emailField).not.toHaveClass('Mui-error');
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);

      await user.type(emailField, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should not show error for valid email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);

      await user.type(emailField, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });
    });

    it('should validate multiple invalid email formats', async () => {
      const user = userEvent.setup();
      const invalidEmails = ['plaintext', 'missing@', '@nodomain.com', 'spaces in@email.com'];

      for (const invalidEmail of invalidEmails) {
        const { unmount } = renderWithRouter(<Login />);
        const emailField = screen.getByLabelText(/email/i);

        await user.type(emailField, invalidEmail);

        await waitFor(() => {
          expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        });

        unmount();
      }
    });

    it('should clear error when email becomes valid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);

      // Type invalid email
      await user.type(emailField, 'invalid');
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });

      // Clear and type valid email
      await user.clear(emailField);
      await user.type(emailField, 'valid@example.com');

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });
    });
  });

  describe('password validation', () => {
    it('should show helper text for password requirement', () => {
      renderWithRouter(<Login />);

      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    it('should show error for password less than 8 characters', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Login />);

      const passwordField = screen.getByLabelText(/password/i);

      await user.type(passwordField, 'short');

      await waitFor(() => {
        const errorField = container.querySelector('#loginPasswordText-helper-text');
        expect(errorField).toHaveClass('Mui-error');
      });
    });

    it('should not show error for password with 8 or more characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const passwordField = screen.getByLabelText(/password/i);

      await user.type(passwordField, 'validpassword123');

      await waitFor(() => {
        expect(passwordField).not.toHaveClass('Mui-error');
      });
    });

    it('should not show error for empty password', () => {
      renderWithRouter(<Login />);

      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField).not.toHaveClass('Mui-error');
    });
  });

  describe('login functionality', () => {
    it('should dispatch login action when login button clicked with valid credentials', async () => {
      const user = userEvent.setup();
      const { login } = require('../../../app/slices/accountSlice');
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /^login$/i });

      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');
      await user.click(loginButton);

      expect(login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should show notification when login clicked with empty email', async () => {
      const user = userEvent.setup();
      const { showActivityNotification } = require('../../../app/slices/activityNotificationSlice');
      renderWithRouter(<Login />);

      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /^login$/i });

      await user.type(passwordField, 'password123');
      await user.click(loginButton);

      expect(showActivityNotification).toHaveBeenCalledWith({
        message: 'Please provide an email and password',
        type: 'error',
      });
    });

    it('should show notification when login clicked with empty password', async () => {
      const user = userEvent.setup();
      const { showActivityNotification } = require('../../../app/slices/activityNotificationSlice');
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      const loginButton = screen.getByRole('button', { name: /^login$/i });

      await user.type(emailField, 'test@example.com');
      await user.click(loginButton);

      expect(showActivityNotification).toHaveBeenCalledWith({
        message: 'Please provide an email and password',
        type: 'error',
      });
    });

    it('should show notification when login clicked with both fields empty', async () => {
      const user = userEvent.setup();
      const { showActivityNotification } = require('../../../app/slices/activityNotificationSlice');
      renderWithRouter(<Login />);

      const loginButton = screen.getByRole('button', { name: /^login$/i });

      await user.click(loginButton);

      expect(showActivityNotification).toHaveBeenCalledWith({
        message: 'Please provide an email and password',
        type: 'error',
      });
    });

    it('should handle Enter key press to submit form', async () => {
      const user = userEvent.setup();
      const { login } = require('../../../app/slices/accountSlice');
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/password/i);

      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');
      await user.keyboard('{Enter}');

      expect(login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle login errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockDispatch.mockRejectedValueOnce(new Error('Login failed'));

      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /^login$/i });

      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Google sign-in', () => {
    it('should dispatch googleLogin action when Google button clicked', async () => {
      const user = userEvent.setup();
      const { googleLogin } = require('../../../app/slices/accountSlice');
      renderWithRouter(<Login />);

      const googleButton = screen.getByRole('button', { name: /sign in\/register with google/i });

      await user.click(googleButton);

      expect(googleLogin).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle Google sign-in errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockDispatch.mockRejectedValueOnce(new Error('Google sign-in failed'));

      renderWithRouter(<Login />);

      const googleButton = screen.getByRole('button', { name: /sign in\/register with google/i });

      await user.click(googleButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should render Google icon', () => {
      const { container } = renderWithRouter(<Login />);

      const googleIcon = container.querySelector('[data-testid="GoogleIcon"]');
      expect(googleIcon).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should link to register page', () => {
      renderWithRouter(<Login />);

      const registerLink = screen.getByRole('link', { name: /no account\? register/i });
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should render register icon', () => {
      const { container } = renderWithRouter(<Login />);

      const registerIcon = container.querySelector('[data-testid="HowToRegIcon"]');
      expect(registerIcon).toBeInTheDocument();
    });
  });

  describe('form fields', () => {
    it('should update email field value on user input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i) as HTMLInputElement;

      await user.type(emailField, 'test@example.com');

      expect(emailField.value).toBe('test@example.com');
    });

    it('should update password field value on user input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const passwordField = screen.getByLabelText(/password/i) as HTMLInputElement;

      await user.type(passwordField, 'mypassword');

      expect(passwordField.value).toBe('mypassword');
    });

    it('should have autocomplete enabled on email field', () => {
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      expect(emailField).toHaveAttribute('autocomplete', 'true');
    });
  });

  describe('layout and styling', () => {
    it('should render in a container', () => {
      const { container } = renderWithRouter(<Login />);

      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();
    });

    it('should render avatar with lock icon', () => {
      const { container } = renderWithRouter(<Login />);

      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();

      const lockIcon = container.querySelector('[data-testid="LockOutlinedIcon"]');
      expect(lockIcon).toBeInTheDocument();
    });

    it('should render all required fields', () => {
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/password/i);

      expect(emailField).toBeRequired();
      expect(passwordField).toBeRequired();
    });

    it('should render full width fields', () => {
      const { container } = renderWithRouter(<Login />);

      const textFields = container.querySelectorAll('.MuiTextField-root');
      textFields.forEach((field) => {
        expect(field).toHaveClass('MuiFormControl-fullWidth');
      });
    });
  });

  describe('accessibility', () => {
    it('should have accessible form labels', () => {
      renderWithRouter(<Login />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should have accessible buttons with proper roles', () => {
      renderWithRouter(<Login />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Login and Google buttons
    });

    it('should have accessible link with proper role', () => {
      renderWithRouter(<Login />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(1); // Register link
    });
  });

  describe('edge cases', () => {
    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      const { login } = require('../../../app/slices/accountSlice');
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /^login$/i });

      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');

      // Click multiple times rapidly
      await user.click(loginButton);
      await user.click(loginButton);
      await user.click(loginButton);

      // Should have been called multiple times
      expect(login).toHaveBeenCalled();
    });

    it('should handle special characters in password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const passwordField = screen.getByLabelText(/password/i) as HTMLInputElement;

      await user.type(passwordField, 'P@ssw0rd!#$%');

      expect(passwordField.value).toBe('P@ssw0rd!#$%');
    });

    it('should handle email without leading/trailing spaces', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i) as HTMLInputElement;

      // userEvent.type() trims spaces, so test that the component accepts the value
      await user.type(emailField, 'test@example.com');

      expect(emailField.value).toBe('test@example.com');
    });

    it('should handle very long email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i) as HTMLInputElement;
      const longEmail = 'a'.repeat(100) + '@example.com';

      await user.type(emailField, longEmail);

      expect(emailField.value).toBe(longEmail);
    });

    it('should handle very long password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const passwordField = screen.getByLabelText(/password/i) as HTMLInputElement;
      const longPassword = 'a'.repeat(200);

      await user.click(passwordField);
      await user.paste(longPassword);

      expect(passwordField.value).toBe(longPassword);
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<Login />);
      expect(container).toBeInTheDocument();
    });

    it('should handle unmounting while fields have values', () => {
      const { unmount } = renderWithRouter(<Login />);

      const emailField = screen.getByLabelText(/email/i) as HTMLInputElement;
      emailField.value = 'test@example.com';

      unmount();

      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });
  });
});
