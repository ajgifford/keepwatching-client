import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
} from '@mui/material';

import { useAppDispatch } from '../../app/hooks';
import { Show } from '../../app/model/shows';
import { WatchStatus } from '../../app/model/watchStatus';
import { updateShowStatus } from '../../app/slices/showsSlice';
import { buildEpisodeLine, buildServicesLine } from '../utility/contentUtility';

export type FilterProps = {
  genre: string;
  streamingService: string;
  watchStatus: string;
  returnPath?: string;
};

export type ShowListItemProps = {
  show: Show;
  getFilters: () => FilterProps;
};

export const ShowListItem = (props: ShowListItemProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const show = props.show;

  const [confirmChangeWatchStatusDialogOpen, setConfirmChangeWatchStatusDialogOpen] = useState<boolean>(false);

  const handleCloseConfirmChangeWatchStatusDialog = () => {
    setConfirmChangeWatchStatusDialogOpen(false);
  };

  const handleWatchStatusChangeConfirmed = () => {
    setConfirmChangeWatchStatusDialogOpen(false);
    dispatch(
      updateShowStatus({
        profileId: Number(show.profile_id),
        showId: show.show_id,
        status: determineNewWatchStatus(show.watch_status),
      }),
    );
  };

  const handleWatchStatusChange = () => {
    setConfirmChangeWatchStatusDialogOpen(true);
  };

  function determineNewWatchStatus(currentStatus: WatchStatus): WatchStatus {
    if (currentStatus === 'NOT_WATCHED') {
      return 'WATCHED';
    } else if (currentStatus === 'WATCHING') {
      return 'WATCHED';
    }
    return 'NOT_WATCHED';
  }

  const buildLinkState = () => {
    const filterProps = props.getFilters();
    filterProps.returnPath = `/shows?profileId=${show.profile_id}`;
    return filterProps;
  };

  return (
    <>
      <ListItem
        alignItems="flex-start"
        sx={{ cursor: 'pointer' }}
        onClick={() => navigate(`/shows/${show.show_id}/${show.profile_id}`, { state: buildLinkState() })}
      >
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
              {show.type} | {show.status}
              <br />
              <b>Genres:</b> {show.genres}
              <br />
              {buildServicesLine(show)}
              <br />
              <b>Release Date:</b> {show.release_date}
              <br />
              <b>Seasons:</b> {show.season_count} | <b>Episodes:</b> {show.episode_count}
              <br />
              {buildEpisodeLine(show)}
            </>
          }
        />

        <Tooltip key={show.profile_id} title={show.watch_status === 'WATCHED' ? `Mark Not Watched` : `Mark Watched`}>
          <IconButton
            key={show.profile_id}
            onClick={(event) => {
              handleWatchStatusChange();
              event.stopPropagation();
            }}
          >
            {show.watch_status === 'NOT_WATCHED' && <WatchLaterOutlinedIcon />}
            {show.watch_status === 'WATCHING' && <WatchLaterTwoToneIcon color="success" />}
            {show.watch_status === 'WATCHED' && <WatchLaterIcon color="success" />}
          </IconButton>
        </Tooltip>
      </ListItem>
      <Dialog
        open={confirmChangeWatchStatusDialogOpen}
        onClose={handleCloseConfirmChangeWatchStatusDialog}
        aria-labelledby="confirm-watch-status-change-dialog-title"
        aria-describedby="confirm-watch-status-change-dialog-description"
      >
        <DialogTitle id="confirm-watch-status-change-dialog-title">
          {show.watch_status === 'WATCHED' ? `Mark '${show.title}' Unwatched?` : `Mark '${show.title}' Watched?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-watch-status-change-dialog-description">
            {show.watch_status === 'WATCHED'
              ? `Marking '${show.title}' unwatched will mark all seasons and episodes unwatched as well. Do you want to proceed?`
              : `Marking '${show.title}' watched will mark all seasons and episodes watched as well. Do you want to proceed?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmChangeWatchStatusDialog} variant="outlined" color="primary">
            No
          </Button>
          <Button onClick={handleWatchStatusChangeConfirmed} variant="contained" color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
