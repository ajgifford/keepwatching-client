export type SearchedShow = {
  id: number;
  title: string;
  genres: string[];
  premiered: string;
  summary: string;
  image: string;
  streamingService: string;
  rating: number;
};

export function convertToSearchShow(data: any[]): SearchedShow[] {
  return data.map((item) => {
    const show = item.show;
    return {
      id: show.id,
      title: show.name,
      genres: show.genres || [],
      premiered: show.premiered || '',
      summary: show.summary ? show.summary.replace(/<\/?[^>]+(>|$)/g, '') : '',
      image: show.image?.medium || '',
      streamingService: show.webChannel ? show.webChannel.name : show.network?.name,
      rating: show.rating?.average || 0,
    };
  });
}

export type ShowWithSeasons = {
  id: string;
  title: string;
  description: string;
  release_date?: string;
  genres: string[];
  streaming_service: string;
  image: string;
  user_rating?: number | null;
  tv_parental_guidelines?: string;
  number_of_seasons?: number;
  total_episodes?: number;
  watched: 'Watched' | 'Watching' | 'Not Watched';
  seasons: Season[];
  profiles: string[];
};

export type ShowWithProfile = {
  id: string;
  title: string;
  description: string;
  release_date?: string;
  genres: string[];
  streaming_service: string;
  image: string;
  user_rating?: number | null;
  tv_parental_guidelines?: string;
  number_of_seasons?: number;
  total_episodes?: number;
  profile: WatchProfile;
};

export type WatchProfile = {
  id: string;
  name: string;
  watched: 'Watched' | 'Watching' | 'Not Watched';
};

export type Season = {
  id: string;
  show_id: string;
  title: string;
  image: string;
  release_date: string;
  number_of_episodes: number;
  episodes: Episode[];
};

export type Episode = {
  id: string;
  season_id: string;
  title: string;
  summary: string;
  duration: number;
  episode_number: number;
  release_date: string;
  image: string;
};
