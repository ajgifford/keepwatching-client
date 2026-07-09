import { useCallback, useRef, useState } from 'react';

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { Button, CircularProgress, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  addMovieFavorite,
  addShowFavorite,
  selectActiveProfile,
  selectMovieByTMDBId,
  selectShowByTMDBId,
} from '../../../app/slices/activeProfileSlice';
import { addToWatchlist, selectWatchlistItems } from '../../../app/slices/watchlistSlice';
import { WatchStatus, WatchlistContentType } from '@ajgifford/keepwatching-types';

interface WatchlistButtonProps {
  id: string | number;
  searchType: string;
  iconOnly?: boolean;
  size?: 'small' | 'medium';
}

function WatchlistButton(props: WatchlistButtonProps) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectActiveProfile);
  const searchType = props.searchType;
  const contentType: WatchlistContentType = searchType === 'movies' ? 'movie' : 'show';

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')) || Boolean(props.iconOnly);

  let tmdbId: number;
  if (typeof props.id === 'string') {
    tmdbId = Number(props.id);
  } else {
    tmdbId = props.id;
  }

  const show = useAppSelector((state) => selectShowByTMDBId(state, tmdbId));
  const movie = useAppSelector((state) => selectMovieByTMDBId(state, tmdbId));
  const localContent = contentType === 'movie' ? movie : show;

  const inWatchlist = useAppSelector((state) =>
    selectWatchlistItems(state).some((item) => item.contentType === contentType && item.contentId === localContent?.id)
  );

  const isEligible = !localContent || localContent.watchStatus === WatchStatus.NOT_WATCHED;

  const handleClick = useCallback(async () => {
    if (isProcessingRef.current || inWatchlist || !isEligible) {
      return;
    }

    isProcessingRef.current = true;
    setIsLoading(true);

    try {
      let profileId: number;
      let contentId: number;

      if (localContent) {
        profileId = Number(profile?.id);
        contentId = localContent.id;
      } else {
        profileId = profile?.id || -1;
        if (contentType === 'movie') {
          const result = await dispatch(addMovieFavorite({ profileId, movieId: tmdbId }));
          if (!addMovieFavorite.fulfilled.match(result)) {
            return;
          }
          contentId = result.payload.favoritedMovie.id;
        } else {
          const result = await dispatch(addShowFavorite({ profileId, showId: tmdbId }));
          if (!addShowFavorite.fulfilled.match(result)) {
            return;
          }
          contentId = result.payload.addedShow.id;
        }
      }

      await dispatch(addToWatchlist({ profileId, contentType, contentId }));
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  }, [dispatch, contentType, tmdbId, profile?.id, localContent, inWatchlist, isEligible]);

  const getButtonContent = () => {
    if (isLoading) {
      return <CircularProgress size={props.size === 'small' ? 16 : isSmallScreen ? 20 : 24} color="inherit" />;
    }
    return inWatchlist ? (
      <PlaylistAddCheckIcon fontSize={props.size === 'small' ? 'small' : undefined} />
    ) : (
      <PlaylistAddIcon fontSize={props.size === 'small' ? 'small' : undefined} />
    );
  };

  const getButtonText = () => {
    if (isLoading) return 'Adding...';
    return inWatchlist ? 'On Watchlist' : 'Watchlist';
  };

  const getTooltipText = () => {
    if (isLoading) return 'Adding to watchlist...';
    if (inWatchlist) return 'Already on Watchlist';
    if (!isEligible) return 'Only unwatched content can be added to your watchlist';
    return localContent ? 'Add to Watchlist' : 'Favorite & Add to Watchlist';
  };

  const isDisabled = isLoading || !isEligible;

  const buttonElement = isSmallScreen ? (
    <IconButton
      id={`watchlistButton_${tmdbId}`}
      aria-label="watchlistButton"
      size={props.size}
      onClick={handleClick}
      disabled={isDisabled}
      sx={{
        position: 'relative',
        '&.Mui-disabled': {
          opacity: inWatchlist ? 1 : 0.6,
        },
      }}
    >
      {getButtonContent()}
    </IconButton>
  ) : (
    <Button
      id={`watchlistButton_${tmdbId}`}
      onClick={handleClick}
      endIcon={getButtonContent()}
      variant={inWatchlist ? 'contained' : 'outlined'}
      disabled={isDisabled}
      sx={{
        position: 'relative',
        minWidth: '120px',
        width: '100%',
        '&.Mui-disabled': {
          opacity: inWatchlist ? 1 : 0.6,
        },
      }}
    >
      {getButtonText()}
    </Button>
  );

  return (
    <Tooltip key={`watchlistButtonTooltip_${tmdbId}`} title={getTooltipText()}>
      {isDisabled ? (
        <span style={isSmallScreen ? undefined : { display: 'block', width: '100%' }}>{buttonElement}</span>
      ) : (
        buttonElement
      )}
    </Tooltip>
  );
}

export default WatchlistButton;
