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
      <br />
      <TMDBIcon />
      <br />
      <Typography variant="caption" color="textPrimary" gutterBottom>
        This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB
      </Typography>
    </Box>
  );
}
