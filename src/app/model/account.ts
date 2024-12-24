export interface Account {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface Profile {
  id: string;
  name: string;
  showsToWatch?: number;
  showsWatching?: number;
  showsWatched?: number;
}
