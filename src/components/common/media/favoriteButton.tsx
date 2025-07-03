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

interface FavoritesButtonProps {
  id: string | number;
  searchType: string;
}

function FavoritesButton(props: FavoritesButtonProps) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectActiveProfile);
  const searchType = props.searchType;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);

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
          await dispatch(
            addMovieFavorite({
              profileId: profile?.id || -1,
              movieId: tmdbId,
            })
          );
        } else {
          await dispatch(
            addShowFavorite({
              profileId: Number(profile?.id),
              showId: tmdbId,
            })
          );
        }
      } finally {
        isProcessingRef.current = false;
        setIsLoading(false);
      }
    },
    [dispatch, searchType, profile?.id, alreadyFavorited]
  );

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

  return (
    <Tooltip key={`favoriteButtonTooltip_${tmdbId}`} title={getTooltipText()}>
      {isSmallScreen ? (
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
      )}
    </Tooltip>
  );
}

export default FavoritesButton;
