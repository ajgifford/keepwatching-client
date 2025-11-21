import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Shows from '../shows';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
  selectShows: jest.fn(),
  selectActiveProfileLoading: jest.fn(),
  selectActiveProfileError: jest.fn(),
  selectShowGenres: jest.fn(),
  selectShowStreamingServices: jest.fn(),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  ErrorComponent: ({ error }: { error: string }) => <div data-testid="error-component">{error}</div>,
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
}));

jest.mock('../../common/shows/showListItem', () => ({
  ShowListItem: ({ show }: any) => <div data-testid="show-list-item">{show.title}</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Shows - Snapshots', () => {
  const mockProfile = {
    id: 1,
    accountId: 100,
    name: 'Test Profile',
    avatarColor: '#FF0000',
  };

  const mockShows = [
    {
      id: 1,
      title: 'Show 1',
      tmdbId: 101,
      genres: ['Action', 'Drama'],
      streamingServices: ['Netflix'],
      watchStatus: 'WATCHING',
    },
    {
      id: 2,
      title: 'Show 2',
      tmdbId: 102,
      genres: ['Comedy'],
      streamingServices: ['Hulu'],
      watchStatus: 'NOT_WATCHED',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const {
      selectActiveProfile,
      selectShows,
      selectActiveProfileLoading,
      selectActiveProfileError,
      selectShowGenres,
      selectShowStreamingServices,
    } = require('../../../app/slices/activeProfileSlice');

    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectActiveProfile) return mockProfile;
      if (selector === selectShows) return mockShows;
      if (selector === selectActiveProfileLoading) return false;
      if (selector === selectActiveProfileError) return null;
      if (selector === selectShowGenres) return ['Action', 'Comedy', 'Drama'];
      if (selector === selectShowStreamingServices) return ['Netflix', 'Hulu', 'Disney+'];
      return null;
    });
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<Shows />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of shows list', () => {
    const { container } = renderWithRouter(<Shows />);
    const showsList = container.querySelector('[data-testid="shows-container"]') || container.firstChild;
    expect(showsList).toMatchSnapshot();
  });
});
