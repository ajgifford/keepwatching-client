import { useState } from 'react';
import { Link } from 'react-router-dom';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ContinueWatchingShow, ProfileEpisode } from '../../app/model/shows';
import { selectNextUnwatchedEpisodes, updateNextEpisodeWatchStatus } from '../../app/slices/activeProfileSlice';
import { buildTMDBImagePath } from '../utility/contentUtility';

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

/**
 * Main component for the Keep Watching tab content
 * Displays shows in a 2x2 grid on large screens, 1x4 grid on small screens
 */
export const KeepWatchingContent = ({ profileId }: { profileId: string }) => {
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
        <Grid item xs={12} md={6} key={`show-grid-${show.show_id}`}>
          <ShowWithEpisodes show={show} profileId={profileId} />
        </Grid>
      ))}
    </Grid>
  );
};

const ShowWithEpisodes = ({ show, profileId }: { show: ContinueWatchingShow; profileId: string }) => {
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
          />
        ))}
      </Stack>
    </Box>
  );
};

const EpisodeCard = ({ episode }: { episode: ProfileEpisode }) => {
  const dispatch = useAppDispatch();
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleWatchStatusChange = async () => {
    setIsWatched(!isWatched);
    setIsLoading(true);
    await dispatch(
      updateNextEpisodeWatchStatus({
        profileId: episode.profile_id,
        showId: episode.show_id,
        seasonId: episode.season_id,
        episodeId: episode.episode_id,
        episodeStatus: 'WATCHED',
      }),
    );
    setIsLoading(false);
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
