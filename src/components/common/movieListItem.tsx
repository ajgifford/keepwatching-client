import { Fragment } from 'react/jsx-runtime';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemText, Tooltip } from '@mui/material';

import { useAppDispatch } from '../../app/hooks';
import { Movie } from '../../app/model/movies';
import { WatchStatus } from '../../app/model/watchStatus';
import { updateStatus } from '../../app/slices/moviesSlice';

export type MovieListItemProps = {
  movie: Movie;
};

export const MovieListItem = (props: MovieListItemProps) => {
  const dispatch = useAppDispatch();
  const movie = props.movie;

  const calculateRuntimeDisplay = (runtime: number) => {
    const hours = Math.floor(runtime / 60);
    if (hours < 1) {
      return `${runtime} minutes`;
    } else if (hours > 1 && hours < 2) {
      const minutes = runtime - 60;
      return `${hours} hour, ${minutes} minutes`;
    } else {
      const minutes = runtime - 60 * hours;
      return `${hours} hours, ${minutes} minutes`;
    }
  };

  const handleWatchStatusChange = (currentStatus: WatchStatus) => {
    dispatch(
      updateStatus({
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

  return (
    <ListItem key={`listItem_${movie.movie_id}`} alignItems="flex-start">
      <ListItemAvatar sx={{ width: 94, height: 140, p: 1 }}>
        <Avatar alt={movie.title} src={movie.image} variant="rounded" sx={{ width: 94, height: 140 }} />
      </ListItemAvatar>
      <ListItemText
        primary={movie.title}
        slotProps={{ primary: { variant: 'subtitle1' }, secondary: { variant: 'caption' } }}
        secondary={
          <>
            <i>{movie.description}</i>
            <br />
            Genres: {movie.genres}
            <br />
            Streaming Service: {movie.streaming_service}
            <br />
            Release Date: {movie.release_date}
            <br />
            Runtime: {calculateRuntimeDisplay(movie.runtime)}
          </>
        }
      />

      <Tooltip key={movie.profile_id} title={movie.watched === 'WATCHED' ? `Mark Not Watched` : `Mark Watched`}>
        <IconButton
          key={movie.profile_id}
          onClick={(event) => {
            handleWatchStatusChange(movie.watched);
            event.stopPropagation();
          }}
        >
          {movie.watched === 'NOT_WATCHED' && <WatchLaterOutlinedIcon />}
          {movie.watched === 'WATCHING' && <WatchLaterTwoToneIcon color="success" />}
          {movie.watched === 'WATCHED' && <WatchLaterIcon color="success" />}
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};
