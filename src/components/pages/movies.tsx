import { Fragment, useEffect, useState } from 'react';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import {
  Avatar,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';

import { Movie } from '../../model/movies';
import { useAccount } from '../context/accountContext';
import NotLoggedIn from '../login/notLoggedIn';

const Movies = () => {
  const { account } = useAccount();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<Record<string, boolean>>({});

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

  const toggleMovieWatched = (movieId: string) => {
    setWatchedMovies((prev) => ({
      ...prev,
      [movieId]: !prev[movieId],
    }));
  };

  return (
    <>
      {!account ? (
        <NotLoggedIn />
      ) : (
        <>
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
                  <Tooltip title={watchedMovies[movie.id] ? 'Mark Not Watched' : 'Mark Watched'}>
                    <IconButton
                      color={watchedMovies[movie.id] ? 'success' : 'default'}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleMovieWatched(movie.id);
                      }}
                    >
                      {watchedMovies[movie.id] ? <WatchLaterIcon /> : <WatchLaterOutlinedIcon />}
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

export default Movies;
