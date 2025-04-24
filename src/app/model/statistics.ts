export interface ProfileStatistics {
  showStatistics: Statistics;
  movieStatistics: Statistics;
  episodeWatchProgress: EpisodeWatchProgress;
}

export interface AccountStatistics {
  profileCount: number;
  uniqueContent: UniqueContent;
  showStatistics: Statistics;
  movieStatistics: Statistics;
  episodeStatistics: EpisodeStatistics;
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

export interface EpisodeWatchProgress {
  totalEpisodes: number;
  watchedEpisodes: number;
  overallProgress: number;
  showsProgress: ShowProgress[];
}

export interface ShowProgress {
  showId: number;
  title: string;
  status: 'WATCHED' | 'WATCHING' | 'NOT_WATCHED' | 'UP_TO_DATE';
  totalEpisodes: number;
  watchedEpisodes: number;
  percentComplete: number;
}

export interface UniqueContent {
  showCount: number;
  movieCount: number;
}

export interface EpisodeStatistics {
  totalEpisodes: number;
  watchedEpisodes: number;
  watchProgress: number;
}
