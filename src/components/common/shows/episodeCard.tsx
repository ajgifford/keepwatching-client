import { Link } from 'react-router-dom';

import { Avatar, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { ProfileEpisode } from '../../../app/model/shows';
import { buildTMDBImagePath } from '../../utility/contentUtility';

interface PropTypes {
  nextEpisode: ProfileEpisode;
}

export function EpisodeCard({ nextEpisode }: PropTypes) {
  const buildServiceDisplay = () => {
    if (nextEpisode.network) {
      return nextEpisode.network;
    }
    return nextEpisode.streaming_services;
  };

  return (
    <Box
      id={`nextEpisodeCard_${nextEpisode.show_name}_${nextEpisode.season_number}_${nextEpisode.episode_number}`}
      key={nextEpisode.episode_title}
      sx={{ p: '10px', minWidth: '200px', textAlign: 'left' }}
    >
      <Typography variant="h5">
        <Link
          id={`nextEpisodeShowLink_${nextEpisode.show_id}_${nextEpisode.episode_title}`}
          style={{ textDecoration: 'none', color: 'black' }}
          to={`/shows/${nextEpisode.show_id}/${nextEpisode.profile_id}`}
          state={{ returnPath: `/home`, genre: '', streamingService: '', watchStatus: '' }}
        >
          {nextEpisode.show_name}
        </Link>
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid>
          <Avatar
            alt={nextEpisode.episode_title}
            src={buildTMDBImagePath(nextEpisode.episode_still_image)}
            variant="rounded"
            sx={{ width: 140, height: 96 }}
          />
        </Grid>
        <Grid>
          <Typography variant="body1">{nextEpisode.episode_title}</Typography>
          <Typography variant="body1">
            S{nextEpisode.season_number} E{nextEpisode.episode_number}
          </Typography>
          <Typography variant="body1">{nextEpisode.air_date}</Typography>
          <Typography variant="body1">{buildServiceDisplay()}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
