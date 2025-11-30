import { Fragment, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  List,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { movieWatchStatuses } from '../../app/constants/filters';
import { useAppSelector } from '../../app/hooks';
import { selectMovieGenres, selectMovieStreamingServices, selectMovies } from '../../app/slices/activeProfileSlice';
import { FilterProps, MovieListItem } from '../common/movies/movieListItem';
import { stripArticle } from '../utility/contentUtility';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = decodeURIComponent(searchParams.get('genre') || '');
  const streamingServiceParam = decodeURIComponent(searchParams.get('streamingService') || '');
  const watchStatusParam = decodeURIComponent(searchParams.get('watchStatus') || '').split(',');

  const [genreFilter, setGenreFilter] = useState<string>(genreParam);
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>(streamingServiceParam);
  const [watchStatusFilter, setWatchStatusFilter] = useState<string[]>(watchStatusParam.filter(Boolean));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const movies = useAppSelector(selectMovies);
  const genreFilterValues = useAppSelector(selectMovieGenres);
  const streamingServiceFilterValues = useAppSelector(selectMovieStreamingServices);

  const toggleDrawer = (newOpen: boolean) => () => {
    setFilterDrawerOpen(newOpen);
  };

  const clearFilters = () => {
    setGenreFilter('');
    setStreamingServiceFilter('');
    setWatchStatusFilter([]);
    setSearchParams({});
    setFilterDrawerOpen(false);
  };

  const updateSearchParams = (key: string, value: string | string[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (Array.isArray(value)) {
      newParams.set(key, encodeURIComponent(value.join(',')));
    } else if (value) {
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

  const handleWatchStatusChange = (value: string[]) => {
    setWatchStatusFilter(value);
    updateSearchParams('watchStatus', value);
  };

  const sortedMovies = [...movies].sort((a, b) => {
    const watchedOrder: Record<string, number> = { UNAIRED: 1, NOT_WATCHED: 2, WATCHED: 3 };
    const aWatched = watchedOrder[a.watchStatus];
    const bWatched = watchedOrder[b.watchStatus];
    if (aWatched !== bWatched) {
      return aWatched - bWatched;
    }
    return stripArticle(a.title).localeCompare(stripArticle(b.title));
  });

  const filteredMovies = sortedMovies.filter((movie) => {
    return (
      (genreFilter === '' || movie.genres.includes(genreFilter)) &&
      (streamingServiceFilter === '' || movie.streamingServices === streamingServiceFilter) &&
      (watchStatusFilter.length === 0 || watchStatusFilter.includes(movie.watchStatus))
    );
  });

  const filtered = genreFilter !== '' || streamingServiceFilter !== '' || watchStatusFilter.length > 0;

  const getFilters = (): FilterProps => {
    return { genre: genreFilter, streamingService: streamingServiceFilter, watchStatus: watchStatusFilter };
  };

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          backgroundColor: 'background.paper',
          padding: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h4" align="left">
          Movies
        </Typography>
        <Stack
          spacing={{ xs: 1, sm: 2 }}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          useFlexGap
          sx={{ flexWrap: 'wrap', mt: 2 }}
        >
          <Button
            id="moviesFilterButton"
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            startIcon={<FilterListIcon className="icon" />}
            variant={filtered ? 'contained' : 'text'}
          >
            Filters
          </Button>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ ml: { sm: 'unset', md: 'auto' }, flexWrap: 'wrap' }}
          >
            {genreFilter && <Chip label={`Genre: ${genreFilter}`} color="primary" />}
            {streamingServiceFilter && (
              <Chip label={`Streaming Service: ${streamingServiceFilter}`} color="secondary" />
            )}
            {watchStatusFilter.length > 0 && (
              <Chip
                label={`Watch Status: ${watchStatusFilter
                  .map((s) => movieWatchStatuses.find((w) => w.value === s)?.display)
                  .join(', ')}`}
                color="success"
              />
            )}
          </Stack>
          <Typography variant="subtitle1" align="justify" sx={{ ml: { sm: 'unset', md: 'auto' } }}>
            Count: {filteredMovies.length}
          </Typography>
        </Stack>
      </Box>
      <Box sx={{ mt: 2 }}>
        {filteredMovies.length > 0 ? (
          <Box>
            <List id="moviesList">
              {filteredMovies.map((movie) => (
                <Fragment key={`movieListItemFragment_${movie.id}`}>
                  <MovieListItem movie={movie} getFilters={getFilters} />
                  <Divider key={`movieListItemDivider_${movie.id}`} variant="inset" component="li" />
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
                {genreFilterValues.map((genre: string) => (
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
                {streamingServiceFilterValues.map((service: string) => (
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
                multiple
                value={watchStatusFilter}
                onChange={(e) => handleWatchStatusChange(e.target.value as string[])}
                renderValue={(selected) =>
                  selected.map((s) => movieWatchStatuses.find((w) => w.value === s)?.display).join(', ')
                }
              >
                {movieWatchStatuses
                  .filter((status) => status.value !== '')
                  .map((status) => (
                    <MenuItem
                      id={`moviesFilterWatchStatus_${status.value}`}
                      key={`watchStatusFilter_${status.value}`}
                      value={status.value}
                    >
                      <Checkbox checked={watchStatusFilter.includes(status.value)} />
                      <ListItemText primary={status.display} />
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
      </Drawer>
    </>
  );
};

export default Movies;
