import { Box, Grid, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Episode, ProfileEpisode, Season } from '../../../app/model/shows';
import { ShowWatchStatus } from '../../../app/model/watchStatus';
import { selectShow, selectWatchedEpisodes, updateEpisodeWatchStatus } from '../../../app/slices/activeShowSlice';
import { EpisodeCard } from './episodeCard';

export const KeepWatchingShowComponent = ({ profileId }: { profileId: string }) => {
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const watchedEpisodes = useAppSelector(selectWatchedEpisodes);

  const handleEpisodeWatchStatusChange = async (episode: ProfileEpisode, newStatus: ShowWatchStatus) => {
    if (!show) return;

    const season = show.seasons?.find((s) => s.season_id === episode.season_id);
    if (!season) return;

    const episodeObj = season.episodes.find((e) => e.episode_id === episode.episode_id);
    if (!episodeObj) return;

    await dispatch(
      updateEpisodeWatchStatus({
        profileId,
        season,
        episode: episodeObj,
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

  const nextEpisodes: {
    profile_id: number;
    show_id: number;
    show_name: string;
    season_id: number;
    episode_id: number;
    network: string;
    streaming_services: string;
    episode_title: string;
    air_date: string;
    episode_number: number;
    season_number: number;
    episode_still_image: string;
  }[] = [];

  show.seasons.forEach((season: Season) => {
    const validEpisodes = season.episodes.filter(
      (episode) =>
        !watchedEpisodes[episode.episode_id] && (!episode.air_date || new Date(episode.air_date) <= new Date())
    );

    validEpisodes.forEach((episode: Episode) => {
      if (nextEpisodes.length < 6) {
        nextEpisodes.push({
          profile_id: Number(profileId),
          show_id: show.show_id,
          show_name: show.title,
          season_id: season.season_id,
          episode_id: episode.episode_id,
          network: show.network || '',
          streaming_services: show.streaming_services || '',
          episode_title: episode.title,
          air_date: episode.air_date,
          episode_number: episode.episode_number,
          season_number: season.season_number,
          episode_still_image: episode.still_image,
        });
      }
    });
  });

  nextEpisodes.sort((a, b) => {
    if (a.season_number !== b.season_number) {
      return a.season_number - b.season_number;
    }
    return a.episode_number - b.episode_number;
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
      <Typography variant="h5" sx={{ mb: 2 }}>
        Next Episodes to Watch
      </Typography>
      <Grid container spacing={2}>
        {nextEpisodes.map((episode) => (
          <Grid item xs={12} sm={6} md={4} key={`next-episode-${episode.episode_id}`}>
            <EpisodeCard
              key={`episode-${show.show_id}-${episode.season_number}-${episode.episode_number}`}
              episode={episode}
              onWatchStatusChange={handleEpisodeWatchStatusChange}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
