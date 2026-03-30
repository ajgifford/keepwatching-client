import React, { useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import {
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  Popover,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { CalendarDay, CalendarItem } from '../../../app/slices/calendarSlice';
import { CalendarContentItem } from './calendarContentItem';

interface CalendarGridViewProps {
  days: CalendarDay[];
  profileId: number;
  viewYear: number;
  viewMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToToday: () => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_DOTS = 3;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildDayMap(days: CalendarDay[]): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();
  for (const d of days) {
    map.set(d.date, d.items);
  }
  return map;
}

export const CalendarGridView: React.FC<CalendarGridViewProps> = ({
  days,
  profileId,
  viewYear,
  viewMonth,
  onPrevMonth,
  onNextMonth,
  onJumpToToday,
}) => {
  const theme = useTheme();
  const todayStr = new Date().toISOString().split('T')[0];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverDate, setPopoverDate] = useState<string | null>(null);

  const dayMap = buildDayMap(days);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  const handleDayClick = (event: React.MouseEvent<HTMLElement>, dateStr: string) => {
    const items = dayMap.get(dateStr);
    if (items && items.length > 0) {
      setPopoverDate(dateStr);
      setAnchorEl(event.currentTarget);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverDate(null);
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const totalCells = firstDow + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  return (
    <Box>
      {/* Month navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton size="small" onClick={onPrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {monthLabel}
          </Typography>
          <Chip label="Today" size="small" onClick={onJumpToToday} sx={{ cursor: 'pointer' }} />
        </Box>
        <IconButton size="small" onClick={onNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day-of-week headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          mb: 1,
        }}
      >
        {DAY_LABELS.map((label) => (
          <Box key={label} sx={{ textAlign: 'center', py: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
        }}
      >
        {Array.from({ length: rows * 7 }).map((_, cellIndex) => {
          const dayNum = cellIndex - firstDow + 1;
          const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
          const dateStr = isCurrentMonth ? toDateString(viewYear, viewMonth, dayNum) : '';
          const items = dateStr ? (dayMap.get(dateStr) ?? []) : [];
          const isToday = dateStr === todayStr;
          const episodeDots = items.filter((i) => i.type === 'episode');
          const movieDots = items.filter((i) => i.type === 'movie');
          const allDots = [...episodeDots, ...movieDots];
          const overflowCount = allDots.length > MAX_DOTS ? allDots.length - MAX_DOTS : 0;
          const visibleDots = allDots.slice(0, MAX_DOTS);
          const hasContent = items.length > 0;

          return (
            <Tooltip
              key={cellIndex}
              title={hasContent ? `${items.length} item${items.length > 1 ? 's' : ''}` : ''}
              placement="top"
            >
              <Box
                onClick={hasContent ? (e) => handleDayClick(e, dateStr) : undefined}
                sx={{
                  minHeight: 64,
                  borderRadius: 1.5,
                  p: 0.75,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: hasContent ? 'pointer' : 'default',
                  opacity: isCurrentMonth ? 1 : 0.25,
                  background: isToday
                    ? alpha(theme.palette.primary.main, 0.1)
                    : hasContent
                      ? alpha(theme.palette.action.hover, 0.5)
                      : 'transparent',
                  border: isToday
                    ? `2px solid ${theme.palette.primary.main}`
                    : '2px solid transparent',
                  transition: 'background 0.15s ease',
                  '&:hover': hasContent
                    ? { background: alpha(theme.palette.primary.main, 0.08) }
                    : {},
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={isToday ? 700 : 400}
                  color={isToday ? 'primary' : 'text.primary'}
                >
                  {isCurrentMonth ? dayNum : ''}
                </Typography>

                {visibleDots.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {visibleDots.map((dot, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor:
                            dot.type === 'episode'
                              ? theme.palette.primary.main
                              : theme.palette.secondary.main,
                        }}
                      />
                    ))}
                    {overflowCount > 0 && (
                      <Typography variant="caption" sx={{ fontSize: '0.55rem', lineHeight: 1 }}>
                        +{overflowCount}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
          <TvIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Episode
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.secondary.main }} />
          <MovieIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Movie
          </Typography>
        </Box>
      </Box>

      {/* Day popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{ sx: { width: 320, maxHeight: 400, overflow: 'auto', borderRadius: 2 } }}
      >
        {popoverDate && (
          <Box>
            <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {new Date(`${popoverDate}T00:00:00`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
            </Box>
            <List dense disablePadding>
              {(dayMap.get(popoverDate) ?? []).map((item, idx) => (
                <ListItem key={idx} disablePadding onClick={handlePopoverClose}>
                  <CalendarContentItem item={item} profileId={profileId} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Popover>
    </Box>
  );
};
