import { Fragment } from 'react/jsx-runtime';

import { Box, Divider, List, Typography } from '@mui/material';

import { SearchResult } from '../../app/model/search';
import { SearchResultItem } from './searchResultItem';

interface SearchResultProps {
  results: SearchResult[];
  searchType: string;
}

function SearchResults(props: SearchResultProps) {
  const results = props.results;

  return (
    <>
      {results.length > 0 ? (
        <List>
          {results.map((result) => (
            <Fragment key={result.id}>
              <SearchResultItem result={result} searchType={props.searchType} />
              <Divider variant="inset" component="li" />
            </Fragment>
          ))}
        </List>
      ) : (
        <Box>
          <Typography variant="h6" align="center">
            No Results Found
          </Typography>
        </Box>
      )}
    </>
  );
}

export default SearchResults;
