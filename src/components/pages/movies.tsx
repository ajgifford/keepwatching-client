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

import axiosInstance from '../../app/api/axiosInstance';
import { sortedGenres, sortedStreamingServices, watchStatuses } from '../../app/constants/filters';
import { useAppSelector } from '../../app/hooks';
import { Movie } from '../../app/model/movies';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import { MovieListItem } from '../common/movieListItem';

const Movies = () => {
  const profiles = useAppSelector(selectAllProfiles);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>('');
  const [watchedFilter, setWatchedFilter] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<number>(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await axiosInstance.get(`/api/profiles/${selectedProfile}/movies`);
        const responseMovies: Movie[] = response.data.results;
        responseMovies.sort((a, b) => {
          const watchedOrder = { NOT_WATCHED: 1, WATCHING: 2, WATCHED: 3 };
          const aWatched = watchedOrder[a.watched];
          const bWatched = watchedOrder[b.watched];
          if (aWatched !== bWatched) {
            return aWatched - bWatched;
          }
          return a.title.localeCompare(b.title);
        });
        setMovies(responseMovies);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    if (selectedProfile !== 0) {
      fetchMovies();
    }
  }, [selectedProfile]);

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
    if (profile === 0) {
      setMovies([]);
    }
    setSelectedProfile(profile);
  };

  const updateMovies = () => {
    setMovies([...movies]);
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
                <MovieListItem movie={movie} updateMovies={updateMovies} />
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
                <Select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                  {sortedGenres.map((genre) => (
                    <MenuItem key={genre.value} value={genre.value}>
                      {genre.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Streaming Service</InputLabel>
                <Select value={streamingServiceFilter} onChange={(e) => setStreamingServiceFilter(e.target.value)}>
                  {sortedStreamingServices.map((service) => (
                    <MenuItem key={service.value} value={service.value}>
                      {service.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Watched Status</InputLabel>
                <Select value={watchedFilter} onChange={(e) => setWatchedFilter(e.target.value)}>
                  {watchStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
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
