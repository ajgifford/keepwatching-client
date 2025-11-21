import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProfileCard } from '../profileCard';
import accountSlice from '../../../../app/slices/accountSlice';
import activeProfileSlice from '../../../../app/slices/activeProfileSlice';
import profilesSlice from '../../../../app/slices/profilesSlice';
import { Profile } from '@ajgifford/keepwatching-types';

const mockProfile: Profile = {
  id: 1,
  accountId: 1,
  name: 'Test Profile',
  image: 'https://placehold.co/96x96',
};

const mockActiveProfile: Profile = {
  id: 2,
  accountId: 1,
  name: 'Active Profile',
  image: 'https://placehold.co/96x96',
};

const mockAccount = {
  id: 1,
  uid: 'test-uid-123',
  email: 'test@example.com',
  name: 'Test User',
  image: '',
  defaultProfileId: 3,
  createdAt: new Date('2024-01-01'),
};

const createMockStore = (
  profile = mockProfile,
  activeProfile = mockActiveProfile,
  account = mockAccount
) => {
  return configureStore({
    reducer: {
      auth: accountSlice,
      activeProfile: activeProfileSlice,
      profiles: profilesSlice,
    },
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
        ids: [profile.id, activeProfile.id],
        entities: {
          [profile.id]: profile,
          [activeProfile.id]: activeProfile,
        },
        loading: false,
        error: null,
      },
    },
  });
};

describe('ProfileCard', () => {
  const mockHandleEdit = jest.fn();
  const mockHandleDelete = jest.fn();
  const mockHandleSetDefault = jest.fn();
  const mockHandleSetActive = jest.fn();
  const mockHandleViewStats = jest.fn();

  const defaultProps = {
    profile: mockProfile,
    handleEdit: mockHandleEdit,
    handleDelete: mockHandleDelete,
    handleSetDefault: mockHandleSetDefault,
    handleSetActive: mockHandleSetActive,
    handleViewStats: mockHandleViewStats,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile card with profile name', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Test Profile')).toBeInTheDocument();
  });

  it('renders profile image', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    const image = screen.getByAltText('Test Profile');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('placehold.co'));
  });

  it('renders all action buttons', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /set active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set default/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view stats/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls handleSetActive when Set Active button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    const setActiveButton = screen.getByRole('button', { name: /set active/i });
    fireEvent.click(setActiveButton);

    expect(mockHandleSetActive).toHaveBeenCalledWith(mockProfile);
  });

  it('calls handleSetDefault when Set Default button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    const setDefaultButton = screen.getByRole('button', { name: /set default/i });
    fireEvent.click(setDefaultButton);

    expect(mockHandleSetDefault).toHaveBeenCalledWith(mockProfile);
  });

  it('calls handleViewStats when View Stats button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    const viewStatsButton = screen.getByRole('button', { name: /view stats/i });
    fireEvent.click(viewStatsButton);

    expect(mockHandleViewStats).toHaveBeenCalledWith(mockProfile);
  });

  it('calls handleEdit when Edit button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockHandleEdit).toHaveBeenCalledWith(mockProfile);
  });

  it('calls handleDelete when Delete button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockHandleDelete).toHaveBeenCalledWith(mockProfile);
  });

  it('disables Set Active button when profile is already active', () => {
    const store = createMockStore(mockActiveProfile, mockActiveProfile);
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} profile={mockActiveProfile} />
      </Provider>
    );

    const setActiveButton = screen.getByRole('button', { name: /set active/i });
    expect(setActiveButton).toBeDisabled();
  });

  it('disables Set Default button when profile is already default', () => {
    const defaultProfile = { ...mockProfile, id: 3 };
    const store = createMockStore(defaultProfile);
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} profile={defaultProfile} />
      </Provider>
    );

    const setDefaultButton = screen.getByRole('button', { name: /set default/i });
    expect(setDefaultButton).toBeDisabled();
  });

  it('disables Delete button when profile is default', () => {
    const defaultProfile = { ...mockProfile, id: 3 };
    const store = createMockStore(defaultProfile);
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} profile={defaultProfile} />
      </Provider>
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} isLoading={true} />
      </Provider>
    );

    expect(screen.getByText(/setting active/i)).toBeInTheDocument();
  });

  it('shows image management menu when image is clicked', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    const imageArea = screen.getByAltText('Test Profile').closest('.image-upload-area');
    if (imageArea) {
      fireEvent.click(imageArea);
    }

    await waitFor(() => {
      expect(screen.getByText(/upload image/i)).toBeInTheDocument();
    });
  });

  it('shows "Change Image" option when profile has custom image', async () => {
    const customImageProfile = {
      ...mockProfile,
      image: 'https://example.com/custom-image.jpg',
    };
    const store = createMockStore(customImageProfile);
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} profile={customImageProfile} />
      </Provider>
    );

    const imageArea = screen.getByAltText('Test Profile').closest('.image-upload-area');
    if (imageArea) {
      fireEvent.click(imageArea);
    }

    await waitFor(() => {
      expect(screen.getByText(/change image/i)).toBeInTheDocument();
      expect(screen.getByText(/remove image/i)).toBeInTheDocument();
    });
  });

  it('renders error message when account or activeProfile is missing', () => {
    const storeWithoutAccount = configureStore({
      reducer: {
        auth: accountSlice,
        activeProfile: activeProfileSlice,
        profiles: profilesSlice,
      },
      preloadedState: {
        auth: {
          account: null,
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: null,
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
          ids: [],
          entities: {},
          loading: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={storeWithoutAccount}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText(/unable to load profile data/i)).toBeInTheDocument();
  });

  it('has correct card ID attribute', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProfileCard {...defaultProps} />
      </Provider>
    );

    const card = screen.getByText('Test Profile').closest('[id^="profileCard_"]');
    expect(card).toHaveAttribute('id', 'profileCard_1');
  });
});
