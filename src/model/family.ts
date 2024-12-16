export type Family = {
  id: string;
  name: string;
  image: string;
  profiles: Profile[];
  settings: Settings;
};

export type Profile = {
  id: string;
  name: string;
};

export type Settings = {
  streaming_services: StreamingService[];
};

export type StreamingService = {
  id: string;
  name: string;
  available: boolean;
};
