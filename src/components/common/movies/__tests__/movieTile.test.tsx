import { render, screen } from '@testing-library/react';

import { MovieTile } from '../movieTile';
import { ProfileMovie } from '@ajgifford/keepwatching-types';

// Mock buildTMDBImagePath
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((image: string) => `https://image.tmdb.org/t/p/w500${image}`),
}));

describe('MovieTile', () => {
  const mockMovie: ProfileMovie = {
    id: 1,
    movieId: 550,
    title: 'Fight Club',
    releaseDate: '1999-10-15',
    posterImage: '/poster.jpg',
    backdropImage: '/backdrop.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
    runtime: 139,
    voteAverage: 8.4,
    streamingServices: 'Netflix, Amazon Prime',
    watched: false,
    profileId: 1,
    genres: 'Drama, Thriller',
  };

  describe('basic rendering', () => {
    it('should render movie title', () => {
      render(<MovieTile movie={mockMovie} />);

      expect(screen.getByText('Fight Club')).toBeInTheDocument();
    });

    it('should render movie release date', () => {
      render(<MovieTile movie={mockMovie} />);

      expect(screen.getByText('1999-10-15')).toBeInTheDocument();
    });

    it('should render streaming services', () => {
      render(<MovieTile movie={mockMovie} />);

      expect(screen.getByText('Netflix, Amazon Prime')).toBeInTheDocument();
    });

    it('should render movie poster avatar', () => {
      render(<MovieTile movie={mockMovie} />);

      const avatar = screen.getByAltText('Fight Club');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/poster.jpg');
    });

    it('should have unique id based on movie id', () => {
      const { container } = render(<MovieTile movie={mockMovie} />);

      const movieCard = container.querySelector('#movieCard_1');
      expect(movieCard).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render in a grid layout', () => {
      const { container } = render(<MovieTile movie={mockMovie} />);

      const grids = container.querySelectorAll('[class*="MuiGrid"]');
      expect(grids.length).toBeGreaterThan(0);
    });

    it('should have rounded variant avatar', () => {
      const { container } = render(<MovieTile movie={mockMovie} />);

      const avatar = container.querySelector('.MuiAvatar-rounded');
      expect(avatar).toBeInTheDocument();
    });

    it('should render title as h6 variant', () => {
      render(<MovieTile movie={mockMovie} />);

      const title = screen.getByText('Fight Club');
      expect(title).toHaveClass('MuiTypography-h6');
    });

    it('should render release date and streaming services as body1 variant', () => {
      const { container } = render(<MovieTile movie={mockMovie} />);

      const body1Elements = container.querySelectorAll('.MuiTypography-body1');
      expect(body1Elements).toHaveLength(2);
    });
  });

  describe('different movie data', () => {
    it('should render movie with long title', () => {
      const longTitleMovie = {
        ...mockMovie,
        title: 'The Lord of the Rings: The Fellowship of the Ring',
      };

      render(<MovieTile movie={longTitleMovie} />);

      expect(screen.getByText('The Lord of the Rings: The Fellowship of the Ring')).toBeInTheDocument();
    });

    it('should render movie with multiple streaming services', () => {
      const multiServiceMovie = {
        ...mockMovie,
        streamingServices: 'Netflix, Amazon Prime, Hulu, Disney+',
      };

      render(<MovieTile movie={multiServiceMovie} />);

      expect(screen.getByText('Netflix, Amazon Prime, Hulu, Disney+')).toBeInTheDocument();
    });

    it('should render movie without streaming services', () => {
      const noServiceMovie = {
        ...mockMovie,
        streamingServices: '',
      };

      render(<MovieTile movie={noServiceMovie} />);

      // Should still render the Typography element, just with empty text
      const { container } = render(<MovieTile movie={noServiceMovie} />);
      const streamingText = container.querySelectorAll('.MuiTypography-body1')[1];
      expect(streamingText).toHaveTextContent('');
    });

    it('should render movie with null poster image', () => {
      const noPosterMovie = {
        ...mockMovie,
        posterImage: '',
      };

      render(<MovieTile movie={noPosterMovie} />);

      const avatar = screen.getByAltText('Fight Club');
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500');
    });

    it('should render movie with special characters in title', () => {
      const specialCharMovie = {
        ...mockMovie,
        title: "Marvel's The Avengers: Infinity War",
      };

      render(<MovieTile movie={specialCharMovie} />);

      expect(screen.getByText("Marvel's The Avengers: Infinity War")).toBeInTheDocument();
    });

    it('should render movie with old release date', () => {
      const oldMovie = {
        ...mockMovie,
        releaseDate: '1927-10-06',
        title: 'The Jazz Singer',
      };

      render(<MovieTile movie={oldMovie} />);

      expect(screen.getByText('1927-10-06')).toBeInTheDocument();
    });

    it('should render movie with future release date', () => {
      const futureMovie = {
        ...mockMovie,
        releaseDate: '2025-12-25',
        title: 'Future Film',
      };

      render(<MovieTile movie={futureMovie} />);

      expect(screen.getByText('2025-12-25')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible alt text for poster image', () => {
      render(<MovieTile movie={mockMovie} />);

      const avatar = screen.getByAltText('Fight Club');
      expect(avatar).toBeInTheDocument();
    });

    it('should render all text content accessibly', () => {
      render(<MovieTile movie={mockMovie} />);

      expect(screen.getByText('Fight Club')).toBeInTheDocument();
      expect(screen.getByText('1999-10-15')).toBeInTheDocument();
      expect(screen.getByText('Netflix, Amazon Prime')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle movie with id of 0', () => {
      const zeroIdMovie = {
        ...mockMovie,
        id: 0,
      };

      const { container } = render(<MovieTile movie={zeroIdMovie} />);

      const movieCard = container.querySelector('#movieCard_0');
      expect(movieCard).toBeInTheDocument();
    });

    it('should handle movie with very long streaming services string', () => {
      const longServicesMovie = {
        ...mockMovie,
        streamingServices:
          'Netflix, Amazon Prime, Hulu, Disney+, HBO Max, Paramount+, Apple TV+, Peacock, Discovery+',
      };

      render(<MovieTile movie={longServicesMovie} />);

      expect(
        screen.getByText(
          'Netflix, Amazon Prime, Hulu, Disney+, HBO Max, Paramount+, Apple TV+, Peacock, Discovery+'
        )
      ).toBeInTheDocument();
    });

    it('should handle movie with non-standard date format', () => {
      const nonStandardDateMovie = {
        ...mockMovie,
        releaseDate: '1999',
      };

      render(<MovieTile movie={nonStandardDateMovie} />);

      expect(screen.getByText('1999')).toBeInTheDocument();
    });

    it('should render multiple movie tiles independently', () => {
      const movie1 = { ...mockMovie, id: 1, title: 'Movie 1' };
      const movie2 = { ...mockMovie, id: 2, title: 'Movie 2' };

      const { container } = render(
        <>
          <MovieTile movie={movie1} />
          <MovieTile movie={movie2} />
        </>
      );

      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
      expect(container.querySelector('#movieCard_1')).toBeInTheDocument();
      expect(container.querySelector('#movieCard_2')).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should render without crashing', () => {
      const { container } = render(<MovieTile movie={mockMovie} />);
      expect(container).toBeInTheDocument();
    });

    it('should handle unmounting gracefully', () => {
      const { unmount } = render(<MovieTile movie={mockMovie} />);

      unmount();

      expect(screen.queryByText('Fight Club')).not.toBeInTheDocument();
    });

    it('should re-render with updated movie data', () => {
      const { rerender } = render(<MovieTile movie={mockMovie} />);

      expect(screen.getByText('Fight Club')).toBeInTheDocument();

      const updatedMovie = {
        ...mockMovie,
        title: 'Updated Title',
      };

      rerender(<MovieTile movie={updatedMovie} />);

      expect(screen.queryByText('Fight Club')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
    });
  });
});
