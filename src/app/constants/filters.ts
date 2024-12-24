export const watchStatuses = [
  { value: '', display: '--All--' },
  { value: 'Not Watched', display: 'Not Watched' },
  { value: 'Watching', display: 'Watching' },
  { value: 'Watched', display: 'Watched' },
];

const genres = [
  { value: '', display: '--All--' },
  { value: 'Sci-Fi', display: 'Sci-Fi' },
  { value: 'Action', display: 'Action' },
  { value: 'Comedy', display: 'Comedy' },
  { value: 'Drama', display: 'Drama' },
];

const streamingServices = [
  { value: '', display: '--All--' },
  { value: 'Max', display: 'Max' },
  { value: 'Netflix', display: 'Netflix' },
  { value: 'Disney+', display: 'Disney+' },
  { value: 'Amazon Prime', display: 'Amazon Prime' },
  { value: 'Hulu', display: 'Hulu' },
  { value: 'Peacock', display: 'Peacock' },
  { value: 'Paramount+', display: 'Paramount+' },
  { value: 'Apple TV', display: 'Apple TV' },
];

export const sortedStreamingServices = streamingServices.sort((a, b) => (a.display < b.display ? -1 : 1));
export const sortedGenres = genres.sort((a, b) => (a.display < b.display ? -1 : 1));
