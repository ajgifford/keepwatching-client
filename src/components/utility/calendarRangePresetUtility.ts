import { defaultCalendarEnd, defaultCalendarStart } from '../../app/slices/calendarSlice';

export type RangePresetId = 'default' | 'next7' | 'next30' | 'thisMonth' | 'last30' | 'custom';

export interface PersistedCalendarRange {
  preset: RangePresetId;
  customStart?: string;
  customEnd?: string;
}

export interface ResolvedCalendarRange {
  startDate: string;
  endDate: string;
}

export const CALENDAR_RANGE_KEY = 'calendarDateRange';
export const MAX_RANGE_SPAN_DAYS = 365;

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Resolves a preset id to concrete ISO start/end dates. Relative presets (next7, thisMonth,
 * etc.) are resolved against `now` at call time rather than persisted as fixed dates, so a
 * saved preset choice doesn't go stale between sessions.
 */
export function resolveRangeForPreset(
  preset: RangePresetId,
  customStart?: string,
  customEnd?: string,
  now: Date = new Date()
): ResolvedCalendarRange {
  switch (preset) {
    case 'next7':
      return { startDate: toISODate(now), endDate: toISODate(addDays(now, 7)) };
    case 'next30':
      return { startDate: toISODate(now), endDate: toISODate(addDays(now, 30)) };
    case 'last30':
      return { startDate: toISODate(addDays(now, -30)), endDate: toISODate(now) };
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
    case 'custom':
      return {
        startDate: customStart ?? defaultCalendarStart(),
        endDate: customEnd ?? defaultCalendarEnd(),
      };
    case 'default':
    default:
      return { startDate: defaultCalendarStart(), endDate: defaultCalendarEnd() };
  }
}

/** Clamps endDate so it never falls more than MAX_RANGE_SPAN_DAYS after startDate. */
export function clampEndDateToMaxSpan(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const maxEnd = addDays(start, MAX_RANGE_SPAN_DAYS);
  return end > maxEnd ? toISODate(maxEnd) : endDate;
}

export function loadPersistedCalendarRange(): PersistedCalendarRange {
  try {
    const stored = localStorage.getItem(CALENDAR_RANGE_KEY);
    if (!stored) return { preset: 'default' };
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed.preset === 'string') {
      return parsed as PersistedCalendarRange;
    }
    return { preset: 'default' };
  } catch {
    return { preset: 'default' };
  }
}

export function savePersistedCalendarRange(range: PersistedCalendarRange): void {
  localStorage.setItem(CALENDAR_RANGE_KEY, JSON.stringify(range));
}
