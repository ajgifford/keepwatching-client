import { Box, Typography } from '@mui/material';

import TMDBIcon from './tmdbIcon';

export function Footer() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        my: '4px',
        px: '8px', // Adds padding for small screens
      }}
    >
      <Typography variant="caption" color="textPrimary" gutterBottom>
        Gifford Family Dev
      </Typography>
      <br />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap', // Allows content to wrap on smaller screens
          gap: '8px',
          maxWidth: '100%', // Ensures content doesn't overflow
        }}
      >
        <TMDBIcon />
        <Typography
          variant="caption"
          color="textPrimary"
          sx={{
            textAlign: 'center',
            maxWidth: '90%', // Prevents text from stretching too wide
            wordBreak: 'break-word', // Ensures long words wrap properly
          }}
        >
          This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB |
          Additional information is provided by Streaming Availability API by{' '}
          <a href="https://www.movieofthenight.com/about/api">Movie of the Night</a>
        </Typography>
      </Box>
    </Box>
  );
}
