import { render, screen } from '@testing-library/react';

import { ProfileContentCard } from '../profileContentCard';
import { ProfileMovie, ProfileShow } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

// Mock buildTMDBImagePath and getWatchStatusColor
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((image: string) => `https://image.tmdb.org/t/p/w500${image}`),
  getWatchStatusColor: jest.fn((status: string) => {
    const colors: Record<string, string> = {
      Watched: '#4caf50',
      'In Progress': '#ff9800',
      Unwatched: '#9e9e9e',
      Continuing: '#2196f3',
    };
    return colors[status] || '#9e9e9e';
  }),
}));

// Mock MUI icons
jest.mock('@mui/icons-material/LiveTv', () => ({
  __esModule: true,
  default: () => <div data-testid="live-tv-icon">TV</div>,
}));

jest.mock('@mui/icons-material/Movie', () => ({
  __esModule: true,
  default: () => <div data-testid="movie-icon">Movie</div>,
}));

describe('ProfileContentCard', () => {
  const mockShow: ProfileShow = {
    id: 1,
    tmdbId: 123,
    title: 'Breaking Bad',
    posterImage: '/breaking-bad.jpg',
    backdropImage: '/breaking-bad-backdrop.jpg',
    watchStatus: 'In Progress',
    isFavorite: true,
    userRating: 9.5,
    genres: 'Drama, Crime',
    streamingServices: 'Netflix',
  };

  const mockMovie: ProfileMovie = {
    id: 2,
    tmdbId: 456,
    title: 'The Shawshank Redemption',
    posterImage: '/shawshank.jpg',
    backdropImage: '/shawshank-backdrop.jpg',
    watchStatus: 'Watched',
    isFavorite: true,
    userRating: 9.3,
    genres: 'Drama',
    streamingServices: 'Hulu',
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render card for show with LiveTvIcon', () => {
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByTestId('live-tv-icon')).toBeInTheDocument();
    });

    it('should render card for movie with MovieIcon', () => {
      render(<ProfileContentCard content={mockMovie} contentType="movie" onClick={mockOnClick} />);

      expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
      expect(screen.getByTestId('movie-icon')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should render watch status chip', () => {
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should render user rating when provided', () => {
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('⭐ 9.5')).toBeInTheDocument();
    });

    it('should not render user rating when not provided', () => {
      const showWithoutRating = { ...mockShow, userRating: undefined };
      render(<ProfileContentCard content={showWithoutRating} contentType="show" onClick={mockOnClick} />);

      expect(screen.queryByText(/⭐/)).not.toBeInTheDocument();
    });

    it('should not render user rating when null', () => {
      const showWithNullRating = { ...mockShow, userRating: null };
      render(<ProfileContentCard content={showWithNullRating as any} contentType="show" onClick={mockOnClick} />);

      expect(screen.queryByText(/⭐/)).not.toBeInTheDocument();
    });

    it('should not render user rating when zero', () => {
      const showWithZeroRating = { ...mockShow, userRating: 0 };
      render(<ProfileContentCard content={showWithZeroRating} contentType="show" onClick={mockOnClick} />);

      expect(screen.queryByText(/⭐/)).not.toBeInTheDocument();
    });
  });

  describe('click handling', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const card = screen.getByText('Breaking Bad').closest('.MuiCard-root') as HTMLElement;
      await user.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when card is clicked for movie', async () => {
      const user = userEvent.setup();
      render(<ProfileContentCard content={mockMovie} contentType="movie" onClick={mockOnClick} />);

      const card = screen.getByText('The Shawshank Redemption').closest('.MuiCard-root') as HTMLElement;
      await user.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const card = screen.getByText('Breaking Bad').closest('.MuiCard-root') as HTMLElement;
      await user.click(card);
      await user.click(card);
      await user.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('image', () => {
    it('should render image with correct src from buildTMDBImagePath', () => {
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const image = screen.getByRole('img', { name: 'Breaking Bad' });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/breaking-bad.jpg');
    });

    it('should have correct alt text', () => {
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const image = screen.getByRole('img', { name: 'Breaking Bad' });
      expect(image).toHaveAttribute('alt', 'Breaking Bad');
    });

    it('should render movie image correctly', () => {
      render(<ProfileContentCard content={mockMovie} contentType="movie" onClick={mockOnClick} />);

      const image = screen.getByRole('img', { name: 'The Shawshank Redemption' });
      expect(image).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/shawshank.jpg');
    });
  });

  describe('watch status', () => {
    it('should display Watched status', () => {
      const watchedShow = { ...mockShow, watchStatus: 'Watched' as const };
      render(<ProfileContentCard content={watchedShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('Watched')).toBeInTheDocument();
    });

    it('should display In Progress status', () => {
      const inProgressShow = { ...mockShow, watchStatus: 'In Progress' as const };
      render(<ProfileContentCard content={inProgressShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should display Unwatched status', () => {
      const unwatchedShow = { ...mockShow, watchStatus: 'Unwatched' as const };
      render(<ProfileContentCard content={unwatchedShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('Unwatched')).toBeInTheDocument();
    });

    it('should display Continuing status', () => {
      const continuingShow = { ...mockShow, watchStatus: 'Continuing' as const };
      render(<ProfileContentCard content={continuingShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('Continuing')).toBeInTheDocument();
    });

    it('should replace underscores with spaces in watch status', () => {
      const showWithUnderscores = { ...mockShow, watchStatus: 'In_Progress' as any };
      render(<ProfileContentCard content={showWithUnderscores} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.queryByText('In_Progress')).not.toBeInTheDocument();
    });
  });

  describe('title truncation', () => {
    beforeEach(() => {
      // Mock offsetWidth and scrollWidth to simulate truncation
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        value: 200,
      });
    });

    it('should detect truncated title', () => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 300, // scrollWidth > offsetWidth = truncated
      });

      const longTitleShow = {
        ...mockShow,
        title: 'This is a very long title that will definitely be truncated in the card',
      };

      render(<ProfileContentCard content={longTitleShow} contentType="show" onClick={mockOnClick} />);

      expect(
        screen.getByText('This is a very long title that will definitely be truncated in the card')
      ).toBeInTheDocument();
    });

    it('should not show tooltip for non-truncated title', () => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 150, // scrollWidth < offsetWidth = not truncated
      });

      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const titleElement = screen.getByText('Breaking Bad');
      expect(titleElement).toBeInTheDocument();
    });

    it('should update truncation on window resize', () => {
      const { rerender } = render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      // Initial render
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();

      // Simulate window resize
      window.dispatchEvent(new Event('resize'));

      // Re-render to trigger effect
      rerender(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should clean up resize listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('badge icon', () => {
    it('should show LiveTvIcon for shows', () => {
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByTestId('live-tv-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('movie-icon')).not.toBeInTheDocument();
    });

    it('should show MovieIcon for movies', () => {
      render(<ProfileContentCard content={mockMovie} contentType="movie" onClick={mockOnClick} />);

      expect(screen.getByTestId('movie-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('live-tv-icon')).not.toBeInTheDocument();
    });
  });

  describe('user rating', () => {
    it('should display rating with star emoji', () => {
      render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('⭐ 9.5')).toBeInTheDocument();
    });

    it('should format rating to 1 decimal place', () => {
      const showWithRating = { ...mockShow, userRating: 8.123 };
      render(<ProfileContentCard content={showWithRating} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('⭐ 8.1')).toBeInTheDocument();
    });

    it('should handle integer ratings', () => {
      const showWithIntRating = { ...mockShow, userRating: 10 };
      render(<ProfileContentCard content={showWithIntRating} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('⭐ 10.0')).toBeInTheDocument();
    });

    it('should handle very low ratings', () => {
      const showWithLowRating = { ...mockShow, userRating: 0.1 };
      render(<ProfileContentCard content={showWithLowRating} contentType="show" onClick={mockOnClick} />);

      expect(screen.getByText('⭐ 0.1')).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render Card component', () => {
      const { container } = render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render Badge component', () => {
      const { container } = render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const badge = container.querySelector('.MuiBadge-root');
      expect(badge).toBeInTheDocument();
    });

    it('should render CardMedia with image', () => {
      const { container } = render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const cardMedia = container.querySelector('.MuiCardMedia-root');
      expect(cardMedia).toBeInTheDocument();
    });

    it('should render CardContent with text', () => {
      const { container } = render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    it('should render Chip for watch status', () => {
      const { container } = render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('should have cursor pointer for clickable card', () => {
      const { container } = render(<ProfileContentCard content={mockShow} contentType="show" onClick={mockOnClick} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('edge cases', () => {
    it('should handle empty title', () => {
      const showWithEmptyTitle = { ...mockShow, title: '' };
      render(<ProfileContentCard content={showWithEmptyTitle} contentType="show" onClick={mockOnClick} />);

      const card = screen.getByTestId('live-tv-icon').closest('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const showWithLongTitle = {
        ...mockShow,
        title:
          'This is an extremely long title that goes on and on and on and should definitely be truncated and have a tooltip displayed when hovered over',
      };
      render(<ProfileContentCard content={showWithLongTitle} contentType="show" onClick={mockOnClick} />);

      expect(
        screen.getByText(
          'This is an extremely long title that goes on and on and on and should definitely be truncated and have a tooltip displayed when hovered over'
        )
      ).toBeInTheDocument();
    });

    it('should handle missing posterImage', () => {
      const showWithoutPoster = { ...mockShow, posterImage: '' };
      render(<ProfileContentCard content={showWithoutPoster} contentType="show" onClick={mockOnClick} />);

      const image = screen.getByRole('img', { name: 'Breaking Bad' });
      expect(image).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500');
    });
  });
});
