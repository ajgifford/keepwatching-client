import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import { Box, Button, Tab, Tabs } from '@mui/material';

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
import { fetchCommunityRecommendations } from '../../app/slices/communityRecommendationsSlice';
import { fetchRatings, selectUnratedContent } from '../../app/slices/ratingsSlice';
import { fetchWatchlist } from '../../app/slices/watchlistSlice';
import StreamingServiceSection from '../common/media/streamingServiceSection';
import { MoviesSection } from '../common/movies/moviesSection';
import DashboardProfileCard from '../common/profile/dashboardProfileCard';
import { BulkRatingDialog } from '../common/ratings/bulkRatingDialog';
import { CommunityRecommendationsSection } from '../common/recommendations/communityRecommendationsSection';
import { EpisodesSection } from '../common/shows/episodeSection';
import { KeepWatchingProfileComponent } from '../common/shows/keepWatchingProfileComponent';
import ProfileStatisticsComponent from '../common/statistics/profileStatisticsComponent';
import { RecapBanner } from '../common/statistics/recap/recapBanner';
import { TabPanel, a11yProps } from '../common/tabs/tabPanel';
import { UpNextSection } from '../common/watchlist/upNextSection';
import { ErrorComponent, LoadingComponent } from '@ajgifford/keepwatching-ui';

const TABS = {
  KEEP_WATCHING: 0,
  UP_NEXT: 1,
  TV_SHOWS: 2,
  MOVIES: 3,
  BY_SERVICE: 4,
  COMMUNITY: 5,
  STATISTICS: 6,
} as const;

const Home = () => {
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [bulkRatingOpen, setBulkRatingOpen] = useState(false);
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
  const unratedContent = useAppSelector(selectUnratedContent);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNavigateToStats = () => {
    setTabValue(TABS.STATISTICS);
  };

  useEffect(() => {
    if (profile) {
      dispatch(fetchMilestoneStats());
      dispatch(fetchCommunityRecommendations({}));
      dispatch(fetchWatchlist(profile.id));
      dispatch(fetchRatings({ profileId: profile.id }));
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

      <RecapBanner
        accountId={profile.accountId}
        profileId={profile.id}
        profileName={profile.name}
        profileAccentColor={profile.accentColor}
      />

      {unratedContent.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="outlined" size="small" startIcon={<StarIcon />} onClick={() => setBulkRatingOpen(true)}>
            Rate Your Library ({unratedContent.length})
          </Button>
        </Box>
      )}

      <BulkRatingDialog profileId={profile.id} open={bulkRatingOpen} onClose={() => setBulkRatingOpen(false)} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="home content tabs"
        >
          <Tab label="Keep Watching" {...a11yProps(TABS.KEEP_WATCHING)} />
          <Tab label="Up Next" {...a11yProps(TABS.UP_NEXT)} />
          <Tab label="TV Shows" {...a11yProps(TABS.TV_SHOWS)} />
          <Tab label="Movies" {...a11yProps(TABS.MOVIES)} />
          <Tab label="By Service" {...a11yProps(TABS.BY_SERVICE)} />
          <Tab label="Community" {...a11yProps(TABS.COMMUNITY)} />
          <Tab label="Statistics" {...a11yProps(TABS.STATISTICS)} />
        </Tabs>
      </Box>

      {/* Keep Watching Tab */}
      <TabPanel value={tabValue} index={TABS.KEEP_WATCHING}>
        <KeepWatchingProfileComponent profileId={profile.id} />
      </TabPanel>

      {/* Up Next Tab */}
      <TabPanel value={tabValue} index={TABS.UP_NEXT}>
        <UpNextSection />
      </TabPanel>

      {/* TV Shows Tab */}
      <TabPanel value={tabValue} index={TABS.TV_SHOWS}>
        <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button component={Link} to="/calendar" size="small" variant="outlined" startIcon={<CalendarMonthIcon />}>
              View Calendar
            </Button>
          </Box>
          <EpisodesSection recentEpisodes={recentEpisodes} upcomingEpisodes={upcomingEpisodes} />
        </Box>
      </TabPanel>

      {/* Movies Tab */}
      <TabPanel value={tabValue} index={TABS.MOVIES}>
        <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button component={Link} to="/calendar" size="small" variant="outlined" startIcon={<CalendarMonthIcon />}>
              View Calendar
            </Button>
          </Box>
          <MoviesSection recentMovies={recentMovies} upcomingMovies={upcomingMovies} />
        </Box>
      </TabPanel>

      {/* By Service Tab */}
      <TabPanel value={tabValue} index={TABS.BY_SERVICE}>
        <StreamingServiceSection />
      </TabPanel>

      {/* Community Tab */}
      <TabPanel value={tabValue} index={TABS.COMMUNITY}>
        <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          <CommunityRecommendationsSection />
        </Box>
      </TabPanel>

      {/* Statistics Tab */}
      <TabPanel value={tabValue} index={TABS.STATISTICS}>
        <ProfileStatisticsComponent accountId={profile.accountId} profileId={profile.id} />
      </TabPanel>
    </Box>
  );
};

export default Home;
