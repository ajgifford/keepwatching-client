import { useEffect, useState } from 'react';

import { Box, Tab, Tabs } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchMilestoneStats,
  selectActiveProfile,
  selectActiveProfileError,
  selectActiveProfileLoading,
  selectMilestoneStats,
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
import StreamingServiceSection from '../common/media/streamingServiceSection';
import { MoviesSection } from '../common/movies/moviesSection';
import DashboardProfileCard from '../common/profile/dashboardProfileCard';
import { EpisodesSection } from '../common/shows/episodeSection';
import { KeepWatchingProfileComponent } from '../common/shows/keepWatchingProfileComponent';
import ProfileStatisticsComponent from '../common/statistics/profileStatisticsComponent';
import { TabPanel, a11yProps } from '../common/tabs/tabPanel';

const Home = () => {
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);
  const activeProfileLoading = useAppSelector(selectActiveProfileLoading);
  const activeProfileError = useAppSelector(selectActiveProfileError);
  const profile = useAppSelector(selectActiveProfile);
  const milestoneStats = useAppSelector(selectMilestoneStats);
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
    unaired: showUnaired,
  } = useAppSelector(selectShowWatchCounts);
  const {
    watched: movieWatched,
    notWatched: movieNotWatched,
    unaired: movieUnaired,
  } = useAppSelector(selectMovieWatchCounts);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNavigateToStats = () => {
    setTabValue(4); // Navigate to Statistics tab
  };

  useEffect(() => {
    if (profile) {
      dispatch(fetchMilestoneStats());
    }
  }, [dispatch, profile]);

  if (activeProfileLoading) {
    return <LoadingComponent />;
  }

  if (activeProfileError) {
    return <ErrorComponent error={activeProfileError} />;
  }

  if (!profile) {
    return <LoadingComponent />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DashboardProfileCard
        profile={profile}
        showWatched={showWatched}
        showUpToDate={showUpToDate}
        showWatching={showWatching}
        showNotWatched={showNotWatched}
        showUnaired={showUnaired}
        movieWatched={movieWatched}
        movieNotWatched={movieNotWatched}
        movieUnaired={movieUnaired}
        milestoneStats={milestoneStats}
        onNavigateToStats={handleNavigateToStats}
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
          <Tab label="By Service" {...a11yProps(3)} />
          <Tab label="Statistics" {...a11yProps(4)} />
        </Tabs>
      </Box>

      {/* Keep Watching Tab */}
      <TabPanel value={tabValue} index={0}>
        <KeepWatchingProfileComponent profileId={profile.id} />
      </TabPanel>

      {/* TV Shows Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          <EpisodesSection recentEpisodes={recentEpisodes} upcomingEpisodes={upcomingEpisodes} />
        </Box>
      </TabPanel>

      {/* Movies Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          <MoviesSection recentMovies={recentMovies} upcomingMovies={upcomingMovies} />
        </Box>
      </TabPanel>

      {/* By Service Tab */}
      <TabPanel value={tabValue} index={3}>
        <StreamingServiceSection />
      </TabPanel>

      {/* Statistics Tab */}
      <TabPanel value={tabValue} index={4}>
        <ProfileStatisticsComponent accountId={profile.accountId} profileId={profile.id} />
      </TabPanel>
    </Box>
  );
};

export default Home;
