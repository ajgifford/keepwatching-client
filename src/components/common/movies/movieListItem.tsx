import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Replay from '@mui/icons-material/Replay';
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
import { useDateFormatters } from '../../../app/hooks/useDateFormatters';
import { removeMovieFavorite, updateMovieWatchStatus } from '../../../app/slices/activeProfileSlice';
import { startMovieRewatch } from '../../../app/slices/watchHistorySlice';
import { calculateRuntimeDisplay } from '../../utility/contentUtility';
import { getWatchStatusAction } from '../../utility/watchStatusUtility';
import { OptionalTooltipControl } from '../controls/optionalTooltipControl';
import { UnfavoriteChoiceDialog } from '../dialogs/UnfavoriteChoiceDialog';
import { ProfileMovie, SimpleWatchStatus, WatchStatus } from '@ajgifford/keepwatching-types';
import { WatchStatusIcon, buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

export type FilterProps = {
  genre: string;
  streamingService: string;
  watchStatus: string[];
  returnPath?: string;
};

export type MovieListItemProps = {
  movie: ProfileMovie;
  getFilters: () => FilterProps;
};

export const MovieListItem = (props: MovieListItemProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const formatters = useDateFormatters();
  const movie = props.movie;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isUpdatingWatchStatus, setIsUpdatingWatchStatus] = useState<boolean>(false);
  const [isRewatching, setIsRewatching] = useState<boolean>(false);
  const [rewatchConfirmOpen, setRewatchConfirmOpen] = useState<boolean>(false);
  const [unfavoriteDialogOpen, setUnfavoriteDialogOpen] = useState<boolean>(false);

  const handleWatchStatusChange = async (currentStatus: SimpleWatchStatus) => {
    setIsUpdatingWatchStatus(true);

    try {
      await dispatch(
        updateMovieWatchStatus({
          profileId: movie.profileId,
          movieId: movie.id,
          status: currentStatus === WatchStatus.NOT_WATCHED ? WatchStatus.WATCHED : WatchStatus.NOT_WATCHED,
        })
      );
    } finally {
      setIsUpdatingWatchStatus(false);
    }
  };

  const buildLinkState = () => {
    const filterProps = props.getFilters();
    filterProps.returnPath = `/movies?profileId=${movie.profileId}`;
    return filterProps;
  };

  const handleRemoveFavorite = () => {
    setUnfavoriteDialogOpen(true);
  };

  const handleCloseUnfavoriteDialog = () => {
    setUnfavoriteDialogOpen(false);
  };

  const handleUnfavoriteChoice = (removeHistory: boolean) => {
    setUnfavoriteDialogOpen(false);
    dispatch(
      removeMovieFavorite({
        profileId: Number(movie.profileId),
        movieId: movie.id,
        removeHistory,
      })
    );
  };

  const handleRewatchClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setRewatchConfirmOpen(true);
  };

  const handleConfirmRewatch = async () => {
    setRewatchConfirmOpen(false);
    setIsRewatching(true);
    try {
      await dispatch(startMovieRewatch({ profileId: movie.profileId, movieId: movie.id }));
    } finally {
      setIsRewatching(false);
    }
  };

  return (
    <>
      <ListItem
        key={`listItem_${movie.id}`}
        alignItems="flex-start"
        sx={{ cursor: 'pointer', flexDirection: 'row', alignItems: 'center', gap: 2 }}
        onClick={() => navigate(`/movies/${movie.id}/${movie.profileId}`, { state: buildLinkState() })}
      >
        <ListItemAvatar sx={{ minWidth: 96, width: 96, height: 140, p: 0, m: 0 }}>
          <Avatar
            alt={movie.title}
            src={buildTMDBImagePath(movie.posterImage)}
            variant="rounded"
            sx={{ width: 96, height: 140 }}
          />
        </ListItemAvatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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
                  <b>Streaming Service: </b> {movie.streamingServices}
                  <br />
                  <b>Release Date: </b>
                  {movie.releaseDate ? formatters.contentDate(movie.releaseDate) : 'TBD'} • <b>Rated: </b>{' '}
                  {movie.mpaRating}
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
        <Tooltip key={`removeFavoriteTooltip_${movie.id}`} title="Remove Favorite">
          <IconButton
            key={`removeFavoriteIconButton_${movie.id}`}
            onClick={(event) => {
              handleRemoveFavorite();
              event.stopPropagation();
            }}
          >
            <StarIcon color="primary" />
          </IconButton>
        </Tooltip>
        {movie.watchStatus === WatchStatus.WATCHED && (
          <Box sx={{ position: 'relative' }}>
            <Tooltip title="Mark Rewatched">
              <span>
                <IconButton disabled={isRewatching} onClick={handleRewatchClick} color="rewatch">
                  <Replay />
                </IconButton>
              </span>
            </Tooltip>
            {isRewatching && (
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
        )}
        <Box sx={{ position: 'relative' }}>
          <OptionalTooltipControl
            identifier={`watchStatusTooltip_${movie.id}`}
            title={getWatchStatusAction(movie.watchStatus)}
            disabled={movie.watchStatus === WatchStatus.UNAIRED || isUpdatingWatchStatus}
          >
            <IconButton
              key={`watchStatusIconButton_${movie.id}`}
              disabled={movie.watchStatus === WatchStatus.UNAIRED || isUpdatingWatchStatus}
              onClick={(event) => {
                handleWatchStatusChange(movie.watchStatus);
                event.stopPropagation();
              }}
            >
              <WatchStatusIcon status={movie.watchStatus} />
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
      <UnfavoriteChoiceDialog
        open={unfavoriteDialogOpen}
        contentTitle={movie.title}
        contentLabel="movie"
        onKeepHistory={() => handleUnfavoriteChoice(false)}
        onRemoveEntirely={() => handleUnfavoriteChoice(true)}
        onClose={handleCloseUnfavoriteDialog}
      />
      <Dialog open={rewatchConfirmOpen} onClose={() => setRewatchConfirmOpen(false)}>
        <DialogTitle>Rewatch Movie?</DialogTitle>
        <DialogContent>
          <DialogContentText>Log another watch of "{movie.title}" in your history?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRewatchConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRewatch} variant="contained" startIcon={<Replay />}>
            Rewatch Movie
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
