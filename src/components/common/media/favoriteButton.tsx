import { useCallback, useRef, useState } from 'react';

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Button, CircularProgress, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  addMovieFavorite,
  addShowFavorite,
  selectActiveProfile,
  selectMovieByTMDBId,
  selectShowByTMDBId,
} from '../../../app/slices/activeProfileSlice';
import { RefavoriteChoiceDialog } from '../dialogs/RefavoriteChoiceDialog';

interface FavoritesButtonProps {
  id: string | number;
  searchType: string;
}

interface RestoreDialogState {
  contentTitle: string;
  contentLabel: 'show' | 'movie';
  profileId: number;
  contentId: number;
}

function FavoritesButton(props: FavoritesButtonProps) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectActiveProfile);
  const searchType = props.searchType;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const [restoreDialogState, setRestoreDialogState] = useState<RestoreDialogState | null>(null);

  let tmdbId: number;
  if (typeof props.id === 'string') {
    tmdbId = Number(props.id);
  } else {
    tmdbId = props.id;
  }

  const show = useAppSelector((state) => selectShowByTMDBId(state, tmdbId));
  const movie = useAppSelector((state) => selectMovieByTMDBId(state, tmdbId));
  const alreadyFavorited = show || movie;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFavoriteProfileClick = useCallback(
    async (tmdbId: number) => {
      if (isProcessingRef.current || alreadyFavorited) {
        return;
      }

      isProcessingRef.current = true;
      setIsLoading(true);

      try {
        if (searchType === 'movies') {
          const profileId = profile?.id || -1;
          const result = await dispatch(addMovieFavorite({ profileId, movieId: tmdbId }));
          if (addMovieFavorite.fulfilled.match(result) && result.payload.hasSurvivingHistory) {
            setRestoreDialogState({
              contentTitle: result.payload.favoritedMovie.title,
              contentLabel: 'movie',
              profileId,
              contentId: tmdbId,
            });
          }
        } else {
          const profileId = Number(profile?.id);
          const result = await dispatch(addShowFavorite({ profileId, showId: tmdbId }));
          if (addShowFavorite.fulfilled.match(result) && result.payload.hasSurvivingHistory) {
            setRestoreDialogState({
              contentTitle: result.payload.addedShow.title,
              contentLabel: 'show',
              profileId,
              contentId: tmdbId,
            });
          }
        }
      } finally {
        isProcessingRef.current = false;
        setIsLoading(false);
      }
    },
    [dispatch, searchType, profile?.id, alreadyFavorited]
  );

  const handleCloseRestoreDialog = useCallback(() => setRestoreDialogState(null), []);

  const handleRestoreFromHistory = useCallback(() => {
    if (!restoreDialogState) return;
    const { profileId, contentId, contentLabel } = restoreDialogState;
    if (contentLabel === 'movie') {
      dispatch(addMovieFavorite({ profileId, movieId: contentId, restoreFromHistory: true }));
    } else {
      dispatch(addShowFavorite({ profileId, showId: contentId, restoreFromHistory: true }));
    }
    setRestoreDialogState(null);
  }, [dispatch, restoreDialogState]);

  const getButtonContent = () => {
    if (isLoading) {
      return <CircularProgress size={isSmallScreen ? 20 : 24} color="inherit" />;
    }
    return alreadyFavorited ? <StarIcon /> : <StarBorderIcon />;
  };

  const getButtonText = () => {
    if (isLoading) return 'Adding...';
    return alreadyFavorited ? 'Favorited' : 'Favorite';
  };

  const getTooltipText = () => {
    if (isLoading) return 'Adding to favorites...';
    return alreadyFavorited ? 'Already a Favorite' : 'Add to Favorites';
  };

  const handleClick = useCallback(() => {
    handleFavoriteProfileClick(tmdbId);
  }, [handleFavoriteProfileClick, tmdbId]);

  const buttonElement = isSmallScreen ? (
    <IconButton
      id={`favoriteButton_${tmdbId}`}
      aria-label="favoriteButton"
      onClick={handleClick}
      disabled={isLoading}
      sx={{
        position: 'relative',
        '&.Mui-disabled': {
          opacity: alreadyFavorited ? 1 : 0.6,
        },
      }}
    >
      {getButtonContent()}
    </IconButton>
  ) : (
    <Button
      id={`favoriteButton_${tmdbId}`}
      onClick={handleClick}
      endIcon={getButtonContent()}
      variant={alreadyFavorited ? 'contained' : 'outlined'}
      disabled={isLoading}
      sx={{
        position: 'relative',
        minWidth: '120px',
        '&.Mui-disabled': {
          opacity: alreadyFavorited ? 1 : 0.6,
        },
      }}
    >
      {getButtonText()}
    </Button>
  );

  return (
    <>
      <Tooltip key={`favoriteButtonTooltip_${tmdbId}`} title={getTooltipText()}>
        {isLoading ? <span>{buttonElement}</span> : buttonElement}
      </Tooltip>
      <RefavoriteChoiceDialog
        open={restoreDialogState !== null}
        contentTitle={restoreDialogState?.contentTitle ?? ''}
        contentLabel={restoreDialogState?.contentLabel ?? 'show'}
        onRestore={handleRestoreFromHistory}
        onStartFresh={handleCloseRestoreDialog}
        onClose={handleCloseRestoreDialog}
      />
    </>
  );
}

export default FavoritesButton;
