import { defaultCalendarEnd, defaultCalendarStart } from '../../../app/slices/calendarSlice';
import {
  CALENDAR_RANGE_KEY,
  clampEndDateToMaxSpan,
  loadPersistedCalendarRange,
  resolveRangeForPreset,
  savePersistedCalendarRange,
} from '../calendarRangePresetUtility';

const FIXED_NOW = new Date('2026-07-08T12:00:00Z');

beforeEach(() => {
  localStorage.clear();
});

describe('resolveRangeForPreset', () => {
  it('resolves "default" using the calendarSlice default window (30 back / 60 forward)', () => {
    const result = resolveRangeForPreset('default', undefined, undefined, FIXED_NOW);
    expect(result).toEqual({ startDate: defaultCalendarStart(), endDate: defaultCalendarEnd() });
  });

  it('resolves "next7" relative to now', () => {
    const result = resolveRangeForPreset('next7', undefined, undefined, FIXED_NOW);
    expect(result).toEqual({ startDate: '2026-07-08', endDate: '2026-07-15' });
  });

  it('resolves "next30" relative to now', () => {
    const result = resolveRangeForPreset('next30', undefined, undefined, FIXED_NOW);
    expect(result).toEqual({ startDate: '2026-07-08', endDate: '2026-08-07' });
  });

  it('resolves "last30" relative to now', () => {
    const result = resolveRangeForPreset('last30', undefined, undefined, FIXED_NOW);
    expect(result).toEqual({ startDate: '2026-06-08', endDate: '2026-07-08' });
  });

  it('resolves "thisMonth" to the first/last day of the current month', () => {
    const result = resolveRangeForPreset('thisMonth', undefined, undefined, FIXED_NOW);
    expect(result).toEqual({ startDate: '2026-07-01', endDate: '2026-07-31' });
  });

  it('resolves "custom" using the provided customStart/customEnd', () => {
    const result = resolveRangeForPreset('custom', '2026-01-01', '2026-02-01', FIXED_NOW);
    expect(result).toEqual({ startDate: '2026-01-01', endDate: '2026-02-01' });
  });

  it('falls back to the default window for "custom" when dates are missing', () => {
    const result = resolveRangeForPreset('custom', undefined, undefined, FIXED_NOW);
    expect(result).toEqual({ startDate: defaultCalendarStart(), endDate: defaultCalendarEnd() });
  });
});

describe('clampEndDateToMaxSpan', () => {
  it('leaves endDate unchanged when within the 365-day max span', () => {
    expect(clampEndDateToMaxSpan('2026-01-01', '2026-06-01')).toBe('2026-06-01');
  });

  it('leaves endDate unchanged when exactly at the 365-day boundary', () => {
    expect(clampEndDateToMaxSpan('2026-01-01', '2027-01-01')).toBe('2027-01-01');
  });

  it('clamps endDate down when it exceeds the 365-day max span', () => {
    expect(clampEndDateToMaxSpan('2026-01-01', '2028-01-01')).toBe('2027-01-01');
  });
});

describe('loadPersistedCalendarRange / savePersistedCalendarRange', () => {
  it('returns the default preset when nothing is stored', () => {
    expect(loadPersistedCalendarRange()).toEqual({ preset: 'default' });
  });

  it('returns the default preset when stored JSON is corrupt', () => {
    localStorage.setItem(CALENDAR_RANGE_KEY, '{not-valid-json');
    expect(loadPersistedCalendarRange()).toEqual({ preset: 'default' });
  });

  it('returns the default preset when stored JSON lacks a preset field', () => {
    localStorage.setItem(CALENDAR_RANGE_KEY, JSON.stringify({ foo: 'bar' }));
    expect(loadPersistedCalendarRange()).toEqual({ preset: 'default' });
  });

  it('round-trips a saved preset', () => {
    savePersistedCalendarRange({ preset: 'next7' });
    expect(loadPersistedCalendarRange()).toEqual({ preset: 'next7' });
  });

  it('round-trips a saved custom range', () => {
    savePersistedCalendarRange({ preset: 'custom', customStart: '2026-01-01', customEnd: '2026-02-01' });
    expect(loadPersistedCalendarRange()).toEqual({
      preset: 'custom',
      customStart: '2026-01-01',
      customEnd: '2026-02-01',
    });
  });
});
