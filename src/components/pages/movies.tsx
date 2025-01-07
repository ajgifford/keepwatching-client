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
  SelectChangeEvent,
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
  const [searchParams] = useSearchParams();
  const profileId = Number(searchParams.get('profileId')) || 0;
  const watchStatus = searchParams.get('watchStatus') || '';
  const [selectedProfile, setSelectedProfile] = useState<number>(profileId);

  const [genreFilter, setGenreFilter] = useState<string>('');
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>('');
  const [watchedFilter, setWatchedFilter] = useState<string>(watchStatus);
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
    setWatchedFilter('');
    setFilterDrawerOpen(false);
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
      (watchedFilter === '' || movie.watch_status === watchedFilter)
    );
  });

  const selectedProfileChanged = (e: SelectChangeEvent) => {
    const profile = Number(e.target.value);
    setSelectedProfile(profile);
  };

  return (
    <>
      <Box>
        <Typography variant="h4" align="left">
          Movies
        </Typography>
      </Box>
      <Stack spacing={{ xs: 1, sm: 2 }} direction="row" alignItems="center" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
        <Typography variant="subtitle1" align="justify">
          Profile:
        </Typography>
        <FormControl id="moviesProfileControl">
          <Select id="moviesProfileSelect" value={`${selectedProfile}`} onChange={selectedProfileChanged}>
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
          id="movieFilterButton"
          onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
          startIcon={<FilterListIcon className="icon" />}
          disabled={selectedProfile === 0}
        >
          Filter
        </Button>
      </Stack>
      {filteredMovies.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" align="justify">
            Count: {filteredMovies.length}
          </Typography>
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
            {selectedProfile === 0 ? 'Select a profile to view movies!' : 'No movies match the current filters.'}
          </Typography>
        </Box>
      )}
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
                    setGenreFilter(e.target.value);
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
                  onChange={(e) => setStreamingServiceFilter(e.target.value)}
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
                  value={watchedFilter}
                  onChange={(e) => setWatchedFilter(e.target.value)}
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
