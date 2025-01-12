import { EpisodeToAir, Show } from '../../app/model/shows';
import { WatchStatus } from '../../app/model/watchStatus';

export function calculateRuntimeDisplay(runtime: number): string {
  if (!runtime) {
    return 'TBD';
  }
  const hours = Math.floor(runtime / 60);
  if (hours < 1) {
    return `${runtime} minutes`;
  } else if (hours > 1 && hours < 2) {
    const minutes = runtime - 60;
    return `${hours} hour, ${minutes} minutes`;
  } else {
    const minutes = runtime - 60 * hours;
    return `${hours} hours, ${minutes} minutes`;
  }
}

export function stripArticle(title: string): string {
  return title.replace(/^(a |an |the )/i, '').trim();
}

export function getWatchStatusDisplay(status: WatchStatus | undefined) {
  if (!status) return '';
  if (status === 'WATCHED') return 'Watched';
  if (status === 'WATCHING') return 'Watching';
  if (status === 'NOT_WATCHED') return 'Not Watched';
}

export const buildEpisodeAirDate = (airDate: string) => {
  if (airDate) {
    const airDateDate = new Date(airDate);
    const now = new Date();
    if (airDateDate < now) {
      return `Aired: ${airDate}`;
    }
    return `Airing: ${airDate}`;
  }
  return `Airing: TBD`;
};

export const buildSeasonAirDate = (airDate: string) => {
  if (airDate) {
    const airDateDate = new Date(airDate);
    const now = new Date();
    if (airDateDate < now) {
      return `First Aired: ${airDate}`;
    }
    return `Premiering On: ${airDate}`;
  }
  return `Premiering On: TBD`;
};

export const buildServicesLine = (show: Show | null) => {
  if (!show) {
    return <></>;
  }
  if (show.network && !show.streaming_services.includes(show.network)) {
    return (
      <>
        <b>Network: </b> {show.network} | <b>Streaming Service(s): </b> {show.streaming_services}
      </>
    );
  }
  return (
    <>
      <b>Streaming Service(s): </b> {show.streaming_services}
    </>
  );
};

export const buildEpisodeLine = (show: Show | null) => {
  if (show && show.last_episode) {
    if (show.next_episode) {
      return (
        <>
          <b>Last Episode: </b>
          {buildEpisodeLineDetails(show.last_episode)} | <b>Next Episode: </b>
          {buildEpisodeLineDetails(show.next_episode)}
        </>
      );
    }
    return (
      <>
        <b>Last Episode:</b> {buildEpisodeLineDetails(show.last_episode)}
      </>
    );
  }
  return <>No Episode Data</>;
};

const buildEpisodeLineDetails = (episode: EpisodeToAir) => {
  return (
    <>
      {episode.title} - {episode.air_date} - {`S${episode.season_number} E${episode.episode_number}`}
    </>
  );
};
