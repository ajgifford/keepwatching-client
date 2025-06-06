import React from 'react';

import UpdateIcon from '@mui/icons-material/Update';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';

import {
  FullWatchStatusType,
  ProfileSeason,
  ProfileShow,
  ProfileShowWithSeasons,
  WatchStatus,
  WatchStatusType,
} from '@ajgifford/keepwatching-types';

export type ContentType = 'show' | 'season' | 'episode';

export const WatchStatusIcon: React.FC<{
  status: WatchStatusType;
  fontSize?: 'small' | 'medium' | 'large' | 'inherit';
}> = ({ status, fontSize = 'medium' }) => {
  switch (status) {
    case 'WATCHED':
      return <WatchLaterIcon color="success" fontSize={fontSize} />;
    case 'WATCHING':
      return <WatchLaterTwoToneIcon color="success" fontSize={fontSize} />;
    case 'UP_TO_DATE':
      return <UpdateIcon color="success" fontSize={fontSize} />;
    case 'NOT_WATCHED':
    default:
      return <WatchLaterOutlinedIcon fontSize={fontSize} />;
  }
};

const isShowInProduction = (show: ProfileShow | null): boolean => {
  if (!show) return false;
  return show.status === 'Returning Series' || show.status === 'In Production';
};

export function getWatchStatusDisplay(status: WatchStatusType | undefined) {
  if (!status) return '';
  if (status === WatchStatus.WATCHED) return 'Watched';
  if (status === WatchStatus.UP_TO_DATE) return 'Up To Date';
  if (status === WatchStatus.WATCHING) return 'Watching';
  if (status === WatchStatus.NOT_WATCHED) return 'Not Watched';
}

export function determineNextShowWatchStatus(show: ProfileShow): FullWatchStatusType {
  const showInProduction = isShowInProduction(show);
  const currentStatus = show.watchStatus;

  if (showInProduction) {
    switch (currentStatus) {
      case 'NOT_WATCHED':
        return 'UP_TO_DATE';
      case 'WATCHING':
        return 'UP_TO_DATE';
      case 'UP_TO_DATE':
        return 'NOT_WATCHED';
      default:
        return 'NOT_WATCHED';
    }
  } else {
    return currentStatus === 'WATCHED' ? 'NOT_WATCHED' : 'WATCHED';
  }
}

export function determineNextSeasonWatchStatus(
  season: ProfileSeason,
  show: ProfileShowWithSeasons
): FullWatchStatusType {
  const isLatestSeason = season.seasonNumber === Math.max(...(show.seasons || []).map((s) => s.seasonNumber));
  const isInProduction = show.status === 'Returning Series' || show.status === 'In Production';
  const hasAllEpisodesAired = allEpisodesAired(season);
  const currentStatus = season.watchStatus;

  if (isLatestSeason && isInProduction) {
    switch (currentStatus) {
      case WatchStatus.NOT_WATCHED:
        return hasAllEpisodesAired ? WatchStatus.WATCHED : WatchStatus.UP_TO_DATE;
      case WatchStatus.WATCHING:
      case WatchStatus.UP_TO_DATE:
      case WatchStatus.WATCHED:
        return WatchStatus.NOT_WATCHED;
      default:
        return WatchStatus.NOT_WATCHED;
    }
  } else {
    return currentStatus === WatchStatus.WATCHED ? WatchStatus.NOT_WATCHED : WatchStatus.WATCHED;
  }
}

export function getShowWatchStatusTooltip(show: ProfileShow) {
  return getWatchStatusTooltip(determineNextShowWatchStatus(show));
}

export function getSeasonWatchStatusTooltip(season: ProfileSeason, show: ProfileShowWithSeasons) {
  return getWatchStatusTooltip(determineNextSeasonWatchStatus(season, show));
}

function getWatchStatusTooltip(status: WatchStatusType): string {
  return `Mark ${
    status === WatchStatus.NOT_WATCHED
      ? 'Not Watched'
      : status === WatchStatus.WATCHING
        ? 'Watching'
        : status === WatchStatus.UP_TO_DATE
          ? 'Up To Date'
          : 'Watched'
  }`;
}

export function canChangeWatchStatus(season: ProfileSeason, show: ProfileShowWithSeasons): boolean {
  const isLatestSeason = season.seasonNumber === Math.max(...(show.seasons || []).map((s) => s.seasonNumber));

  if (isLatestSeason) {
    if (season.episodes.length === 0) {
      return false;
    }
  }
  return true;
}

const allEpisodesAired = (season: ProfileSeason): boolean => {
  const now = new Date();
  return season.episodes.every((episode) => {
    if (!episode.airDate) return false;

    const airDate = new Date(episode.airDate);
    return airDate <= now;
  });
};
