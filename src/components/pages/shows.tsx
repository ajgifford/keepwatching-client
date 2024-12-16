import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import {
  Avatar,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';

import { Show } from '../../model/show';

const Shows = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState<Show[]>([]);
  const [watchedShows, setWatchedShows] = useState<Record<string, boolean>>({});

  async function fetchAllShows() {
    const response = await fetch(`/api/shows`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const shows: Show[] = JSON.parse(data);
    setShows(shows);
  }

  useEffect(() => {
    fetchAllShows();
  }, []);

  const toggleShowWatched = (showId: string) => {
    setWatchedShows((prev) => ({
      ...prev,
      [showId]: !prev[showId],
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Typography variant="h4">Shows</Typography>
      <List>
        {shows.map((show) => (
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
                      Release Date: {show.release_date}
                      <br />
                      Streaming on: {show.streaming_service}
                    </Typography>
                  </>
                }
              />
              <Tooltip title={watchedShows[show.id] ? 'Mark Unwatched' : 'Mark Watched'}>
                <IconButton
                  color={watchedShows[show.id] ? 'success' : 'default'}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleShowWatched(show.id);
                  }}
                >
                  {watchedShows[show.id] ? <WatchLaterIcon /> : <WatchLaterOutlinedIcon />}
                </IconButton>
              </Tooltip>
            </ListItem>
            <Divider variant="inset" component="li" />
          </Fragment>
        ))}
      </List>
    </Container>
  );
};

export default Shows;
