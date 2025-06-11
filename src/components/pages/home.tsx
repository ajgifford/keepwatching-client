import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Box, Chip, Divider, Grid, Tab, Tabs, Typography } from '@mui/material';

import { useAppSelector } from '../../app/hooks';
import {
  selectActiveProfile,
  selectActiveProfileError,
  selectActiveProfileLoading,
  selectMovieWatchCounts,
  selectMoviesByIds,
  selectRecentEpisodes,
  selectRecentMovies,
  selectShowWatchCounts,
  selectUpcomingEpisodes,
  selectUpcomingMovies,
} from '../../app/slices/activeProfileSlice';
import { ErrorComponent } from '../common/errorComponent';
import { LoadingComponent } from '../common/loadingComponent';
import { MovieTile } from '../common/movies/movieTile';
import GradientProfileCard from '../common/profile/gradientProfileCard';
import { EpisodeTile } from '../common/shows/episodeTile';
import { KeepWatchingProfileComponent } from '../common/shows/keepWatchingProfileComponent';
import ProfileStatisticsComponent from '../common/statistics/profileStatisticsComponent';
import { TabPanel, a11yProps } from '../common/tabs/tabPanel';
import { RecentUpcomingEpisode } from '@ajgifford/keepwatching-types';

const Home = () => {
  const [tabValue, setTabValue] = useState(0);
  const activeProfileLoading = useAppSelector(selectActiveProfileLoading);
  const activeProfileError = useAppSelector(selectActiveProfileError);
  const profile = useAppSelector(selectActiveProfile)!;
  const upcomingEpisodes = useAppSelector(selectUpcomingEpisodes);
  const recentEpisodes = useAppSelector(selectRecentEpisodes);
  const recentMovieIds = useAppSelector(selectRecentMovies);
  const recentMovies = useAppSelector((state) => selectMoviesByIds(state, recentMovieIds));
  const upcomingMovieIds = useAppSelector(selectUpcomingMovies);
  const upcomingMovies = useAppSelector((state) => selectMoviesByIds(state, upcomingMovieIds));
  const {
    watched: showWatched,
    upToDate: showUpToDate,
    watching: showWatching,
    notWatched: showNotWatched,
  } = useAppSelector(selectShowWatchCounts);
  const { watched: movieWatched, notWatched: movieNotWatched } = useAppSelector(selectMovieWatchCounts);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (activeProfileLoading) {
    return <LoadingComponent />;
  }

  if (activeProfileError) {
    return <ErrorComponent error={activeProfileError} />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <GradientProfileCard
        profile={profile}
        showWatched={showWatched}
        showUpToDate={showUpToDate}
        showWatching={showWatching}
        showNotWatched={showNotWatched}
        movieWatched={movieWatched}
        movieNotWatched={movieNotWatched}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="home content tabs"
        >
          <Tab label="Keep Watching" {...a11yProps(0)} />
          <Tab label="TV Shows" {...a11yProps(1)} />
          <Tab label="Movies" {...a11yProps(2)} />
          <Tab label="Statistics" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {/* Keep Watching Tab */}
      <TabPanel value={tabValue} index={0}>
        <KeepWatchingProfileComponent profileId={profile.id} />
      </TabPanel>

      {/* TV Shows Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          {/* Alternative smaller stats cards for the shows tab if you want to keep them */}

          <Divider sx={{ my: 2 }}>
            <Chip
              label="Upcoming Episodes"
              component={Link}
              to="/shows?watchStatus=WATCHING"
              clickable
              color="primary"
            />
          </Divider>

          <Box sx={{ mb: 3, px: { xs: 1, sm: 0 } }}>
            {upcomingEpisodes && upcomingEpisodes.length > 0 ? (
              <Grid container spacing={2}>
                {upcomingEpisodes.map((episode: RecentUpcomingEpisode) => (
                  <Grid item xs={12} md={4} key={`upcomingEpisodeInShowsTab_${episode.showId}_${episode.episodeTitle}`}>
                    <EpisodeTile episode={episode} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                No upcoming episodes
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }}>
            <Chip label="Recent Episodes" component={Link} to="/shows?watchStatus=WATCHING" clickable color="primary" />
          </Divider>

          <Box sx={{ mb: 3, px: { xs: 1, sm: 0 } }}>
            {recentEpisodes && recentEpisodes.length > 0 ? (
              <Grid container spacing={2}>
                {recentEpisodes.map((episode: RecentUpcomingEpisode) => (
                  <Grid item xs={12} md={4} key={`recentEpisodeInShowsTab_${episode.showId}_${episode.episodeTitle}`}>
                    <EpisodeTile episode={episode} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                No recent episodes
              </Typography>
            )}
          </Box>
        </Box>
      </TabPanel>

      {/* Movies Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          <Divider sx={{ my: 2 }}>
            <Chip label="Recent Releases" component={Link} to="/movies" clickable color="secondary" />
          </Divider>

          <Box sx={{ mb: 3, px: { xs: 1, sm: 0 } }}>
            {recentMovies.length > 0 ? (
              <Grid container spacing={2}>
                {recentMovies.map((movie) => (
                  <Grid item xs={12} md={4} key={`recentMovie_${movie.id}`}>
                    <MovieTile movie={movie} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                No recent movie releases
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }}>
            <Chip label="Upcoming Releases" component={Link} to="/movies" clickable color="secondary" />
          </Divider>

          <Box sx={{ px: { xs: 1, sm: 0 } }}>
            {upcomingMovies.length > 0 ? (
              <Grid container spacing={2}>
                {upcomingMovies.map((movie) => (
                  <Grid item xs={12} md={4} key={`upcomingMovie_${movie.id}`}>
                    <MovieTile movie={movie} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                No upcoming movie releases
              </Typography>
            )}
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ProfileStatisticsComponent accountId={profile.accountId} profileId={profile.id} />
      </TabPanel>
    </Box>
  );
};

export default Home;
