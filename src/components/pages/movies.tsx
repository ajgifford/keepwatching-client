import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  List,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { watchStatuses } from '../../app/constants/filters';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchMoviesForProfile,
  selectMovieGenresByProfile,
  selectMovieStreamingServicesByProfile,
  selectMoviesByProfile,
} from '../../app/slices/moviesSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import { MovieListItem } from '../common/movieListItem';
import { stripArticle } from '../utility/contentUtility';

const Movies = () => {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector(selectAllProfiles);
  const moviesByProfile = useAppSelector(selectMoviesByProfile);
  const genresByProfile = useAppSelector(selectMovieGenresByProfile);
  const streamingServicesByProfile = useAppSelector(selectMovieStreamingServicesByProfile);
  const [searchParams, setSearchParams] = useSearchParams();
  const profileParam = Number(searchParams.get('profileId')) || 0;
  const genreParam = decodeURIComponent(searchParams.get('genre') || '');
  const streamingServiveParam = decodeURIComponent(searchParams.get('streamingService') || '');
  const watchStatusParam = decodeURIComponent(searchParams.get('watchStatus') || '');
  const [selectedProfile, setSelectedProfile] = useState<number>(profileParam);

  const [genreFilter, setGenreFilter] = useState<string>(genreParam);
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>(streamingServiveParam);
  const [watchStatusFilter, setWatchStatusFilter] = useState<string>(watchStatusParam);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (selectedProfile && !moviesByProfile[selectedProfile]) {
      dispatch(fetchMoviesForProfile(selectedProfile));
    }
  }, [selectedProfile, moviesByProfile, dispatch]);

  const movies = moviesByProfile[selectedProfile] || [];
  const genreFilterValues = genresByProfile[selectedProfile] || [];
  const streamingServiceFilterValues = streamingServicesByProfile[selectedProfile] || [];

  const toggleDrawer = (newOpen: boolean) => () => {
    setFilterDrawerOpen(newOpen);
  };

  const clearFilters = () => {
    setGenreFilter('');
    setStreamingServiceFilter('');
    setWatchStatusFilter('');
    setSearchParams({});
    setFilterDrawerOpen(false);
  };

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, encodeURIComponent(value));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleGenreChange = (value: string) => {
    setGenreFilter(value);
    updateSearchParams('genre', value);
  };

  const handleStreamingServiceChange = (value: string) => {
    setStreamingServiceFilter(value);
    updateSearchParams('streamingService', value);
  };

  const handleWatchStatusChange = (value: string) => {
    setWatchStatusFilter(value);
    updateSearchParams('watchStatus', value);
  };

  const handleProfileChanged = (value: string) => {
    setSelectedProfile(Number(value));
    updateSearchParams('profileId', value);
  };

  const sortedMovies = [...movies].sort((a, b) => {
    const watchedOrder = { NOT_WATCHED: 1, WATCHING: 2, WATCHED: 3 };
    const aWatched = watchedOrder[a.watch_status];
    const bWatched = watchedOrder[b.watch_status];
    if (aWatched !== bWatched) {
      return aWatched - bWatched;
    }
    return stripArticle(a.title).localeCompare(stripArticle(b.title));
  });

  const filteredMovies = sortedMovies.filter((movie) => {
    return (
      (genreFilter === '' || movie.genres.includes(genreFilter)) &&
      (streamingServiceFilter === '' || movie.streaming_services === streamingServiceFilter) &&
      (watchStatusFilter === '' || movie.watch_status === watchStatusFilter)
    );
  });

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          backgroundColor: 'white',
          padding: 2,
          borderBottom: '1px solid #ddd',
        }}
      >
        <Typography variant="h4" align="left">
          Movies
        </Typography>
        <Stack
          spacing={{ xs: 1, sm: 2 }}
          direction="row"
          alignItems="center"
          useFlexGap
          sx={{ flexWrap: 'wrap', mt: 2 }}
        >
          <Typography variant="subtitle1" align="justify">
            Profile:
          </Typography>
          <FormControl id="moviesProfileControl">
            <Select
              id="moviesProfileSelect"
              value={`${selectedProfile}`}
              onChange={(e) => handleProfileChanged(e.target.value)}
            >
              <MenuItem id="moviesProfileFilter_none" key={0} value={0}>
                ---
              </MenuItem>
              {profiles.map((profile) => (
                <MenuItem id={`moviesProfileFilter_${profile.id}`} key={profile.id} value={profile.id}>
                  {profile.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            id="moviesFilterButton"
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            startIcon={<FilterListIcon className="icon" />}
            disabled={selectedProfile === 0}
          >
            Filter
          </Button>
          <Typography variant="subtitle1" align="justify" sx={{ ml: 'auto' }}>
            Count: {filteredMovies.length}
          </Typography>
        </Stack>
      </Box>
      <Box sx={{ mt: 2 }}>
        {filteredMovies.length > 0 ? (
          <Box>
            <List id="moviesList">
              {filteredMovies.map((movie) => (
                <Fragment key={`movieListItemFragment_${movie.movie_id}`}>
                  <MovieListItem movie={movie} />
                  <Divider key={`movieListItemDivider_${movie.movie_id}`} variant="inset" component="li" />
                </Fragment>
              ))}
            </List>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" align="center">
              No Movies Match Current Filters
            </Typography>
          </Box>
        )}
      </Box>
      <Drawer id="moviesFilterDrawer" open={filterDrawerOpen} onClose={toggleDrawer(false)}>
        {
          <>
            <Stack spacing={{ xs: 1, sm: 2 }} direction="column" useFlexGap sx={{ flexWrap: 'wrap', p: 2, width: 300 }}>
              <Typography variant="h6" color="primary">
                Movie Filters
              </Typography>
              <FormControl id="moviesFilterGenreControl" fullWidth>
                <InputLabel id="moviesFilterGenreLabel" htmlFor="moviesFilterGenreSelect">
                  Genre
                </InputLabel>
                <Select
                  id="moviesFilterGenreSelect"
                  value={genreFilter}
                  onChange={(e) => {
                    handleGenreChange(e.target.value);
                  }}
                >
                  <MenuItem id="moviesFilterGenre_all" key="genresFilter_all" value="">
                    --All--
                  </MenuItem>
                  {genreFilterValues.map((genre) => (
                    <MenuItem id={`moviesFilterGenre_${genre}`} key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="moviesFilterStreamingServiceControl" fullWidth>
                <InputLabel id="moviesFilterStreamingServiceLabel" htmlFor="moviesFilterStreamingServiceSelect">
                  Streaming Service
                </InputLabel>
                <Select
                  id="moviesFilterStreamingServiceSelect"
                  value={streamingServiceFilter}
                  onChange={(e) => handleStreamingServiceChange(e.target.value)}
                >
                  <MenuItem id="moviesFilterStreamingService_all" key="streamingServicesFilter_all" value="">
                    --All--
                  </MenuItem>
                  {streamingServiceFilterValues.map((service) => (
                    <MenuItem id={`moviesFilterStreamingService_${service}`} key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="moviesFilterWatchStatusControl" fullWidth>
                <InputLabel id="moviesFilterWatchStatusLabel" htmlFor="moviesFilterWatchStatusSelect">
                  Watch Status
                </InputLabel>
                <Select
                  id="moviesFilterWatchStatusSelect"
                  value={watchStatusFilter}
                  onChange={(e) => handleWatchStatusChange(e.target.value)}
                >
                  {watchStatuses.map((status) => (
                    <MenuItem
                      id={`moviesFilterWatchStatus_${status.value}`}
                      key={`watchStatusFilter_${status.value}`}
                      value={status.value}
                    >
                      {status.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="moviesFilterClearFilterControl">
                <Button id="moviesFilterClearFiltersButton" key="clearFilterButton" onClick={() => clearFilters()}>
                  Clear Filters
                </Button>
              </FormControl>
            </Stack>
          </>
        }
      </Drawer>
    </>
  );
};

export default Movies;
