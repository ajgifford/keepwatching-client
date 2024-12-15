export type WatchedStatus = {
  id: string;
  user_id: string;
  content_type: 'show' | 'season' | 'episode' | 'movie';
  content_id: string;
  watched_at: string;
  status: 'watched' | 'watching' | 'not watched';
};

export type Favorite = {
  id: string;
  user_id: string;
  content_type: 'show' | 'movie';
  content_id: string;
};
