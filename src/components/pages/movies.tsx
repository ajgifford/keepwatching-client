import { Fragment, useEffect, useState } from 'react';

import { Avatar, Container, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { Movie } from '../../model/movies';

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  async function fetchAllMovies() {
    const response = await fetch(`/api/movies`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const movies: Movie[] = JSON.parse(data);
    setMovies(movies);
  }

  useEffect(() => {
    fetchAllMovies();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Typography variant="h4">Movies</Typography>
      <List>
        {movies.map((movie) => (
          <Fragment key={movie.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar alt={movie.title} src={movie.image} />
              </ListItemAvatar>
              <ListItemText
                primary={movie.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {movie.genre}
                    </Typography>
                    {` — ${movie.description}`}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Release Date: {movie.release_date}
                      <br />
                      Streaming on: {movie.streaming_service}
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

export default Movies;
