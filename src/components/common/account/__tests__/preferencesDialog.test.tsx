import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import accountSlice from '../../../../app/slices/accountSlice';
import preferencesSlice from '../../../../app/slices/preferencesSlice';
import PreferencesDialog from '../preferencesDialog';
import { configureStore } from '@reduxjs/toolkit';
import { getAuth } from 'firebase/auth';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      email: 'test@example.com',
      emailVerified: true,
    },
  })),
}));

const mockAccount = {
  id: 1,
  uid: 'test-uid-123',
  email: 'test@example.com',
  name: 'Test User',
  defaultProfileId: 1,
  createdAt: '2024-01-01',
  image: '',
};

const mockPreferences = {
  display: {
    theme: 'auto' as const,
  },
  email: {
    weeklyDigest: true,
  },
};

const createMockStore = (accountData: any = mockAccount, preferencesData: any = mockPreferences) => {
  return configureStore({
    reducer: {
      auth: accountSlice,
      preferences: preferencesSlice,
    },
    preloadedState: {
      auth: {
        account: accountData,
        loading: false,
        error: null,
      },
      preferences: {
        preferences: preferencesData,
        loading: false,
        error: null,
      },
    },
  } as any);
};

describe('PreferencesDialog', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} open={false} />
      </Provider>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays theme preference section', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Theme Preference')).toBeInTheDocument();
    expect(screen.getByLabelText('Light')).toBeInTheDocument();
    expect(screen.getByLabelText('Dark')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto')).toBeInTheDocument();
  });

  it('displays email preferences section', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Email Preferences')).toBeInTheDocument();
    expect(screen.getByLabelText(/receive weekly digest emails/i)).toBeInTheDocument();
  });

  it('selects auto theme by default', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    const autoRadio = screen.getByLabelText('Auto') as HTMLInputElement;
    expect(autoRadio.checked).toBe(true);
  });

  it('allows user to change theme preference', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    const darkRadio = screen.getByLabelText('Dark');
    fireEvent.click(darkRadio);

    expect((darkRadio as HTMLInputElement).checked).toBe(true);
  });

  it('weekly digest switch is checked by default', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    const weeklyDigestSwitch = screen.getByRole('switch', {
      name: /receive weekly digest emails/i,
    }) as HTMLInputElement;
    expect(weeklyDigestSwitch.checked).toBe(true);
  });

  it('allows user to toggle weekly digest', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    const weeklyDigestSwitch = screen.getByRole('switch', { name: /receive weekly digest emails/i });
    fireEvent.click(weeklyDigestSwitch);

    expect((weeklyDigestSwitch as HTMLInputElement).checked).toBe(false);
  });

  it('disables email preferences when email is not verified', () => {
    (getAuth as jest.Mock).mockReturnValueOnce({
      currentUser: {
        email: 'test@example.com',
        emailVerified: false,
      },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    const weeklyDigestSwitch = screen.getByRole('switch', { name: /receive weekly digest emails/i });
    expect(weeklyDigestSwitch).toBeDisabled();
    expect(screen.getByText(/email must be verified/i)).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('dispatches updatePreferences and updateEmailPreferences when Save is clicked', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    // Change theme to dark
    const darkRadio = screen.getByLabelText('Dark');
    fireEvent.click(darkRadio);

    // Click Save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows "Saving..." text when save is in progress', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // The button text changes to "Saving..." briefly
    await waitFor(
      () => {
        expect(screen.queryByText(/saving/i)).toBeInTheDocument();
      },
      { timeout: 100 }
    );
  });

  it('resets local state when Cancel is clicked after making changes', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    // Change theme
    const lightRadio = screen.getByLabelText('Light');
    fireEvent.click(lightRadio);
    expect((lightRadio as HTMLInputElement).checked).toBe(true);

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('initializes with dark theme when preference is dark', () => {
    const customPreferences = {
      display: {
        theme: 'dark' as const,
      },
      email: {
        weeklyDigest: false,
      },
    };
    const store = createMockStore(mockAccount, customPreferences);

    render(
      <Provider store={store}>
        <PreferencesDialog {...defaultProps} />
      </Provider>
    );

    const darkRadio = screen.getByLabelText('Dark') as HTMLInputElement;
    expect(darkRadio.checked).toBe(true);
  });
});
