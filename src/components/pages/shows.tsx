import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Container, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { Show } from '../../model/show';

const Shows = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState<Show[]>([]);

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
            </ListItem>
            <Divider variant="inset" component="li" />
          </Fragment>
        ))}
      </List>
    </Container>
  );
};

export default Shows;
