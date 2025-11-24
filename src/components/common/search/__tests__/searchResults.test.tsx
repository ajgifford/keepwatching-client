import { render, screen } from '@testing-library/react';

import SearchResults from '../searchResults';
import { DiscoverAndSearchResult } from '@ajgifford/keepwatching-types';

// Mock child components
jest.mock('../searchEmptyState', () => ({
  SearchEmptyState: ({ searchType, isNoResults, searchQuery, source }: any) => (
    <div data-testid="search-empty-state" data-search-type={searchType} data-is-no-results={isNoResults} data-search-query={searchQuery} data-source={source}>
      SearchEmptyState
    </div>
  ),
}));

jest.mock('../searchResultItem', () => ({
  SearchResultItem: ({ result, searchType, source }: any) => (
    <div data-testid="search-result-item" data-result-id={result.id} data-search-type={searchType} data-source={source}>
      {result.title}
    </div>
  ),
}));

describe('SearchResults', () => {
  const mockResults: DiscoverAndSearchResult[] = [
    {
      id: '1',
      title: 'Breaking Bad',
      image: '/breaking-bad.jpg',
      premiered: '2008-01-20',
      summary: 'A chemistry teacher turned meth producer',
      genres: ['Drama', 'Crime'],
      rating: 9.5,
      popularity: 95.5,
    },
    {
      id: '2',
      title: 'Better Call Saul',

      image: '/bcs.jpg',
      premiered: '2015-02-08',
      summary: 'Lawyer prequel to Breaking Bad',
      genres: ['Drama', 'Crime'],
      rating: 8.9,
      popularity: 88.0,
    },
    {
      id: '3',
      title: 'The Wire',
      image: '/wire.jpg',
      premiered: '2002-06-02',
      summary: 'Baltimore crime drama',
      genres: ['Drama', 'Crime'],
      rating: 9.3,
      popularity: 92.0,
    },
  ];

  describe('loading state', () => {
    it('should show loading spinner when loading with no results', () => {
      render(
        <SearchResults
          results={[]}
          searchType="shows"
          source="search"
          isLoading={true}
          searchPerformed={false}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByTestId('search-empty-state')).not.toBeInTheDocument();
    });

    it('should not show loading spinner when not loading', () => {
      render(
        <SearchResults
          results={[]}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={false}
        />
      );

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should show pagination loading spinner when loading with results', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={true}
          searchPerformed={true}
        />
      );

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(1);
    });
  });

  describe('results rendering', () => {
    it('should render all search results', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('Better Call Saul')).toBeInTheDocument();
      expect(screen.getByText('The Wire')).toBeInTheDocument();
    });

    it('should render SearchResultItem for each result', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const resultItems = screen.getAllByTestId('search-result-item');
      expect(resultItems).toHaveLength(3);
    });

    it('should pass correct props to SearchResultItem', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="movies"
          source="discover"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const resultItems = screen.getAllByTestId('search-result-item');
      expect(resultItems[0]).toHaveAttribute('data-result-id', '1');
      expect(resultItems[0]).toHaveAttribute('data-search-type', 'movies');
      expect(resultItems[0]).toHaveAttribute('data-source', 'discover');
    });

    it('should render List component', () => {
      const { container } = render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const list = container.querySelector('.MuiList-root');
      expect(list).toBeInTheDocument();
    });

    it('should render Divider components', () => {
      const { container } = render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const dividers = container.querySelectorAll('.MuiDivider-root');
      expect(dividers).toHaveLength(3);
    });

    it('should apply search-result-item class for infinite scroll', () => {
      const { container } = render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const searchResultItems = container.querySelectorAll('.search-result-item');
      expect(searchResultItems).toHaveLength(3);
    });
  });

  describe('empty state', () => {
    it('should show SearchEmptyState when no results and search not performed', () => {
      render(
        <SearchResults
          results={[]}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={false}
        />
      );

      const emptyState = screen.getByTestId('search-empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveAttribute('data-is-no-results', 'false');
    });

    it('should show SearchEmptyState when no results after search', () => {
      render(
        <SearchResults
          results={[]}
          searchType="movies"
          source="search"
          isLoading={false}
          searchPerformed={true}
          searchQuery="Test Query"
        />
      );

      const emptyState = screen.getByTestId('search-empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveAttribute('data-is-no-results', 'true');
      expect(emptyState).toHaveAttribute('data-search-query', 'Test Query');
    });

    it('should pass correct searchType to SearchEmptyState', () => {
      render(
        <SearchResults
          results={[]}
          searchType="people"
          source="search"
          isLoading={false}
          searchPerformed={false}
        />
      );

      const emptyState = screen.getByTestId('search-empty-state');
      expect(emptyState).toHaveAttribute('data-search-type', 'people');
    });

    it('should pass source prop to SearchEmptyState', () => {
      render(
        <SearchResults
          results={[]}
          searchType="shows"
          source="discover"
          isLoading={false}
          searchPerformed={false}
        />
      );

      const emptyState = screen.getByTestId('search-empty-state');
      expect(emptyState).toHaveAttribute('data-source', 'discover');
    });
  });

  describe('infinite scroll reference', () => {
    it('should attach ref to last result element', () => {
      const mockRef = jest.fn();

      const { container } = render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
          lastResultElementRef={mockRef}
        />
      );

      // The ref should have been called with the last element
      expect(mockRef).toHaveBeenCalled();
    });

    it('should not attach ref to non-last elements', () => {
      const mockRef = jest.fn();

      render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
          lastResultElementRef={mockRef}
        />
      );

      // Ref should only be called once (for the last element)
      expect(mockRef).toHaveBeenCalledTimes(1);
    });

    it('should work without lastResultElementRef provided', () => {
      expect(() => {
        render(
          <SearchResults
            results={mockResults}
            searchType="shows"
            source="search"
            isLoading={false}
            searchPerformed={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle single result', () => {
      render(
        <SearchResults
          results={[mockResults[0]]}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const resultItems = screen.getAllByTestId('search-result-item');
      expect(resultItems).toHaveLength(1);
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should handle large number of results', () => {
      const manyResults = Array.from({ length: 50 }, (_, i) => ({
        ...mockResults[0],
        id: i,
        title: `Show ${i}`,
      }));

      render(
        <SearchResults
          results={manyResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const resultItems = screen.getAllByTestId('search-result-item');
      expect(resultItems).toHaveLength(50);
    });

    it('should handle missing searchQuery', () => {
      render(
        <SearchResults
          results={[]}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      // Should render empty state without errors even when searchQuery is not provided
      const emptyState = screen.getByTestId('search-empty-state');
      expect(emptyState).toBeInTheDocument();
    });

    it('should handle empty string searchQuery', () => {
      render(
        <SearchResults
          results={[]}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
          searchQuery=""
        />
      );

      const emptyState = screen.getByTestId('search-empty-state');
      expect(emptyState).toHaveAttribute('data-search-query', '');
    });
  });

  describe('different search types', () => {
    it('should handle movies search type', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="movies"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const resultItems = screen.getAllByTestId('search-result-item');
      expect(resultItems[0]).toHaveAttribute('data-search-type', 'movies');
    });

    it('should handle shows search type', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const resultItems = screen.getAllByTestId('search-result-item');
      expect(resultItems[0]).toHaveAttribute('data-search-type', 'shows');
    });

    it('should handle people search type in empty state', () => {
      render(
        <SearchResults
          results={[]}
          searchType="people"
          source="search"
          isLoading={false}
          searchPerformed={false}
        />
      );

      const emptyState = screen.getByTestId('search-empty-state');
      expect(emptyState).toHaveAttribute('data-search-type', 'people');
    });
  });

  describe('source variations', () => {
    it('should handle search source', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="movies"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const resultItems = screen.getAllByTestId('search-result-item');
      expect(resultItems[0]).toHaveAttribute('data-source', 'search');
    });

    it('should handle discover source', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="movies"
          source="discover"
          isLoading={false}
          searchPerformed={true}
        />
      );

      const resultItems = screen.getAllByTestId('search-result-item');
      expect(resultItems[0]).toHaveAttribute('data-source', 'discover');
    });
  });

  describe('loading combinations', () => {
    it('should show initial loading without SearchEmptyState', () => {
      render(
        <SearchResults
          results={[]}
          searchType="shows"
          source="search"
          isLoading={true}
          searchPerformed={false}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByTestId('search-empty-state')).not.toBeInTheDocument();
    });

    it('should show results with pagination loading', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={true}
          searchPerformed={true}
        />
      );

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should not show pagination loading when not loading', () => {
      render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('key generation', () => {
    it('should use result id as key', () => {
      const { container } = render(
        <SearchResults
          results={mockResults}
          searchType="shows"
          source="search"
          isLoading={false}
          searchPerformed={true}
        />
      );

      // Each result should have a unique data-result-id
      const resultItems = screen.getAllByTestId('search-result-item');
      resultItems.forEach((item) => {
        expect(item).toHaveAttribute('data-result-id');
      });
    });
  });
});
