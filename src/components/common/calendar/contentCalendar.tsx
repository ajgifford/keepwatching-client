import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Box, Button, Chip, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectActiveProfile } from '../../../app/slices/activeProfileSlice';
import {
  fetchCalendarContent,
  selectCalendarDays,
  selectCalendarError,
  selectCalendarFetchedRange,
  selectCalendarLastFetched,
  selectCalendarLoading,
} from '../../../app/slices/calendarSlice';
import { CalendarAgendaView } from './calendarAgendaView';
import { CalendarGridView } from './calendarGridView';
import { ErrorComponent, LoadingComponent } from '@ajgifford/keepwatching-ui';

const STALE_MS = 5 * 60 * 1000; // 5 minutes
const VIEW_MODE_KEY = 'calendarViewMode';

interface ContentCalendarProps {
  compact?: boolean;
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Returns the first day of a given month as ISO string */
function monthStart(year: number, month: number): string {
  return toISODate(new Date(year, month, 1));
}

/** Returns the last day of a given month as ISO string */
function monthEnd(year: number, month: number): string {
  return toISODate(new Date(year, month + 1, 0));
}

/** Expand a range to cover a target month, with a one-month buffer on each side */
function expandedRange(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month - 1, 1); // one month before
  const end = new Date(year, month + 2, 0);   // one month after (last day)
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({ compact = false }) => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectActiveProfile);
  const loading = useAppSelector(selectCalendarLoading);
  const error = useAppSelector(selectCalendarError);
  const lastFetched = useAppSelector(selectCalendarLastFetched);
  const fetchedRange = useAppSelector(selectCalendarFetchedRange);
  const days = useAppSelector(selectCalendarDays);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [viewMode, setViewMode] = useState<'agenda' | 'grid'>(() => {
    if (compact) return 'agenda';
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    return stored === 'grid' ? 'grid' : 'agenda';
  });

  // Initial load or stale data
  useEffect(() => {
    if (!profile) return;
    const isStale = !lastFetched || Date.now() - new Date(lastFetched).getTime() > STALE_MS;
    if (isStale) {
      dispatch(fetchCalendarContent({ profileId: profile.id }));
    }
  }, [dispatch, profile, lastFetched]);

  // When the viewed month changes, check if it's outside the fetched range and fetch if needed
  useEffect(() => {
    if (!profile || compact) return;
    if (!fetchedRange.startDate || !fetchedRange.endDate) return;

    const viewedMonthStart = monthStart(viewYear, viewMonth);
    const viewedMonthEnd = monthEnd(viewYear, viewMonth);

    const outsideRange =
      viewedMonthStart < fetchedRange.startDate || viewedMonthEnd > fetchedRange.endDate;

    if (outsideRange) {
      const { startDate, endDate } = expandedRange(viewYear, viewMonth);
      dispatch(fetchCalendarContent({ profileId: profile.id, startDate, endDate }));
    }
  }, [dispatch, profile, compact, viewYear, viewMonth, fetchedRange]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newMode: 'agenda' | 'grid' | null) => {
    if (!newMode) return;
    setViewMode(newMode);
    localStorage.setItem(VIEW_MODE_KEY, newMode);
  };

  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;

  const totalItems = days.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CalendarMonthIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Content Calendar
          </Typography>
          <Chip label={`${totalItems} items`} size="small" color="primary" variant="outlined" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!compact && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
            >
              <ToggleButton value="agenda" aria-label="agenda view">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="calendar grid view">
                <CalendarMonthIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          {compact && (
            <Button component={Link} to="/calendar" size="small" variant="outlined">
              View Full Calendar
            </Button>
          )}
        </Box>
      </Box>

      {/* Content */}
      {viewMode === 'agenda' || compact ? (
        <CalendarAgendaView days={days} profileId={profile?.id ?? 0} compact={compact} />
      ) : (
        <CalendarGridView
          days={days}
          profileId={profile?.id ?? 0}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onJumpToToday={handleJumpToToday}
        />
      )}
    </Box>
  );
};
