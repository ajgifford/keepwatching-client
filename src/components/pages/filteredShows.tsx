// Import necessary libraries
import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FilterListIcon from '@mui/icons-material/FilterList';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { sortedGenres, sortedStreamingServices, watchStatuses } from '../../app/constants/filters';
import { useAppSelector } from '../../app/hooks';
import { ShowWithProfile } from '../../app/model/shows';
import { selectCurrentAccount } from '../../app/slices/authSlice';
import axios from 'axios';

const FilteredShows = () => {
  const navigate = useNavigate();
  const account = useAppSelector(selectCurrentAccount);
  const [shows, setShows] = useState<ShowWithProfile[]>([]);

  const [genreFilter, setGenreFilter] = useState<string>('');
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>('');
  const [watchedFilter, setWatchedFilter] = useState<string>('');
  const [profileFilter, setProfileFilter] = useState<string>('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (account) {
      async function fetchShows() {
        try {
          const response = await axios.get(`/api/account/${account?.id}/shows`);
          const retrievedShows: ShowWithProfile[] = JSON.parse(response.data);

          retrievedShows.sort((a, b) => {
            const watchedOrder = { 'Not Watched': 1, Watching: 2, Watched: 3 };
            const aWatched = watchedOrder[a.profile.watched];
            const bWatched = watchedOrder[b.profile.watched];
            if (aWatched !== bWatched) {
              return aWatched - bWatched;
            }
            return a.title.localeCompare(b.title);
          });
          setShows(retrievedShows);
        } catch (error) {
          console.error('Error:', error);
        }
      }
      fetchShows();
    }
  }, [account]);

  const toggleDrawer = (newOpen: boolean) => () => {
    setFilterDrawerOpen(newOpen);
  };

  const clearFilters = () => {
    setGenreFilter('');
    setStreamingServiceFilter('');
    setProfileFilter('');
    setWatchedFilter('');
    setFilterDrawerOpen(false);
  };

  const handleWatchStatusChange = (
    currentStatus: 'Watched' | 'Watching' | 'Not Watched',
  ): 'Watched' | 'Watching' | 'Not Watched' => {
    if (currentStatus === 'Not Watched') return 'Watched';
    if (currentStatus === 'Watching') return 'Watched';
    return 'Not Watched';
  };

  const filteredShows = shows.filter((show) => {
    return (
      (genreFilter === '' || show.genres.includes(genreFilter)) &&
      (streamingServiceFilter === '' || show.streaming_service === streamingServiceFilter) &&
      (watchedFilter === '' || show.profile.watched === watchedFilter) &&
      (profileFilter === '' || show.profile.id === profileFilter)
    );
  });

  return (
    <>
      <Button
        key="filterButton"
        onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
        startIcon={<FilterListIcon className="icon" />}
      >
        Filter
      </Button>
      {filteredShows.length > 0 ? (
        <List>
          {filteredShows.map((show) => (
            <Fragment key={show.id}>
              <ListItem alignItems="flex-start" onClick={() => navigate(`/shows/${show.id}`)}>
                <ListItemAvatar sx={{ width: 96, height: 96, p: 1 }}>
                  <Avatar alt={show.title} src={show.image} variant="rounded" sx={{ width: 96, height: 96 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={show.title}
                  slotProps={{ primary: { variant: 'subtitle1' }, secondary: { variant: 'caption' } }}
                  secondary={
                    <>
                      <i>{show.description}</i>
                      <br />
                      Genres: {show.genres.join(', ')}
                      <br />
                      Streaming Service: {show.streaming_service}
                      <br />
                      Release Date: {show.release_date}
                      <br />
                      Profiles: {show.profile.name}
                    </>
                  }
                />

                <Tooltip
                  key={show.profile.id}
                  title={show.profile.watched === 'Watched' ? `Mark Not Watched` : `Mark Watched`}
                >
                  <IconButton
                    key={show.profile.id}
                    onClick={(event) => {
                      show.profile.watched = handleWatchStatusChange(show.profile.watched);
                      setShows([...shows]);
                      event.stopPropagation();
                    }}
                  >
                    {show.profile.watched === 'Not Watched' && <WatchLaterOutlinedIcon />}
                    {show.profile.watched === 'Watching' && <WatchLaterTwoToneIcon color="success" />}
                    {show.profile.watched === 'Watched' && <WatchLaterIcon color="success" />}
                  </IconButton>
                </Tooltip>
              </ListItem>
              <Divider variant="inset" component="li" />
            </Fragment>
          ))}
        </List>
      ) : (
        <Box>
          <Typography variant="h6" align="center">
            No Shows Match Current Filters
          </Typography>
        </Box>
      )}
      <Drawer open={filterDrawerOpen} onClose={toggleDrawer(false)}>
        {
          <>
            <Stack spacing={{ xs: 1, sm: 2 }} direction="column" useFlexGap sx={{ flexWrap: 'wrap', p: 2, width: 300 }}>
              <Typography variant="h6" color="primary">
                Show Filters
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Profiles</InputLabel>
                <Select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)}>
                  <MenuItem key="displayAllProfiles" value="">
                    --All--
                  </MenuItem>
                  {Array.from(new Set(shows.map((show) => show.profile))).map((profile) => (
                    <MenuItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default FilteredShows;
