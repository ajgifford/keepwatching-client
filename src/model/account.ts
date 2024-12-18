export type Account = {
  id: string;
  name: string;
  email: string;
  image: string;
  profiles: Profile[];
} | null;

export type Profile = {
  id?: string;
  name: string;
};
