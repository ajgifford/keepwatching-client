import { useState } from 'react';

import { Box, Card, CardContent, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';

import { calculateRuntimeDisplay } from '../../../components/utility/contentUtility';
import { WatchStatusIcon } from '../../utility/watchStatusUtility';
import { NextEpisode, UserWatchStatus, WatchStatus } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath, parseLocalDate } from '@ajgifford/keepwatching-ui';

interface EpisodeCardProps {
  episode: NextEpisode;
  onWatchStatusChange: (episode: NextEpisode, newStatus: UserWatchStatus) => Promise<void>;
}

export const EpisodeCard = ({ episode, onWatchStatusChange }: EpisodeCardProps) => {
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleWatchStatusChange = async () => {
    setIsWatched(!isWatched);
    setIsLoading(true);
    try {
      await onWatchStatusChange(episode, WatchStatus.WATCHED);
    } finally {
      setIsLoading(false);
    }
  };

  const determineWatchStatus = () => {
    if (isWatched) {
      return WatchStatus.WATCHED;
    }
    const now = new Date();
    const airDate = parseLocalDate(episode.airDate);
    if (!episode.airDate || now < airDate) {
      return WatchStatus.UNAIRED;
    }
    return WatchStatus.NOT_WATCHED;
  };

  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={buildTMDBImagePath(episode.episodeStillImage, 'original', episode.episodeTitle)}
          alt={episode.episodeTitle}
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
            S{episode.seasonNumber} E{episode.episodeNumber}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            {episode.episodeTitle}
          </Typography>
          <Tooltip
            title={
              isWatched ? 'Mark Not Watched' : determineWatchStatus() === WatchStatus.UNAIRED ? '' : 'Mark Watched'
            }
          >
            <Box sx={{ position: 'relative' }}>
              <IconButton
                color={isWatched ? 'success' : 'default'}
                onClick={handleWatchStatusChange}
                size="small"
                disabled={isLoading || determineWatchStatus() === WatchStatus.UNAIRED}
              >
                <WatchStatusIcon status={determineWatchStatus()} />
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
          {episode.airDate}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {`${episode.network || episode.streamingServices} • ${calculateRuntimeDisplay(episode.runtime)}`}
        </Typography>
      </CardContent>
    </Card>
  );
};
