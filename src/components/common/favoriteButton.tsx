import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Button } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addMovieFavorite, addShowFavorite, selectActiveProfile } from '../../app/slices/activeProfileSlice';

interface FavoritesMenuProps {
  id: number;
  searchType: string;
}

function FavoritesMenu(props: FavoritesMenuProps) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectActiveProfile);
  const searchType = props.searchType;
  const showId = props.id;

  const handleFavoriteProfileClick = async (showId: number) => {
    if (searchType === 'movies') {
      dispatch(
        addMovieFavorite({
          profileId: Number(profile?.id),
          movieId: showId,
        }),
      );
    } else {
      dispatch(
        addShowFavorite({
          profileId: Number(profile?.id),
          showId: showId,
        }),
      );
    }
  };

  return (
    <>
      <Button
        id="favorite-button"
        aria-controls="favorite-menu"
        aria-haspopup="true"
        onClick={() => handleFavoriteProfileClick(showId)}
        endIcon={<StarBorderIcon />}
        variant="outlined"
      >
        Favorite
      </Button>
    </>
  );
}

export default FavoritesMenu;
