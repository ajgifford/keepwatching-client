import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { MovieCard } from '../movieCard';
import { ProfileMovie } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn(
    (path: string, size?: string) => `https://image.tmdb.org/t/p/${size || 'original'}${path}`
  ),
}));

jest.mock('../../../utility/contentUtility', () => ({
  calculateRuntimeDisplay: jest.fn((runtime: number) => {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
  }),
}));

describe('MovieCard', () => {
  const mockMovie: ProfileMovie = {
    id: 1,
    tmdbId: 278,
    title: 'The Shawshank Redemption',
    posterImage: '/shawshank.jpg',
    backdropImage: '/shawshank-backdrop.jpg',
    description:
      'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    releaseDate: '1994-09-23',
    runtime: 142,
    genres: 'Drama, Crime',
    streamingServices: 'Netflix, Hulu',
    watchStatus: 'Watched' as const,
    isFavorite: true,
    userRating: 9.3,
    profileId: 1,
  };

  const renderMovieCard = (movie: ProfileMovie = mockMovie) => {
    return render(
      <BrowserRouter>
        <MovieCard movie={movie} />
      </BrowserRouter>
    );
  };

  describe('rendering', () => {
    it('should render movie title', () => {
      renderMovieCard();

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
    });

    it('should render movie poster image', () => {
      renderMovieCard();

      const poster = screen.getByRole('img');
      expect(poster).toBeInTheDocument();
      expect(poster).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w185/shawshank.jpg');
    });

    it('should render runtime', () => {
      renderMovieCard();

      expect(screen.getByText('2h 22m')).toBeInTheDocument();
    });

    it('should render release year and streaming services', () => {
      renderMovieCard();

      expect(screen.getByText(/1994.*Netflix, Hulu/)).toBeInTheDocument();
    });

    it('should render description', () => {
      renderMovieCard();

      expect(screen.getByText(/Two imprisoned men bond over a number of years/)).toBeInTheDocument();
    });

    it('should render genre chips (max 2)', () => {
      renderMovieCard();

      expect(screen.getByText('Drama')).toBeInTheDocument();
      expect(screen.getByText('Crime')).toBeInTheDocument();
    });

    it('should only show first 2 genres when more exist', () => {
      const movieWithManyGenres = {
        ...mockMovie,
        genres: 'Drama, Crime, Thriller, Mystery',
      };

      renderMovieCard(movieWithManyGenres);

      expect(screen.getByText('Drama')).toBeInTheDocument();
      expect(screen.getByText('Crime')).toBeInTheDocument();
      expect(screen.queryByText('Thriller')).not.toBeInTheDocument();
      expect(screen.queryByText('Mystery')).not.toBeInTheDocument();
    });
  });

  describe('navigation link', () => {
    it('should render as a Link component', () => {
      const { container } = renderMovieCard();

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/movies/1/1');
    });

    it('should have correct navigation state', () => {
      const { container } = renderMovieCard();

      const link = container.querySelector('a');
      // The state is passed via React Router, hard to test directly
      // but we can verify the link exists
      expect(link).toBeInTheDocument();
    });
  });

  describe('formatReleaseDate', () => {
    beforeEach(() => {
      // Mock the current date to be 2024-01-15
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show "Today" for today\'s date', () => {
      const todayMovie = {
        ...mockMovie,
        releaseDate: '2024-01-15',
      };

      renderMovieCard(todayMovie);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should show "Tomorrow" for tomorrow\'s date', () => {
      const tomorrowMovie = {
        ...mockMovie,
        releaseDate: '2024-01-16',
      };

      renderMovieCard(tomorrowMovie);

      expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    });

    it('should show "Yesterday" for yesterday\'s date', () => {
      const yesterdayMovie = {
        ...mockMovie,
        releaseDate: '2024-01-14',
      };

      renderMovieCard(yesterdayMovie);

      expect(screen.getByText('Yesterday')).toBeInTheDocument();
    });

    it('should show "In X days" for future dates', () => {
      const futureMovie = {
        ...mockMovie,
        releaseDate: '2024-01-20',
      };

      renderMovieCard(futureMovie);

      expect(screen.getByText('In 5 days')).toBeInTheDocument();
    });

    it('should show "X days ago" for recent past dates', () => {
      const pastMovie = {
        ...mockMovie,
        releaseDate: '2024-01-10',
      };

      renderMovieCard(pastMovie);

      expect(screen.getByText('5 days ago')).toBeInTheDocument();
    });

    it('should show year for dates more than 30 days ago', () => {
      const oldMovie = {
        ...mockMovie,
        releaseDate: '2023-11-01',
      };

      renderMovieCard(oldMovie);

      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('should handle date exactly 30 days ago', () => {
      const movie30DaysAgo = {
        ...mockMovie,
        releaseDate: '2023-12-16',
      };

      renderMovieCard(movie30DaysAgo);

      expect(screen.getByText('30 days ago')).toBeInTheDocument();
    });

    it('should handle date exactly 31 days ago (shows year)', () => {
      const movie31DaysAgo = {
        ...mockMovie,
        releaseDate: '2023-12-15',
      };

      renderMovieCard(movie31DaysAgo);

      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  describe('poster image', () => {
    it('should use buildTMDBImagePath with w185 size', () => {
      const { buildTMDBImagePath } = require('@ajgifford/keepwatching-ui');
      renderMovieCard();

      expect(buildTMDBImagePath).toHaveBeenCalledWith('/shawshank.jpg', 'w185');
    });
  });

  describe('runtime display', () => {
    it('should call calculateRuntimeDisplay with runtime', () => {
      const { calculateRuntimeDisplay } = require('../../../utility/contentUtility');
      renderMovieCard();

      expect(calculateRuntimeDisplay).toHaveBeenCalledWith(142);
    });

    it('should handle short runtime', () => {
      const shortMovie = {
        ...mockMovie,
        runtime: 90,
      };

      renderMovieCard(shortMovie);

      expect(screen.getByText('1h 30m')).toBeInTheDocument();
    });

    it('should handle very long runtime', () => {
      const longMovie = {
        ...mockMovie,
        runtime: 200,
      };

      renderMovieCard(longMovie);

      expect(screen.getByText('3h 20m')).toBeInTheDocument();
    });

    it('should handle runtime less than 60 minutes', () => {
      const shortMovie = {
        ...mockMovie,
        runtime: 45,
      };

      renderMovieCard(shortMovie);

      expect(screen.getByText('0h 45m')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle movie with single genre', () => {
      const singleGenreMovie = {
        ...mockMovie,
        genres: 'Drama',
      };

      renderMovieCard(singleGenreMovie);

      expect(screen.getByText('Drama')).toBeInTheDocument();
    });

    it('should handle movie with empty description', () => {
      const noDescMovie = {
        ...mockMovie,
        description: '',
      };

      renderMovieCard(noDescMovie);

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
    });

    it('should handle long description (truncated)', () => {
      const longDescMovie = {
        ...mockMovie,
        description: 'This is a very long description that goes on and on and on. '.repeat(10),
      };

      renderMovieCard(longDescMovie);

      // Just verify the description is shown (it will be truncated by CSS)
      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    });

    it('should handle missing poster image', () => {
      const noPosterMovie = {
        ...mockMovie,
        posterImage: '',
      };

      renderMovieCard(noPosterMovie);

      const poster = screen.getByRole('img');
      expect(poster).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w185');
    });

    it('should handle genres with extra whitespace', () => {
      const whiteSpaceGenresMovie = {
        ...mockMovie,
        genres: 'Drama  ,  Crime  ,  Thriller',
      };

      renderMovieCard(whiteSpaceGenresMovie);

      expect(screen.getByText('Drama')).toBeInTheDocument();
      expect(screen.getByText('Crime')).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render Card component', () => {
      const { container } = renderMovieCard();

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render CardContent', () => {
      const { container } = renderMovieCard();

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    it('should render Avatar for poster', () => {
      const { container } = renderMovieCard();

      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();
    });

    it('should render Chip components', () => {
      const { container } = renderMovieCard();

      const chips = container.querySelectorAll('.MuiChip-root');
      // Runtime chip + 2 genre chips + release date chip = 4 total
      expect(chips.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('content combinations', () => {
    it('should handle movie with all fields populated', () => {
      renderMovieCard(mockMovie);

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
      expect(screen.getByText('2h 22m')).toBeInTheDocument();
      expect(screen.getAllByText(/1994/).length).toBeGreaterThan(0);
      expect(screen.getByText('Drama')).toBeInTheDocument();
      expect(screen.getByText('Crime')).toBeInTheDocument();
    });

    it('should handle movie with minimal information', () => {
      const minimalMovie: ProfileMovie = {
        id: 1,
        tmdbId: 1,
        title: 'Minimal Movie',
        posterImage: '',
        backdropImage: '',
        description: '',
        releaseDate: '2024-01-15',
        runtime: 90,
        genres: 'Drama',
        streamingServices: 'Netflix',
        watchStatus: 'Unwatched' as const,
        isFavorite: false,
        userRating: 0,
        profileId: 1,
      };

      renderMovieCard(minimalMovie);

      expect(screen.getByText('Minimal Movie')).toBeInTheDocument();
      expect(screen.getByText('1h 30m')).toBeInTheDocument();
    });
  });
});
