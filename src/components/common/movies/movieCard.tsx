import React from 'react';
import { Link } from 'react-router-dom';

import { Avatar, Box, Card, CardContent, Chip, Stack, Typography, useTheme } from '@mui/material';

import { buildTMDBImagePath, calculateRuntimeDisplay } from '../../utility/contentUtility';
import { ProfileMovie } from '@ajgifford/keepwatching-types';

interface MovieCardProps {
  movie: ProfileMovie;
}

const formatReleaseDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  if (diffDays < -30) return new Date(dateString).getFullYear().toString();
  return `${Math.abs(diffDays)} days ago`;
};

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const theme = useTheme();

  return (
    <Card
      component={Link}
      to={`/movies/${movie.id}/${movie.profileId}`}
      state={{ returnPath: `/home`, genre: '', streamingService: '', watchStatus: '' }}
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        overflow: 'hidden',
        textDecoration: 'none',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          '&::after': {
            transform: 'scaleX(1)',
          },
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          transform: 'scaleX(0)',
          transition: 'transform 0.3s ease',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            src={buildTMDBImagePath(movie.posterImage, 'w185')}
            sx={{
              width: 64,
              height: 96,
              borderRadius: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            POSTER
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" fontWeight={600} noWrap sx={{ flexGrow: 1, mr: 1 }}>
                {movie.title}
              </Typography>
              <Chip
                label={calculateRuntimeDisplay(movie.runtime)}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {new Date(movie.releaseDate).getFullYear()} • {movie.streamingServices}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}
            >
              {movie.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {movie.genres
                  .split(',')
                  .slice(0, 2)
                  .map((genre, index) => (
                    <Chip
                      key={index}
                      label={genre.trim()}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.75rem',
                        height: 24,
                        bgcolor: 'rgba(33, 150, 243, 0.1)',
                        borderColor: 'rgba(33, 150, 243, 0.2)',
                        color: theme.palette.primary.main,
                      }}
                    />
                  ))}
                <Chip
                  label={formatReleaseDate(movie.releaseDate)}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    color: theme.palette.secondary.main,
                    borderColor: 'transparent',
                  }}
                />
              </Stack>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
