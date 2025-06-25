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

import { showWatchStatuses } from '../../app/constants/filters';
import { useAppSelector } from '../../app/hooks';
import { selectShowGenres, selectShowStreamingServices, selectShows } from '../../app/slices/activeProfileSlice';
import { FilterProps, ShowListItem } from '../common/shows/showListItem';
import { stripArticle } from '../utility/contentUtility';

const Shows = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = decodeURIComponent(searchParams.get('genre') || '');
  const streamingServiceParam = decodeURIComponent(searchParams.get('streamingService') || '');
  const watchStatusParam = decodeURIComponent(searchParams.get('watchStatus') || '').split(',');

  const [genreFilter, setGenreFilter] = useState<string>(genreParam);
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>(streamingServiceParam);
  const [watchStatusFilter, setWatchStatusFilter] = useState<string[]>(watchStatusParam.filter(Boolean));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const shows = useAppSelector(selectShows);
  const genreFilterValues = useAppSelector(selectShowGenres);
  const streamingServiceFilterValues = useAppSelector(selectShowStreamingServices);

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

  const sortedShows = [...shows].sort((a, b) => {
    const watchedOrder = { UNAIRED: 1, NOT_WATCHED: 2, WATCHING: 3, UP_TO_DATE: 4, WATCHED: 5 };
    const aWatched = watchedOrder[a.watchStatus];
    const bWatched = watchedOrder[b.watchStatus];
    if (aWatched !== bWatched) {
      return aWatched - bWatched;
    }
    return stripArticle(a.title).localeCompare(stripArticle(b.title));
  });

  const filteredShows = sortedShows.filter((show) => {
    return (
      (genreFilter === '' || show.genres.includes(genreFilter)) &&
      (streamingServiceFilter === '' || show.streamingServices.includes(streamingServiceFilter)) &&
      (watchStatusFilter.length === 0 || watchStatusFilter.includes(show.watchStatus))
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
          backgroundColor: 'white',
          padding: 2,
          borderBottom: '1px solid #ddd',
        }}
      >
        <Typography variant="h4" align="left">
          Shows
        </Typography>
        <Stack
          spacing={{ xs: 1, sm: 2 }}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          useFlexGap
          sx={{ flexWrap: 'wrap', mt: 2 }}
        >
          <Button
            id="showsFilterButton"
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
                  .map((s) => showWatchStatuses.find((w) => w.value === s)?.display)
                  .join(', ')}`}
                color="success"
              />
            )}
          </Stack>
          <Typography variant="subtitle1" align="justify" sx={{ ml: { sm: 'unset', md: 'auto' } }}>
            Count: {filteredShows.length}
          </Typography>
        </Stack>
      </Box>
      <Box sx={{ mt: 2 }}>
        {filteredShows.length > 0 ? (
          <Box>
            <List id="showsList">
              {filteredShows.map((show) => (
                <Fragment key={`showListItemFragment_${show.id}`}>
                  <ShowListItem show={show} getFilters={getFilters} />
                  <Divider key={`showListItemDivider_${show.id}`} variant="inset" component="li" />
                </Fragment>
              ))}
            </List>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" align="center">
              No Shows Match Current Filters
            </Typography>
          </Box>
        )}
      </Box>
      <Drawer id="showsFilterDrawer" open={filterDrawerOpen} onClose={toggleDrawer(false)}>
        {
          <>
            <Stack spacing={{ xs: 1, sm: 2 }} direction="column" useFlexGap sx={{ flexWrap: 'wrap', p: 2, width: 300 }}>
              <Typography variant="h6" color="primary">
                Show Filters
              </Typography>
              <FormControl id="showsFilterGenreControl" fullWidth>
                <InputLabel id="showsFilterGenreLabel" htmlFor="showsFilterGenreSelect">
                  Genre
                </InputLabel>
                <Select
                  id="showsFilterGenreSelect"
                  value={genreFilter}
                  onChange={(e) => handleGenreChange(e.target.value)}
                >
                  <MenuItem id="showsFilterGenre_all" key="genresFilter_all" value="">
                    --All--
                  </MenuItem>
                  {genreFilterValues.map((genre) => (
                    <MenuItem id={`showsFilterGenre_${genre}`} key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="showsFilterStreamingServiceControl" fullWidth>
                <InputLabel id="showsFilterStreamingServiceLabel" htmlFor="showsFilterStreamingServiceSelect">
                  Streaming Service
                </InputLabel>
                <Select
                  id="showsFilterStreamingServiceSelect"
                  value={streamingServiceFilter}
                  onChange={(e) => handleStreamingServiceChange(e.target.value)}
                >
                  <MenuItem id="showsFilterStreamingService_all" key="streamingServicesFilter_all" value="">
                    --All--
                  </MenuItem>
                  {streamingServiceFilterValues.map((service) => (
                    <MenuItem id={`showsFilterStreamingService_${service}`} key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="showsFilterWatchStatusControl" fullWidth>
                <InputLabel id="showsFilterWatchStatusLabel" htmlFor="showsFilterWatchStatusSelect">
                  Watch Status
                </InputLabel>
                <Select
                  id="showsFilterWatchStatusSelect"
                  multiple
                  value={watchStatusFilter}
                  onChange={(e) => handleWatchStatusChange(e.target.value as string[])}
                  renderValue={(selected) =>
                    selected.map((s) => showWatchStatuses.find((w) => w.value === s)?.display).join(', ')
                  }
                >
                  {showWatchStatuses
                    .filter((status) => status.value !== '')
                    .map((status) => (
                      <MenuItem id={`showsFilterWatchStatus_${status.value}`} key={status.value} value={status.value}>
                        <Checkbox checked={watchStatusFilter.includes(status.value)} />
                        <ListItemText primary={status.display} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl id="showsFilterClearFilterControl">
                <Button id="showsFilterClearFilterButton" key="clearFilterButton" onClick={() => clearFilters()}>
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

export default Shows;
