import { WatchStatus } from './watchStatus';

export type Show = {
  show_id: number;
  tmdb_id: number;
  title: string;
  description: string;
  release_date?: string;
  genres: string;
  streaming_services: string;
  image: string;
  user_rating?: number | null;
  tv_parental_guidelines?: string;
  season_count?: number;
  episode_count?: number;
  watch_status: WatchStatus;
  profile_id: string;
  seasons?: Season[];
};

export type Season = {
  season_id: number;
  show_id: number;
  tmdb_id: number;
  name: string;
  overview: string;
  season_number: number;
  release_date: string;
  image: string;
  number_of_episodes: number;
  watch_status: WatchStatus;
  episodes: Episode[];
};

export type Episode = {
  episode_id: number;
  tmdb_id: number;
  season_id: number;
  show_id: number;
  episode_number: number;
  episode_type: string;
  title: string;
  overview: string;
  runtime: number;
  air_date: string;
  image: string;
  watch_status: WatchStatus;
};
