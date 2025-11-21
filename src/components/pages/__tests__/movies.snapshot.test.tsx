import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Movies from '../movies';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
  selectMovies: jest.fn(),
  selectActiveProfileLoading: jest.fn(),
  selectActiveProfileError: jest.fn(),
  selectMovieGenres: jest.fn(),
  selectMovieStreamingServices: jest.fn(),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  ErrorComponent: ({ error }: { error: string }) => <div data-testid="error-component">{error}</div>,
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
}));

jest.mock('../../common/movies/movieListItem', () => ({
  MovieListItem: ({ movie }: any) => <div data-testid="movie-list-item">{movie.title}</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Movies - Snapshots', () => {
  const mockProfile = {
    id: 1,
    accountId: 100,
    name: 'Test Profile',
    avatarColor: '#FF0000',
  };

  const mockMovies = [
    {
      id: 1,
      title: 'Movie 1',
      tmdbId: 101,
      genres: ['Action', 'Adventure'],
      streamingServices: 'Netflix',
      watchStatus: 'NOT_WATCHED',
    },
    {
      id: 2,
      title: 'Movie 2',
      tmdbId: 102,
      genres: ['Comedy'],
      streamingServices: 'Hulu',
      watchStatus: 'WATCHED',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const {
      selectActiveProfile,
      selectMovies,
      selectActiveProfileLoading,
      selectActiveProfileError,
      selectMovieGenres,
      selectMovieStreamingServices,
    } = require('../../../app/slices/activeProfileSlice');

    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectActiveProfile) return mockProfile;
      if (selector === selectMovies) return mockMovies;
      if (selector === selectActiveProfileLoading) return false;
      if (selector === selectActiveProfileError) return null;
      if (selector === selectMovieGenres) return ['Action', 'Adventure', 'Comedy'];
      if (selector === selectMovieStreamingServices) return ['Netflix', 'Hulu', 'Disney+'];
      return null;
    });
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<Movies />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of movies list', () => {
    const { container } = renderWithRouter(<Movies />);
    const moviesList = container.querySelector('[data-testid="movies-container"]') || container.firstChild;
    expect(moviesList).toMatchSnapshot();
  });
});
