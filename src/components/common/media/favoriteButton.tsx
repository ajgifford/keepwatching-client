import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Button, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';

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

  const handleFavoriteProfileClick = async (tmdbId: number) => {
    if (alreadyFavorited) {
      return;
    }
    if (searchType === 'movies') {
      dispatch(
        addMovieFavorite({
          profileId: profile?.id || -1,
          movieId: tmdbId,
        })
      );
    } else {
      dispatch(
        addShowFavorite({
          profileId: Number(profile?.id),
          showId: tmdbId,
        })
      );
    }
  };

  return (
    <>
      <Tooltip key={`favoriteButtonTooltip_${tmdbId}`} title={alreadyFavorited ? 'Already a Favorite' : ''}>
        {isSmallScreen ? (
          <IconButton
            id={`favoriteButton_${tmdbId}`}
            aria-label="favoriteButton"
            onClick={() => handleFavoriteProfileClick(tmdbId)}
          >
            {alreadyFavorited ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        ) : (
          <Button
            id={`favoriteButton_${tmdbId}`}
            onClick={() => handleFavoriteProfileClick(tmdbId)}
            endIcon={alreadyFavorited ? <StarIcon /> : <StarBorderIcon />}
            variant={alreadyFavorited ? 'contained' : 'outlined'}
          >
            Favorite
          </Button>
        )}
      </Tooltip>
    </>
  );
}

export default FavoritesButton;
