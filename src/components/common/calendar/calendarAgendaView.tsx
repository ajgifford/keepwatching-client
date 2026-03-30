import React, { useEffect, useRef } from 'react';

import { Box, Divider, Typography } from '@mui/material';

import { CalendarDay } from '../../../app/slices/calendarSlice';
import { CalendarDaySection } from './calendarDaySection';

interface CalendarAgendaViewProps {
  days: CalendarDay[];
  profileId: number;
  compact?: boolean;
}

const d = new Date();
const TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;


export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({ days, profileId, compact = false }) => {
  const todayRef = useRef<HTMLDivElement>(null);

  // In full mode, scroll so that today (or the nearest upcoming day) is at the top
  useEffect(() => {
    if (!compact && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [compact, days]);

  const pastDays = days.filter((d) => d.date < TODAY);
  const todayAndFutureDays = days.filter((d) => d.date >= TODAY);

  // Compact mode: start from today, show up to 10 upcoming days
  if (compact) {
    const visibleDays = todayAndFutureDays.slice(0, 10);

    if (visibleDays.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" color="text.secondary">
            No upcoming content scheduled
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {visibleDays.map((day) => (
          <CalendarDaySection key={day.date} day={day} profileId={profileId} />
        ))}
      </Box>
    );
  }

  // Full mode: past days above (collapsed summary), then today+future
  if (days.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          No content scheduled in this date range
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Past days — rendered before today so scrolling up reveals them */}
      {pastDays.length > 0 && (
        <Box sx={{ opacity: 0.75 }}>
          {pastDays.map((day) => (
            <CalendarDaySection key={day.date} day={day} profileId={profileId} />
          ))}
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.disabled">
              {pastDays.length} past day{pastDays.length !== 1 ? 's' : ''}
            </Typography>
          </Divider>
        </Box>
      )}

      {/* Today and future — todayRef anchors scroll position here */}
      <Box ref={todayRef}>
        {todayAndFutureDays.map((day) => (
          <CalendarDaySection key={day.date} day={day} profileId={profileId} />
        ))}
      </Box>
    </Box>
  );
};
