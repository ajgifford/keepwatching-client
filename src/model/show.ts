export type Show = {
  id: string;
  title: string;
  description: string;
  release_date: string;
  genre: string;
  image: string;
  user_rating: number | null;
  tv_parental_guidelines: string;
  number_of_seasons: number;
  total_episodes: number;
  seasons?: Season[];
};

export type Season = {
  id: string;
  show_id: string;
  title: string;
  number_of_episodes: number;
  episodes?: Episode[];
};

export type Episode = {
  id: string;
  season_id: string;
  title: string;
  duration: number;
  episode_number: number;
};
