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
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import {
  fetchShowsForProfile,
  selectShowGenresByProfile,
  selectShowStreamingServicesByProfile,
  selectShowsByProfile,
} from '../../app/slices/showsSlice';
import { ShowListItem } from '../common/showListItem';
import { stripArticle } from '../utility/contentUtility';

const Shows = () => {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector(selectAllProfiles);
  const showsByProfile = useAppSelector(selectShowsByProfile);
  const genresByProfile = useAppSelector(selectShowGenresByProfile);
  const streamingServicesByProfile = useAppSelector(selectShowStreamingServicesByProfile);
  const [searchParams] = useSearchParams();
  const profileId = Number(searchParams.get('profileId')) || 0;
  const watchStatus = searchParams.get('watchStatus') || '';
  const [selectedProfile, setSelectedProfile] = useState<number>(profileId);

  const [genreFilter, setGenreFilter] = useState<string>('');
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>('');
  const [watchedFilter, setWatchedFilter] = useState<string>(watchStatus);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (selectedProfile && !showsByProfile[selectedProfile]) {
      dispatch(fetchShowsForProfile(selectedProfile));
    }
  }, [selectedProfile, showsByProfile, dispatch]);

  const shows = showsByProfile[selectedProfile] || [];
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

  const sortedShows = [...shows].sort((a, b) => {
    const watchedOrder = { NOT_WATCHED: 1, WATCHING: 2, WATCHED: 3 };
    const aWatched = watchedOrder[a.watch_status];
    const bWatched = watchedOrder[b.watch_status];
    if (aWatched !== bWatched) {
      return aWatched - bWatched;
    }
    return stripArticle(a.title).localeCompare(stripArticle(b.title));
  });

  const filteredShows = sortedShows.filter((show) => {
    return (
      (genreFilter === '' || show.genres.includes(genreFilter)) &&
      (streamingServiceFilter === '' || show.streaming_services === streamingServiceFilter) &&
      (watchedFilter === '' || show.watch_status === watchedFilter)
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
          Shows
        </Typography>
      </Box>
      <Stack spacing={{ xs: 1, sm: 2 }} direction="row" alignItems="center" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
        <Typography variant="subtitle1" align="justify">
          Profile:
        </Typography>
        <FormControl id="showsProfileControl">
          <Select id="showsProfileSelect" value={`${selectedProfile}`} onChange={selectedProfileChanged}>
            <MenuItem id="showsProfileFilter_none" key={0} value={0}>
              ---
            </MenuItem>
            {profiles.map((profile) => (
              <MenuItem id={`showsProfileFilter_${profile.id}`} key={profile.id} value={profile.id}>
                {profile.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          id="showsFilterButton"
          onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
          startIcon={<FilterListIcon className="icon" />}
          disabled={selectedProfile === 0}
        >
          Filter
        </Button>
      </Stack>
      {filteredShows.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" align="justify">
            Count: {filteredShows.length}
          </Typography>
          <List id="showsList">
            {filteredShows.map((show) => (
              <Fragment key={`showListItemFragment_${show.show_id}`}>
                <ShowListItem show={show} />
                <Divider key={`showListItemDivider_${show.show_id}`} variant="inset" component="li" />
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
                  onChange={(e) => setGenreFilter(e.target.value)}
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
                  onChange={(e) => setStreamingServiceFilter(e.target.value)}
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
                  value={watchedFilter}
                  onChange={(e) => setWatchedFilter(e.target.value)}
                >
                  {watchStatuses.map((status) => (
                    <MenuItem id={`showsFilterWatchStatus_${status.value}`} key={status.value} value={status.value}>
                      {status.display}
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
