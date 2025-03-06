import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Box, Card, CardContent, Chip, Divider, Grid, Tab, Tabs, Typography } from '@mui/material';

// import Grid from '@mui/material/Grid2';

import { useAppSelector } from '../../app/hooks';
import { ProfileEpisode } from '../../app/model/shows';
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
import { KeepWatchingContent } from '../common/keepWatchingComponent';
import { LoadingComponent } from '../common/loadingComponent';
import { MovieCard } from '../common/movieCard';
import { NextEpisodeCard } from '../common/nextEpisodeCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`home-tabpanel-${index}`}
      aria-labelledby={`home-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `home-tab-${index}`,
    'aria-controls': `home-tabpanel-${index}`,
  };
}

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

  function buildTitle(name: string) {
    return `${name}'s Dashboard`;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} sm={4} md={3} sx={{ textAlign: 'center' }}>
              <Box
                crossOrigin="anonymous"
                component="img"
                src={profile.image}
                alt={profile.name}
                sx={{
                  width: { xs: '50%', sm: '80%', md: '70%' },
                  maxWidth: 150,
                  height: 'auto',
                  borderRadius: 2,
                  mb: 1,
                }}
              />
            </Grid>
            <Grid xs={12} sm={8} md={9}>
              <Typography variant="h4" color="textPrimary" gutterBottom>
                {buildTitle(profile.name)}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Card variant="outlined" sx={{ minWidth: 110, flex: '1 1 auto', textAlign: 'center' }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="h6" color="primary">
                      {showNotWatched + showWatching}
                    </Typography>
                    <Typography variant="body2">Shows to Watch</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 110, flex: '1 1 auto', textAlign: 'center' }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="h6" color="primary">
                      {showWatched}
                    </Typography>
                    <Typography variant="body2">Shows Watched</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 110, flex: '1 1 auto', textAlign: 'center' }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="h6" color="secondary">
                      {movieNotWatched}
                    </Typography>
                    <Typography variant="body2">Movies to Watch</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 110, flex: '1 1 auto', textAlign: 'center' }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="h6" color="secondary">
                      {movieWatched}
                    </Typography>
                    <Typography variant="body2">Movies Watched</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
        </Tabs>
      </Box>

      {/* Keep Watching Tab */}
      <TabPanel value={tabValue} index={0}>
        <KeepWatchingContent profileId={profile.id} />
      </TabPanel>

      {/* TV Shows Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <Link style={{ textDecoration: 'none' }} to={`/shows?watchStatus=NOT_WATCHED`}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="info.main">
                          {showNotWatched}
                        </Typography>
                        <Typography variant="body1">To Watch</Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Link style={{ textDecoration: 'none' }} to={`/shows?watchStatus=WATCHING`}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', bgcolor: 'warning.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="warning.main">
                          {showWatching}
                        </Typography>
                        <Typography variant="body1">Watching</Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Link style={{ textDecoration: 'none' }} to={`/shows?watchStatus=WATCHED`}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', bgcolor: 'success.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="success.main">
                          {showWatched}
                        </Typography>
                        <Typography variant="body1">Watched</Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }}>
            <Chip
              label="Upcoming Episodes"
              component={Link}
              to="/shows?watchStatus=WATCHING"
              clickable
              color="primary"
            />
          </Divider>

          <Box sx={{ mb: 3 }}>
            {upcomingEpisodes.length > 0 ? (
              <Grid container spacing={2}>
                {upcomingEpisodes.map((episode: ProfileEpisode) => (
                  <Grid xs={12} md={4} key={`upcomingEpisodeInShowsTab_${episode.show_id}_${episode.episode_title}`}>
                    <NextEpisodeCard nextEpisode={episode} />
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

          <Box sx={{ mb: 3 }}>
            {recentEpisodes.length > 0 ? (
              <Grid container spacing={2}>
                {recentEpisodes.map((episode: ProfileEpisode) => (
                  <Grid xs={12} md={4} key={`recentEpisodeInShowsTab_${episode.show_id}_${episode.episode_title}`}>
                    <NextEpisodeCard nextEpisode={episode} />
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
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Link style={{ textDecoration: 'none' }} to={`/movies?watchStatus=NOT_WATCHED`}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', bgcolor: 'info.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="info.main">
                          {movieNotWatched}
                        </Typography>
                        <Typography variant="body1">To Watch</Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Link style={{ textDecoration: 'none' }} to={`/movies?watchStatus=WATCHED`}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', bgcolor: 'success.lighter' }}>
                      <CardContent>
                        <Typography variant="h4" color="success.main">
                          {movieWatched}
                        </Typography>
                        <Typography variant="body1">Watched</Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }}>
            <Chip label="Recent Releases" component={Link} to="/movies" clickable color="secondary" />
          </Divider>

          <Box sx={{ mb: 3 }}>
            {recentMovies.length > 0 ? (
              <Grid container spacing={2}>
                {recentMovies.map((movie) => (
                  <Grid xs={12} md={4} key={`recentMovie_${movie.movie_id}`}>
                    <MovieCard movie={movie} />
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

          <Box>
            {upcomingMovies.length > 0 ? (
              <Grid container spacing={2}>
                {upcomingMovies.map((movie) => (
                  <Grid xs={12} md={4} key={`upcomingMovie_${movie.movie_id}`}>
                    <MovieCard movie={movie} />
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
    </Box>
  );
};

export default Home;
