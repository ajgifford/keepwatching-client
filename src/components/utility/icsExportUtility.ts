import { CalendarDay, CalendarEpisodeItem, CalendarItem, CalendarMovieItem } from '../../app/slices/calendarSlice';

const UID_DOMAIN = 'keepwatching.giffordfamilydev.us';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatIcsDate(dateString: string): string {
  return dateString.replace(/-/g, '');
}

/** All-day events use an exclusive DTEND, so this is the day after `dateString`. */
function formatIcsDateExclusiveEnd(dateString: string): string {
  const d = new Date(dateString);
  d.setDate(d.getDate() + 1);
  const iso = d.toISOString().split('T')[0];
  return formatIcsDate(iso);
}

function formatIcsDateStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function episodeToVEvent(item: CalendarEpisodeItem, now: Date): string {
  const ep = item.data;
  const uid = `episode-${ep.showId}-s${ep.seasonNumber}e${ep.episodeNumber}-${ep.airDate}@${UID_DOMAIN}`;
  const summary = `${ep.showName} S${pad2(ep.seasonNumber)}E${pad2(ep.episodeNumber)}: ${ep.episodeTitle}`;
  const descriptionParts = [
    ep.network ? `Network: ${ep.network}` : null,
    ep.streamingServices ? `Streaming: ${ep.streamingServices}` : null,
    ep.runtime ? `Runtime: ${ep.runtime} min` : null,
  ].filter(Boolean);

  const url = `${window.location.origin}/shows/${ep.showId}/${ep.profileId}`;

  return buildVEvent({
    uid,
    summary,
    description: descriptionParts.join('\\n'),
    dtStart: formatIcsDate(ep.airDate),
    dtEnd: formatIcsDateExclusiveEnd(ep.airDate),
    url,
    now,
  });
}

function movieToVEvent(item: CalendarMovieItem, now: Date): string {
  const movie = item.data;
  const uid = `movie-${movie.id}-${movie.releaseDate}@${UID_DOMAIN}`;
  const summary = `${movie.title} (Movie Release)`;
  const descriptionParts = [
    movie.genres ? `Genres: ${movie.genres}` : null,
    movie.streamingServices ? `Streaming: ${movie.streamingServices}` : null,
    movie.runtime ? `Runtime: ${movie.runtime} min` : null,
  ].filter(Boolean);

  const url = `${window.location.origin}/movies/${movie.id}/${movie.profileId}`;

  return buildVEvent({
    uid,
    summary,
    description: descriptionParts.join('\\n'),
    dtStart: formatIcsDate(movie.releaseDate),
    dtEnd: formatIcsDateExclusiveEnd(movie.releaseDate),
    url,
    now,
  });
}

function buildVEvent(params: {
  uid: string;
  summary: string;
  description: string;
  dtStart: string;
  dtEnd: string;
  url: string;
  now: Date;
}): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${formatIcsDateStamp(params.now)}`,
    `DTSTART;VALUE=DATE:${params.dtStart}`,
    `DTEND;VALUE=DATE:${params.dtEnd}`,
    `SUMMARY:${escapeIcsText(params.summary)}`,
  ];
  if (params.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(params.description)}`);
  }
  if (params.url) {
    lines.push(`URL:${params.url}`);
  }
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

function itemToVEvent(item: CalendarItem, now: Date): string {
  return item.type === 'episode' ? episodeToVEvent(item, now) : movieToVEvent(item, now);
}

/** Generates an RFC5545 VCALENDAR document from the calendar's currently-loaded days. */
export function generateIcsCalendar(days: CalendarDay[], opts?: { now?: Date }): string {
  const now = opts?.now ?? new Date();
  const events = days.flatMap((day) => day.items.map((item) => itemToVEvent(item, now)));

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KeepWatching//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}
