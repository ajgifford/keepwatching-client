import { CalendarDay, CalendarEpisodeItem, CalendarMovieItem } from '../../../app/slices/calendarSlice';
import { generateIcsCalendar } from '../icsExportUtility';
import { ProfileMovie, RecentUpcomingEpisode, WatchStatus } from '@ajgifford/keepwatching-types';

const FIXED_NOW = new Date('2026-07-08T15:30:45.123Z');

const createMockEpisode = (overrides: Partial<RecentUpcomingEpisode> = {}): RecentUpcomingEpisode => ({
  profileId: 5,
  showId: 100,
  showName: 'Test Show',
  streamingServices: 'Netflix',
  network: 'NBC',
  episodeTitle: 'Pilot',
  airDate: '2026-07-10',
  runtime: 45,
  episodeNumber: 1,
  seasonNumber: 2,
  episodeStillImage: '',
  ...overrides,
});

const createMockMovie = (overrides: Partial<ProfileMovie> = {}): ProfileMovie => ({
  id: 200,
  tmdbId: 999,
  title: 'Test Movie',
  description: '',
  releaseDate: '2026-07-11',
  posterImage: '',
  backdropImage: '',
  runtime: 120,
  userRating: 0,
  mpaRating: 'PG-13',
  genres: 'Action',
  streamingServices: 'Max',
  profileId: 5,
  watchStatus: WatchStatus.NOT_WATCHED,
  ...overrides,
});

const episodeItem = (overrides: Partial<RecentUpcomingEpisode> = {}): CalendarEpisodeItem => {
  const data = createMockEpisode(overrides);
  return { type: 'episode', date: data.airDate, data };
};

const movieItem = (overrides: Partial<ProfileMovie> = {}): CalendarMovieItem => {
  const data = createMockMovie(overrides);
  return { type: 'movie', date: data.releaseDate, data };
};

describe('generateIcsCalendar', () => {
  it('produces a valid minimal VCALENDAR for an empty days array', () => {
    const result = generateIcsCalendar([], { now: FIXED_NOW });
    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('VERSION:2.0');
    expect(result).toContain('END:VCALENDAR');
    expect(result).not.toContain('BEGIN:VEVENT');
  });

  it('produces one VEVENT per item across mixed episode/movie days', () => {
    const days: CalendarDay[] = [
      { date: '2026-07-10', items: [episodeItem(), movieItem()] },
      { date: '2026-07-12', items: [episodeItem({ airDate: '2026-07-12', episodeNumber: 2 })] },
    ];
    const result = generateIcsCalendar(days, { now: FIXED_NOW });
    expect(result.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    expect(result.match(/END:VEVENT/g)).toHaveLength(3);
  });

  it('uses CRLF line endings', () => {
    const result = generateIcsCalendar([{ date: '2026-07-10', items: [episodeItem()] }], { now: FIXED_NOW });
    expect(result).toContain('\r\n');
    expect(result.split('\n').every((line) => !line.endsWith('\r\n'))).toBe(true);
  });

  it('formats episode DTSTART/DTEND as an all-day event with an exclusive end date', () => {
    const result = generateIcsCalendar([{ date: '2026-07-10', items: [episodeItem({ airDate: '2026-07-10' })] }], {
      now: FIXED_NOW,
    });
    expect(result).toContain('DTSTART;VALUE=DATE:20260710');
    expect(result).toContain('DTEND;VALUE=DATE:20260711');
  });

  it('formats movie DTSTART/DTEND as an all-day event with an exclusive end date', () => {
    const result = generateIcsCalendar([{ date: '2026-07-11', items: [movieItem({ releaseDate: '2026-07-11' })] }], {
      now: FIXED_NOW,
    });
    expect(result).toContain('DTSTART;VALUE=DATE:20260711');
    expect(result).toContain('DTEND;VALUE=DATE:20260712');
  });

  it('reflects the injected `now` in DTSTAMP', () => {
    const result = generateIcsCalendar([{ date: '2026-07-10', items: [episodeItem()] }], { now: FIXED_NOW });
    expect(result).toContain('DTSTAMP:20260708T153045Z');
  });

  it('produces a stable, deterministic UID for the same episode across calls', () => {
    const item = episodeItem();
    const first = generateIcsCalendar([{ date: item.date, items: [item] }], { now: FIXED_NOW });
    const second = generateIcsCalendar([{ date: item.date, items: [item] }], { now: FIXED_NOW });
    const uidPattern = /UID:([^\r\n]+)/;
    expect(first.match(uidPattern)?.[1]).toBe(second.match(uidPattern)?.[1]);
  });

  it('produces distinct UIDs for different episodes and for episodes vs movies', () => {
    const days: CalendarDay[] = [
      {
        date: '2026-07-10',
        items: [episodeItem({ episodeNumber: 1 }), episodeItem({ episodeNumber: 2 }), movieItem()],
      },
    ];
    const result = generateIcsCalendar(days, { now: FIXED_NOW });
    const uids = [...result.matchAll(/UID:([^\r\n]+)/g)].map((m) => m[1]);
    expect(new Set(uids).size).toBe(3);
  });

  it('includes a show/episode SUMMARY with season/episode numbers zero-padded', () => {
    const result = generateIcsCalendar(
      [{ date: '2026-07-10', items: [episodeItem({ showName: 'Show', seasonNumber: 1, episodeNumber: 3 })] }],
      { now: FIXED_NOW }
    );
    expect(result).toContain('SUMMARY:Show S01E03');
  });

  it('escapes commas, semicolons, backslashes, and newlines in text fields', () => {
    const result = generateIcsCalendar(
      [
        {
          date: '2026-07-10',
          items: [episodeItem({ episodeTitle: 'Part 1, Chapter 2; The\\Return\nBegins' })],
        },
      ],
      { now: FIXED_NOW }
    );
    expect(result).toContain('Part 1\\, Chapter 2\\; The\\\\Return\\nBegins');
  });

  it('links back into the app via URL for episodes and movies', () => {
    const result = generateIcsCalendar(
      [{ date: '2026-07-10', items: [episodeItem({ showId: 42, profileId: 7 }), movieItem({ id: 84, profileId: 7 })] }],
      { now: FIXED_NOW }
    );
    expect(result).toContain(`URL:${window.location.origin}/shows/42/7`);
    expect(result).toContain(`URL:${window.location.origin}/movies/84/7`);
  });
});
