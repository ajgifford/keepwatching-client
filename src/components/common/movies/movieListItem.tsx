import { useState } from 'react';

import StarIcon from '@mui/icons-material/Star';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAppDispatch } from '../../../app/hooks';
import { Movie } from '../../../app/model/movies';
import { WatchStatus } from '../../../app/model/watchStatus';
import { removeMovieFavorite, updateMovieStatus } from '../../../app/slices/activeProfileSlice';
import { buildTMDBImagePath, calculateRuntimeDisplay } from '../../utility/contentUtility';

export type MovieListItemProps = {
  movie: Movie;
};

export const MovieListItem = (props: MovieListItemProps) => {
  const dispatch = useAppDispatch();
  const movie = props.movie;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleWatchStatusChange = (currentStatus: WatchStatus) => {
    dispatch(
      updateMovieStatus({
        profileId: Number(movie.profile_id),
        movieId: movie.movie_id,
        status: determineNewWatchStatus(currentStatus),
      }),
    );
  };

  function determineNewWatchStatus(currentStatus: WatchStatus): WatchStatus {
    if (currentStatus === 'NOT_WATCHED') {
      return 'WATCHED';
    } else if (currentStatus === 'WATCHING') {
      return 'WATCHED';
    }
    return 'NOT_WATCHED';
  }

  const handleRemoveFavorite = () => {
    dispatch(
      removeMovieFavorite({
        profileId: Number(movie.profile_id),
        movieId: movie.movie_id,
      }),
    );
  };

  return (
    <ListItem key={`listItem_${movie.movie_id}`} alignItems="flex-start">
      <ListItemAvatar sx={{ width: 96, height: 140, p: 1 }}>
        <Avatar
          alt={movie.title}
          src={buildTMDBImagePath(movie.poster_image)}
          variant="rounded"
          sx={{ width: 96, height: 140 }}
        />
      </ListItemAvatar>
      <Box sx={{ flexGrow: 1 }}>
        <ListItemText
          primary={movie.title}
          slotProps={{ primary: { variant: 'subtitle1' }, secondary: { variant: 'caption' } }}
          secondary={
            <>
              <Typography
                variant="body2"
                sx={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: isSmallScreen && !expanded ? 3 : 'unset',
                  overflow: 'hidden',
                }}
              >
                <i>{movie.description}</i>
                <br />
                <b>Genres: </b> {movie.genres}
                <br />
                <b>Streaming Service: </b> {movie.streaming_services}
                <br />
                <b>Release Date: </b>
                {movie.release_date} | <b>Rated: </b> {movie.mpa_rating}
                <br />
                <b>Runtime: </b>
                {calculateRuntimeDisplay(movie.runtime)}
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
        />
      </Box>
      <Tooltip key={`removeFavoriteTooltip_${movie.movie_id}`} title="Remove Favorite">
        <IconButton
          key={`removeFavoriteIconButton_${movie.movie_id}`}
          onClick={(event) => {
            handleRemoveFavorite();
            event.stopPropagation();
          }}
        >
          <StarIcon color="primary" />
        </IconButton>
      </Tooltip>
      <Tooltip key={movie.profile_id} title={movie.watch_status === 'WATCHED' ? `Mark Not Watched` : `Mark Watched`}>
        <IconButton
          key={movie.profile_id}
          onClick={(event) => {
            handleWatchStatusChange(movie.watch_status);
            event.stopPropagation();
          }}
        >
          {movie.watch_status === 'NOT_WATCHED' && <WatchLaterOutlinedIcon />}
          {movie.watch_status === 'WATCHING' && <WatchLaterTwoToneIcon color="success" />}
          {movie.watch_status === 'WATCHED' && <WatchLaterIcon color="success" />}
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};
