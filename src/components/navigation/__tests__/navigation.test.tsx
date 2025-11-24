import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Navigation from '../navigation';
import accountSlice from '../../../app/slices/accountSlice';
import activeProfileSlice from '../../../app/slices/activeProfileSlice';
import profilesSlice from '../../../app/slices/profilesSlice';
import systemNotificationsSlice from '../../../app/slices/systemNotificationsSlice';
import { Profile } from '@ajgifford/keepwatching-types';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the notification component
jest.mock('../../notification/notificationIconDropdown', () => {
  return function NotificationIconDropdown() {
    return <div data-testid="notification-dropdown">Notifications</div>;
  };
});

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useMediaQuery to control mobile/desktop view
const mockUseMediaQuery = jest.fn();
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mockUseMediaQuery(),
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  signOut: jest.fn(() => Promise.resolve()),
}));

// Mock axios instance
jest.mock('../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    post: jest.fn(() => Promise.resolve({ data: { message: 'Success' } })),
    get: jest.fn(() =>
      Promise.resolve({
        data: {
          profileWithContent: {
            profile: { id: 2, accountId: 1, name: 'Second Profile', image: 'profile2.png' },
            shows: [],
            episodes: { upcomingEpisodes: [], recentEpisodes: [], nextUnwatchedEpisodes: [] },
            movies: [],
            recentUpcomingMovies: { recentMovies: [], upcomingMovies: [] },
          },
        },
      })
    ),
    put: jest.fn(() => Promise.resolve({ data: { message: 'Success' } })),
    delete: jest.fn(() => Promise.resolve({ data: { message: 'Success' } })),
  },
}));

const mockProfile: Profile = {
  id: 1,
  accountId: 1,
  name: 'Test Profile',
  image: 'profile1.png',
};

const mockProfile2: Profile = {
  id: 2,
  accountId: 1,
  name: 'Second Profile',
  image: 'profile2.png',
};

const mockAccount = {
  id: 1,
  uid: 'test-uid-123',
  email: 'test@example.com',
  name: 'Test User',
  image: '',
  defaultProfileId: 1,
  createdAt: new Date('2024-01-01'),
};

