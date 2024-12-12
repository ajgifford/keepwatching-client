import React, { useEffect, useState } from 'react';
import { TextField, Button, Container, Typography, Grid, Card, CardContent, CardMedia } from "@mui/material";
import Header from "./header/header";

// Define types for the main entities
type Show = {
  id: string;
  title: string;
  description: string;
  release_date: string;
  genre: string;
  image: string;
};

type Movie = {
  id: string;
  title: string;
  description: string;
  release_date: string;
  genre: string;
  duration: number;
  image: string;
};

type User = {
  id: string;
  name: string;
};

type WatchedStatus = {
  id: string;
  user_id: string;
  content_type: "show" | "season" | "episode" | "movie";
  content_id: string;
  watched_at: string;
};

type Favorite = {
  id: string;
  user_id: string;
  content_type: "show" | "movie";
  content_id: string;
};

const ShowList: React.FC<{ shows: Show[] }> = ({ shows }) => (
    <Grid container spacing={3}>
      {shows.map((show) => (
        <Grid item xs={12} sm={6} md={4} key={show.id}>
          <Card>
            <CardMedia component="img" height="140" image={show.image} alt={show.title} />
            <CardContent>
              <Typography variant="h5" component="div">
                {show.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {show.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Genre:</strong> {show.genre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Release Date:</strong> {show.release_date}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  
  const MovieList: React.FC<{ movies: Movie[] }> = ({ movies }) => (
    <Grid container spacing={3}>
      {movies.map((movie) => (
        <Grid item xs={12} sm={6} md={4} key={movie.id}>
          <Card>
            <CardMedia component="img" height="140" image={movie.image} alt={movie.title} />
            <CardContent>
              <Typography variant="h5" component="div">
                {movie.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {movie.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Genre:</strong> {movie.genre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Release Date:</strong> {movie.release_date}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Duration:</strong> {movie.duration} minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

function App() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [shows, setShows] = useState<Show[]>([]);

    useEffect(() => {
        fetch('/api/shows')
            .then(res => res.json())
            .then(data => setShows(data.shows));
    }, []);

    useEffect(() => {
        fetch('/api/movies')
            .then(res => res.json())
            .then(data => setMovies(data.movies));
    }, []);

    const sampleShows: Show[] = [
        {
          id: "1",
          title: "Stranger Things",
          description: "A group of kids uncover mysteries in their small town.",
          release_date: "2016-07-15",
          genre: "Science Fiction",
          image: "https://via.placeholder.com/150",
        },
        {
          id: "2",
          title: "Breaking Bad",
          description: "A chemistry teacher turned meth producer.",
          release_date: "2008-01-20",
          genre: "Drama",
          image: "https://via.placeholder.com/150",
        },
      ];
    
      const sampleMovies: Movie[] = [
        {
          id: "1",
          title: "Inception",
          description: "A thief who steals secrets through dreams.",
          release_date: "2010-07-16",
          genre: "Science Fiction",
          duration: 148,
          image: "https://via.placeholder.com/150",
        },
        {
          id: "2",
          title: "The Dark Knight",
          description: "Batman faces the Joker in Gotham City.",
          release_date: "2008-07-18",
          genre: "Action",
          duration: 152,
          image: "https://via.placeholder.com/150",
        },
      ];
    
      return (
        <Container>
          <Header />
          <main>
            <ShowList shows={shows} />
            <MovieList movies={movies} />
          </main>
        </Container>
      );
};

export default App;
