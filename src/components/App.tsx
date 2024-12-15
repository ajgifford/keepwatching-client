import React, { useEffect, useState } from 'react';

import { Container } from '@mui/material';

import { Movie } from '../model/movies';
import { Episode, Season, Show } from '../model/show';
import MoviesCards from './content/moviesCards';
import SeasonsCards from './content/seasonsCards';
import ShowsCards from './content/showsCards';
import Header from './header/header';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

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

  async function fetchSeasons(show_id: number) {
    const response = await fetch(`/api/seasons/${show_id}`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const seasons: Season[] = JSON.parse(data);
    console.log('Seasons API Call', seasons);
    setSeasons(seasons);
  }

  async function fetchEpisodes(season_id: number) {
    const response = await fetch(`/api/episodes/${season_id}`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const episodes: Episode[] = JSON.parse(data);
    console.log('Episodes API Call', episodes);
    setEpisodes(episodes);
  }

  useEffect(() => {
    fetchAllMovies();
    fetchAllShows();
    fetchSeasons(1);
    fetchEpisodes(1);
  }, []);

  return (
    <Container>
      <Header />
      <main>
        <ShowsCards shows={shows} />
        <SeasonsCards seasons={seasons} episodes={episodes} />
        <MoviesCards movies={movies} />
      </main>
    </Container>
  );
}

export default App;
