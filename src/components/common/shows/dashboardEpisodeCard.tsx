import React from 'react';
import { Link } from 'react-router-dom';

import { Box, Card, CardContent, Chip, Typography } from '@mui/material';

import { calculateRuntimeDisplay } from '../../utility/contentUtility';
import { RecentUpcomingEpisode } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

interface DashboardEpisodeCardProps {
  episode: RecentUpcomingEpisode;
}

const formatAirDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

export const DashboardEpisodeCard: React.FC<DashboardEpisodeCardProps> = ({ episode }) => {
  const buildServiceDisplay = () => {
    if (episode.network) {
      return episode.network;
    }
    return episode.streamingServices;
  };

  return (
    <Card
      component={Link}
      to={`/shows/${episode.showId}/${episode.profileId}`}
      state={{ returnPath: `/home`, genre: '', streamingService: '', watchStatus: '' }}
      sx={{
        minWidth: { xs: 250, sm: 280 },
        height: 320,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        },
      }}
    >
      <Box
        sx={{
          height: 180,
          position: 'relative',
          overflow: 'hidden',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        {/* Episode Still Image as Background */}
        <Box
          component="img"
          src={
            buildTMDBImagePath(episode.episodeStillImage, 'w500') ||
            'https://placehold.co/280x180/gray/white?text=No+Image'
          }
          alt={episode.episodeTitle}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7)',
          }}
        />

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
          }}
        />

        {/* Service Chip */}
        <Chip
          label={buildServiceDisplay()}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.75rem',
            backdropFilter: 'blur(4px)',
          }}
        />

        {/* Air Date */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            color: 'white',
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
            {formatAirDate(episode.airDate)}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5, height: 155, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
          {episode.showName}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          S{episode.seasonNumber} E{episode.episodeNumber}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
          {episode.episodeTitle}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
          {calculateRuntimeDisplay(episode.runtime)}
        </Typography>
      </CardContent>
    </Card>
  );
};
