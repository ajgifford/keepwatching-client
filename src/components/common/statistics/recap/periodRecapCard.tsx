import { forwardRef } from 'react';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MovieIcon from '@mui/icons-material/Movie';
import TheatersIcon from '@mui/icons-material/Theaters';
import { Box, CircularProgress, Skeleton, Stack, Typography, alpha, useTheme } from '@mui/material';

import { hexToHsl, hslToHex } from '../../../../theme/theme';
import { ActivityHeatmap } from './activityHeatmap';
import { ProfileRecapResponse } from '@ajgifford/keepwatching-types';

/**
 * Three-stop gradient derived from a profile's accent color: a darker shade, the accent itself,
 * and a hue-rotated "pop" color so the poster still has movement instead of reading as one flat
 * hue washed light-to-dark. Rotating +140deg lands roughly opposite-ish without going fully
 * complementary (180deg), which tends to look muddier for saturated accent colors.
 */
export function accentGradientStops(accentColor: string): { start: string; mid: string; end: string } {
  const [h, s, l] = hexToHsl(accentColor);
  return {
    start: hslToHex(h, Math.min(s, 90), Math.max(l - 22, 12)),
    mid: accentColor,
    end: hslToHex((h + 140) % 360, Math.min(s, 85), Math.min(l + 6, 60)),
  };
}

export function recapPeriodLabel(period: 'month' | 'year', year: number, month?: number): string {
  if (period === 'year') {
    return `${year}`;
  }
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, 1));
  return date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/**
 * "N episodes · N movies" caption, omitting whichever side is zero - a month with only episodes
 * (or only movies) doesn't need "· 0 movies" stated as if it were a notable absence.
 */
export function formatWatchedCaption(episodesWatched: number, moviesWatched: number): string {
  if (moviesWatched === 0) {
    return `${episodesWatched} episode${episodesWatched === 1 ? '' : 's'}`;
  }
  if (episodesWatched === 0) {
    return `${moviesWatched} movie${moviesWatched === 1 ? '' : 's'}`;
  }
  return `${episodesWatched} episodes · ${moviesWatched} movies`;
}

/**
 * Percent change from `previous` to `current`, rounded to the nearest whole percent.
 * Returns null when there's no meaningful baseline to compare against (previous is 0 or
 * unknown) - callers should render nothing in that case rather than a "New"/infinite badge,
 * since a quiet month is a normal, unremarkable thing and doesn't need flagging.
 */
export function calculatePercentChange(current: number, previous: number | undefined | null): number | null {
  if (!previous) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

const MAX_DISPLAYED_PERCENT_CHANGE = 500;

/**
 * Display text for a percent change. Increases are unbounded (a near-zero previous value can
 * produce a mathematically correct but silly-looking number like "1392%"), so anything past the
 * cap reads as ">500%" instead - still communicates "a lot more," without the number itself
 * looking like a bug. Decreases never need capping: they're bounded to -100% by construction.
 */
export function formatPercentChange(percentChange: number): string {
  if (percentChange > MAX_DISPLAYED_PERCENT_CHANGE) {
    return `>${MAX_DISPLAYED_PERCENT_CHANGE}%`;
  }
  return `${Math.abs(percentChange)}%`;
}

function DeltaBadge({ percentChange, periodLabel }: { percentChange: number | null; periodLabel: string }) {
  if (percentChange === null) {
    return null;
  }
  const isUp = percentChange >= 0;
  return (
    <Typography
      variant="caption"
      sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: isUp ? '#8be28b' : '#ffb3b3', mt: 0.25 }}
    >
      {isUp ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />}
      {formatPercentChange(percentChange)} vs last {periodLabel}
    </Typography>
  );
}

