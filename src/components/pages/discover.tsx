import { useEffect, useState } from 'react';

import { Container, Typography } from '@mui/material';

import { Movie } from '../../model/movies';
import { Show } from '../../model/show';
import MoviesCards from '../watchableContent/moviesCards';
import ShowsCards from '../watchableContent/showsCards';

function Discover() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);

  async function fetchAllMovies() {
    const response = await fetch(`/api/movies`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const movies: Movie[] = JSON.parse(data);
    console.log('All Movies API Call', movies);
    setMovies(movies);
  }

  async function fetchAllShows() {
    const response = await fetch(`/api/shows`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const shows: Show[] = JSON.parse(data);
    console.log('All Shows API Call', shows);
    setShows(shows);
  }

  useEffect(() => {
    fetchAllMovies();
    fetchAllShows();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Typography variant="h4">Discover</Typography>
      <ShowsCards shows={shows} />
      <MoviesCards movies={movies} />
    </Container>
  );
}

export default Discover;
