import { useEffect, useMemo, useRef, useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import { Box, IconButton, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';

import axiosInstance from '../../../../app/api/axiosInstance';
import { PeriodRecapCard, recapPeriodLabel } from './periodRecapCard';
import { AvailableRecapPeriods, ProfileRecapResponse, RecapPeriodType } from '@ajgifford/keepwatching-types';
import { toPng } from 'html-to-image';

interface RecapPeriodKey {
  period: RecapPeriodType;
  year: number;
  month?: number;
}

function periodKeyString({ period, year, month }: RecapPeriodKey): string {
  return `${period}-${year}${month ? `-${month}` : ''}`;
}

/** The calendar period immediately preceding the given one - prev month rolls the year over. */
function getPreviousPeriodKey({ period, year, month }: RecapPeriodKey): RecapPeriodKey {
  if (period === 'year') {
    return { period: 'year', year: year - 1 };
  }
  if (month === 1) {
    return { period: 'month', year: year - 1, month: 12 };
  }
  return { period: 'month', year, month: (month ?? 1) - 1 };
}

const BOTH_PERIOD_TYPES: RecapPeriodType[] = ['year', 'month'];

interface RecapNavigatorProps {
  accountId: number;
  profileId: number;
  profileName: string;
  profileAccentColor?: string | null;
  initialPeriodType: RecapPeriodType;
  initialYear?: number;
  initialMonth?: number;
  /** Which period types can be browsed. Defaults to both. */
  allowedPeriodTypes?: RecapPeriodType[];
}

export function RecapNavigator({
  accountId,
  profileId,
  profileName,
  profileAccentColor,
  initialPeriodType,
  initialYear,
  initialMonth,
  allowedPeriodTypes = BOTH_PERIOD_TYPES,
}: RecapNavigatorProps) {
  const [periodType, setPeriodType] = useState<RecapPeriodType>(initialPeriodType);
  const [available, setAvailable] = useState<AvailableRecapPeriods | null>(null);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);
  const [recapCache, setRecapCache] = useState<Record<string, ProfileRecapResponse>>({});
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  // -1 is a sentinel meaning "no period resolved yet" - distinct from any real index (including
  // 0) so the effect below is guaranteed to fire exactly once with the true resolved default,
  // rather than possibly starting equal to it and never triggering a state change/re-render.
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks in-flight fetches synchronously via ref (not React state, which batches/updates
  // asynchronously) so a StrictMode dev-mode double-invoke of the same effect - which reads this
  // check before the first invocation's state update has committed - can't slip past the dedupe
  // and fire a second, redundant request for the same period.
  const inFlightRecapKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const fetchAvailable = async () => {
      setIsLoadingAvailable(true);
      try {
        const response = await axiosInstance.get(
          `/accounts/${accountId}/profiles/${profileId}/statistics/recap/available`
        );
        if (!cancelled) {
          setAvailable(response.data.results);
        }
      } catch (error) {
        console.error('Error fetching available recap periods:', error);
      } finally {
        if (!cancelled) {
          setIsLoadingAvailable(false);
        }
      }
    };

    fetchAvailable();

    return () => {
      cancelled = true;
    };
  }, [accountId, profileId]);

  useEffect(() => {
    if (!available) return;
    const hasYearly = available.years.length > 0;
    const hasMonthly = available.months.length > 0;
    const initialTypeHasData = periodType === 'year' ? hasYearly : hasMonthly;
    if (initialTypeHasData) return;

    const fallback: RecapPeriodType = periodType === 'year' ? 'month' : 'year';
    const fallbackHasData = fallback === 'year' ? hasYearly : hasMonthly;
    if (fallbackHasData && allowedPeriodTypes.includes(fallback)) {
      setPeriodType(fallback);
    }
    // Only run right when `available` first resolves, not on every manual toggle - a user
    // deliberately switching to a period type with no data yet should see the empty state,
    // not get silently bounced back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  const periods: RecapPeriodKey[] = useMemo(() => {
    if (!available) return [];
    if (periodType === 'year') {
      return available.years.map((year) => ({ period: 'year' as const, year }));
    }
    return available.months.map(({ year, month }) => ({ period: 'month' as const, year, month }));
  }, [available, periodType]);

  useEffect(() => {
    if (periods.length === 0) return;

    let index = periods.length - 1;
    if (periodType === initialPeriodType && initialYear !== undefined) {
      const target = periods.findIndex(
        (p) => p.year === initialYear && (periodType !== 'month' || p.month === initialMonth)
      );
      if (target >= 0) index = target;
    }
    setFocusedIndex(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods]);

  const fetchRecapIntoCache = (target: RecapPeriodKey) => {
    const key = periodKeyString(target);
    if (recapCache[key] || inFlightRecapKeys.current.has(key)) return;

    inFlightRecapKeys.current.add(key);
    setLoadingKeys((prev) => new Set(prev).add(key));

    axiosInstance
      .get(`/accounts/${accountId}/profiles/${profileId}/statistics/recap`, {
        params: { period: target.period, year: target.year, month: target.month },
      })
      .then((response) => {
        setRecapCache((prev) => ({ ...prev, [key]: response.data.results }));
      })
      .catch((error) => {
        console.error('Error fetching recap:', error);
      })
      .finally(() => {
        inFlightRecapKeys.current.delete(key);
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      });
  };

  const focusedTarget = focusedIndex >= 0 ? (periods[focusedIndex] ?? null) : null;
  // Key on the resolved period's identity, not the raw index. Two different `periods` arrays
  // (e.g. before/after toggling Yearly<->Monthly) can coincidentally default to the same numeric
  // index - since React skips re-running effects when a dependency value hasn't actually changed,
  // keying on `focusedIndex` alone would silently no-op the fetch in that coincidence and leave
  // the card stuck loading. The period key changes whenever the target period genuinely changes,
  // regardless of what its index happens to be.
  const focusedKey = focusedTarget ? periodKeyString(focusedTarget) : null;

  useEffect(() => {
    if (!focusedTarget) return;
    fetchRecapIntoCache(focusedTarget);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedKey, accountId, profileId]);

  useEffect(() => {
    // Prefetch the calendar-adjacent previous period into the same cache, purely so the
    // comparison badge on the focused card has data ready instead of popping in late. Reuses
    // the normal recap cache/loading-state, so it's a no-op once already fetched.
    if (!focusedTarget) return;
    fetchRecapIntoCache(getPreviousPeriodKey(focusedTarget));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedKey, accountId, profileId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const card = cardRefs.current[focusedIndex];
    if (container && card) {
      const left = card.offsetLeft - container.offsetLeft;

      // Mark this scroll as self-triggered so handleScroll ignores the intermediate positions of
      // the smooth-scroll animation - otherwise a partial scrollLeft mid-animation computes the
      // wrong nearest index, calls setFocusedIndex again, and that restarts the scroll toward the
      // wrong target, fighting the original animation. Clearing the flag needs to track the
      // animation's *actual* completion via the native `scrollend` event, not a fixed-duration
      // guess: a long jump (e.g. straight to the most recent of many months) can take longer than
      // any reasonable fixed timeout, so a guess-based clear can fire mid-animation and let a
      // stray scroll event nudge the index backward one step at a time.
      isProgrammaticScroll.current = true;
      if (programmaticScrollTimeout.current) {
        clearTimeout(programmaticScrollTimeout.current);
      }

      const clearFlag = () => {
        isProgrammaticScroll.current = false;
        if (programmaticScrollTimeout.current) {
          clearTimeout(programmaticScrollTimeout.current);
          programmaticScrollTimeout.current = null;
        }
        container.removeEventListener('scrollend', clearFlag);
      };

      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ left, behavior: 'smooth' });
        container.addEventListener('scrollend', clearFlag);
      } else {
        container.scrollLeft = left;
      }

      // Fallback safety net for browsers without `scrollend` support, or in case it never fires -
      // generous enough to outlast any real smooth-scroll animation rather than racing it.
      programmaticScrollTimeout.current = setTimeout(clearFlag, 2000);

      return () => {
        container.removeEventListener('scrollend', clearFlag);
        if (programmaticScrollTimeout.current) {
          clearTimeout(programmaticScrollTimeout.current);
        }
      };
    }
  }, [focusedIndex]);

  const updateArrowVisibility = () => {
    setShowLeftArrow(focusedIndex > 0);
    setShowRightArrow(focusedIndex < periods.length - 1);
  };

  useEffect(() => {
    updateArrowVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedIndex, periods.length]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, clientWidth } = container;
    const nearestIndex = Math.round(scrollLeft / clientWidth);
    if (nearestIndex !== focusedIndex && nearestIndex >= 0 && nearestIndex < periods.length) {
      setFocusedIndex(nearestIndex);
    }
  };

  const handlePeriodTypeChange = (_event: React.MouseEvent<HTMLElement>, value: RecapPeriodType | null) => {
    if (value) {
      setPeriodType(value);
    }
  };

  const handleDownload = async () => {
    const card = cardRefs.current[focusedIndex];
    if (!card) return;
    const dataUrl = await toPng(card, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `keepwatching-recap-${periodKeyString(periods[focusedIndex])}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    const card = cardRefs.current[focusedIndex];
    if (!card) return;
    const dataUrl = await toPng(card, { pixelRatio: 2 });
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'keepwatching-recap.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'My KeepWatching Recap' });
    } else {
      await handleDownload();
    }
  };

  if (isLoadingAvailable) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography color="text.secondary">Loading your recap history...</Typography>
      </Box>
    );
  }

  const focused = periods[focusedIndex];
  const focusedRecap = focused ? (recapCache[periodKeyString(focused)] ?? null) : null;
  const focusedIsLoading = focused ? loadingKeys.has(periodKeyString(focused)) : false;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {allowedPeriodTypes.length > 1 && (
        <ToggleButtonGroup value={periodType} exclusive size="small" onChange={handlePeriodTypeChange}>
          {allowedPeriodTypes.includes('year') && <ToggleButton value="year">Yearly</ToggleButton>}
          {allowedPeriodTypes.includes('month') && <ToggleButton value="month">Monthly</ToggleButton>}
        </ToggleButtonGroup>
      )}

      {periods.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography color="text.secondary">
            No {periodType === 'year' ? 'yearly' : 'monthly'} recap available yet — keep watching!
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {showLeftArrow && (
              <IconButton
                aria-label="previous recap"
                onClick={() => setFocusedIndex((i) => Math.max(0, i - 1))}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            )}

            <Box
              ref={scrollContainerRef}
              onScroll={handleScroll}
              data-testid="recap-scroll-track"
              sx={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                width: '100%',
                maxWidth: 420,
              }}
            >
              {periods.map((p, index) => {
                const key = periodKeyString(p);
                const previousKey = periodKeyString(getPreviousPeriodKey(p));
                return (
                  <Box
                    key={key}
                    sx={{ flex: '0 0 100%', scrollSnapAlign: 'start', display: 'flex', justifyContent: 'center' }}
                  >
                    <PeriodRecapCard
                      ref={(el) => {
                        cardRefs.current[index] = el;
                      }}
                      profileName={profileName}
                      profileAccentColor={profileAccentColor}
                      period={p.period}
                      year={p.year}
                      month={p.month}
                      recap={recapCache[key] ?? null}
                      previousRecap={recapCache[previousKey] ?? null}
                      isLoading={loadingKeys.has(key)}
                    />
                  </Box>
                );
              })}
            </Box>

            {showRightArrow && (
              <IconButton
                aria-label="next recap"
                onClick={() => setFocusedIndex((i) => Math.min(periods.length - 1, i + 1))}
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            )}
          </Box>

          {focused && (
            <Typography variant="body2" color="text.secondary" data-testid="focused-period-label">
              {recapPeriodLabel(focused.period, focused.year, focused.month)}
            </Typography>
          )}
        </>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Download as image">
          <span>
            <IconButton
              aria-label="download as image"
              onClick={handleDownload}
              disabled={!focusedRecap || focusedIsLoading}
            >
              <DownloadIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Share">
          <span>
            <IconButton aria-label="share" onClick={handleShare} disabled={!focusedRecap || focusedIsLoading}>
              <ShareIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
