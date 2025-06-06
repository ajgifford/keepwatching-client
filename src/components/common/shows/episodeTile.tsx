import { Link } from 'react-router-dom';

import { Avatar, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { buildTMDBImagePath } from '../../utility/contentUtility';
import { RecentUpcomingEpisode } from '@ajgifford/keepwatching-types';

interface PropTypes {
  episode: RecentUpcomingEpisode;
}

export function EpisodeTile({ episode }: PropTypes) {
  const buildServiceDisplay = () => {
    if (episode.network) {
      return episode.network;
    }
    return episode.streamingServices;
  };

  return (
    <Box
      id={`episodeComponent_${episode.showName}_${episode.seasonNumber}_${episode.episodeNumber}`}
      key={episode.episodeTitle}
      sx={{ p: '10px', minWidth: '200px', textAlign: 'left' }}
    >
      <Typography variant="h5">
        <Link
          id={`episodeComponentShowLink_${episode.showId}_${episode.episodeTitle}`}
          style={{ textDecoration: 'none', color: 'black' }}
          to={`/shows/${episode.showId}/${episode.profileId}`}
          state={{ returnPath: `/home`, genre: '', streamingService: '', watchStatus: '' }}
        >
          {episode.showName}
        </Link>
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid>
          <Avatar
            alt={episode.episodeTitle}
            src={buildTMDBImagePath(episode.episodeStillImage)}
            variant="rounded"
            sx={{ width: 140, height: 96 }}
          />
        </Grid>
        <Grid>
          <Typography variant="body1">{episode.episodeTitle}</Typography>
          <Typography variant="body1">
            S{episode.seasonNumber} E{episode.episodeNumber}
          </Typography>
          <Typography variant="body1">{episode.airDate}</Typography>
          <Typography variant="body1">{buildServiceDisplay()}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
