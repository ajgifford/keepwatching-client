import {
  ProfileEpisode,
  ProfileSeason,
  ProfileShow,
  UserWatchStatus,
  WatchStatus,
} from '@ajgifford/keepwatching-types';
import { parseLocalDate } from '@ajgifford/keepwatching-ui';

export function determineNextSeasonWatchStatus(season: ProfileSeason): UserWatchStatus {
  switch (season.watchStatus) {
    case WatchStatus.NOT_WATCHED:
    case WatchStatus.WATCHING:
      return WatchStatus.WATCHED;
    case WatchStatus.SKIPPED:
    case WatchStatus.UP_TO_DATE:
    case WatchStatus.WATCHED:
    default:
      return WatchStatus.NOT_WATCHED;
  }
}

export function determineNextShowWatchStatus(show: ProfileShow): UserWatchStatus {
  switch (show.watchStatus) {
    case WatchStatus.NOT_WATCHED:
    case WatchStatus.WATCHING:
      return WatchStatus.WATCHED;
    case WatchStatus.UP_TO_DATE:
    case WatchStatus.WATCHED:
    default:
      return WatchStatus.NOT_WATCHED;
  }
}

export function determineNextWatchStatus(currentStatus: WatchStatus): UserWatchStatus {
  switch (currentStatus) {
    case WatchStatus.NOT_WATCHED:
    case WatchStatus.WATCHING:
      return WatchStatus.WATCHED;
    case WatchStatus.UP_TO_DATE:
    case WatchStatus.WATCHED:
    default:
      return WatchStatus.NOT_WATCHED;
  }
}

/** Helper function that will return the action that will be taken for a given watch status */
export function getWatchStatusAction(currentStatus: WatchStatus): string {
  if (currentStatus === WatchStatus.SKIPPED) {
    return 'Mark Not Watched';
  }
  const nextStatus = determineNextWatchStatus(currentStatus);
  if (nextStatus === WatchStatus.NOT_WATCHED) {
    return 'Mark Not Watched';
  }
  return 'Mark Watched';
}

export function canChangeShowWatchStatus(show: ProfileShow): boolean {
  const now = new Date();
  return show.watchStatus !== WatchStatus.UNAIRED || parseLocalDate(show.releaseDate) < now;
}

export function canChangeSeasonWatchStatus(season: ProfileSeason): boolean {
  const now = new Date();
  return season.watchStatus !== WatchStatus.UNAIRED || parseLocalDate(season.releaseDate) < now;
}

export function canChangeEpisodeWatchStatus(episode: ProfileEpisode) {
  const now = new Date();
  const isUnairedStatus = episode.watchStatus === WatchStatus.UNAIRED;
  const airDateInPast = episode.airDate && parseLocalDate(episode.airDate) < now;
  return !isUnairedStatus || airDateInPast;
}
