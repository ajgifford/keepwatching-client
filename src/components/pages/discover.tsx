import { useEffect, useState } from 'react';

import { Typography } from '@mui/material';

import { Movie } from '../../app/model/movies';
import { DiscoverShow } from '../../app/model/shows';
import MoviesCards from '../watchableContent/moviesCards';
import ShowsCards from '../watchableContent/showsCards';
import axios from 'axios';

function Discover() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<DiscoverShow[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [moviesResponse, showsResponse] = await axios.all([axios.get('/api/movies'), axios.get('/api/shows')]);

        const shows: DiscoverShow[] = JSON.parse(showsResponse.data);
        setShows(shows);
        const movies: Movie[] = JSON.parse(moviesResponse.data);
        setMovies(movies);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <Typography variant="h4">Discover</Typography>
      <ShowsCards shows={shows} />
      <MoviesCards movies={movies} />
    </>
  );
}

export default Discover;
