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

import { SearchResult } from '../../app/model/search';
import FavoritesButton from './favoriteButton';

interface SearchResultProps {
  result: SearchResult;
  searchType: string;
}

export function SearchResultItem(props: SearchResultProps) {
  const searchResult = props.result;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <ListItem
      key={searchResult.id}
      alignItems="flex-start"
      secondaryAction={<FavoritesButton id={searchResult.id} searchType={props.searchType} />}
    >
      <ListItemAvatar sx={{ width: 94, height: 140, p: 1 }}>
        <Avatar alt={searchResult.title} src={searchResult.image} variant="rounded" sx={{ width: 94, height: 140 }} />
      </ListItemAvatar>
      <ListItemText
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
              <b>Genres:</b> {searchResult.genres.join(', ')}
              <br />
              <b>Premiered:</b> {searchResult.premiered}
              <br />
              <b>Rating:</b> {searchResult.rating}
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
