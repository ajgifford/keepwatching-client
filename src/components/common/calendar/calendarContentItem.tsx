import React from 'react';
import { Link } from 'react-router-dom';

import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Chip, Typography, alpha, useTheme } from '@mui/material';

import { CalendarItem } from '../../../app/slices/calendarSlice';

interface CalendarContentItemProps {
  item: CalendarItem;
  profileId: number;
}

function getPremiereBadge(item: CalendarItem): string | null {
  if (item.type !== 'episode') return null;
  const { seasonNumber, episodeNumber } = item.data;
  if (seasonNumber === 1 && episodeNumber === 1) return 'Series Premiere';
  if (episodeNumber === 1) return 'Season Premiere';
  return null;
}

export const CalendarContentItem: React.FC<CalendarContentItemProps> = ({ item, profileId }) => {
  const theme = useTheme();

  const isEpisode = item.type === 'episode';
  const linkTo = isEpisode
    ? `/shows/${item.data.showId}/${profileId}`
    : `/movies/${item.data.id}/${profileId}`;

  const primaryText = isEpisode ? item.data.showName : item.data.title;
  const secondaryText = isEpisode
    ? `S${item.data.seasonNumber}E${item.data.episodeNumber} · ${item.data.episodeTitle}`
    : item.data.streamingServices;

  const service = isEpisode
    ? item.data.network || item.data.streamingServices
    : item.data.streamingServices;

  const badge = getPremiereBadge(item);

  return (
    <Box
      component={Link}
      to={linkTo}
      state={{ returnPath: '/home' }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        borderRadius: 1.5,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.15s ease',
        '&:hover': {
          background: alpha(theme.palette.primary.main, 0.06),
        },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: isEpisode
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.secondary.main, 0.12),
          color: isEpisode ? theme.palette.primary.main : theme.palette.secondary.main,
        }}
      >
        {isEpisode ? <TvIcon sx={{ fontSize: 16 }} /> : <MovieIcon sx={{ fontSize: 16 }} />}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {primaryText}
          </Typography>
          {badge && (
            <Chip
              label={badge}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem', flexShrink: 0 }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {secondaryText}
        </Typography>
      </Box>

      {service && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ flexShrink: 0, fontSize: '0.7rem', maxWidth: 90, textAlign: 'right' }}
          noWrap
        >
          {service}
        </Typography>
      )}
    </Box>
  );
};
