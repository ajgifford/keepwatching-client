import { useState } from 'react';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Collapse, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import TMDBIcon from './tmdbIcon';

export function Footer() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        textAlign: 'center',
        my: '4px',
        px: '8px',
      }}
    >
      <Typography variant="caption" color="common.white" gutterBottom>
        Gifford Family Dev
      </Typography>
      <br />

      {!isLargeScreen && (
        <Button
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            fontSize: '0.75rem',
            textTransform: 'none',
            color: 'common.white',
            mb: 1,
          }}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      )}

      <Collapse in={isLargeScreen || expanded}>
        {' '}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            maxWidth: '100%',
          }}
        >
          <TMDBIcon />
          <Typography
            variant="caption"
            color="common.white"
            sx={{
              textAlign: 'center',
              maxWidth: '90%',
              wordBreak: 'break-word',
            }}
          >
            This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by{' '}
            <a style={{ color: 'white' }} href="https://www.themoviedb.org/">
              TMDB
            </a>{' '}
            | Additional information is provided by Streaming Availability API by{' '}
            <a style={{ color: 'white' }} href="https://www.movieofthenight.com/about/api">
              Movie of the Night
            </a>
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
