import { useState } from 'react';
import React from 'react';

import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Button, Menu, MenuItem } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addMovieFavorite } from '../../app/slices/moviesSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import { addShowFavorite } from '../../app/slices/showsSlice';

interface FavoritesMenuProps {
  id: number;
  searchType: string;
}

function FavoritesMenu(props: FavoritesMenuProps) {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector(selectAllProfiles);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open: boolean = Boolean(anchorEl);
  const searchType = props.searchType;

  const handleFavoriteProfileClick = async (profileId: string, showId: number) => {
    if (searchType === 'movies') {
      dispatch(
        addMovieFavorite({
          profileId: Number(profileId),
          movieId: showId,
        }),
      );
    } else {
      dispatch(
        addShowFavorite({
          profileId: Number(profileId),
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
        onClick={(event) => setAnchorEl(event.currentTarget)}
        endIcon={<StarBorderIcon />}
        variant="outlined"
      >
        Favorite
      </Button>
      <Menu
        elevation={1}
        id="favorite-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        {profiles.map((profile) => (
          <MenuItem
            key={profile.id}
            onClick={() => {
              setAnchorEl(null);
              handleFavoriteProfileClick(profile.id, props.id);
            }}
          >
            {profile.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default FavoritesMenu;
