import { Fragment } from 'react/jsx-runtime';

import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { SearchResult } from '../../app/model/search';
import FavoritesButton from './favoriteButton';

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
          {results.map((content) => (
            <Fragment key={content.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={<FavoritesButton id={content.id} searchType={props.searchType} />}
              >
                <ListItemAvatar sx={{ width: 94, height: 140, p: 1 }}>
                  <Avatar alt={content.title} src={content.image} variant="rounded" sx={{ width: 94, height: 140 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={content.title}
                  secondary={
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ display: 'block', marginTop: 1, paddingRight: '120px' }}
                    >
                      <i>{content.summary}</i>
                      <br />
                      <b>Genres:</b> {content.genres.join(', ')}
                      <br />
                      <b>Premiered:</b> {content.premiered}
                      <br />
                      <b>Rating:</b> {content.rating}
                    </Typography>
                  }
                  slotProps={{
                    primary: { variant: 'subtitle1' },
                  }}
                />
              </ListItem>
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
