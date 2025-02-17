import { Fragment } from 'react/jsx-runtime';

import { Box, CircularProgress, Divider, List, Typography } from '@mui/material';

import { SearchResult } from '../../app/model/search';
import { SearchResultItem } from './searchResultItem';

interface SearchResultProps {
  results: SearchResult[];
  searchType: string;
  source: 'search' | 'discover';
  isLoading: boolean;
  searchPerformed: boolean;
  lastResultElementRef?: (node: HTMLElement | null) => void;
}

function SearchResults(props: SearchResultProps) {
  const { results, isLoading, lastResultElementRef } = props;

  return (
    <>
      {isLoading && results.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : results.length > 0 ? (
        <List>
          {results.map((result, index) => (
            <Fragment key={result.id}>
              <div ref={index === results.length - 1 ? lastResultElementRef : null}>
                <SearchResultItem result={result} searchType={props.searchType} source={props.source} />
                <Divider variant="inset" component="li" />
              </div>
            </Fragment>
          ))}
          {isLoading && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          )}
        </List>
      ) : props.searchPerformed ? (
        <Box>
          <Typography variant="h6" align="center">
            No Results Found
          </Typography>
        </Box>
      ) : (
        <></>
      )}
    </>
  );
}

export default SearchResults;
