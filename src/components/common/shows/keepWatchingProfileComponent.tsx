import { Link } from 'react-router-dom';

import { Avatar, Box, Grid, Stack, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectNextUnwatchedEpisodes, updateNextEpisodeWatchStatus } from '../../../app/slices/activeProfileSlice';
import { buildTMDBImagePath } from '../../utility/contentUtility';
import { EpisodeCard } from './episodeCard';
import { BinaryWatchStatusType, KeepWatchingShow, NextEpisode } from '@ajgifford/keepwatching-types';

const balanceShowsAcrossRows = (shows: KeepWatchingShow[]): KeepWatchingShow[] => {
  if (!shows || shows.length <= 2) return shows;

  const groupedByEpisodeCount: Record<number, KeepWatchingShow[]> = {};

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

  const result: KeepWatchingShow[] = [];

  episodeCounts.forEach((count) => {
    result.push(...groupedByEpisodeCount[count]);
  });

  return result;
};

export const KeepWatchingProfileComponent = ({ profileId }: { profileId: number }) => {
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
        <Grid item xs={12} sm={6} lg={4} key={`show-grid-${show.showId}`}>
          <ShowWithEpisodes show={show} profileId={profileId} />
        </Grid>
      ))}
    </Grid>
  );
};

const ShowWithEpisodes = ({ show, profileId }: { show: KeepWatchingShow; profileId: number }) => {
  const dispatch = useAppDispatch();

  const handleNextEpisodeWatchStatusChange = async (episode: NextEpisode, newStatus: BinaryWatchStatusType) => {
    await dispatch(
      updateNextEpisodeWatchStatus({
        profileId: episode.profileId,
        showId: episode.showId,
        seasonId: episode.seasonId,
        episodeId: episode.episodeId,
        episodeStatus: newStatus,
      })
    );
  };

  return (
    <Box sx={{ mb: { xs: 4, md: 0 }, border: '1px solid', borderColor: 'grey.300', borderRadius: 2, padding: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar
          variant="rounded"
          src={buildTMDBImagePath(show.posterImage)}
          alt={show.showTitle}
          sx={{ width: 40, height: 40 }}
        />
        <Typography
          variant="h6"
          component={Link}
          to={`/shows/${show.showId}/${profileId}`}
          state={{ returnPath: `/home`, genre: '', streamingService: '', watchStatus: '' }}
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          {show.showTitle}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {show.episodes.map((episode) => (
          <EpisodeCard
            key={`episode-${show.showId}-${episode.seasonNumber}-${episode.episodeNumber}`}
            episode={episode}
            onWatchStatusChange={handleNextEpisodeWatchStatusChange}
          />
        ))}
      </Stack>
    </Box>
  );
};
