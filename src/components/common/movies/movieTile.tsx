import { Avatar, Box, Grid, Typography } from '@mui/material';

import { buildTMDBImagePath } from '../../utility/contentUtility';
import { ProfileMovie } from '@ajgifford/keepwatching-types';

interface PropTypes {
  movie: ProfileMovie;
}

export function MovieTile({ movie }: PropTypes) {
  return (
    <Box id={`movieCard_${movie.id}`} key={movie.title} sx={{ p: '10px', minWidth: '200px', textAlign: 'left' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid>
          <Avatar
            alt={movie.title}
            src={buildTMDBImagePath(movie.posterImage)}
            variant="rounded"
            sx={{ width: 96, height: 140 }}
          />
        </Grid>
        <Grid>
          <Typography variant="h6">{movie.title}</Typography>
          <Typography variant="body1">{movie.releaseDate}</Typography>
          <Typography variant="body1">{movie.streamingServices}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
