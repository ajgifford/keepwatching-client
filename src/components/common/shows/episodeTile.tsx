import { Link } from 'react-router-dom';

import { Avatar, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { ProfileEpisode } from '../../../app/model/shows';
import { buildTMDBImagePath } from '../../utility/contentUtility';

interface PropTypes {
  episode: ProfileEpisode;
}

export function EpisodeTile({ episode }: PropTypes) {
  const buildServiceDisplay = () => {
    if (episode.network) {
      return episode.network;
    }
    return episode.streaming_services;
  };

  return (
    <Box
      id={`episodeComponent_${episode.show_name}_${episode.season_number}_${episode.episode_number}`}
      key={episode.episode_title}
      sx={{ p: '10px', minWidth: '200px', textAlign: 'left' }}
    >
      <Typography variant="h5">
        <Link
          id={`episodeComponentShowLink_${episode.show_id}_${episode.episode_title}`}
          style={{ textDecoration: 'none', color: 'black' }}
          to={`/shows/${episode.show_id}/${episode.profile_id}`}
          state={{ returnPath: `/home`, genre: '', streamingService: '', watchStatus: '' }}
        >
          {episode.show_name}
        </Link>
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid>
          <Avatar
            alt={episode.episode_title}
            src={buildTMDBImagePath(episode.episode_still_image)}
            variant="rounded"
            sx={{ width: 140, height: 96 }}
          />
        </Grid>
        <Grid>
          <Typography variant="body1">{episode.episode_title}</Typography>
          <Typography variant="body1">
            S{episode.season_number} E{episode.episode_number}
          </Typography>
          <Typography variant="body1">{episode.air_date}</Typography>
          <Typography variant="body1">{buildServiceDisplay()}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
