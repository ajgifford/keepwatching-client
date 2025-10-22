import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
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

import { useAppDispatch } from '../../../app/hooks';
import { removeShowFavorite, updateShowWatchStatus } from '../../../app/slices/activeProfileSlice';
import {
  buildEpisodeLine,
  buildServicesLine,
  buildShowAirDate,
  buildTMDBImagePath,
} from '../../utility/contentUtility';
import { WatchStatusIcon, determineNextShowWatchStatus, getWatchStatusAction } from '../../utility/watchStatusUtility';
import { OptionalTooltipControl } from '../controls/optionalTooltipControl';
import { ProfileShow, WatchStatus } from '@ajgifford/keepwatching-types';

export type FilterProps = {
  genre: string;
  streamingService: string;
  watchStatus: string[];
  returnPath?: string;
};

export type ShowListItemProps = {
  show: ProfileShow;
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
  const [isUpdatingWatchStatus, setIsUpdatingWatchStatus] = useState<boolean>(false);

  const nextWatchStatus = determineNextShowWatchStatus(show);

  const handleCloseConfirmChangeWatchStatusDialog = () => {
    setConfirmChangeWatchStatusDialogOpen(false);
  };

  const handleWatchStatusChangeConfirmed = async () => {
    setConfirmChangeWatchStatusDialogOpen(false);
    setIsUpdatingWatchStatus(true);

    try {
      await dispatch(
        updateShowWatchStatus({
          profileId: show.profileId,
          showId: show.id,
          status: nextWatchStatus,
        })
      );
    } finally {
      setIsUpdatingWatchStatus(false);
    }
  };

  const handleWatchStatusChange = () => {
    setConfirmChangeWatchStatusDialogOpen(true);
  };

  const buildLinkState = () => {
    const filterProps = props.getFilters();
    filterProps.returnPath = `/shows?profileId=${show.profileId}`;
    return filterProps;
  };

  const handleRemoveFavorite = () => {
    dispatch(
      removeShowFavorite({
        profileId: Number(show.profileId),
        showId: show.id,
      })
    );
  };

  return (
    <>
      <ListItem
        id={`showListItem_${show.id}`}
        alignItems="flex-start"
        sx={{ cursor: 'pointer', flexDirection: 'row', alignItems: 'center', gap: 2 }}
        onClick={() => navigate(`/shows/${show.id}/${show.profileId}`, { state: buildLinkState() })}
      >
        <ListItemAvatar sx={{ minWidth: 96, width: 96, height: 140, p: 0, m: 0 }}>
          <Avatar
            alt={show.title}
            src={buildTMDBImagePath(show.posterImage)}
            variant="rounded"
            sx={{ width: 96, height: 140 }}
          />
        </ListItemAvatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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
                  {show.type} • {show.status}
                  <br />
                  <b>Genres: </b> {show.genres ?? 'unknown'}
                  <br />
                  {buildServicesLine(show)}
                  <br />
                  {buildShowAirDate(show.releaseDate)} • <b>Rated: </b> {show.contentRating}
                  <br />
                  <b>Seasons: </b> {show.seasonCount} • <b>Episodes: </b> {show.episodeCount}
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
        <Tooltip key={`removeFavoriteTooltip_${show.id}`} title="Remove Favorite">
          <IconButton
            key={`removeFavoriteIconButton_${show.id}`}
            onClick={(event) => {
              handleRemoveFavorite();
              event.stopPropagation();
            }}
          >
            <StarIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Box sx={{ position: 'relative' }}>
          <OptionalTooltipControl
            identifier={`watchStatusTooltip_${show.id}`}
            title={getWatchStatusAction(show.watchStatus)}
            disabled={show.watchStatus === WatchStatus.UNAIRED || isUpdatingWatchStatus}
          >
            <IconButton
              key={`watchStatusIconButton_${show.id}`}
              disabled={show.watchStatus === WatchStatus.UNAIRED || isUpdatingWatchStatus}
              onClick={(event) => {
                handleWatchStatusChange();
                event.stopPropagation();
              }}
            >
              <WatchStatusIcon status={show.watchStatus} />
            </IconButton>
          </OptionalTooltipControl>
          {isUpdatingWatchStatus && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </ListItem>
      <Dialog
        open={confirmChangeWatchStatusDialogOpen}
        onClose={handleCloseConfirmChangeWatchStatusDialog}
        aria-labelledby="confirm-watch-status-change-dialog-title"
        aria-describedby="confirm-watch-status-change-dialog-description"
      >
        <DialogTitle id="confirm-watch-status-change-dialog-title">
          {`Mark '${show.title}' ${nextWatchStatus === WatchStatus.NOT_WATCHED ? 'Not Watched' : 'Watched'}?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-watch-status-change-dialog-description">
            {nextWatchStatus === WatchStatus.NOT_WATCHED
              ? `Marking '${show.title}' not watched will mark all seasons and episodes not watched as well. Do you want to proceed?`
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
