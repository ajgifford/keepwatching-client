import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
import {
  RangePresetId,
  loadPersistedCalendarRange,
  resolveRangeForPreset,
  savePersistedCalendarRange,
} from '../../utility/calendarRangePresetUtility';
import { downloadTextFile } from '../../utility/downloadFileUtility';
import { generateIcsCalendar } from '../../utility/icsExportUtility';
import { CalendarAgendaView } from './calendarAgendaView';
import { CalendarGridView } from './calendarGridView';
import { CalendarRangeControls } from './calendarRangeControls';
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
  const end = new Date(year, month + 2, 0); // one month after (last day)
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

  const [range, setRange] = useState<{ preset: RangePresetId; startDate: string; endDate: string }>(() => {
    if (compact) {
      return { preset: 'default', ...resolveRangeForPreset('default') };
    }
    const persisted = loadPersistedCalendarRange();
    const resolved = resolveRangeForPreset(persisted.preset, persisted.customStart, persisted.customEnd);
    return { preset: persisted.preset, ...resolved };
  });

  // Initial load or stale data
  useEffect(() => {
    if (!profile) return;
    const isStale = !lastFetched || Date.now() - new Date(lastFetched).getTime() > STALE_MS;
    if (isStale) {
      dispatch(fetchCalendarContent({ profileId: profile.id, startDate: range.startDate, endDate: range.endDate }));
    }
    // Only re-run on mount/profile/staleness changes — user-picked range changes dispatch their own fetch (handleRangeChange).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, profile, lastFetched]);

  // When the viewed month changes in grid view, check if it's outside the fetched range and fetch if needed
  useEffect(() => {
    if (!profile || compact || viewMode !== 'grid') return;
    if (!fetchedRange.startDate || !fetchedRange.endDate) return;

    const viewedMonthStart = monthStart(viewYear, viewMonth);
    const viewedMonthEnd = monthEnd(viewYear, viewMonth);

    const outsideRange = viewedMonthStart < fetchedRange.startDate || viewedMonthEnd > fetchedRange.endDate;

    if (outsideRange) {
      const { startDate, endDate } = expandedRange(viewYear, viewMonth);
      dispatch(fetchCalendarContent({ profileId: profile.id, startDate, endDate }));
    }
  }, [dispatch, profile, compact, viewMode, viewYear, viewMonth, fetchedRange]);

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

  const handleRangeChange = (next: {
    preset: RangePresetId;
    startDate: string;
    endDate: string;
    customStart?: string;
    customEnd?: string;
  }) => {
    setRange({ preset: next.preset, startDate: next.startDate, endDate: next.endDate });
    savePersistedCalendarRange({ preset: next.preset, customStart: next.customStart, customEnd: next.customEnd });
    if (profile) {
      dispatch(fetchCalendarContent({ profileId: profile.id, startDate: next.startDate, endDate: next.endDate }));
    }
  };

  const handleExport = () => {
    downloadTextFile(generateIcsCalendar(days), 'keepwatching-calendar.ics', 'text/calendar');
  };

  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;

  const totalItems = days.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 40 }}>
            <CalendarMonthIcon color="primary" />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
              }}
            >
              Content Calendar
            </Typography>
            <Chip label={`${totalItems} items`} size="small" color="primary" variant="outlined" />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {!compact && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<FileDownloadIcon fontSize="small" />}
                onClick={handleExport}
              >
                Export
              </Button>
            )}

            {!compact && (
              <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size="small">
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

        {!compact && viewMode === 'agenda' && (
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, mt: 3 }}>
            <CalendarRangeControls
              preset={range.preset}
              startDate={range.startDate}
              endDate={range.endDate}
              onRangeChange={handleRangeChange}
            />
          </Box>
        )}
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
