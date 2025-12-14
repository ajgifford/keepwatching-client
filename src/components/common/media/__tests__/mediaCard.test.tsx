import { render, screen, waitFor } from '@testing-library/react';

import { MediaCard } from '../mediaCard';
import { SimilarOrRecommendedShow } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

// Mock FavoritesButton component
jest.mock('../favoriteButton', () => ({
  __esModule: true,
  default: ({ id, searchType }: { id: number; searchType: string }) => (
    <button data-testid="favorites-button" data-id={id} data-search-type={searchType}>
      Favorite
    </button>
  ),
}));

// Mock buildTMDBImagePath
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((image: string) => `https://image.tmdb.org/t/p/w500${image}`),
}));

describe('MediaCard', () => {
  const mockItem: SimilarOrRecommendedShow = {
    id: 123,
    tmdbId: 456,
    title: 'Test Show Title',
    image: '/test-poster.jpg',
    genres: ['Drama', 'Thriller'],
    premiered: '2024-01-15',
    summary: 'This is a test summary for the show that describes what it is about.',
    country: 'US',
    rating: 8.5,
    popularity: 95.2,
    language: 'en',
    inFavorites: false,
  };

  describe('rendering', () => {
    it('should render card with all item details', () => {
      render(<MediaCard item={mockItem} searchType="shows" />);

      expect(screen.getByText('Test Show Title')).toBeInTheDocument();
      expect(screen.getByText('Drama, Thriller')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText(mockItem.summary!)).toBeInTheDocument();
    });

    it('should render without summary if not provided', () => {
      const itemWithoutSummary = { ...mockItem, summary: undefined };
      render(<MediaCard item={itemWithoutSummary} searchType="shows" />);

      expect(screen.getByText('Test Show Title')).toBeInTheDocument();
      expect(screen.getByText('Drama, Thriller')).toBeInTheDocument();
      expect(screen.queryByText(mockItem.summary!)).not.toBeInTheDocument();
    });

    it('should render with empty genres array', () => {
      const itemWithNoGenres = { ...mockItem, genres: [] };
      render(<MediaCard item={itemWithNoGenres} searchType="shows" />);

      expect(screen.getByText('Test Show Title')).toBeInTheDocument();
      // Empty string for genres
      const genresElement = screen.getByText('Test Show Title').parentElement?.parentElement;
      expect(genresElement).toBeInTheDocument();
    });

    it('should render FavoritesButton with correct props for shows', () => {
      render(<MediaCard item={mockItem} searchType="shows" />);

      const favButton = screen.getByTestId('favorites-button');
      expect(favButton).toBeInTheDocument();
      expect(favButton).toHaveAttribute('data-id', '123');
      expect(favButton).toHaveAttribute('data-search-type', 'shows');
    });

    it('should render FavoritesButton with correct props for movies', () => {
      render(<MediaCard item={mockItem} searchType="movies" />);

      const favButton = screen.getByTestId('favorites-button');
      expect(favButton).toBeInTheDocument();
      expect(favButton).toHaveAttribute('data-id', '123');
      expect(favButton).toHaveAttribute('data-search-type', 'movies');
    });
  });

  describe('image', () => {
    it('should render image with correct src from buildTMDBImagePath', () => {
      render(<MediaCard item={mockItem} searchType="shows" />);

      const image = screen.getByRole('img', { name: 'Test Show Title' });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/test-poster.jpg');
    });

    it('should have correct alt text', () => {
      render(<MediaCard item={mockItem} searchType="shows" />);

      const image = screen.getByRole('img', { name: 'Test Show Title' });
      expect(image).toHaveAttribute('alt', 'Test Show Title');
    });
  });

  describe('tooltips', () => {
    it('should show genres tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<MediaCard item={mockItem} searchType="shows" />);

      const genresText = screen.getByText('Drama, Thriller');
      await user.hover(genresText);

      await waitFor(() => {
        expect(screen.getAllByText('Drama, Thriller').length).toBeGreaterThan(1);
      });
    });

    it('should show summary tooltip when provided', async () => {
      const user = userEvent.setup();
      render(<MediaCard item={mockItem} searchType="shows" />);

      const summaryText = screen.getByText(mockItem.summary!);
      await user.hover(summaryText);

      await waitFor(() => {
        expect(screen.getAllByText(mockItem.summary!).length).toBeGreaterThan(1);
      });
    });

    it('should handle single genre', () => {
      const itemWithOneGenre = { ...mockItem, genres: ['Drama'] };
      render(<MediaCard item={itemWithOneGenre} searchType="shows" />);

      expect(screen.getByText('Drama')).toBeInTheDocument();
    });

    it('should handle many genres', () => {
      const itemWithManyGenres = { ...mockItem, genres: ['Drama', 'Thriller', 'Mystery', 'Crime'] };
      render(<MediaCard item={itemWithManyGenres} searchType="shows" />);

      expect(screen.getByText('Drama, Thriller, Mystery, Crime')).toBeInTheDocument();
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

      const longTitleItem = {
        ...mockItem,
        title: 'This is a very long title that will definitely be truncated in the card',
      };

      render(<MediaCard item={longTitleItem} searchType="shows" />);

      expect(
        screen.getByText('This is a very long title that will definitely be truncated in the card')
      ).toBeInTheDocument();
    });

    it('should not show tooltip for non-truncated title', () => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 150, // scrollWidth < offsetWidth = not truncated
      });

      render(<MediaCard item={mockItem} searchType="shows" />);

      const titleElement = screen.getByText('Test Show Title');
      expect(titleElement).toBeInTheDocument();
    });

    it('should update truncation on window resize', () => {
      const { rerender } = render(<MediaCard item={mockItem} searchType="shows" />);

      // Initial render
      expect(screen.getByText('Test Show Title')).toBeInTheDocument();

      // Simulate window resize
      window.dispatchEvent(new Event('resize'));

      // Re-render to trigger effect
      rerender(<MediaCard item={mockItem} searchType="shows" />);

      expect(screen.getByText('Test Show Title')).toBeInTheDocument();
    });

    it('should clean up resize listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<MediaCard item={mockItem} searchType="shows" />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('layout and styling', () => {
    it('should render Card component', () => {
      const { container } = render(<MediaCard item={mockItem} searchType="shows" />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render CardMedia with image', () => {
      const { container } = render(<MediaCard item={mockItem} searchType="shows" />);

      const cardMedia = container.querySelector('.MuiCardMedia-root');
      expect(cardMedia).toBeInTheDocument();
    });

    it('should render CardContent with text', () => {
      const { container } = render(<MediaCard item={mockItem} searchType="shows" />);

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    it('should render CardActions with FavoritesButton', () => {
      const { container } = render(<MediaCard item={mockItem} searchType="shows" />);

      const cardActions = container.querySelector('.MuiCardActions-root');
      expect(cardActions).toBeInTheDocument();
      expect(screen.getByTestId('favorites-button')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle null summary gracefully', () => {
      const itemWithNullSummary = { ...mockItem, summary: null };
      render(<MediaCard item={itemWithNullSummary as any} searchType="shows" />);

      expect(screen.getByText('Test Show Title')).toBeInTheDocument();
    });

    it('should handle empty string summary', () => {
      const itemWithEmptySummary = { ...mockItem, summary: '' };
      render(<MediaCard item={itemWithEmptySummary} searchType="shows" />);

      expect(screen.getByText('Test Show Title')).toBeInTheDocument();
    });

    it('should handle very long genres list', () => {
      const itemWithLongGenres = {
        ...mockItem,
        genres: [
          'Drama',
          'Thriller',
          'Mystery',
          'Crime',
          'Action',
          'Adventure',
          'Comedy',
          'Horror',
          'Sci-Fi',
          'Fantasy',
        ],
      };
      render(<MediaCard item={itemWithLongGenres} searchType="shows" />);

      expect(
        screen.getByText('Drama, Thriller, Mystery, Crime, Action, Adventure, Comedy, Horror, Sci-Fi, Fantasy')
      ).toBeInTheDocument();
    });

    it('should handle missing premiered date', () => {
      const itemWithoutPremiered = { ...mockItem, premiered: '' };
      render(<MediaCard item={itemWithoutPremiered} searchType="shows" />);

      expect(screen.getByText('Test Show Title')).toBeInTheDocument();
      // Empty premiered should still render but be empty
      expect(screen.queryByText('2024-01-15')).not.toBeInTheDocument();
    });
  });
});
