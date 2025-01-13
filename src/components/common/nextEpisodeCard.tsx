import { Link } from 'react-router-dom';

import { Avatar, Box, Divider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { NextWatchEpisode } from '../../app/model/shows';

interface PropTypes {
  nextEpisode: NextWatchEpisode;
}

export function NextEpisodeCard({ nextEpisode }: PropTypes) {
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
          id={`nextWatchShowLink_${nextEpisode.show_id}_${nextEpisode.episode_title}`}
          style={{ textDecoration: 'none', color: '#42a5f5' }}
          to={`/shows/${nextEpisode.show_id}/${nextEpisode.profile_id}`}
          state={{ returnPath: `/profile/${nextEpisode.profile_id}`, genre: '', streamingService: '', watchStatus: '' }}
        >
          {nextEpisode.show_name}
        </Link>
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid>
          <Avatar
            alt={nextEpisode.episode_title}
            src={nextEpisode.episode_image}
            variant="rounded"
            sx={{ width: 140, height: 96 }}
          />
        </Grid>
        <Grid>
          <Typography variant="body1">{nextEpisode.episode_title}</Typography>
          <Typography variant="body1">{nextEpisode.air_date}</Typography>
          <Typography variant="body1">{buildServiceDisplay()}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
