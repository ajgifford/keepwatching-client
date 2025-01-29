import { Box, Typography } from '@mui/material';

import TMDBIcon from './tmdbIcon';

export function Footer() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        my: '4px',
      }}
    >
      <Typography variant="caption" color="textPrimary" gutterBottom>
        Gifford Family Dev
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <TMDBIcon />
        <Typography variant="caption" color="textPrimary">
          This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by{' '}
          <a href="https://www.themoviedb.org/">TMDB</a> | Additional information is provided by Streaming Availability
          API by <a href="https://www.movieofthenight.com/about/api">Movie of the Night</a>
        </Typography>
      </Box>
    </Box>
  );
}
