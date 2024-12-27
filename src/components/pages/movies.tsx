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

import axiosInstance from '../../app/api/axiosInstance';
import { useAppSelector } from '../../app/hooks';
import { Movie } from '../../app/model/movies';
import { selectCurrentAccount } from '../../app/slices/authSlice';

const Movies = () => {
  const account = useAppSelector(selectCurrentAccount);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await axiosInstance.get(`/api/movies`);
        const movies: Movie[] = JSON.parse(response.data);
        setMovies(movies);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchMovies();
  }, []);

  const toggleMovieWatched = (movieId: string) => {
    setWatchedMovies((prev) => ({
      ...prev,
      [movieId]: !prev[movieId],
    }));
  };

  return (
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
  );
};

export default Movies;
