import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
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
import { removeMovieFavorite, updateMovieWatchStatus } from '../../../app/slices/activeProfileSlice';
import { buildTMDBImagePath, calculateRuntimeDisplay } from '../../utility/contentUtility';
import { WatchStatusIcon, getWatchStatusAction } from '../../utility/watchStatusUtility';
import { OptionalTooltipControl } from '../controls/optionalTooltipControl';
import { ProfileMovie, SimpleWatchStatus, WatchStatus } from '@ajgifford/keepwatching-types';

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
  const movie = props.movie;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isUpdatingWatchStatus, setIsUpdatingWatchStatus] = useState<boolean>(false);

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
    dispatch(
      removeMovieFavorite({
        profileId: Number(movie.profileId),
        movieId: movie.id,
      })
    );
  };

  return (
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
                {movie.releaseDate} • <b>Rated: </b> {movie.mpaRating}
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
      <Box sx={{ position: 'relative' }}>
        <OptionalTooltipControl
          identifier={`watchStatusTooltip_${movie.id}`}
          title={getWatchStatusAction(movie.watchStatus)}
          disabled={movie.watchStatus === WatchStatus.UNAIRED || isUpdatingWatchStatus}
          children={
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
          }
        />
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
  );
};
