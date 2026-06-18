import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';

export type StatsTimeWindowDays = 30 | 90 | 180 | 365 | null;

type WindowKey = '30d' | '90d' | '6m' | '1y' | 'all';

const WINDOWS: { label: string; key: WindowKey; days: StatsTimeWindowDays }[] = [
  { label: '30D', key: '30d', days: 30 },
  { label: '90D', key: '90d', days: 90 },
  { label: '6M', key: '6m', days: 180 },
  { label: '1Y', key: '1y', days: 365 },
  { label: 'All', key: 'all', days: null },
];

function daysToKey(days: StatsTimeWindowDays): WindowKey {
  return WINDOWS.find((w) => w.days === days)?.key ?? '30d';
}

interface StatsTimeWindowSelectorProps {
  value: StatsTimeWindowDays;
  onChange: (value: StatsTimeWindowDays) => void;
  disabled?: boolean;
}

const StatsTimeWindowSelector = ({ value, onChange, disabled }: StatsTimeWindowSelectorProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        Time window:
      </Typography>
      <Tooltip
        title="Applies to velocity, activity, binge sessions, streaks, seasonal patterns, time-to-watch, content preferences, and discovery. Milestones, abandonment risk, and unaired content always reflect lifetime data."
        placement="top"
        arrow
      >
        <InfoOutlinedIcon sx={{ fontSize: '1rem', color: 'text.disabled', cursor: 'default' }} />
      </Tooltip>
      <ToggleButtonGroup
        value={daysToKey(value)}
        exclusive
        size="small"
        disabled={disabled}
        onChange={(_, newKey: WindowKey | null) => {
          if (!newKey) return;
          const found = WINDOWS.find((w) => w.key === newKey);
          if (found) onChange(found.days);
        }}
        aria-label="stats time window"
      >
        {WINDOWS.map(({ label, key }) => (
          <ToggleButton key={key} value={key} sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default StatsTimeWindowSelector;
