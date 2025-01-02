import { Fragment, useEffect, useState } from 'react';

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
  selectGenresByProfile,
  selectMoviesByProfile,
  selectStreamingServicesByProfile,
} from '../../app/slices/moviesSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import { MovieListItem } from '../common/movieListItem';

const Movies = () => {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector(selectAllProfiles);
  const moviesByProfile = useAppSelector(selectMoviesByProfile);
  const genresByProfile = useAppSelector(selectGenresByProfile);
  const streamingServicesByProfile = useAppSelector(selectStreamingServicesByProfile);
  const [selectedProfile, setSelectedProfile] = useState<number>(0);

  const [genreFilter, setGenreFilter] = useState<string>('');
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>('');
  const [watchedFilter, setWatchedFilter] = useState<string>('');
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

  const filteredMovies = movies.filter((movie) => {
    return (
      (genreFilter === '' || movie.genres.includes(genreFilter)) &&
      (streamingServiceFilter === '' || movie.streaming_service === streamingServiceFilter) &&
      (watchedFilter === '' || movie.watched === watchedFilter)
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
        <FormControl>
          <Select value={`${selectedProfile}`} onChange={selectedProfileChanged}>
            <MenuItem key={0} value={0}>
              ---
            </MenuItem>
            {profiles.map((profile) => (
              <MenuItem key={profile.id} value={profile.id}>
                {profile.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          key="filterButton"
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
          <List>
            {filteredMovies.map((movie) => (
              <Fragment key={`listItemFragment_${movie.movie_id}`}>
                <MovieListItem movie={movie} />
                <Divider key={`listItemDivider_${movie.movie_id}`} variant="inset" component="li" />
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
      <Drawer open={filterDrawerOpen} onClose={toggleDrawer(false)}>
        {
          <>
            <Stack spacing={{ xs: 1, sm: 2 }} direction="column" useFlexGap sx={{ flexWrap: 'wrap', p: 2, width: 300 }}>
              <Typography variant="h6" color="primary">
                Movie Filters
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={genreFilter}
                  onChange={(e) => {
                    console.log(e);
                    setGenreFilter(e.target.value);
                  }}
                >
                  <MenuItem key="genresFilter_all" value="">
                    --All--
                  </MenuItem>
                  {genreFilterValues.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Streaming Service</InputLabel>
                <Select value={streamingServiceFilter} onChange={(e) => setStreamingServiceFilter(e.target.value)}>
                  <MenuItem key="streamingServicesFilter_all" value="">
                    --All--
                  </MenuItem>
                  {streamingServiceFilterValues.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Watched Status</InputLabel>
                <Select value={watchedFilter} onChange={(e) => setWatchedFilter(e.target.value)}>
                  {watchStatuses.map((status) => (
                    <MenuItem key={`watchStatusFilter_${status.value}`} value={status.value}>
                      {status.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <Button key="clearFilterButton" onClick={() => clearFilters()}>
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
