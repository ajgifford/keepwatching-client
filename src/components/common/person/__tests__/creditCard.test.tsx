import { render, screen } from '@testing-library/react';

import { CreditCard } from '../creditCard';
import { Credit, ShowCredit } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn(
    (path: string, size?: string) => `https://image.tmdb.org/t/p/${size || 'original'}${path}`
  ),
}));

describe('CreditCard', () => {
  const mockCredit: Credit = {
    tmdbId: 278,
    name: 'The Shawshank Redemption',
    poster: '/shawshank.jpg',
    character: 'Andy Dufresne',
    year: 1994,
    rating: 9.3,
  };

  const mockShowCredit: ShowCredit = {
    tmdbId: 1396,
    name: 'Breaking Bad',
    poster: '/breaking-bad.jpg',
    character: 'Walter White',
    year: 2008,
    rating: 9.5,
    episodeCount: 62,
  };

  describe('rendering basic Credit', () => {
    it('should render credit name', () => {
      render(<CreditCard credit={mockCredit} />);

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
    });

    it('should render character name', () => {
      render(<CreditCard credit={mockCredit} />);

      expect(screen.getByText(/as Andy Dufresne/)).toBeInTheDocument();
    });

    it('should render year', () => {
      render(<CreditCard credit={mockCredit} />);

      expect(screen.getByText('1994')).toBeInTheDocument();
    });

    it('should render rating value', () => {
      render(<CreditCard credit={mockCredit} />);

      expect(screen.getByText('9.3')).toBeInTheDocument();
    });

    it('should render poster image', () => {
      const { container } = render(<CreditCard credit={mockCredit} />);

      const avatar = container.querySelector('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w92/shawshank.jpg');
      expect(avatar).toHaveAttribute('alt', 'The Shawshank Redemption');
    });

    it('should not show episode count for basic Credit', () => {
      render(<CreditCard credit={mockCredit} />);

      expect(screen.queryByText(/ep/)).not.toBeInTheDocument();
    });
  });

  describe('rendering ShowCredit', () => {
    it('should render show name', () => {
      render(<CreditCard credit={mockShowCredit} />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should render character name', () => {
      render(<CreditCard credit={mockShowCredit} />);

      expect(screen.getByText(/as Walter White/)).toBeInTheDocument();
    });

    it('should render year', () => {
      render(<CreditCard credit={mockShowCredit} />);

      expect(screen.getByText('2008')).toBeInTheDocument();
    });

    it('should show episode count', () => {
      render(<CreditCard credit={mockShowCredit} />);

      expect(screen.getByText('62 eps')).toBeInTheDocument();
    });

    it('should show singular "ep" for 1 episode', () => {
      const singleEpisode: ShowCredit = {
        ...mockShowCredit,
        episodeCount: 1,
      };

      render(<CreditCard credit={singleEpisode} />);

      expect(screen.getByText('1 ep')).toBeInTheDocument();
    });

    it('should show plural "eps" for 0 episodes', () => {
      const zeroEpisodes: ShowCredit = {
        ...mockShowCredit,
        episodeCount: 0,
      };

      render(<CreditCard credit={zeroEpisodes} />);

      expect(screen.getByText('0 eps')).toBeInTheDocument();
    });

    it('should show plural "eps" for multiple episodes', () => {
      const multipleEpisodes: ShowCredit = {
        ...mockShowCredit,
        episodeCount: 150,
      };

      render(<CreditCard credit={multipleEpisodes} />);

      expect(screen.getByText('150 eps')).toBeInTheDocument();
    });
  });

  describe('rating display', () => {
    it('should display rating with 1 decimal place', () => {
      render(<CreditCard credit={mockCredit} />);

      expect(screen.getByText('9.3')).toBeInTheDocument();
    });

    it('should format rating with toFixed(1)', () => {
      const decimalRating = { ...mockCredit, rating: 8.567 };
      render(<CreditCard credit={decimalRating} />);

      expect(screen.getByText('8.6')).toBeInTheDocument();
    });

    it('should display integer ratings with decimal', () => {
      const integerRating = { ...mockCredit, rating: 10 };
      render(<CreditCard credit={integerRating} />);

      expect(screen.getByText('10.0')).toBeInTheDocument();
    });

    it('should display low ratings correctly', () => {
      const lowRating = { ...mockCredit, rating: 3.2 };
      render(<CreditCard credit={lowRating} />);

      expect(screen.getByText('3.2')).toBeInTheDocument();
    });

    it('should render Rating component', () => {
      const { container } = render(<CreditCard credit={mockCredit} />);

      const rating = container.querySelector('.MuiRating-root');
      expect(rating).toBeInTheDocument();
    });

    it('should calculate Rating value from rating/2', () => {
      // Rating component uses rating/2 (9.3/2 = 4.65 out of 5 stars)
      const { container } = render(<CreditCard credit={mockCredit} />);

      const rating = container.querySelector('[role="img"]');
      expect(rating).toBeInTheDocument();
    });
  });

  describe('image handling', () => {
    it('should call buildTMDBImagePath with w92 size', () => {
      const { buildTMDBImagePath } = require('@ajgifford/keepwatching-ui');
      render(<CreditCard credit={mockCredit} />);

      expect(buildTMDBImagePath).toHaveBeenCalledWith('/shawshank.jpg', 'w92');
    });

    it('should handle missing poster', () => {
      const noPoster = { ...mockCredit, poster: '' };
      const { container } = render(<CreditCard credit={noPoster} />);

      const avatar = container.querySelector('img');
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w92');
    });

    it('should set alt text to credit name', () => {
      const { container } = render(<CreditCard credit={mockCredit} />);

      const avatar = container.querySelector('img');
      expect(avatar).toHaveAttribute('alt', 'The Shawshank Redemption');
    });
  });

  describe('layout and styling', () => {
    it('should render Card component', () => {
      const { container } = render(<CreditCard credit={mockCredit} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render CardContent', () => {
      const { container } = render(<CreditCard credit={mockCredit} />);

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    it('should render Avatar with rounded variant', () => {
      const { container } = render(<CreditCard credit={mockCredit} />);

      const avatar = container.querySelector('.MuiAvatar-rounded');
      expect(avatar).toBeInTheDocument();
    });

    it('should render Grid container', () => {
      const { container } = render(<CreditCard credit={mockCredit} />);

      const grid = container.querySelector('[class*="MuiGrid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should render Chip for ShowCredit', () => {
      const { container } = render(<CreditCard credit={mockShowCredit} />);

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('should not render Chip for basic Credit', () => {
      const { container } = render(<CreditCard credit={mockCredit} />);

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle very long credit names (truncated)', () => {
      const longName = {
        ...mockCredit,
        name: 'This is a very long title that should be truncated by the WebkitLineClamp property to two lines maximum',
      };

      render(<CreditCard credit={longName} />);

      expect(screen.getByText(/This is a very long title/)).toBeInTheDocument();
    });

    it('should handle very long character names', () => {
      const longCharacter = {
        ...mockCredit,
        character: 'A Very Long Character Name That Goes On And On',
      };

      render(<CreditCard credit={longCharacter} />);

      expect(screen.getByText(/as A Very Long Character Name/)).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const specialChars = {
        ...mockCredit,
        name: "O'Brien & Smith",
        character: 'Lt. Dan "Danny" O\'Reilly',
      };

      render(<CreditCard credit={specialChars} />);

      expect(screen.getByText("O'Brien & Smith")).toBeInTheDocument();
      expect(screen.getByText(/Lt. Dan "Danny" O'Reilly/)).toBeInTheDocument();
    });

    it('should handle zero rating', () => {
      const zeroRating = { ...mockCredit, rating: 0 };
      render(<CreditCard credit={zeroRating} />);

      expect(screen.getByText('0.0')).toBeInTheDocument();
    });

    it('should handle maximum rating', () => {
      const maxRating = { ...mockCredit, rating: 10.0 };
      render(<CreditCard credit={maxRating} />);

      expect(screen.getByText('10.0')).toBeInTheDocument();
    });

    it('should handle empty character name', () => {
      const emptyCharacter = { ...mockCredit, character: '' };
      render(<CreditCard credit={emptyCharacter} />);

      expect(screen.getByText('as')).toBeInTheDocument();
    });

    it('should handle very old year', () => {
      const oldYear = { ...mockCredit, year: 1920 };
      render(<CreditCard credit={oldYear} />);

      expect(screen.getByText('1920')).toBeInTheDocument();
    });

    it('should handle future year', () => {
      const futureYear = { ...mockCredit, year: 2050 };
      render(<CreditCard credit={futureYear} />);

      expect(screen.getByText('2050')).toBeInTheDocument();
    });
  });

  describe('type guard behavior', () => {
    it('should correctly identify ShowCredit with episodeCount', () => {
      render(<CreditCard credit={mockShowCredit} />);

      // Should show episode count (proving ShowCredit was identified)
      expect(screen.getByText('62 eps')).toBeInTheDocument();
    });

    it('should correctly identify regular Credit without episodeCount', () => {
      render(<CreditCard credit={mockCredit} />);

      // Should NOT show episode count (proving Credit was identified)
      expect(screen.queryByText(/ep/)).not.toBeInTheDocument();
    });
  });
});
