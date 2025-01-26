import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Button, Tooltip } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  addMovieFavorite,
  addShowFavorite,
  selectActiveProfile,
  selectMovieByTMDBId,
  selectShowByTMDBId,
} from '../../app/slices/activeProfileSlice';

interface FavoritesButtonProps {
  id: number;
  searchType: string;
}

function FavoritesButton(props: FavoritesButtonProps) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectActiveProfile);
  const searchType = props.searchType;
  const tmdbId = Number(props.id);
  const show = useAppSelector((state) => selectShowByTMDBId(state, tmdbId));
  const movie = useAppSelector((state) => selectMovieByTMDBId(state, tmdbId));
  const alreadyFavorited = show || movie;

  const handleFavoriteProfileClick = async (tmdbId: number) => {
    if (alreadyFavorited) {
      return;
    }
    if (searchType === 'movies') {
      dispatch(
        addMovieFavorite({
          profileId: Number(profile?.id),
          movieId: tmdbId,
        }),
      );
    } else {
      dispatch(
        addShowFavorite({
          profileId: Number(profile?.id),
          showId: tmdbId,
        }),
      );
    }
  };

  return (
    <>
      <Tooltip key={`favoriteButtonTooltip_${tmdbId}`} title={alreadyFavorited ? 'Already a Favorite' : ''}>
        <Button
          id={`favoriteButton_${tmdbId}`}
          aria-controls="favorite-menu"
          aria-haspopup="true"
          onClick={() => handleFavoriteProfileClick(tmdbId)}
          endIcon={alreadyFavorited ? <StarIcon /> : <StarBorderIcon />}
          variant={alreadyFavorited ? 'contained' : 'outlined'}
        >
          Favorite
        </Button>
      </Tooltip>
    </>
  );
}

export default FavoritesButton;