const createMockStore = (
  account: typeof mockAccount | null = mockAccount,
  activeProfile: Profile | null = mockProfile,
  profiles: Profile[] = [mockProfile, mockProfile2]
) => {
  return configureStore({
    reducer: {
      auth: accountSlice,
      activeProfile: activeProfileSlice,
      profiles: profilesSlice,
      systemNotifications: systemNotificationsSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for tests to avoid Date serialization warnings
      }),
    preloadedState: {
      auth: {
        account,
        loading: false,
        error: null,
      },
      activeProfile: {
        profile: activeProfile,
        shows: [],
        showGenres: [],
        showStreamingServices: [],
        upcomingEpisodes: [],
        recentEpisodes: [],
        nextUnwatchedEpisodes: [],
        movies: [],
        movieGenres: [],
        movieStreamingServices: [],
        recentMovies: [],
        upcomingMovies: [],
        milestoneStats: null,
        lastUpdated: null,
        loading: false,
        error: null,
      },
      profiles: {
        ids: profiles.map((p) => p.id),
        entities: profiles.reduce(
          (acc, p) => {
            acc[p.id] = p;
            return acc;
          },
          {} as Record<number, Profile>
        ),
        loading: false,
        error: null,
      },
      systemNotifications: {
        ids: [],
        entities: {},
        unreadCount: 0,
        loading: false,
        error: null,
      },
    },
  });
};

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/home']) => {
  return render(<MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>);
};

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(false); // Default to desktop view
  });

  describe('rendering with account', () => {
    it('renders the app name', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      expect(screen.getByText('KeepWatching')).toBeInTheDocument();
    });

    it('renders navigation buttons when user is logged in', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /shows/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /movies/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /discover/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
    });

    it('does not render navigation buttons when user is not logged in', () => {
      const store = createMockStore(null, null, []);
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /shows/i })).not.toBeInTheDocument();
    });

    it('renders notification control when profile exists', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    });

    it('does not render notification control when no active profile', () => {
      const store = createMockStore(mockAccount, null, []);
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('profile menu', () => {
    it('renders profile avatar when profile exists', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatar = screen.getByAltText('Test Profile');
      expect(avatar).toBeInTheDocument();
    });

    it('opens profile menu when avatar is clicked', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatarButton = screen.getByAltText('Test Profile').closest('button');
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Switch Profile')).toBeInTheDocument();
      });
    });

    it('displays all profiles in the profile menu', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatarButton = screen.getByAltText('Test Profile').closest('button');
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
        expect(screen.getByText('Second Profile')).toBeInTheDocument();
      });
    });

    it('displays Manage Account menu item', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatarButton = screen.getByAltText('Test Profile').closest('button');
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Manage Account')).toBeInTheDocument();
      });
    });

    it('displays Logout menu item', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatarButton = screen.getByAltText('Test Profile').closest('button');
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('navigates to /home when profile is switched', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatarButton = screen.getByAltText('Test Profile').closest('button');
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        const secondProfileMenuItem = screen.getByText('Second Profile');
        fireEvent.click(secondProfileMenuItem);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });

    it('navigates to /manageAccount when Manage Account is clicked', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatarButton = screen.getByAltText('Test Profile').closest('button');
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        const manageAccountItem = screen.getByText('Manage Account');
        fireEvent.click(manageAccountItem);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/manageAccount');
    });

    it('dispatches logout action and navigates to /login when Logout is clicked', async () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatarButton = screen.getByAltText('Test Profile').closest('button');
      fireEvent.click(avatarButton!);

      await waitFor(() => {
        const logoutItem = screen.getByText('Logout');
        fireEvent.click(logoutItem);
      });

      // Wait for async operations to complete
      await waitFor(
        () => {
          expect(dispatchSpy).toHaveBeenCalled();
          expect(mockNavigate).toHaveBeenCalledWith('/login');
        },
        { timeout: 3000 }
      );
    });
  });

  describe('mobile view', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true); // Set to mobile view
    });

    it('renders mobile menu button when in mobile view', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const menuButton = screen.getByLabelText('menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('disables mobile menu button when user is not logged in', () => {
      const store = createMockStore(null, null, []);
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const menuButton = screen.getByLabelText('menu');
      expect(menuButton).toBeDisabled();
    });

    it('opens mobile menu when menu button is clicked', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        // Check for menu items in mobile menu
        const homeItems = screen.getAllByText('Home');
        expect(homeItems.length).toBeGreaterThan(0);
      });
    });

    it('navigates to page and closes menu when menu item is clicked', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        const menuItems = screen.getAllByText('Shows');
        // Find the mobile menu item (not the desktop button)
        const mobileMenuItem = menuItems.find((item) => item.closest('[role="menuitem"]'));
        if (mobileMenuItem) {
          fireEvent.click(mobileMenuItem);
        }
      });

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('desktop view', () => {
    it('does not render mobile menu button in desktop view', () => {
      mockUseMediaQuery.mockReturnValue(false);
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const menuButton = screen.queryByLabelText('menu');
      expect(menuButton).not.toBeInTheDocument();
    });

    it('renders navigation buttons as NavLinks', () => {
      mockUseMediaQuery.mockReturnValue(false);
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const homeButton = screen.getByRole('link', { name: /home/i });
      expect(homeButton).toBeInTheDocument();
      expect(homeButton.tagName).toBe('A'); // NavLink renders as an anchor
    });
  });

  describe('navigation items', () => {
    it('has correct route for home navigation', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const homeButton = screen.getByRole('link', { name: /home/i });
      expect(homeButton).toHaveAttribute('href', '/home');
    });

    it('has correct route with query params for shows navigation', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const showsButton = screen.getByRole('link', { name: /shows/i });
      expect(showsButton).toHaveAttribute(
        'href',
        '/shows?watchStatus=UNAIRED%2CNOT_WATCHED%2CWATCHING%2CUP_TO_DATE'
      );
    });

    it('has correct route with query params for movies navigation', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const moviesButton = screen.getByRole('link', { name: /movies/i });
      expect(moviesButton).toHaveAttribute('href', '/movies?watchStatus=UNAIRED%2CNOT_WATCHED');
    });

    it('has correct route for discover navigation', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const discoverButton = screen.getByRole('link', { name: /discover/i });
      expect(discoverButton).toHaveAttribute('href', '/discover');
    });

    it('has correct route for search navigation', () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const searchButton = screen.getByRole('link', { name: /search/i });
      expect(searchButton).toHaveAttribute('href', '/search');
    });
  });

  describe('tooltip behavior', () => {
    it('shows profile name in tooltip on hover', async () => {
      const store = createMockStore();
      renderWithRouter(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const avatarButton = screen.getByAltText('Test Profile').closest('button');
      fireEvent.mouseOver(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText('Active Profile: Test Profile')).toBeInTheDocument();
      });
    });
  });
});
