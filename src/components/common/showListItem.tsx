import { useNavigate } from 'react-router-dom';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemText, Tooltip } from '@mui/material';

import { useAppDispatch } from '../../app/hooks';
import { Show } from '../../app/model/shows';
import { WatchStatus } from '../../app/model/watchStatus';
import { updateShowStatus } from '../../app/slices/showsSlice';

export type ShowListItemProps = {
  show: Show;
};

export const ShowListItem = (props: ShowListItemProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const show = props.show;

  const handleWatchStatusChange = (currentStatus: WatchStatus) => {
    dispatch(
      updateShowStatus({
        profileId: Number(show.profile_id),
        showId: show.show_id,
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

  //onClick={() => navigate(`/shows/${show.show_id}`)}
  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar sx={{ width: 96, height: 140, p: 1 }}>
        <Avatar alt={show.title} src={show.image} variant="rounded" sx={{ width: 96, height: 140 }} />
      </ListItemAvatar>
      <ListItemText
        primary={show.title}
        slotProps={{ primary: { variant: 'subtitle1' }, secondary: { variant: 'caption' } }}
        secondary={
          <>
            <i>{show.description}</i>
            <br />
            Genres: {show.genres}
            <br />
            Streaming Service: {show.streaming_service}
            <br />
            Release Date: {show.release_date}
            <br />
            Seasons: {show.season_count} | Episodes: {show.episode_count}
          </>
        }
      />

      <Tooltip key={show.profile_id} title={show.watch_status === 'WATCHED' ? `Mark Not Watched` : `Mark Watched`}>
        <IconButton
          key={show.profile_id}
          onClick={(event) => {
            handleWatchStatusChange(show.watch_status);
            event.stopPropagation();
          }}
        >
          {show.watch_status === 'NOT_WATCHED' && <WatchLaterOutlinedIcon />}
          {show.watch_status === 'WATCHING' && <WatchLaterTwoToneIcon color="success" />}
          {show.watch_status === 'WATCHED' && <WatchLaterIcon color="success" />}
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};
