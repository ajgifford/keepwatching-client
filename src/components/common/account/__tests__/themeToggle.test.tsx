import { screen, waitFor } from '@testing-library/react';

import axiosInstance from '../../../../app/api/axiosInstance';
import { renderWithProviders } from '../../../../app/testUtils';
import { ThemeToggle } from '../themeToggle';
import userEvent from '@testing-library/user-event';

// Mock axios
jest.mock('../../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
  },
}));

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('ThemeToggle', () => {
  const mockAccount = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  const createPreloadedState = (theme?: 'light' | 'dark' | 'auto') => ({
    auth: { account: mockAccount, loading: false, error: null },
    preferences: {
      preferences: theme ? { display: { theme } } : {},
      loading: false,
      error: null,
    },
    profiles: { profiles: [], loading: false, error: null },
    activeProfile: { activeProfile: null, loading: false, error: null },
    activeShow: { show: null, loading: false, error: null },
    activeMovie: { movie: null, loading: false, error: null },
    activityNotification: { open: false, message: '', type: 'success' as any },
    systemNotification: { systemNotifications: [], loading: false, error: null },
    personSearch: { results: [], personDetails: null, loading: false, error: null },
  });

  it('should render theme toggle with all options', () => {
    renderWithProviders(<ThemeToggle />, {
      preloadedState: createPreloadedState() as any,
    });

    expect(screen.getByText('Theme Preference')).toBeInTheDocument();
    expect(screen.getByLabelText('Light')).toBeInTheDocument();
    expect(screen.getByLabelText('Dark')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto')).toBeInTheDocument();
  });

  it('should have light theme selected by default', () => {
    renderWithProviders(<ThemeToggle />, {
      preloadedState: createPreloadedState('light') as any,
    });

    const lightRadio = screen.getByLabelText('Light') as HTMLInputElement;
    expect(lightRadio.checked).toBe(true);
  });

  it('should have dark theme selected when preference is dark', () => {
    renderWithProviders(<ThemeToggle />, {
      preloadedState: createPreloadedState('dark') as any,
    });

    const darkRadio = screen.getByLabelText('Dark') as HTMLInputElement;
    expect(darkRadio.checked).toBe(true);
  });

  it('should have auto theme selected when preference is auto', () => {
    renderWithProviders(<ThemeToggle />, {
      preloadedState: createPreloadedState('auto') as any,
    });

    const autoRadio = screen.getByLabelText('Auto') as HTMLInputElement;
    expect(autoRadio.checked).toBe(true);
  });

  it('should default to auto when no preferences', () => {
    renderWithProviders(<ThemeToggle />, {
      preloadedState: createPreloadedState() as any,
    });

    const autoRadio = screen.getByLabelText('Auto') as HTMLInputElement;
    expect(autoRadio.checked).toBe(true);
  });

  it('should allow selecting different theme', async () => {
    mockAxiosInstance.put.mockResolvedValueOnce({
      data: {
        preferences: {
          display: { theme: 'dark' },
        },
      },
    });

    const user = userEvent.setup();
    const { store } = renderWithProviders(<ThemeToggle />, {
      preloadedState: createPreloadedState('light') as any,
    });

    const darkRadio = screen.getByLabelText('Dark');
    await user.click(darkRadio);

    // Wait for the async action to complete
    await waitFor(() => {
      const state = store.getState();
      expect(state.preferences.preferences.display?.theme).toBe('dark');
    });

    expect((darkRadio as HTMLInputElement).checked).toBe(true);
  });
});
