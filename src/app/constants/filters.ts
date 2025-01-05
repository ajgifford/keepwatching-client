export const watchStatuses = [
  { value: '', display: '--All--' },
  { value: 'NOT_WATCHED', display: 'Not Watched' },
  { value: 'WATCHING', display: 'Watching' },
  { value: 'WATCHED', display: 'Watched' },
];

interface ContentItem {
  genres: string;
  streaming_services: string;
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
    const itemStreamingServices = item.streaming_services || '';
    const streamingServices = itemStreamingServices.split(',').map((streaming_service) => streaming_service.trim());
    streamingServices.forEach((streamingService) => {
      servicesSet.add(streamingService);
    });
  });

  return Array.from(servicesSet).sort();
}
