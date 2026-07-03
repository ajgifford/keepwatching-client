import { useEffect, useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Box, Button, Paper, Typography, alpha, useTheme } from '@mui/material';

import axiosInstance from '../../../../app/api/axiosInstance';
import { RecapDialog } from './recapDialog';
import { AvailableRecapPeriods, RecapPeriodType } from '@ajgifford/keepwatching-types';

interface BannerTarget {
  periodType: RecapPeriodType;
  year: number;
  month?: number;
  label: string;
  /** Which period types the dialog opened from this banner should let you browse. */
  allowedPeriodTypes: RecapPeriodType[];
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function resolveRecapBannerTarget(now: Date): BannerTarget | null {
  const day = now.getDate();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();

  if (month === 11) {
    // December: whole month, offer the yearly recap for the current year. The dialog is
    // yearly-only for the rest of the month, but the first 5 days also overlap with November's
    // monthly recap becoming available (it just closed) - allow browsing both during that window
    // rather than hiding a genuinely-relevant recap.
    const allowedPeriodTypes: RecapPeriodType[] = day <= 5 ? ['year', 'month'] : ['year'];
    return { periodType: 'year', year, label: `Your ${year} Recap is ready`, allowedPeriodTypes };
  }

  if (day >= 1 && day <= 5) {
    const prevMonth = month === 0 ? 12 : month;
    const prevYear = month === 0 ? year - 1 : year;
    return {
      periodType: 'month',
      year: prevYear,
      month: prevMonth,
      label: `Check out your ${MONTH_NAMES[prevMonth - 1]} recap`,
      allowedPeriodTypes: ['month'],
    };
  }

  return null;
}

function isTargetAvailable(target: BannerTarget, available: AvailableRecapPeriods): boolean {
  if (target.periodType === 'year') {
    return available.years.includes(target.year);
  }
  return available.months.some((m) => m.year === target.year && m.month === target.month);
}

interface RecapBannerProps {
  accountId: number;
  profileId: number;
  profileName: string;
  profileAccentColor?: string | null;
}

export function RecapBanner({ accountId, profileId, profileName, profileAccentColor }: RecapBannerProps) {
  const theme = useTheme();
  const [target, setTarget] = useState<BannerTarget | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const bannerTarget = resolveRecapBannerTarget(new Date());
    if (!bannerTarget) {
      setTarget(null);
      return;
    }

    let cancelled = false;

    axiosInstance
      .get(`/accounts/${accountId}/profiles/${profileId}/statistics/recap/available`)
      .then((response) => {
        if (!cancelled && isTargetAvailable(bannerTarget, response.data.results)) {
          setTarget(bannerTarget);
        }
      })
      .catch((error) => {
        console.error('Error checking recap availability:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [accountId, profileId]);

  if (!target) {
    return null;
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          borderLeft: 4,
          borderLeftColor: 'secondary.main',
          backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="secondary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {target.label}
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" onClick={() => setDialogOpen(true)}>
          View Recap
        </Button>
      </Paper>

      <RecapDialog
        open={dialogOpen}
        accountId={accountId}
        profileId={profileId}
        profileName={profileName}
        profileAccentColor={profileAccentColor}
        initialPeriodType={target.periodType}
        initialYear={target.year}
        initialMonth={target.month}
        allowedPeriodTypes={target.allowedPeriodTypes}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
