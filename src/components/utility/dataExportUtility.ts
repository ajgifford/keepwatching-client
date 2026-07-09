import axiosInstance from '../../app/api/axiosInstance';
import {
  ContentRating,
  Profile,
  ProfileContentResponse,
  ProfileMovie,
  ProfileShow,
  RatingsResponse,
  WatchHistoryItem,
  WatchHistoryResponse,
  WatchlistItem,
  WatchlistResponse,
} from '@ajgifford/keepwatching-types';
import { AxiosResponse } from 'axios';

const WATCH_HISTORY_PAGE_SIZE = 100;

export interface ProfileDataExport {
  exportedAt: string;
  profile: { id: number; name: string };
  favorites: { shows: ProfileShow[]; movies: ProfileMovie[] };
  ratings: ContentRating[];
  watchlist: WatchlistItem[];
  watchHistory: WatchHistoryItem[];
}

async function fetchFavorites(
  accountId: number,
  profileId: number
): Promise<{ shows: ProfileShow[]; movies: ProfileMovie[] }> {
  const response: AxiosResponse<ProfileContentResponse> = await axiosInstance.get(
    `/accounts/${accountId}/profiles/${profileId}`
  );
  const { shows, movies } = response.data.profileWithContent;
  return { shows, movies };
}

async function fetchRatingsForExport(accountId: number, profileId: number): Promise<ContentRating[]> {
  const response: AxiosResponse<RatingsResponse> = await axiosInstance.get(
    `/accounts/${accountId}/profiles/${profileId}/ratings`
  );
  return response.data.ratings;
}

async function fetchWatchlistForExport(accountId: number, profileId: number): Promise<WatchlistItem[]> {
  const response: AxiosResponse<WatchlistResponse> = await axiosInstance.get(
    `/accounts/${accountId}/profiles/${profileId}/watchlist`
  );
  return response.data.watchlist;
}

export async function fetchAllWatchHistory(accountId: number, profileId: number): Promise<WatchHistoryItem[]> {
  const firstPage: AxiosResponse<WatchHistoryResponse> = await axiosInstance.get(
    `/accounts/${accountId}/profiles/${profileId}/watchHistory`,
    { params: { page: 1, pageSize: WATCH_HISTORY_PAGE_SIZE, contentType: 'all', sortOrder: 'desc' } }
  );

  const items = [...firstPage.data.items];
  const { totalCount } = firstPage.data;

  let page = 2;
  while (items.length < totalCount) {
    const response: AxiosResponse<WatchHistoryResponse> = await axiosInstance.get(
      `/accounts/${accountId}/profiles/${profileId}/watchHistory`,
      { params: { page, pageSize: WATCH_HISTORY_PAGE_SIZE, contentType: 'all', sortOrder: 'desc' } }
    );
    items.push(...response.data.items);
    page += 1;
  }

  return items;
}

/** Assembles a single profile's ratings, watch history, watchlist, and favorites into one exportable object. */
export async function buildProfileDataExport(accountId: number, profile: Profile): Promise<ProfileDataExport> {
  const [favorites, ratings, watchlist, watchHistory] = await Promise.all([
    fetchFavorites(accountId, profile.id),
    fetchRatingsForExport(accountId, profile.id),
    fetchWatchlistForExport(accountId, profile.id),
    fetchAllWatchHistory(accountId, profile.id),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: { id: profile.id, name: profile.name },
    favorites,
    ratings,
    watchlist,
    watchHistory,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Generates a date-stamped filename for a profile's data export, e.g. `keepwatching-data-john-2026-07-09.json`. */
export function profileDataExportFilename(profileName: string, now: Date = new Date()): string {
  const dateStamp = now.toISOString().split('T')[0];
  return `keepwatching-data-${slugify(profileName)}-${dateStamp}.json`;
}
