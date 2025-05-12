import { EpisodeToAir, Show } from '../../app/model/shows';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export function buildTMDBImagePath(
  path: string | undefined,
  size: string = 'w185',
  alt: string = 'No Image'
): string | undefined {
  if (path) {
    return `${IMAGE_BASE_URL}${size}${path}`;
  }
  return buildDefaultImagePath(alt);
}

export function buildDefaultImagePath(altImageName: string): string {
  const formattedAltImageName = replaceSpacesWithPlus(altImageName);
  return `https://placehold.co/300x200/gray/white?text=${formattedAltImageName}&font=roboto`;
}

function replaceSpacesWithPlus(input: string): string {
  return input.replace(/ /g, '+');
}

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

  // Helper function to filter out 'Unknown' from streaming services
  const filterUnknown = (services: string) => {
    return services
      .split(',')
      .map((service) => service.trim())
      .filter((service) => service.toLowerCase() !== 'unknown')
      .join(', ');
  };

  const network = show.network?.toLowerCase() === 'unknown' ? null : show.network;
  const filteredServices = show.streaming_services ? filterUnknown(show.streaming_services) : '';

  if (network) {
    if (filteredServices) {
      if (!filteredServices.includes(network)) {
        return (
          <>
            <b>Network: </b> {network} | <b>Streaming Service(s): </b> {filteredServices}
          </>
        );
      } else {
        return (
          <>
            <b>Streaming Service(s): </b> {filteredServices}
          </>
        );
      }
    } else {
      return (
        <>
          <b>Network: </b> {network}
        </>
      );
    }
  }

  if (filteredServices) {
    return (
      <>
        <b>Streaming Service(s): </b> {filteredServices}
      </>
    );
  }

  return <>No Streaming Service Information</>;
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
        <b>Last Episode: </b> {buildEpisodeLineDetails(show.last_episode)}
      </>
    );
  }
  return <>No Episode Data</>;
};

export const buildEpisodeLineDetails = (episode: EpisodeToAir) => {
  return (
    <>
      {`S${episode.season_number} E${episode.episode_number}`} - {episode.title} - {episode.air_date}
    </>
  );
};
