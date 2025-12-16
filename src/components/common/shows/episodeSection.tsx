import React from 'react';
import { Link } from 'react-router-dom';

import ScheduleIcon from '@mui/icons-material/Schedule';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Chip, Divider, Typography, useTheme } from '@mui/material';

import { ScrollableMediaRow } from '../media/scrollableMediaRow';
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

export const EpisodesSection: React.FC<EpisodesSectionProps> = ({ recentEpisodes, upcomingEpisodes }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Recent Episodes Section */}
      <ScrollableMediaRow
        title={
          <SectionHeader
            icon={<TvIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
            title="Recent Episodes"
            subtitle="Aired last 7 days"
            color="primary"
            linkTo="/shows?watchStatus=WATCHING%2CUP_TO_DATE"
          />
        }
        items={recentEpisodes}
        isLoading={false}
        renderItem={(episode) => (
          <Box sx={{ width: { xs: 250, sm: 280 } }}>
            <DashboardEpisodeCard episode={episode} />
          </Box>
        )}
        emptyMessage="No recent episodes"
        getItemKey={(episode) => `recent-${episode.showId}-s${episode.seasonNumber}e${episode.episodeNumber}`}
      />

      {/* Upcoming Episodes Section */}
      <ScrollableMediaRow
        title={
          <SectionHeader
            icon={<ScheduleIcon sx={{ fontSize: 28, color: theme.palette.info.main }} />}
            title="Upcoming Episodes"
            subtitle="Airing next 7 days"
            color="info"
            linkTo="/shows?watchStatus=WATCHING%2CUP_TO_DATE"
          />
        }
        items={upcomingEpisodes}
        isLoading={false}
        renderItem={(episode) => (
          <Box sx={{ width: { xs: 250, sm: 280 } }}>
            <DashboardEpisodeCard episode={episode} />
          </Box>
        )}
        emptyMessage="No upcoming episodes"
        getItemKey={(episode) => `upcoming-${episode.showId}-s${episode.seasonNumber}e${episode.episodeNumber}`}
      />

      <Divider sx={{ my: 4 }} />
    </Box>
  );
};
