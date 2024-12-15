import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';

import { Movie } from '../../model/movies';

const MoviesCards: React.FC<{ movies: Movie[] }> = ({ movies }) => (
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
            <Typography variant="body2" color="text.secondary">
              <strong>User Rating:</strong> {movie.user_rating || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>MPA Rating:</strong> {movie.mpa_rating}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default MoviesCards;
