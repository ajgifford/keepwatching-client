import { Fragment, useState } from 'react';
import React from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppSelector } from '../../app/hooks';
import { SearchedShow, convertToSearchShow } from '../../app/model/shows';
import { selectCurrentAccount } from '../../app/slices/authSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import axios from 'axios';

function Discover() {
  const account = useAppSelector(selectCurrentAccount)!;
  const profiles = useAppSelector(selectAllProfiles);
  const [shows, setShows] = useState<SearchedShow[]>([]);
  const [searchText, setSearchText] = useState('');

  const handleFavoriteProfileClick = async (profileId: string, show: SearchedShow) => {
    try {
      await axiosInstance.post(`/api/accounts/${account.id}/profiles/${profileId}/favorites`, { show });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      const searchString = replaceSpacesWithPlus(searchText);
      const response = await axios.get(`https://api.tvmaze.com/search/shows?q=:${searchString}`);
      const searchResults = convertToSearchShow(response.data);
      setShows(searchResults);
    } catch (error) {
      console.error(error);
    }
  };

  function replaceSpacesWithPlus(input: string): string {
    return input.replace(/ /g, '+');
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  interface IsolatedMenuProps {
    show: SearchedShow;
  }

  const ShowFavoriteMenu = (props: IsolatedMenuProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open: boolean = Boolean(anchorEl);

    return (
      <React.Fragment>
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
                handleFavoriteProfileClick(profile.id, props.show);
              }}
            >
              {profile.name}
            </MenuItem>
          ))}
        </Menu>
      </React.Fragment>
    );
  };

  return (
    <>
      <Typography variant="h4">Discover</Typography>
      <Box display="flex" alignItems="center" marginY={2}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyPress}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginLeft: '8px' }}>
          Search
        </Button>
      </Box>
      {shows.length > 0 ? (
        <List>
          {shows.map((show) => (
            <Fragment key={show.id}>
              <ListItem alignItems="flex-start" secondaryAction={<ShowFavoriteMenu show={show} />}>
                <ListItemAvatar sx={{ width: 96, height: 96, p: 1 }}>
                  <Avatar alt={show.title} src={show.image} variant="rounded" sx={{ width: 96, height: 96 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={show.title}
                  secondary={
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ display: 'block', marginTop: 1, paddingRight: '120px' }} // Add spacing below the secondary text
                    >
                      <i>{show.summary}</i>
                      <br />
                      <b>Genres:</b> {show.genres.join(', ')}
                      <br />
                      <b>Streaming Service:</b> {show.streamingService}
                      <br />
                      <b>Premiered:</b> {show.premiered}
                    </Typography>
                  }
                  slotProps={{
                    primary: { variant: 'subtitle1' },
                  }}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </Fragment>
          ))}
        </List>
      ) : (
        <Box>
          <Typography variant="h6" align="center">
            No Shows Found
          </Typography>
        </Box>
      )}
    </>
  );
}

export default Discover;
