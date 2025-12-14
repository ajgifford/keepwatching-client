import { render, screen } from '@testing-library/react';

import { SearchResultItem } from '../searchResultItem';
import { DiscoverAndSearchResult } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((path: string) => `https://image.tmdb.org/t/p/original${path || ''}`),
}));

jest.mock('../../media/favoriteButton', () => ({
  __esModule: true,
  default: ({ id, searchType }: any) => (
    <button data-testid="favorite-button" data-id={id} data-search-type={searchType}>
      Favorite
    </button>
  ),
}));

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn(() => false); // Default to large screen
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mockUseMediaQuery(),
}));

describe('SearchResultItem', () => {
  const mockSearchResult: DiscoverAndSearchResult = {
    id: 1,
    title: 'Breaking Bad',
    tmdbId: 123,
    image: '/breaking-bad.jpg',
    premiered: '2008-01-20',
    summary: 'A high school chemistry teacher turned methamphetamine producer.',
    genres: ['Drama', 'Crime', 'Thriller'],
    country: 'US',
    rating: 9.5,
    popularity: 95.5,
    language: 'en',
    inFavorites: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic rendering', () => {
    it('should render result title', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should render summary', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.getByText(/A high school chemistry teacher/)).toBeInTheDocument();
    });

    it('should render genres', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Genres:/)).toBeInTheDocument();
      expect(screen.getByText(/Drama, Crime, Thriller/)).toBeInTheDocument();
    });

    it('should render rating', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Rating:/)).toBeInTheDocument();
      expect(screen.getByText(/9.5/)).toBeInTheDocument();
    });

    it('should render popularity when provided', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Popularity:/)).toBeInTheDocument();
      expect(screen.getByText(/95.5/)).toBeInTheDocument();
    });

    it('should render favorite button', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const favoriteButton = screen.getByTestId('favorite-button');
      expect(favoriteButton).toBeInTheDocument();
      expect(favoriteButton).toHaveAttribute('data-id', '1');
      expect(favoriteButton).toHaveAttribute('data-search-type', 'shows');
    });

    it('should render avatar image', () => {
      const { container } = render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const avatar = container.querySelector('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('alt', 'Breaking Bad');
    });
  });

  describe('premiered date logic', () => {
    it('should show "Premiered" for past dates', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Premiered:/)).toBeInTheDocument();
      expect(screen.getByText(/2008-01-20/)).toBeInTheDocument();
    });

    it('should show "Premieres" for future dates', () => {
      const futureResult = {
        ...mockSearchResult,
        premiered: '2025-12-31',
      };

      render(<SearchResultItem result={futureResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Premieres:/)).toBeInTheDocument();
      expect(screen.getByText(/2025-12-31/)).toBeInTheDocument();
    });

    it('should show "Premieres: TBD" when premiered is missing', () => {
      const noPremieredResult = {
        ...mockSearchResult,
        premiered: '',
      };

      render(<SearchResultItem result={noPremieredResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Premieres:/)).toBeInTheDocument();
      expect(screen.getByText(/TBD/)).toBeInTheDocument();
    });

    it('should show "Premieres: TBD" when premiered is undefined', () => {
      const noPremieredResult = {
        ...mockSearchResult,
        premiered: undefined,
      } as any;

      render(<SearchResultItem result={noPremieredResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Premieres:/)).toBeInTheDocument();
      expect(screen.getByText(/TBD/)).toBeInTheDocument();
    });

    it("should handle today's date as past", () => {
      const todayResult = {
        ...mockSearchResult,
        premiered: '2024-01-15',
      };

      render(<SearchResultItem result={todayResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Premiered:/)).toBeInTheDocument();
    });
  });

  describe('image source handling', () => {
    it('should use buildTMDBImagePath for search source', () => {
      const { container } = render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const avatar = container.querySelector('img');
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original/breaking-bad.jpg');
    });

    it('should use image directly for discover source', () => {
      const discoverResult = {
        ...mockSearchResult,
        image: 'https://external.com/image.jpg',
      };

      const { container } = render(<SearchResultItem result={discoverResult} searchType="shows" source="discover" />);

      const avatar = container.querySelector('img');
      expect(avatar).toHaveAttribute('src', 'https://external.com/image.jpg');
    });
  });

  describe('responsive behavior on small screens', () => {
    it('should show "Show More" button on small screens', () => {
      mockUseMediaQuery.mockReturnValue(true);

      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.getByText('Show More')).toBeInTheDocument();
    });

    it('should not show "Show More" button on large screens', () => {
      mockUseMediaQuery.mockReturnValue(false);

      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('should toggle to "Show Less" when clicking "Show More"', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      const user = userEvent.setup({ delay: null });

      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const showMoreButton = screen.getByText('Show More');
      await user.click(showMoreButton);

      expect(screen.getByText('Show Less')).toBeInTheDocument();
      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
    });

    it('should toggle back to "Show More" when clicking "Show Less"', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      const user = userEvent.setup({ delay: null });

      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const showMoreButton = screen.getByText('Show More');
      await user.click(showMoreButton);

      const showLessButton = screen.getByText('Show Less');
      await user.click(showLessButton);

      expect(screen.getByText('Show More')).toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });
  });

  describe('missing or empty fields', () => {
    it('should handle missing popularity', () => {
      const noPopularityResult = {
        ...mockSearchResult,
        popularity: undefined,
      };

      render(<SearchResultItem result={noPopularityResult} searchType="shows" source="search" />);

      expect(screen.queryByText(/Popularity:/)).not.toBeInTheDocument();
    });

    it('should handle zero popularity', () => {
      const zeroPopularityResult = {
        ...mockSearchResult,
        popularity: 0,
      };

      render(<SearchResultItem result={zeroPopularityResult} searchType="shows" source="search" />);

      // 0 is falsy, so popularity should not be rendered
      expect(screen.queryByText(/Popularity:/)).not.toBeInTheDocument();
    });

    it('should handle empty genres array', () => {
      const noGenresResult = {
        ...mockSearchResult,
        genres: [],
      };

      render(<SearchResultItem result={noGenresResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Genres:/)).toBeInTheDocument();
      // Empty string after "Genres: "
    });

    it('should handle empty summary', () => {
      const noSummaryResult = {
        ...mockSearchResult,
        summary: '',
      };

      render(<SearchResultItem result={noSummaryResult} searchType="shows" source="search" />);

      // Component should still render
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should handle missing image', () => {
      const noImageResult = {
        ...mockSearchResult,
        image: '',
      };

      const { container } = render(<SearchResultItem result={noImageResult} searchType="shows" source="search" />);

      const avatar = container.querySelector('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original');
    });
  });

  describe('edge cases', () => {
    it('should handle very long title', () => {
      const longTitleResult = {
        ...mockSearchResult,
        title: 'A'.repeat(200),
      };

      render(<SearchResultItem result={longTitleResult} searchType="shows" source="search" />);

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
    });

    it('should handle very long summary', () => {
      const longSummaryResult = {
        ...mockSearchResult,
        summary: 'This is a very long summary. '.repeat(50),
      };

      render(<SearchResultItem result={longSummaryResult} searchType="shows" source="search" />);

      expect(screen.getByText(/This is a very long summary./)).toBeInTheDocument();
    });

    it('should handle many genres', () => {
      const manyGenresResult = {
        ...mockSearchResult,
        genres: ['Genre1', 'Genre2', 'Genre3', 'Genre4', 'Genre5', 'Genre6', 'Genre7', 'Genre8'],
      };

      render(<SearchResultItem result={manyGenresResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Genre1, Genre2, Genre3, Genre4, Genre5, Genre6, Genre7, Genre8/)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialCharsResult = {
        ...mockSearchResult,
        title: "It's Always Sunny in Philadelphia & Friends!",
      };

      render(<SearchResultItem result={specialCharsResult} searchType="shows" source="search" />);

      expect(screen.getByText("It's Always Sunny in Philadelphia & Friends!")).toBeInTheDocument();
    });

    it('should handle decimal rating', () => {
      const decimalRatingResult = {
        ...mockSearchResult,
        rating: 7.456,
      };

      render(<SearchResultItem result={decimalRatingResult} searchType="shows" source="search" />);

      expect(screen.getByText(/7.456/)).toBeInTheDocument();
    });

    it('should handle zero rating', () => {
      const zeroRatingResult = {
        ...mockSearchResult,
        rating: 0,
      };

      render(<SearchResultItem result={zeroRatingResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Rating:/)).toBeInTheDocument();
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle very high popularity', () => {
      const highPopularityResult = {
        ...mockSearchResult,
        popularity: 999.999,
      };

      render(<SearchResultItem result={highPopularityResult} searchType="shows" source="search" />);

      expect(screen.getByText(/999.999/)).toBeInTheDocument();
    });
  });

  describe('different search types', () => {
    it('should pass movies search type to favorite button', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="movies" source="search" />);

      const favoriteButton = screen.getByTestId('favorite-button');
      expect(favoriteButton).toHaveAttribute('data-search-type', 'movies');
    });

    it('should pass shows search type to favorite button', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const favoriteButton = screen.getByTestId('favorite-button');
      expect(favoriteButton).toHaveAttribute('data-search-type', 'shows');
    });
  });

  describe('layout and styling', () => {
    it('should render ListItem component', () => {
      const { container } = render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const listItem = container.querySelector('.MuiListItem-root');
      expect(listItem).toBeInTheDocument();
    });

    it('should render ListItemAvatar component', () => {
      const { container } = render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const listItemAvatar = container.querySelector('.MuiListItemAvatar-root');
      expect(listItemAvatar).toBeInTheDocument();
    });

    it('should render ListItemText component', () => {
      const { container } = render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const listItemText = container.querySelector('.MuiListItemText-root');
      expect(listItemText).toBeInTheDocument();
    });

    it('should render Avatar with rounded variant', () => {
      const { container } = render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const avatar = container.querySelector('.MuiAvatar-rounded');
      expect(avatar).toBeInTheDocument();
    });

    it('should render Typography for secondary content', () => {
      const { container } = render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      const captions = container.querySelectorAll('.MuiTypography-caption');
      expect(captions.length).toBeGreaterThan(0);
    });
  });

  describe('genres formatting', () => {
    it('should join genres with comma and space', () => {
      render(<SearchResultItem result={mockSearchResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Drama, Crime, Thriller/)).toBeInTheDocument();
    });

    it('should handle single genre', () => {
      const singleGenreResult = {
        ...mockSearchResult,
        genres: ['Comedy'],
      };

      render(<SearchResultItem result={singleGenreResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Comedy/)).toBeInTheDocument();
    });

    it('should handle genres with special characters', () => {
      const specialGenresResult = {
        ...mockSearchResult,
        genres: ['Sci-Fi', 'Action & Adventure'],
      };

      render(<SearchResultItem result={specialGenresResult} searchType="shows" source="search" />);

      expect(screen.getByText(/Sci-Fi, Action & Adventure/)).toBeInTheDocument();
    });
  });
});
