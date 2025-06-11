import React from 'react';
import { Link } from 'react-router-dom';

import MovieIcon from '@mui/icons-material/Movie';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import { Box, Chip, Grid, Typography, useTheme } from '@mui/material';

import { MovieCard } from './movieCard';
import { ProfileMovie } from '@ajgifford/keepwatching-types';

interface MoviesSectionProps {
  recentMovies: ProfileMovie[];
  upcomingMovies: ProfileMovie[];
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color?: 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error';
  linkTo?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, subtitle, color = 'primary', linkTo }) => {
  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      {icon}
      <Typography variant="h5" fontWeight={600}>
        {title}
      </Typography>
      <Chip label={subtitle} color={color} variant="outlined" size="small" />
    </Box>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  }

  return content;
};

interface MovieGridProps {
  movies: ProfileMovie[];
  emptyMessage: string;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, emptyMessage }) => {
  if (!movies || movies.length === 0) {
    return (
      <Grid item xs={12}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      </Grid>
    );
  }

  return (
    <>
      {movies.map((movie) => (
        <Grid item xs={12} md={6} key={movie.id}>
          <MovieCard movie={movie} />
        </Grid>
      ))}
    </>
  );
};

export const MoviesSection: React.FC<MoviesSectionProps> = ({ recentMovies, upcomingMovies }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Recent Movies Section */}
      <Box sx={{ mb: 6 }}>
        <SectionHeader
          icon={<MovieIcon sx={{ fontSize: 28, color: theme.palette.secondary.main }} />}
          title="Recent Movies"
          subtitle="Released this month"
          color="secondary"
          linkTo="/movies"
        />
        <Grid container spacing={2.5}>
          <MovieGrid movies={recentMovies} emptyMessage="No recent movie releases" />
        </Grid>
      </Box>

      {/* Upcoming Movies Section */}
      <Box>
        <SectionHeader
          icon={<UpcomingIcon sx={{ fontSize: 28, color: theme.palette.warning.main }} />}
          title="Upcoming Movies"
          subtitle="Coming soon"
          color="warning"
          linkTo="/movies"
        />
        <Grid container spacing={2.5}>
          <MovieGrid movies={upcomingMovies} emptyMessage="No upcoming movie releases" />
        </Grid>
      </Box>
    </Box>
  );
};