function GenreBars({ topGenres }: { topGenres: { genre: string; count: number }[] }) {
  if (topGenres.length === 0) {
    return null;
  }
  const top = topGenres.slice(0, 3);
  const max = top[0].count;

  return (
    <Box>
      <Typography variant="caption" sx={{ opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1 }}>
        Top genres
      </Typography>
      <Stack spacing={0.75} sx={{ mt: 0.75 }}>
        {top.map((g) => (
          <Box key={g.genre} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ width: 64, flexShrink: 0, opacity: 0.9 }}>
              {g.genre}
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha('#fff', 0.16),
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${Math.round((g.count / max) * 100)}%`,
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: alpha('#fff', 0.85),
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

interface PeriodRecapCardProps {
  profileName: string;
  profileAccentColor?: string | null;
  period: 'month' | 'year';
  year: number;
  month?: number;
  recap: ProfileRecapResponse | null;
  previousRecap?: ProfileRecapResponse | null;
  isLoading: boolean;
}

export const PeriodRecapCard = forwardRef<HTMLDivElement, PeriodRecapCardProps>(
  ({ profileName, profileAccentColor, period, year, month, recap, previousRecap, isLoading }, ref) => {
    const theme = useTheme();
    const periodLabel = period === 'year' ? 'year' : 'month';
    const gradientStops = profileAccentColor
      ? accentGradientStops(profileAccentColor)
      : { start: theme.palette.primary.dark, mid: theme.palette.primary.main, end: theme.palette.secondary.main };
    const hoursDelta = recap ? calculatePercentChange(recap.hoursWatched, previousRecap?.hoursWatched) : null;
    const itemsDelta = recap
      ? calculatePercentChange(
          recap.episodesWatched + recap.moviesWatched,
          previousRecap ? previousRecap.episodesWatched + previousRecap.moviesWatched : undefined
        )
      : null;

    return (
      <Box
        ref={ref}
        data-testid="period-recap-card"
        sx={{
          width: '100%',
          maxWidth: 420,
          aspectRatio: '9 / 16',
          borderRadius: 3,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'common.white',
          background: `linear-gradient(160deg, ${gradientStops.start} 0%, ${gradientStops.mid} 45%, ${gradientStops.end} 100%)`,
          boxShadow: theme.shadows[8],
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>
            {period === 'year' ? 'Year in Review' : 'Monthly Recap'}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {profileName}'s {recapPeriodLabel(period, year, month)}
          </Typography>
        </Box>

        {isLoading || !recap ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <CircularProgress color="inherit" />
            ) : (
              <Stack spacing={1.5} sx={{ width: '100%' }}>
                <Skeleton variant="rounded" height={32} sx={{ bgcolor: alpha('#fff', 0.15) }} />
                <Skeleton variant="rounded" height={32} sx={{ bgcolor: alpha('#fff', 0.15) }} />
                <Skeleton variant="rounded" height={32} sx={{ bgcolor: alpha('#fff', 0.15) }} />
              </Stack>
            )}
          </Box>
        ) : (
          <Stack spacing={2} sx={{ flex: 1, justifyContent: 'space-evenly' }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {recap.hoursWatched}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  hours watched
                </Typography>
                <DeltaBadge percentChange={hoursDelta} periodLabel={periodLabel} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {recap.episodesWatched + recap.moviesWatched}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {formatWatchedCaption(recap.episodesWatched, recap.moviesWatched)}
                </Typography>
                <DeltaBadge percentChange={itemsDelta} periodLabel={periodLabel} />
              </Box>
            </Box>

            <ActivityHeatmap
              activityBreakdown={recap.activityBreakdown}
              period={period}
              periodLabel={recapPeriodLabel(period, year, month)}
            />

            <GenreBars topGenres={recap.topGenres} />

            {recap.topShow && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MovieIcon fontSize="small" />
                <Typography variant="body2">
                  Most watched: <strong>{recap.topShow.title}</strong> ({recap.topShow.episodesWatched} episodes)
                </Typography>
              </Box>
            )}

            {recap.topMovie && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TheatersIcon fontSize="small" />
                <Typography variant="body2">
                  Standout movie: <strong>{recap.topMovie.title}</strong>
                </Typography>
              </Box>
            )}

            {recap.longestStreak && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalFireDepartmentIcon fontSize="small" />
                <Typography variant="body2">
                  Longest streak: <strong>{recap.longestStreak.days} days</strong>
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        <Typography variant="caption" sx={{ opacity: 0.7, textAlign: 'center', mt: 2.5 }}>
          KeepWatching
        </Typography>
      </Box>
    );
  }
);

PeriodRecapCard.displayName = 'PeriodRecapCard';
