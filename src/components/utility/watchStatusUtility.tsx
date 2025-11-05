import React from 'react';

import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import UpdateIcon from '@mui/icons-material/Update';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';

import {
  ProfileEpisode,
  ProfileSeason,
  ProfileShow,
  UserWatchStatus,
  WatchStatus,
} from '@ajgifford/keepwatching-types';

export const WatchStatusIcon: React.FC<{
  status: WatchStatus;
  fontSize?: 'small' | 'medium' | 'large' | 'inherit';
}> = ({ status, fontSize = 'medium' }) => {
  switch (status) {
    case WatchStatus.WATCHED:
      return <WatchLaterIcon color="success" fontSize={fontSize} />;
    case WatchStatus.WATCHING:
      return <WatchLaterTwoToneIcon color="success" fontSize={fontSize} />;
    case WatchStatus.UP_TO_DATE:
      return <UpdateIcon color="success" fontSize={fontSize} />;
    case WatchStatus.UNAIRED:
      return <PendingOutlinedIcon fontSize={fontSize} />;
    case WatchStatus.NOT_WATCHED:
    default:
      return <WatchLaterOutlinedIcon fontSize={fontSize} />;
  }
};

export function determineNextSeasonWatchStatus(season: ProfileSeason): UserWatchStatus {
  switch (season.watchStatus) {
    case WatchStatus.NOT_WATCHED:
    case WatchStatus.WATCHING:
      return WatchStatus.WATCHED;
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
  const nextStatus = determineNextWatchStatus(currentStatus);
  if (nextStatus === WatchStatus.NOT_WATCHED) {
    return 'Mark Not Watched';
  }
  return 'Mark Watched';
}

export function canChangeShowWatchStatus(show: ProfileShow): boolean {
  const now = new Date();
  return show.watchStatus !== WatchStatus.UNAIRED || new Date(show.releaseDate) < now;
}

export function canChangeSeasonWatchStatus(season: ProfileSeason): boolean {
  const now = new Date();
  return season.watchStatus !== WatchStatus.UNAIRED || new Date(season.releaseDate) < now;
}

export function canChangeEpisodeWatchStatus(episode: ProfileEpisode) {
  const now = new Date();
  const isUnairedStatus = episode.watchStatus === WatchStatus.UNAIRED;
  const airDateInPast = episode.airDate && new Date(episode.airDate) < now;
  return !isUnairedStatus || airDateInPast;
}
