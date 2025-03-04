import { WatchStatus } from './watchStatus';

export type Show = {
  show_id: number;
  tmdb_id: number;
  title: string;
  description: string;
  release_date?: string;
  genres: string;
  streaming_services: string;
  network: string | null;
  status: string;
  type: string;
  content_rating: string;
  poster_image: string;
  backdrop_image: string;
  user_rating?: number | null;
  tv_parental_guidelines?: string;
  season_count?: number;
  episode_count?: number;
  watch_status: WatchStatus;
  profile_id: string;
  seasons?: Season[];
  last_episode: EpisodeToAir | null;
  next_episode: EpisodeToAir | null;
};

export type EpisodeToAir = {
  title: string;
  air_date: string;
  episode_number: number;
  season_number: number;
};

export type Season = {
  season_id: number;
  show_id: number;
  tmdb_id: number;
  name: string;
  overview: string;
  season_number: number;
  release_date: string;
  poster_image: string;
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
  still_image: string;
  watch_status: WatchStatus;
};

export type ContinueWatchingShow = {
  show_id: number;
  show_title: string;
  poster_image: string;
  episodes: ProfileEpisode[];
};

export type ProfileEpisode = {
  profile_id: number;
  show_id: number;
  show_name: string;
  network: string;
  streaming_services: string;
  episode_title: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  episode_still_image: string;
};
