import { Fragment } from 'react/jsx-runtime';

import { Box, CircularProgress, Divider, List } from '@mui/material';

import { SearchEmptyState } from './searchEmptyState';
import { SearchResultItem } from './searchResultItem';
import { DiscoverAndSearchResult } from '@ajgifford/keepwatching-types';

interface SearchResultProps {
  results: DiscoverAndSearchResult[];
  searchType: string;
  source: 'search' | 'discover';
  isLoading: boolean;
  searchPerformed: boolean;
  searchQuery?: string;
  lastResultElementRef?: (node: HTMLElement | null) => void;
}

function SearchResults(props: SearchResultProps) {
  const { results, isLoading, lastResultElementRef, searchType, searchPerformed, searchQuery } = props;

  // Show loading spinner for initial search
  if (isLoading && results.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Show results if we have them
  if (results.length > 0) {
    return (
      <List>
        {results.map((result, index) => (
          <Fragment key={result.id}>
            <div
              ref={index === results.length - 1 ? lastResultElementRef : null}
              className="search-result-item" // Class for infinite scroll observer
            >
              <SearchResultItem result={result} searchType={searchType} source={props.source} />
              <Divider variant="inset" component="li" />
            </div>
          </Fragment>
        ))}
        {/* Loading indicator for pagination */}
        {isLoading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        )}
      </List>
    );
  }

  // Show empty state
  return (
    <SearchEmptyState
      searchType={searchType as 'movies' | 'shows' | 'people'}
      isNoResults={searchPerformed}
      searchQuery={searchQuery}
      source={props.source}
    />
  );
}

export default SearchResults;
