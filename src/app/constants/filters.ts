import { WatchStatus } from '@ajgifford/keepwatching-types';

export const showWatchStatuses = [
  { value: '', display: '--All--' },
  { value: WatchStatus.UNAIRED, display: 'Unaired' },
  { value: WatchStatus.NOT_WATCHED, display: 'Not Watched' },
  { value: WatchStatus.WATCHING, display: 'Watching' },
  { value: WatchStatus.UP_TO_DATE, display: 'Up To Date' },
  { value: WatchStatus.WATCHED, display: 'Watched' },
];

export const movieWatchStatuses = [
  { value: '', display: '--All--' },
  { value: WatchStatus.UNAIRED, display: 'Unaired' },
  { value: WatchStatus.NOT_WATCHED, display: 'Not Watched' },
  { value: WatchStatus.WATCHED, display: 'Watched' },
];

interface ContentItem {
  genres: string;
  streamingServices: string;
}

export function generateGenreFilterValues(items: ContentItem[]): string[] {
  const genreSet: Set<string> = new Set();

  items.forEach((item) => {
    const itemGenres = item.genres || '';
    const genres = itemGenres.split(',').map((genre) => genre.trim());
    genres.forEach((genre) => {
      genreSet.add(genre);
    });
  });

  return Array.from(genreSet).sort();
}

export function generateStreamingServiceFilterValues(items: ContentItem[]): string[] {
  const servicesSet: Set<string> = new Set();

  items.forEach((item) => {
    const itemStreamingServices = item.streamingServices || '';
    const streamingServices = itemStreamingServices.split(',').map((streaming_service) => streaming_service.trim());
    streamingServices.forEach((streamingService) => {
      servicesSet.add(streamingService);
    });
  });

  return Array.from(servicesSet).sort();
}
