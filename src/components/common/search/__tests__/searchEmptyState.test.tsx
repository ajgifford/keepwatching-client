import { render, screen } from '@testing-library/react';

import { SearchEmptyState } from '../searchEmptyState';

describe('SearchEmptyState', () => {
  describe('initial empty state - search source', () => {
    it('should render movies initial state', () => {
      render(<SearchEmptyState searchType="movies" />);

      expect(screen.getByText('Search for Movies')).toBeInTheDocument();
      expect(screen.getByText(/Discover movies to add to your watchlist/)).toBeInTheDocument();
    });

    it('should render shows initial state', () => {
      render(<SearchEmptyState searchType="shows" />);

      expect(screen.getByText('Search for TV Shows')).toBeInTheDocument();
      expect(screen.getByText(/Find TV shows to track and follow/)).toBeInTheDocument();
    });

    it('should render people initial state', () => {
      render(<SearchEmptyState searchType="people" />);

      expect(screen.getByText('Search for People')).toBeInTheDocument();
      expect(screen.getByText(/Find movies and TV shows by searching for actors/)).toBeInTheDocument();
    });
  });

  describe('initial empty state - discover source', () => {
    it('should render discover initial state', () => {
      render(<SearchEmptyState searchType="movies" source="discover" />);

      expect(screen.getByText('Discover Content')).toBeInTheDocument();
      expect(screen.getByText(/Select a streaming service and content type/)).toBeInTheDocument();
    });

    it('should render discover initial state for shows', () => {
      render(<SearchEmptyState searchType="shows" source="discover" />);

      expect(screen.getByText('Discover Content')).toBeInTheDocument();
      expect(screen.getByText(/Select a streaming service and content type/)).toBeInTheDocument();
    });

    it('should render discover initial state for people', () => {
      render(<SearchEmptyState searchType="people" source="discover" />);

      expect(screen.getByText('Discover Content')).toBeInTheDocument();
      expect(screen.getByText(/Select a streaming service and content type/)).toBeInTheDocument();
    });
  });

  describe('no results state - search source', () => {
    it('should render movies no results state', () => {
      render(<SearchEmptyState searchType="movies" isNoResults={true} />);

      expect(screen.getByText('No movies found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search terms/)).toBeInTheDocument();
    });

    it('should render shows no results state', () => {
      render(<SearchEmptyState searchType="shows" isNoResults={true} />);

      expect(screen.getByText('No TV shows found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search terms/)).toBeInTheDocument();
    });

    it('should render people no results state', () => {
      render(<SearchEmptyState searchType="people" isNoResults={true} />);

      expect(screen.getByText('No people found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search terms/)).toBeInTheDocument();
    });
  });

  describe('no results state - discover source', () => {
    it('should render discover no results state', () => {
      render(<SearchEmptyState searchType="movies" isNoResults={true} source="discover" />);

      expect(screen.getByText('No content found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your filters/)).toBeInTheDocument();
    });
  });

  describe('no results with search query', () => {
    it('should include search query in no results message', () => {
      render(<SearchEmptyState searchType="movies" isNoResults={true} searchQuery="The Matrix" />);

      expect(screen.getByText(/No results found for "The Matrix"/)).toBeInTheDocument();
    });

    it('should include query with special characters', () => {
      render(<SearchEmptyState searchType="shows" isNoResults={true} searchQuery="It's Always Sunny" />);

      expect(screen.getByText(/No results found for "It's Always Sunny"/)).toBeInTheDocument();
    });

    it('should handle empty string query', () => {
      render(<SearchEmptyState searchType="movies" isNoResults={true} searchQuery="" />);

      expect(screen.getByText('No movies found')).toBeInTheDocument();
      expect(screen.queryByText(/No results found for ""/)).not.toBeInTheDocument();
    });
  });

  describe('icon rendering', () => {
    it('should render MovieIcon for movies search type', () => {
      const { container } = render(<SearchEmptyState searchType="movies" />);

      const movieIcon = container.querySelector('[data-testid="MovieIcon"]');
      expect(movieIcon).toBeInTheDocument();
    });

    it('should render TvIcon for shows search type', () => {
      const { container } = render(<SearchEmptyState searchType="shows" />);

      const tvIcon = container.querySelector('[data-testid="TvIcon"]');
      expect(tvIcon).toBeInTheDocument();
    });

    it('should render PersonIcon for people search type', () => {
      const { container } = render(<SearchEmptyState searchType="people" />);

      const personIcon = container.querySelector('[data-testid="PersonIcon"]');
      expect(personIcon).toBeInTheDocument();
    });

    it('should render ExploreIcon for discover source', () => {
      const { container } = render(<SearchEmptyState searchType="movies" source="discover" />);

      const exploreIcon = container.querySelector('[data-testid="ExploreIcon"]');
      expect(exploreIcon).toBeInTheDocument();
    });

    it('should render ExploreIcon for discover source regardless of search type', () => {
      const { container } = render(<SearchEmptyState searchType="people" source="discover" />);

      const exploreIcon = container.querySelector('[data-testid="ExploreIcon"]');
      expect(exploreIcon).toBeInTheDocument();

      const personIcon = container.querySelector('[data-testid="PersonIcon"]');
      expect(personIcon).not.toBeInTheDocument();
    });
  });

  describe('default prop values', () => {
    it('should default to initial state when isNoResults is not provided', () => {
      render(<SearchEmptyState searchType="movies" />);

      expect(screen.getByText('Search for Movies')).toBeInTheDocument();
      expect(screen.queryByText('No movies found')).not.toBeInTheDocument();
    });

    it('should default to search source when source is not provided', () => {
      render(<SearchEmptyState searchType="movies" />);

      expect(screen.getByText('Search for Movies')).toBeInTheDocument();
      expect(screen.queryByText('Discover Content')).not.toBeInTheDocument();
    });

    it('should handle missing searchQuery in no results state', () => {
      render(<SearchEmptyState searchType="movies" isNoResults={true} />);

      expect(screen.getByText('No movies found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search terms/)).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render container Box', () => {
      const { container } = render(<SearchEmptyState searchType="movies" />);

      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render title as h6 Typography', () => {
      render(<SearchEmptyState searchType="movies" />);

      const title = screen.getByText('Search for Movies');
      expect(title.tagName).toBe('H6');
    });

    it('should render description Typography', () => {
      const { container } = render(<SearchEmptyState searchType="movies" />);

      const descriptions = container.querySelectorAll('.MuiTypography-body2');
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very long search query', () => {
      const longQuery = 'A'.repeat(200);
      render(<SearchEmptyState searchType="movies" isNoResults={true} searchQuery={longQuery} />);

      expect(screen.getByText(new RegExp(`No results found for "${longQuery}"`))).toBeInTheDocument();
    });

    it('should handle search query with quotes', () => {
      render(<SearchEmptyState searchType="movies" isNoResults={true} searchQuery='The "Best" Movie' />);

      expect(screen.getByText(/No results found for "The "Best" Movie"/)).toBeInTheDocument();
    });

    it('should handle special characters in search query', () => {
      render(<SearchEmptyState searchType="shows" isNoResults={true} searchQuery="Show & Tell: A Story!" />);

      expect(screen.getByText(/No results found for "Show & Tell: A Story!"/)).toBeInTheDocument();
    });

    it('should render correctly when switching from initial to no results', () => {
      const { rerender } = render(<SearchEmptyState searchType="movies" />);

      expect(screen.getByText('Search for Movies')).toBeInTheDocument();

      rerender(<SearchEmptyState searchType="movies" isNoResults={true} searchQuery="Test" />);

      expect(screen.getByText('No movies found')).toBeInTheDocument();
      expect(screen.getByText(/No results found for "Test"/)).toBeInTheDocument();
      expect(screen.queryByText('Search for Movies')).not.toBeInTheDocument();
    });

    it('should render correctly when switching search types', () => {
      const { rerender } = render(<SearchEmptyState searchType="movies" />);

      expect(screen.getByText('Search for Movies')).toBeInTheDocument();

      rerender(<SearchEmptyState searchType="shows" />);

      expect(screen.getByText('Search for TV Shows')).toBeInTheDocument();
      expect(screen.queryByText('Search for Movies')).not.toBeInTheDocument();
    });

    it('should render correctly when switching sources', () => {
      const { rerender } = render(<SearchEmptyState searchType="movies" source="search" />);

      expect(screen.getByText('Search for Movies')).toBeInTheDocument();

      rerender(<SearchEmptyState searchType="movies" source="discover" />);

      expect(screen.getByText('Discover Content')).toBeInTheDocument();
      expect(screen.queryByText('Search for Movies')).not.toBeInTheDocument();
    });
  });

  describe('content variations', () => {
    it('should show correct message for movies initial state', () => {
      render(<SearchEmptyState searchType="movies" />);

      expect(screen.getByText(/Search by title \(and year\) find your next favorite film/)).toBeInTheDocument();
    });

    it('should show correct message for shows initial state', () => {
      render(<SearchEmptyState searchType="shows" />);

      expect(
        screen.getByText(/Search by title \(and year\) to discover your next binge-worthy series/)
      ).toBeInTheDocument();
    });

    it('should show correct message for people initial state', () => {
      render(<SearchEmptyState searchType="people" />);

      expect(screen.getByText(/actors, directors, writers, and other crew members/)).toBeInTheDocument();
    });

    it('should show correct message for discover source', () => {
      render(<SearchEmptyState searchType="movies" source="discover" />);

      expect(screen.getByText(/trending shows and movies available to watch/)).toBeInTheDocument();
    });

    it('should show correct no results message for discover source', () => {
      render(<SearchEmptyState searchType="movies" source="discover" isNoResults={true} />);

      expect(screen.getByText(/adjusting your filters or selecting a different service/)).toBeInTheDocument();
    });
  });
});
