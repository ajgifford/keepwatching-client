import { MovieWatchStatus } from './watchStatus';

export type Movie = {
  movie_id: number;
  tmdb_id: number;
  title: string;
  description: string;
  release_date: string;
  genres: string;
  runtime: number;
  poster_image: string;
  backdrop_image: string;
  user_rating: number | null;
  mpa_rating: string;
  streaming_services: string;
  watch_status: MovieWatchStatus;
  profile_id: string;
};

export type MovieIds = {
  movie_id: string;
};
