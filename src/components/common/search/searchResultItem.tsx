import { useState } from 'react';

import {
  Avatar,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { buildTMDBImagePath } from '../../utility/contentUtility';
import FavoritesButton from '../media/favoriteButton';
import { DiscoverAndSearchResult } from '@ajgifford/keepwatching-types';

interface SearchResultProps {
  result: DiscoverAndSearchResult;
  searchType: string;
  source: 'search' | 'discover';
}

export function SearchResultItem(props: SearchResultProps) {
  const searchResult = props.result;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState<boolean>(false);
  const imageSrc = props.source === 'search' ? buildTMDBImagePath(searchResult.image) : searchResult.image;

  function buildPremieredString() {
    if (!searchResult.premiered) {
      return (
        <>
          <b>{'Premieres: '}</b>
          {'TBD'}
        </>
      );
    }
    const premieredDate = new Date(searchResult.premiered);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (premieredDate > today) {
      return (
        <>
          <b>Premieres: </b>
          {searchResult.premiered}
        </>
      );
    }
    return (
      <>
        <b>{'Premiered: '}</b>
        {searchResult.premiered}
      </>
    );
  }

  return (
    <ListItem
      key={searchResult.id}
      alignItems="center"
      sx={{ gap: 2 }}
      secondaryAction={<FavoritesButton id={searchResult.id} searchType={props.searchType} />}
    >
      <ListItemAvatar sx={{ minWidth: 94, width: 94, height: 140, p: 0, m: 0, display: 'flex', alignItems: 'center' }}>
        <Avatar alt={searchResult.title} src={imageSrc} variant="rounded" sx={{ width: 94, height: 140 }} />
      </ListItemAvatar>
      <ListItemText
        sx={{ minWidth: 0 }}
        primary={searchResult.title}
        secondary={
          <>
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: isSmallScreen && !expanded ? 3 : 'unset',
                overflow: 'hidden',
                paddingRight: isSmallScreen ? '30px' : '120px',
              }}
            >
              <i>{searchResult.summary}</i>
              <br />
              <b>Genres: </b> {searchResult.genres.join(', ')}
              <br />
              {buildPremieredString()}
              <br />
              <b>Rating: </b> {searchResult.rating}
              {searchResult.popularity && (
                <>
                  <br />
                  <b>Popularity: </b> {searchResult.popularity}
                </>
              )}
            </Typography>
            {isSmallScreen && (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? 'Show Less' : 'Show More'}
              </Button>
            )}
          </>
        }
        slotProps={{
          primary: { variant: 'subtitle1' },
        }}
      />
    </ListItem>
  );
}
