import React from 'react';

import { Box, Chip, Divider, Typography, alpha, useTheme } from '@mui/material';

import { CalendarDay } from '../../../app/slices/calendarSlice';
import { CalendarContentItem } from './calendarContentItem';

interface CalendarDaySectionProps {
  day: CalendarDay;
  profileId: number;
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function localTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === localTodayString();
}

function isPast(dateStr: string): boolean {
  return dateStr < localTodayString();
}

export const CalendarDaySection: React.FC<CalendarDaySectionProps> = ({ day, profileId }) => {
  const theme = useTheme();
  const today = isToday(day.date);
  const past = isPast(day.date);

  const date = new Date(`${day.date}T00:00:00`);
  const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Box sx={{ mb: 0.5 }}>
      {/* Date header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          borderRadius: 2,
          background: today
            ? alpha(theme.palette.primary.main, 0.08)
            : 'transparent',
          borderLeft: today ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={today ? 700 : 600}
          color={past && !today ? 'text.secondary' : 'text.primary'}
        >
          {formatDayLabel(day.date)}
        </Typography>
        {today && (
          <Chip
            label="Today"
            size="small"
            color="primary"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
        )}
        <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
          {today ? '' : monthYear}
        </Typography>
        <Chip
          label={`${day.items.length} ${day.items.length === 1 ? 'item' : 'items'}`}
          size="small"
          variant="outlined"
          sx={{ height: 18, fontSize: '0.65rem' }}
        />
      </Box>

      {/* Content items */}
      <Box sx={{ opacity: past && !today ? 0.7 : 1 }}>
        {day.items.map((item, idx) => (
          <CalendarContentItem
            key={`${item.type}-${item.type === 'episode' ? `${item.data.showId}-s${item.data.seasonNumber}e${item.data.episodeNumber}` : item.data.id}-${idx}`}
            item={item}
            profileId={profileId}
          />
        ))}
      </Box>

      <Divider sx={{ mt: 1, opacity: 0.4 }} />
    </Box>
  );
};
