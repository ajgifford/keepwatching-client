export interface Statistics {
  showStatistics: Statistics;
  movieStatistics: Statistics;
  progress: Progress;
}

export interface Statistics {
  total: number;
  watchStatusCounts: WatchStatusCounts;
  genreDistribution: Record<string, number>;
  serviceDistribution: Record<string, number>;
  watchProgress: number;
}

export interface WatchStatusCounts {
  watched?: number;
  watching?: number;
  notWatched?: number;
  [key: string]: number | undefined;
}

export interface Progress {
  totalEpisodes: number;
  watchedEpisodes: number;
  overallProgress: number;
  showsProgress: ShowProgress[];
}

export interface ShowProgress {
  showId: number;
  title: string;
  status: 'WATCHED' | 'WATCHING' | 'NOT_WATCHED';
  totalEpisodes: number;
  watchedEpisodes: number;
  percentComplete: number;
}
