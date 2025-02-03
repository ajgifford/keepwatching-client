import { Avatar, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { Movie } from '../../app/model/movies';
import { buildTMDBImagePath } from '../utility/contentUtility';

interface PropTypes {
  movie: Movie;
}

export function MovieCard({ movie }: PropTypes) {
  return (
    <Box id={`movieCard_${movie.movie_id}`} key={movie.title} sx={{ p: '10px', minWidth: '200px', textAlign: 'left' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid>
          <Avatar
            alt={movie.title}
            src={buildTMDBImagePath(movie.poster_image)}
            variant="rounded"
            sx={{ width: 96, height: 140 }}
          />
        </Grid>
        <Grid>
          <Typography variant="h6">{movie.title}</Typography>
          <Typography variant="body1">{movie.release_date}</Typography>
          <Typography variant="body1">{movie.streaming_services}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
