import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import Register from '../register';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../app/slices/accountSlice', () => ({
  register: jest.fn((credentials) => ({
    type: 'account/register',
    payload: credentials,
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

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockResolvedValue({ type: 'mock' });
  });

  describe('basic rendering', () => {
    it('should render register heading', () => {
      renderWithRouter(<Register />);

      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    });

    it('should render name text field', () => {
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/name/i);
      expect(nameField).toBeInTheDocument();
      expect(nameField).toHaveAttribute('type', 'text');
    });

    it('should render email text field', () => {
      renderWithRouter(<Register />);

      const emailField = screen.getByLabelText(/email address/i);
      expect(emailField).toBeInTheDocument();
    });

    it('should render password text field', () => {
      renderWithRouter(<Register />);

      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField).toBeInTheDocument();
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    it('should render register button', () => {
      renderWithRouter(<Register />);

      const registerButton = screen.getByRole('button', { name: /register/i });
      expect(registerButton).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderWithRouter(<Register />);

      const loginLink = screen.getByRole('link', { name: /already have an account\? login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should render lock icon', () => {
      const { container } = renderWithRouter(<Register />);

      const lockIcon = container.querySelector('[data-testid="LockOutlinedIcon"]');
      expect(lockIcon).toBeInTheDocument();
    });
  });

  describe('name validation', () => {
    it('should show helper text for name requirement', () => {
      renderWithRouter(<Register />);

      expect(screen.getByText('Name must be 3 or more characters')).toBeInTheDocument();
    });

    it('should show error for name less than 3 characters', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);

      await user.type(nameField, 'ab');

      await waitFor(() => {
        const errorField = container.querySelector('#name-helper-text');
        expect(errorField).toHaveClass('Mui-error');
      });
    });

    it('should not show error for name with 3 or more characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);

      await user.type(nameField, 'John Doe');

      await waitFor(() => {
        expect(nameField).not.toHaveClass('Mui-error');
      });
    });

    it('should not show error for empty name', () => {
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      expect(nameField).not.toHaveClass('Mui-error');
    });

    it('should clear error when name becomes valid', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);

      // Type short name
      await user.type(nameField, 'ab');
      await waitFor(() => {
        const errorField = container.querySelector('#name-helper-text');
        expect(errorField).toHaveClass('Mui-error');
      });

      // Clear and type valid name
      await user.clear(nameField);
      await user.type(nameField, 'John');

      await waitFor(() => {
        expect(nameField).not.toHaveClass('Mui-error');
      });
    });
  });

  describe('email validation', () => {
    it('should not show error for empty email', () => {
      renderWithRouter(<Register />);

      const emailField = screen.getByLabelText(/email address/i);
      expect(emailField).not.toHaveClass('Mui-error');
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const emailField = screen.getByLabelText(/email address/i);

      await user.type(emailField, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should not show error for valid email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const emailField = screen.getByLabelText(/email address/i);

      await user.type(emailField, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });
    });

    it('should validate multiple invalid email formats', async () => {
      const user = userEvent.setup();
      const invalidEmails = ['plaintext', 'missing@', '@nodomain.com'];

      for (const invalidEmail of invalidEmails) {
        const { unmount } = renderWithRouter(<Register />);
        const emailField = screen.getByLabelText(/email address/i);

        await user.type(emailField, invalidEmail);

        await waitFor(() => {
          expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('password validation', () => {
    it('should show helper text for password requirement', () => {
      renderWithRouter(<Register />);

      expect(screen.getByText('Password must be 8 or more characters')).toBeInTheDocument();
    });

    it('should show error for password less than 8 characters', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Register />);

      const passwordField = screen.getByLabelText(/password/i);

      await user.type(passwordField, 'short');

      await waitFor(() => {
        const errorField = container.querySelector('#password-helper-text');
        expect(errorField).toHaveClass('Mui-error');
      });
    });

    it('should not show error for password with 8 or more characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const passwordField = screen.getByLabelText(/password/i);

      await user.type(passwordField, 'validpassword123');

      await waitFor(() => {
        expect(passwordField).not.toHaveClass('Mui-error');
      });
    });

    it('should not show error for empty password', () => {
      renderWithRouter(<Register />);

      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField).not.toHaveClass('Mui-error');
    });
  });

  describe('register functionality', () => {
    it('should dispatch register action when register button clicked with valid credentials', async () => {
      const user = userEvent.setup();
      const { register } = require('../../../app/slices/accountSlice');
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.type(nameField, 'John Doe');
      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');
      await user.click(registerButton);

      expect(register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should show notification when register clicked with empty name', async () => {
      const user = userEvent.setup();
      const { showActivityNotification } = require('../../../app/slices/activityNotificationSlice');
      renderWithRouter(<Register />);

      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');
      await user.click(registerButton);

      expect(showActivityNotification).toHaveBeenCalledWith({
        message: 'Please fill out all required fields',
        type: 'error',
      });
    });

    it('should show notification when register clicked with empty email', async () => {
      const user = userEvent.setup();
      const { showActivityNotification } = require('../../../app/slices/activityNotificationSlice');
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      const passwordField = screen.getByLabelText(/password/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.type(nameField, 'John Doe');
      await user.type(passwordField, 'password123');
      await user.click(registerButton);

      expect(showActivityNotification).toHaveBeenCalledWith({
        message: 'Please fill out all required fields',
        type: 'error',
      });
    });

    it('should show notification when register clicked with empty password', async () => {
      const user = userEvent.setup();
      const { showActivityNotification } = require('../../../app/slices/activityNotificationSlice');
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      const emailField = screen.getByLabelText(/email address/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.type(nameField, 'John Doe');
      await user.type(emailField, 'test@example.com');
      await user.click(registerButton);

      expect(showActivityNotification).toHaveBeenCalledWith({
        message: 'Please fill out all required fields',
        type: 'error',
      });
    });

    it('should show notification when register clicked with all fields empty', async () => {
      const user = userEvent.setup();
      const { showActivityNotification } = require('../../../app/slices/activityNotificationSlice');
      renderWithRouter(<Register />);

      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.click(registerButton);

      expect(showActivityNotification).toHaveBeenCalledWith({
        message: 'Please fill out all required fields',
        type: 'error',
      });
    });

    it('should handle Enter key press to submit form', async () => {
      const user = userEvent.setup();
      const { register } = require('../../../app/slices/accountSlice');
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);

      await user.type(nameField, 'John Doe');
      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');
      await user.keyboard('{Enter}');

      expect(register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle register errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockDispatch.mockRejectedValueOnce(new Error('Registration failed'));

      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.type(nameField, 'John Doe');
      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');
      await user.click(registerButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('navigation', () => {
    it('should link to login page', () => {
      renderWithRouter(<Register />);

      const loginLink = screen.getByRole('link', { name: /already have an account\? login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('form fields', () => {
    it('should update name field value on user input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i) as HTMLInputElement;

      await user.type(nameField, 'John Doe');

      expect(nameField.value).toBe('John Doe');
    });

    it('should update email field value on user input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const emailField = screen.getByLabelText(/email address/i) as HTMLInputElement;

      await user.type(emailField, 'test@example.com');

      expect(emailField.value).toBe('test@example.com');
    });

    it('should update password field value on user input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const passwordField = screen.getByLabelText(/password/i) as HTMLInputElement;

      await user.type(passwordField, 'mypassword');

      expect(passwordField.value).toBe('mypassword');
    });

    it('should have autocomplete enabled on fields', () => {
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      const emailField = screen.getByLabelText(/email address/i);

      expect(nameField).toHaveAttribute('autocomplete', 'true');
      expect(emailField).toHaveAttribute('autocomplete', 'true');
    });
  });

  describe('layout and styling', () => {
    it('should render in a container', () => {
      const { container } = renderWithRouter(<Register />);

      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();
    });

    it('should render avatar with lock icon', () => {
      const { container } = renderWithRouter(<Register />);

      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();

      const lockIcon = container.querySelector('[data-testid="LockOutlinedIcon"]');
      expect(lockIcon).toBeInTheDocument();
    });

    it('should render all required fields', () => {
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);

      expect(nameField).toBeRequired();
      expect(emailField).toBeRequired();
      expect(passwordField).toBeRequired();
    });

    it('should render full width fields', () => {
      const { container } = renderWithRouter(<Register />);

      const textFields = container.querySelectorAll('.MuiTextField-root');
      textFields.forEach((field) => {
        expect(field).toHaveClass('MuiFormControl-fullWidth');
      });
    });

    it('should render fields in a grid layout', () => {
      const { container } = renderWithRouter(<Register />);

      const grids = container.querySelectorAll('[class*="MuiGrid"]');
      expect(grids.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have accessible form labels', () => {
      renderWithRouter(<Register />);

      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should have accessible button with proper role', () => {
      renderWithRouter(<Register />);

      const button = screen.getByRole('button', { name: /register/i });
      expect(button).toBeInTheDocument();
    });

    it('should have accessible link with proper role', () => {
      renderWithRouter(<Register />);

      const link = screen.getByRole('link', { name: /already have an account\? login/i });
      expect(link).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      const { register } = require('../../../app/slices/accountSlice');
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i);
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.type(nameField, 'John Doe');
      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');

      // Click multiple times rapidly
      await user.click(registerButton);
      await user.click(registerButton);
      await user.click(registerButton);

      // Should have been called multiple times
      expect(register).toHaveBeenCalled();
    });

    it('should handle special characters in name', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i) as HTMLInputElement;

      await user.type(nameField, "O'Brien-Smith");

      expect(nameField.value).toBe("O'Brien-Smith");
    });

    it('should handle special characters in password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const passwordField = screen.getByLabelText(/password/i) as HTMLInputElement;

      await user.type(passwordField, 'P@ssw0rd!#$%');

      expect(passwordField.value).toBe('P@ssw0rd!#$%');
    });

    it('should handle very long name', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i) as HTMLInputElement;
      const longName = 'a'.repeat(100);

      await user.type(nameField, longName);

      expect(nameField.value).toBe(longName);
    });

    it('should handle very long email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const emailField = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const longEmail = 'a'.repeat(100) + '@example.com';

      await user.type(emailField, longEmail);

      expect(emailField.value).toBe(longEmail);
    });

    it('should handle very long password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);

      const passwordField = screen.getByLabelText(/password/i) as HTMLInputElement;
      const longPassword = 'a'.repeat(200);

      await user.click(passwordField);
      await user.paste(longPassword);

      expect(passwordField.value).toBe(longPassword);
    });

    it('should handle empty string submission', async () => {
      const user = userEvent.setup();
      const { showActivityNotification } = require('../../../app/slices/activityNotificationSlice');
      renderWithRouter(<Register />);

      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.click(registerButton);

      expect(showActivityNotification).toHaveBeenCalledWith({
        message: 'Please fill out all required fields',
        type: 'error',
      });
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<Register />);
      expect(container).toBeInTheDocument();
    });

    it('should handle unmounting while fields have values', () => {
      const { unmount } = renderWithRouter(<Register />);

      const nameField = screen.getByLabelText(/^name/i) as HTMLInputElement;
      nameField.value = 'John Doe';

      unmount();

      expect(screen.queryByLabelText(/^name/i)).not.toBeInTheDocument();
    });
  });
});
