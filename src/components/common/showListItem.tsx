import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';
import {
  Avatar,
  Box,
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
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAppDispatch } from '../../app/hooks';
import { Show } from '../../app/model/shows';
import { WatchStatus } from '../../app/model/watchStatus';
import { removeShowFavorite, updateShowStatus } from '../../app/slices/activeProfileSlice';
import { buildEpisodeLine, buildServicesLine } from '../utility/contentUtility';

export type FilterProps = {
  genre: string;
  streamingService: string;
  watchStatus: string[];
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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState<boolean>(false);
  const [confirmChangeWatchStatusDialogOpen, setConfirmChangeWatchStatusDialogOpen] = useState<boolean>(false);

  const handleCloseConfirmChangeWatchStatusDialog = () => {
    setConfirmChangeWatchStatusDialogOpen(false);
  };

  const handleWatchStatusChangeConfirmed = () => {
    setConfirmChangeWatchStatusDialogOpen(false);
    dispatch(
      updateShowStatus({
        profileId: show.profile_id,
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

  const handleRemoveFavorite = () => {
    dispatch(
      removeShowFavorite({
        profileId: Number(show.profile_id),
        showId: show.show_id,
      }),
    );
  };

  return (
    <>
      <ListItem
        id={`showListItem_${show.show_id}`}
        alignItems="flex-start"
        sx={{ cursor: 'pointer', flexDirection: 'row', alignItems: 'center' }}
        onClick={() => navigate(`/shows/${show.show_id}/${show.profile_id}`, { state: buildLinkState() })}
      >
        <ListItemAvatar sx={{ width: 96, height: 140, p: 1 }}>
          <Avatar alt={show.title} src={show.image} variant="rounded" sx={{ width: 96, height: 140 }} />
        </ListItemAvatar>
        <Box sx={{ flexGrow: 1 }}>
          <ListItemText
            primary={show.title}
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
                  <i>{show.description}</i>
                  <br />
                  {show.type} | {show.status}
                  <br />
                  <b>Genres:</b> {show.genres ?? 'unknown'}
                  <br />
                  {buildServicesLine(show)}
                  <br />
                  <b>Release Date:</b> {show.release_date}
                  <br />
                  <b>Seasons:</b> {show.season_count} | <b>Episodes:</b> {show.episode_count}
                  <br />
                  {buildEpisodeLine(show)}
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
        <Tooltip key={`removeFavoriteTooltip_${show.show_id}`} title="Remove Favorite">
          <IconButton
            key={`removeFavoriteIconButton_${show.show_id}`}
            onClick={(event) => {
              handleRemoveFavorite();
              event.stopPropagation();
            }}
          >
            <StarIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip
          key={`watchStatusTooltip_${show.show_id}`}
          title={show.watch_status === 'WATCHED' ? `Mark Not Watched` : `Mark Watched`}
        >
          <IconButton
            key={`watchStatusIconButton_${show.show_id}`}
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
