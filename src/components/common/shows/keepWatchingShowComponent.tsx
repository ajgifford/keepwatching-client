import { Box, Grid, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectShow, selectWatchedEpisodes, updateEpisodeWatchStatus } from '../../../app/slices/activeShowSlice';
import { EpisodeCard } from './episodeCard';
import { NextEpisode, ProfileEpisode, ProfileSeason, UserWatchStatus } from '@ajgifford/keepwatching-types';

export const KeepWatchingShowComponent = ({ profileId }: { profileId: number }) => {
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const watchedEpisodes = useAppSelector(selectWatchedEpisodes);

  const handleEpisodeWatchStatusChange = async (episode: NextEpisode, newStatus: UserWatchStatus) => {
    if (!show) return;

    await dispatch(
      updateEpisodeWatchStatus({
        profileId,
        episodeId: episode.episodeId,
        episodeStatus: newStatus,
      })
    );
  };

  if (!show || !show.seasons) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No episodes available to watch
        </Typography>
      </Box>
    );
  }

  const nextEpisodes: NextEpisode[] = [];

  show.seasons.forEach((season: ProfileSeason) => {
    const validEpisodes = season.episodes.filter(
      (episode) => !watchedEpisodes[episode.id] && (!episode.airDate || new Date(episode.airDate) <= new Date())
    );

    validEpisodes.forEach((episode: ProfileEpisode) => {
      if (nextEpisodes.length < 6) {
        nextEpisodes.push({
          profileId,
          showId: show.id,
          showName: show.title,
          seasonId: season.id,
          episodeId: episode.id,
          network: show.network || '',
          streamingServices: show.streamingServices || '',
          episodeTitle: episode.title,
          airDate: episode.airDate,
          episodeNumber: episode.episodeNumber,
          seasonNumber: season.seasonNumber,
          overview: episode.overview,
          posterImage: show.posterImage,
          episodeStillImage: episode.stillImage,
        });
      }
    });
  });

  nextEpisodes.sort((a, b) => {
    if (a.seasonNumber !== b.seasonNumber) {
      return a.seasonNumber - b.seasonNumber;
    }
    return a.episodeNumber - b.episodeNumber;
  });

  if (nextEpisodes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {`You've watched all available episodes!`}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Check back later for new episodes
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {nextEpisodes.map((episode) => (
          <Grid item xs={12} sm={6} md={4} key={`next-episode-${episode.episodeId}`}>
            <EpisodeCard
              key={`episode-${show.id}-${episode.seasonNumber}-${episode.episodeNumber}`}
              episode={episode}
              onWatchStatusChange={handleEpisodeWatchStatusChange}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
