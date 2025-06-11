import React from 'react';
import { Link } from 'react-router-dom';

import ScheduleIcon from '@mui/icons-material/Schedule';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Chip, Divider, Typography, alpha, useTheme } from '@mui/material';

import { DashboardEpisodeCard } from './dashboardEpisodeCard';
import { RecentUpcomingEpisode } from '@ajgifford/keepwatching-types';

interface EpisodesSectionProps {
  recentEpisodes: RecentUpcomingEpisode[];
  upcomingEpisodes: RecentUpcomingEpisode[];
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

interface ScrollableRowProps {
  children: React.ReactNode[];
  emptyMessage: string;
}

const ScrollableRow: React.FC<ScrollableRowProps> = ({ children, emptyMessage }) => {
  const theme = useTheme();

  if (!children || children.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2.5,
        overflowX: 'auto',
        pb: 2,
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: alpha(theme.palette.grey[300], 0.3),
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme.palette.primary.main, 0.5),
          borderRadius: 4,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.7),
          },
        },
      }}
    >
      {children}
    </Box>
  );
};

export const EpisodesSection: React.FC<EpisodesSectionProps> = ({ recentEpisodes, upcomingEpisodes }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Recent Episodes Section */}
      <Box sx={{ mb: 6 }}>
        <SectionHeader
          icon={<TvIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
          title="Recent Episodes"
          subtitle="Aired this week"
          color="primary"
          linkTo="/shows?watchStatus=WATCHING"
        />
        <ScrollableRow emptyMessage="No recent episodes">
          {recentEpisodes.map((episode) => (
            <DashboardEpisodeCard
              key={`recent-${episode.showId}-s${episode.seasonNumber}e${episode.episodeNumber}`}
              episode={episode}
            />
          ))}
        </ScrollableRow>
      </Box>

      {/* Upcoming Episodes Section */}
      <Box sx={{ mb: 6 }}>
        <SectionHeader
          icon={<ScheduleIcon sx={{ fontSize: 28, color: theme.palette.info.main }} />}
          title="Upcoming Episodes"
          subtitle="Airing next week"
          color="info"
          linkTo="/shows?watchStatus=WATCHING"
        />
        <ScrollableRow emptyMessage="No upcoming episodes">
          {upcomingEpisodes.map((episode) => (
            <DashboardEpisodeCard
              key={`upcoming-${episode.showId}-s${episode.seasonNumber}e${episode.episodeNumber}`}
              episode={episode}
            />
          ))}
        </ScrollableRow>
      </Box>

      <Divider sx={{ my: 4 }} />
    </Box>
  );
};
