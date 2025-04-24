import { useState } from 'react';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import { Box, Card, CardContent, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';

import { ProfileEpisode } from '../../../app/model/shows';
import { ShowWatchStatus } from '../../../app/model/watchStatus';
import { buildTMDBImagePath } from '../../utility/contentUtility';

interface EpisodeCardProps {
  episode: ProfileEpisode;
  onWatchStatusChange: (episode: ProfileEpisode, newStatus: ShowWatchStatus) => Promise<void>;
}

export const EpisodeCard = ({ episode, onWatchStatusChange }: EpisodeCardProps) => {
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleWatchStatusChange = async () => {
    setIsWatched(!isWatched);
    setIsLoading(true);
    try {
      await onWatchStatusChange(episode, 'WATCHED');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={buildTMDBImagePath(episode.episode_still_image, 'original', episode.episode_title)}
          alt={episode.episode_title}
          sx={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 2,
            py: 0.5,
          }}
        >
          <Typography variant="body2" component="span">
            S{episode.season_number} E{episode.episode_number}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            {episode.episode_title}
          </Typography>
          <Tooltip title={isWatched ? 'Mark Not Watched' : 'Mark Watched'}>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                color={isWatched ? 'success' : 'default'}
                onClick={handleWatchStatusChange}
                size="small"
                disabled={isLoading}
              >
                {isWatched ? <WatchLaterIcon /> : <WatchLaterOutlinedIcon />}
              </IconButton>
              {isLoading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </Tooltip>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {episode.air_date}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {episode.network || episode.streaming_services}
        </Typography>
      </CardContent>
    </Card>
  );
};
