import React from 'react';

import UpdateIcon from '@mui/icons-material/Update';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';

import { Season, Show } from '../../app/model/shows';
import { ShowWatchStatus } from '../../app/model/watchStatus';

export type ContentType = 'show' | 'season' | 'episode';

export const WatchStatusIcon: React.FC<{
  status: ShowWatchStatus;
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

const isShowInProduction = (show: Show | null): boolean => {
  if (!show) return false;
  return show.status === 'Returning Series' || show.status === 'In Production';
};

export function getWatchStatusDisplay(status: ShowWatchStatus | undefined) {
  if (!status) return '';
  if (status === 'WATCHED') return 'Watched';
  if (status === 'UP_TO_DATE') return 'Up To Date';
  if (status === 'WATCHING') return 'Watching';
  if (status === 'NOT_WATCHED') return 'Not Watched';
}

export function determineNextShowWatchStatus(show: Show): ShowWatchStatus {
  const showInProduction = isShowInProduction(show);
  const currentStatus = show.watch_status;

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

export function determineNextSeasonWatchStatus(season: Season, show: Show): ShowWatchStatus {
  const isLatestSeason = season.season_number === Math.max(...(show.seasons || []).map((s) => s.season_number));
  const isInProduction = show.status === 'Returning Series' || show.status === 'In Production';
  const hasAllEpisodesAired = allEpisodesAired(season);
  const currentStatus = season.watch_status;

  if (isLatestSeason && isInProduction) {
    switch (currentStatus) {
      case 'NOT_WATCHED':
        return hasAllEpisodesAired ? 'WATCHED' : 'UP_TO_DATE';
      case 'WATCHING':
      case 'UP_TO_DATE':
      case 'WATCHED':
        return 'NOT_WATCHED';
      default:
        return 'NOT_WATCHED';
    }
  } else {
    return currentStatus === 'WATCHED' ? 'NOT_WATCHED' : 'WATCHED';
  }
}

export function getShowWatchStatusTooltip(show: Show) {
  return getWatchStatusTooltip(determineNextShowWatchStatus(show));
}

export function getSeasonWatchStatusTooltip(season: Season, show: Show) {
  return getWatchStatusTooltip(determineNextSeasonWatchStatus(season, show));
}

function getWatchStatusTooltip(status: ShowWatchStatus): string {
  return `Mark ${
    status === 'NOT_WATCHED'
      ? 'Not Watched'
      : status === 'WATCHING'
        ? 'Watching'
        : status === 'UP_TO_DATE'
          ? 'Up To Date'
          : 'Watched'
  }`;
}

const allEpisodesAired = (season: Season): boolean => {
  const now = new Date();
  return season.episodes.every((episode) => {
    if (!episode.air_date) return false;

    const airDate = new Date(episode.air_date);
    return airDate <= now;
  });
};
