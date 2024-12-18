// Import necessary libraries
import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';
import {
  Avatar,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { Show } from '../../model/show';
import { useAccount } from '../context/accountContext';
import NotLoggedIn from '../login/notLoggedIn';

// Sample data
const showData: Show[] = [
  {
    id: '1',
    title: 'Breaking Bad',
    description: 'A chemistry teacher turned meth producer.',
    genre: 'Drama',
    streaming_service: 'Netflix',
    watched: 'Watched',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Stranger Things',
    description: 'A group of kids uncover supernatural mysteries.',
    genre: 'Sci-Fi',
    streaming_service: 'Netflix',
    watched: 'Not Watched',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    title: 'The Office',
    description: 'A comedic look at office life.',
    genre: 'Comedy',
    streaming_service: 'Peacock',
    watched: 'Watched',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '4',
    title: 'The Mandalorian',
    description: 'A bounty hunter in the Star Wars universe.',
    genre: 'Sci-Fi',
    streaming_service: 'Disney+',
    watched: 'Watching',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '5',
    title: 'Parks and Recreation',
    description: 'The quirky employees of Pawnee, Indiana.',
    genre: 'Comedy',
    streaming_service: 'Peacock',
    watched: 'Watched',
    image: 'https://via.placeholder.com/150',
  },
];

const watchStatuses = [
  { value: '', display: 'All' },
  { value: 'Not Watched', display: 'Not Watched' },
  { value: 'Watching', display: 'Watching' },
  { value: 'Watched', display: 'Watched' },
];

const streamingServices = [
  { value: '', display: 'All' },
  { value: 'Max', display: 'Max' },
  { value: 'Netflix', display: 'Netflix' },
  { value: 'Disney+', display: 'Disney+' },
  { value: 'Amazon Prime', display: 'Amazon Prime' },
  { value: 'Hulu', display: 'Hulu' },
  { value: 'Peacock', display: 'Peacock' },
  { value: 'Paramount+', display: 'Paramount+' },
  { value: 'Apple TV', display: 'Apple TV' },
];

const sortedStreamingServices = streamingServices.sort((a, b) => (a.display < b.display ? -1 : 1));

const FilteredShows = () => {
  const navigate = useNavigate();
  const { account } = useAccount();
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [streamingServiceFilter, setStreamingServiceFilter] = useState<string>('');
  const [watchedFilter, setWatchedFilter] = useState<string>('');

  const handleWatchStatusChange = (
    currentStatus: 'Watched' | 'Watching' | 'Not Watched',
  ): 'Watched' | 'Watching' | 'Not Watched' => {
    if (currentStatus === 'Not Watched') return 'Watched';
    if (currentStatus === 'Watching') return 'Watched';
    return 'Not Watched';
  };

  const filteredShows = showData.filter((show) => {
    return (
      (genreFilter === '' || show.genre === genreFilter) &&
      (streamingServiceFilter === '' || show.streaming_service === streamingServiceFilter) &&
      (watchedFilter === '' || show.watched === watchedFilter)
    );
  });

  return (
    <>
      {!account ? (
        <NotLoggedIn />
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Drama">Drama</MenuItem>
                  <MenuItem value="Sci-Fi">Sci-Fi</MenuItem>
                  <MenuItem value="Comedy">Comedy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Streaming Service</InputLabel>
                <Select value={streamingServiceFilter} onChange={(e) => setStreamingServiceFilter(e.target.value)}>
                  {sortedStreamingServices.map((service) => (
                    <MenuItem value={service.value}>{service.display}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Watched Status</InputLabel>
                <Select value={watchedFilter} onChange={(e) => setWatchedFilter(e.target.value)}>
                  {watchStatuses.map((status) => (
                    <MenuItem value={status.value}>{status.display}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <List>
            {filteredShows.map((show) => (
              <Fragment key={show.id}>
                <ListItem alignItems="flex-start" onClick={() => navigate(`/shows/${show.id}`)}>
                  <ListItemAvatar>
                    <Avatar alt={show.title} src={show.image} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={show.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {show.genre}
                        </Typography>
                        {` — ${show.description}`}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Genre: {show.genre}
                          <br />
                          Streaming on: {show.streaming_service}
                        </Typography>
                      </>
                    }
                  />
                  <Tooltip title={show.watched === 'Watched' ? 'Mark Unwatched' : 'Mark Watched'}>
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        console.log('Before', show.title, show.watched);
                        show.watched = handleWatchStatusChange(show.watched);
                        console.log('After 1', show.title, show.watched);
                        setGenreFilter((prev) => prev); // Trigger re-render
                        console.log('After 2', show.title, show.watched);
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
        </>
      )}
    </>
  );
};

export default FilteredShows;
