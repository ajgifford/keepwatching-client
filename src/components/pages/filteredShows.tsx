// Import necessary libraries
import React, { Fragment, useState } from 'react';
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

import { sortedGenres, sortedStreamingServices, watchStatuses } from '../../model/filters';
import { Show } from '../../model/shows';
import { useAccount } from '../context/accountContext';
import NotLoggedIn from '../login/notLoggedIn';

const showData: Show[] = [
  {
    id: '1',
    title: 'Breaking Bad',
    description: 'A chemistry teacher turned meth producer.',
    genres: ['Drama'],
    streaming_service: 'Netflix',
    watched: 'Watched',
    image: 'https://via.placeholder.com/96?text=Breaking+Bad&font=roboto',
    profiles: ['1'],
  },
  {
    id: '2',
    title: 'Stranger Things',
    description: 'A group of kids uncover supernatural mysteries.',
    genres: ['Sci-Fi', 'Drama'],
    streaming_service: 'Netflix',
    watched: 'Not Watched',
    image: 'https://via.placeholder.com/96?text=Stranger+Things&font=roboto',
    profiles: ['1'],
  },
  {
    id: '3',
    title: 'The Office',
    description: 'A comedic look at office life.',
    genres: ['Comedy'],
    streaming_service: 'Peacock',
    watched: 'Watched',
    image: 'https://via.placeholder.com/96?text=The+Office&font=roboto',
    profiles: ['3'],
  },
  {
    id: '4',
    title: 'The Mandalorian',
    description: 'A bounty hunter in the Star Wars universe.',
    genres: ['Sci-Fi', 'Action'],
    streaming_service: 'Disney+',
    watched: 'Watching',
    image: 'https://via.placeholder.com/96?text=The+Madalorain&font=roboto',
    profiles: ['4'],
  },
  {
    id: '5',
    title: 'Parks and Recreation',
    description: 'The quirky employees of Pawnee, Indiana.',
    genres: ['Comedy'],
    streaming_service: 'Peacock',
    watched: 'Watched',
    image: 'https://via.placeholder.com/96?text=Parks+and+Rec&font=roboto',
    profiles: ['3'],
  },
];

const FilteredShows = () => {
  const navigate = useNavigate();
  const { account } = useAccount();
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>('');
  const [watchedFilter, setWatchedFilter] = useState<string>('');
  const [profileFilter, setProfileFilter] = useState<string>('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setFilterDrawerOpen(newOpen);
  };

  const sortedProfiles = account?.profiles.sort((a, b) => (a.name < b.name ? -1 : 1));

  const handleWatchStatusChange = (
    currentStatus: 'Watched' | 'Watching' | 'Not Watched',
  ): 'Watched' | 'Watching' | 'Not Watched' => {
    if (currentStatus === 'Not Watched') return 'Watched';
    if (currentStatus === 'Watching') return 'Watched';
    return 'Not Watched';
  };

  const filteredShows = showData
    .filter((show) => {
      return (
        (genreFilter === '' || show.genres.includes(genreFilter)) &&
        (streamingServiceFilter === '' || show.streaming_service === streamingServiceFilter) &&
        (watchedFilter === '' || show.watched === watchedFilter) &&
        (profileFilter === '' || show.profiles.includes(profileFilter))
      );
    })
    .sort((a, b) => {
      const watchedOrder = { 'Not Watched': 1, Watching: 2, Watched: 3 };
      if (watchedOrder[a.watched] !== watchedOrder[b.watched]) {
        return watchedOrder[a.watched] - watchedOrder[b.watched];
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <>
      {!account ? (
        <NotLoggedIn />
      ) : (
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
                    <ListItemAvatar sx={{ width: 96, height: 96, p:1 }}>
                      <Avatar alt={show.title} src={show.image} variant='rounded' sx={{ width: 96, height: 96 }}/>
                    </ListItemAvatar>
                    <ListItemText
                      primary={show.title}
                      secondary={
                        <>
                          <Typography variant="body2">{show.description}</Typography>
                          <Typography variant="caption">Genres: {show.genres.join(', ')}</Typography>
                          <br />
                          <Typography variant="caption">Streaming Service: {show.streaming_service}</Typography>
                          <br />
                          <Typography variant="caption">Release Date: {show.release_date}</Typography>
                        </>
                      }
                    />
                    <Tooltip title={show.watched === 'Watched' ? 'Mark Unwatched' : 'Mark Watched'}>
                      <IconButton
                        onClick={(event) => {
                          show.watched = handleWatchStatusChange(show.watched);
                          setGenreFilter((prev) => prev); // Trigger re-render
                          event.stopPropagation();
                        }}
                      >
                        {show.watched === 'Not Watched' && <WatchLaterOutlinedIcon />}
                        {show.watched === 'Watching' && <WatchLaterTwoToneIcon color="success" />}
                        {show.watched === 'Watched' && <WatchLaterIcon color="success" />}
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
                <Stack
                  spacing={{ xs: 1, sm: 2 }}
                  direction="column"
                  useFlexGap
                  sx={{ flexWrap: 'wrap', p: 2, width: 300 }}
                >
                  <Typography variant="h6">Show Filters</Typography>
                  <FormControl fullWidth>
                    <InputLabel>Profiles</InputLabel>
                    <Select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)}>
                      <MenuItem value="">--All--</MenuItem>
                      {sortedProfiles?.map((profile) => <MenuItem value={profile.id}>{profile.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Genre</InputLabel>
                    <Select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                      {sortedGenres.map((genre) => (
                        <MenuItem value={genre.value}>{genre.display}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Streaming Service</InputLabel>
                    <Select value={streamingServiceFilter} onChange={(e) => setStreamingServiceFilter(e.target.value)}>
                      {sortedStreamingServices.map((service) => (
                        <MenuItem value={service.value}>{service.display}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Watched Status</InputLabel>
                    <Select value={watchedFilter} onChange={(e) => setWatchedFilter(e.target.value)}>
                      {watchStatuses.map((status) => (
                        <MenuItem value={status.value}>{status.display}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </>
            }
          </Drawer>
        </>
      )}
    </>
  );
};

export default FilteredShows;
