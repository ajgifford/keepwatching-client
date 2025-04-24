import { Link } from 'react-router-dom';

import { Avatar, Box, Grid, Stack, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ContinueWatchingShow, ProfileEpisode } from '../../../app/model/shows';
import { ShowWatchStatus } from '../../../app/model/watchStatus';
import { selectNextUnwatchedEpisodes, updateNextEpisodeWatchStatus } from '../../../app/slices/activeProfileSlice';
import { buildTMDBImagePath } from '../../utility/contentUtility';
import { EpisodeCard } from './episodeCard';

const balanceShowsAcrossRows = (shows: ContinueWatchingShow[]): ContinueWatchingShow[] => {
  if (!shows || shows.length <= 2) return shows;

  const groupedByEpisodeCount: Record<number, ContinueWatchingShow[]> = {};

  shows.forEach((show) => {
    const count = show.episodes.length;
    if (!groupedByEpisodeCount[count]) {
      groupedByEpisodeCount[count] = [];
    }
    groupedByEpisodeCount[count].push(show);
  });

  const episodeCounts = Object.keys(groupedByEpisodeCount)
    .map(Number)
    .sort((a, b) => b - a);

  const result: ContinueWatchingShow[] = [];

  episodeCounts.forEach((count) => {
    result.push(...groupedByEpisodeCount[count]);
  });

  return result;
};

export const KeepWatchingProfileComponent = ({ profileId }: { profileId: string }) => {
  const nextUnwatchedEpisodes = useAppSelector(selectNextUnwatchedEpisodes);
  if (!nextUnwatchedEpisodes || nextUnwatchedEpisodes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No shows to keep watching
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add shows to your watchlist from the <Link to="/discover">Discover</Link> or <Link to="/search">Search</Link>{' '}
          pages
        </Typography>
      </Box>
    );
  }

  const sortedShows = balanceShowsAcrossRows(nextUnwatchedEpisodes);
  return (
    <Grid container spacing={2}>
      {sortedShows.map((show) => (
        <Grid item xs={12} sm={6} lg={4} key={`show-grid-${show.show_id}`}>
          <ShowWithEpisodes show={show} profileId={profileId} />
        </Grid>
      ))}
    </Grid>
  );
};

const ShowWithEpisodes = ({ show, profileId }: { show: ContinueWatchingShow; profileId: string }) => {
  const dispatch = useAppDispatch();

  const handleNextEpisodeWatchStatusChange = async (episode: ProfileEpisode, newStatus: ShowWatchStatus) => {
    await dispatch(
      updateNextEpisodeWatchStatus({
        profileId: episode.profile_id,
        showId: episode.show_id,
        seasonId: episode.season_id,
        episodeId: episode.episode_id,
        episodeStatus: newStatus,
      })
    );
  };

  return (
    <Box sx={{ mb: { xs: 4, md: 0 }, border: '1px solid', borderColor: 'grey.300', borderRadius: 2, padding: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar
          variant="rounded"
          src={buildTMDBImagePath(show.poster_image)}
          alt={show.show_title}
          sx={{ width: 40, height: 40 }}
        />
        <Typography
          variant="h6"
          component={Link}
          to={`/shows/${show.show_id}/${profileId}`}
          state={{ returnPath: `/home`, genre: '', streamingService: '', watchStatus: '' }}
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          {show.show_title}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {show.episodes.map((episode) => (
          <EpisodeCard
            key={`episode-${show.show_id}-${episode.season_number}-${episode.episode_number}`}
            episode={episode}
            onWatchStatusChange={handleNextEpisodeWatchStatusChange}
          />
        ))}
      </Stack>
    </Box>
  );
};
