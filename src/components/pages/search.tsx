import { Fragment, useState } from 'react';
import React from 'react';

import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SearchResult } from '../../app/model/search';
import { addMovieFavorite } from '../../app/slices/moviesSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import { addShowFavorite } from '../../app/slices/showsSlice';

interface FavoritesMenuProps {
  id: number;
}

function Search() {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector(selectAllProfiles);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('shows');

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

  const handleSearch = async () => {
    const searchString = replaceSpacesWithPlus(searchText);
    const searchOptions = {
      searchString: searchString,
    };
    try {
      const response = await axiosInstance.get(`/api/search/${searchType}`, { params: searchOptions });
      setResults(response.data.results);
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

  const handleSearchTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchType((event.target as HTMLInputElement).value);
    setSearchText('');
    setResults([]);
  };

  const FavoritesMenu = (props: FavoritesMenuProps) => {
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
                handleFavoriteProfileClick(profile.id, props.id);
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
    <div>
      <Typography variant="h4">Search</Typography>
      <Box display="flex" alignItems="center" marginY="8px">
        <TextField
          id="searchTextField"
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
      <Box display="flex" alignItems="center">
        <FormControl id="searchFilterContentTypeControl">
          <RadioGroup
            id="searchFilterContentTypeRadioGroup"
            row
            name="search-type-radio-buttons-group"
            value={searchType}
            onChange={handleSearchTypeChange}
          >
            <FormControlLabel
              id="searchFilterContentTypeShowsRadio"
              value="shows"
              control={<Radio />}
              label="TV Shows"
            />
            <FormControlLabel
              id="searchFilterContentTypeMoviesRadio"
              value="movies"
              control={<Radio />}
              label="Movies"
            />
          </RadioGroup>
        </FormControl>
      </Box>
      {results.length > 0 ? (
        <List>
          {results.map((show) => (
            <Fragment key={show.id}>
              <ListItem alignItems="flex-start" secondaryAction={<FavoritesMenu id={show.id} />}>
                <ListItemAvatar sx={{ width: 94, height: 140, p: 1 }}>
                  <Avatar alt={show.title} src={show.image} variant="rounded" sx={{ width: 94, height: 140 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={show.title}
                  secondary={
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ display: 'block', marginTop: 1, paddingRight: '120px' }}
                    >
                      <i>{show.summary}</i>
                      <br />
                      <b>Genres:</b> {show.genres.join(', ')}
                      <br />
                      <b>Premiered:</b> {show.premiered}
                      <br />
                      <b>Rating:</b> {show.rating}
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
            No Results Found
          </Typography>
        </Box>
      )}
    </div>
  );
}

export default Search;
