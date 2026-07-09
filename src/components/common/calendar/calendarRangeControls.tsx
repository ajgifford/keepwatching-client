import React from 'react';

import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { RangePresetId, clampEndDateToMaxSpan, resolveRangeForPreset } from '../../utility/calendarRangePresetUtility';
import { format } from 'date-fns';

interface CalendarRangeControlsProps {
  preset: RangePresetId;
  startDate: string;
  endDate: string;
  onRangeChange: (next: {
    preset: RangePresetId;
    startDate: string;
    endDate: string;
    customStart?: string;
    customEnd?: string;
  }) => void;
}

const PRESET_OPTIONS: { id: RangePresetId; label: string }[] = [
  { id: 'default', label: 'Default (30 days back / 60 forward)' },
  { id: 'next7', label: 'Next 7 Days' },
  { id: 'next30', label: 'Next 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'last30', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom Range…' },
];

function parseIsoDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

function formatIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export const CalendarRangeControls: React.FC<CalendarRangeControlsProps> = ({
  preset,
  startDate,
  endDate,
  onRangeChange,
}) => {
  const handlePresetChange = (event: SelectChangeEvent) => {
    const nextPreset = event.target.value as RangePresetId;

    if (nextPreset === 'custom') {
      const resolved = resolveRangeForPreset('custom', startDate, endDate);
      onRangeChange({
        preset: nextPreset,
        startDate: resolved.startDate,
        endDate: resolved.endDate,
        customStart: resolved.startDate,
        customEnd: resolved.endDate,
      });
      return;
    }

    const resolved = resolveRangeForPreset(nextPreset);
    onRangeChange({ preset: nextPreset, startDate: resolved.startDate, endDate: resolved.endDate });
  };

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    const newStart = formatIsoDate(date);
    const newEnd = newStart > endDate ? newStart : endDate;
    const clampedEnd = clampEndDateToMaxSpan(newStart, newEnd);
    onRangeChange({
      preset: 'custom',
      startDate: newStart,
      endDate: clampedEnd,
      customStart: newStart,
      customEnd: clampedEnd,
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    const newEnd = clampEndDateToMaxSpan(startDate, formatIsoDate(date));
    onRangeChange({ preset: 'custom', startDate, endDate: newEnd, customStart: startDate, customEnd: newEnd });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: { xs: 'flex-start', sm: 'flex-end' },
        gap: 1.5,
        flexWrap: 'wrap',
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
        <InputLabel id="calendar-range-preset-label">Date Range</InputLabel>
        <Select labelId="calendar-range-preset-label" label="Date Range" value={preset} onChange={handlePresetChange}>
          {PRESET_OPTIONS.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {preset === 'custom' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            gap: 1.5,
            flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <DatePicker
            label="Start"
            value={parseIsoDate(startDate)}
            onChange={handleStartDateChange}
            maxDate={parseIsoDate(endDate)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          />
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <DatePicker
              label="End"
              value={parseIsoDate(endDate)}
              onChange={handleEndDateChange}
              minDate={parseIsoDate(startDate)}
              maxDate={parseIsoDate(clampEndDateToMaxSpan(startDate, '9999-12-31'))}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />
            <FormHelperText>Maximum range: 1 year</FormHelperText>
          </Box>
        </Box>
      )}
    </Box>
  );
};
