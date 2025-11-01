import { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import axiosInstance from '../../../app/api/axiosInstance';
import ActivityTimelineChart from './activityTimelineChart';
import AnniversaryCard from './anniversaryCard';
import BacklogAgingCard from './backlogAgingCard';
import BaseStatisticsDashboard from './baseStatisticsDashboard';
import BingeWatchingCard from './bingeWatchingCard';
import MilestonesCard from './milestonesCard';
import { SeasonalViewingCard } from './seasonalViewingCard';
import ShowProgressCard from './showProgressCard';
import { getProfileSummaryProps } from './statisticsUtils';
import { TimeToWatchCard } from './timeToWatchCard';
import WatchStreakCard from './watchStreakCard';
import WatchVelocityCard from './watchVelocityCard';
import {
  BingeWatchingStats,
  MilestoneStats,
  ProfileStatisticsResponse,
  SeasonalViewingStats,
  TimeToWatchStats,
  WatchStatus,
  WatchStreakStats,
  WatchingActivityTimeline,
  WatchingVelocityStats,
} from '@ajgifford/keepwatching-types';

interface EnhancedProfileStatisticsDashboardProps {
  profileId: number;
  accountId: number;
  statistics?: ProfileStatisticsResponse | null;
  isLoading?: boolean;
}

export default function EnhancedProfileStatisticsDashboard({
  profileId,
  accountId,
  statistics,
  isLoading = false,
}: EnhancedProfileStatisticsDashboardProps) {
  const [velocityData, setVelocityData] = useState<WatchingVelocityStats | null>(null);
  const [timelineData, setTimelineData] = useState<WatchingActivityTimeline | null>(null);
  const [bingeData, setBingeData] = useState<BingeWatchingStats | null>(null);
  const [streakData, setStreakData] = useState<WatchStreakStats | null>(null);
  const [timeToWatchData, setTimeToWatchData] = useState<TimeToWatchStats | null>(null);
  const [seasonalData, setSeasonalData] = useState<SeasonalViewingStats | null>(null);
  const [milestoneData, setMilestoneData] = useState<MilestoneStats | null>(null);
  const [isLoadingEnhancedStats, setIsLoadingEnhancedStats] = useState(false);

  // Fetch all enhanced statistics data
  useEffect(() => {
    const fetchAllEnhancedStats = async () => {
      if (!profileId || !accountId) return;

      setIsLoadingEnhancedStats(true);

      try {
        // Fetch all statistics in parallel
        const [velocityRes, timelineRes, bingeRes, streakRes, timeToWatchRes, seasonalRes, milestoneRes] =
          await Promise.allSettled([
            axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/velocity`, {
              params: { days: 30 },
            }),
            axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/activity/timeline`),
            axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/binge`),
            axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/streaks`),
            axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/time-to-watch`),
            axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/seasonal`),
            axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/milestones`),
          ]);

        // Set velocity data
        if (velocityRes.status === 'fulfilled') {
          setVelocityData(velocityRes.value.data.results);
        } else {
          console.error('Failed to fetch velocity data:', velocityRes.reason);
          setVelocityData(null);
        }

        // Set timeline data
        if (timelineRes.status === 'fulfilled') {
          setTimelineData(timelineRes.value.data.results);
        } else {
          console.error('Failed to fetch timeline data:', timelineRes.reason);
          setTimelineData(null);
        }

        // Set binge data
        if (bingeRes.status === 'fulfilled') {
          setBingeData(bingeRes.value.data.results);
        } else {
          console.error('Failed to fetch binge data:', bingeRes.reason);
          setBingeData(null);
        }

        // Set streak data
        if (streakRes.status === 'fulfilled') {
          setStreakData(streakRes.value.data.results);
        } else {
          console.error('Failed to fetch streak data:', streakRes.reason);
          setStreakData(null);
        }

        // Set time-to-watch data
        if (timeToWatchRes.status === 'fulfilled') {
          setTimeToWatchData(timeToWatchRes.value.data.results);
        } else {
          console.error('Failed to fetch time-to-watch data:', timeToWatchRes.reason);
          setTimeToWatchData(null);
        }

        // Set seasonal data
        if (seasonalRes.status === 'fulfilled') {
          setSeasonalData(seasonalRes.value.data.results);
        } else {
          console.error('Failed to fetch seasonal data:', seasonalRes.reason);
          setSeasonalData(null);
        }

        // Set milestone data
        if (milestoneRes.status === 'fulfilled') {
          setMilestoneData(milestoneRes.value.data.results);
        } else {
          console.error('Failed to fetch milestone data:', milestoneRes.reason);
          setMilestoneData(null);
        }
      } finally {
        setIsLoadingEnhancedStats(false);
      }
    };

    fetchAllEnhancedStats();
  }, [profileId, accountId]);

  const summaryCardProps = useMemo(() => {
    return getProfileSummaryProps(statistics);
  }, [statistics]);

  const contentSections = useMemo(() => {
    if (!statistics) return null;

    return (
      <>
        {/* Active Shows Progress */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ShowProgressCard
            title="Active Shows Progress"
            shows={statistics.episodeWatchProgress.showsProgress}
            filters={[WatchStatus.WATCHING, WatchStatus.UP_TO_DATE]}
            maxHeight={300}
            maxItems={10}
          />
        </Grid>

        {/* Milestones & Achievements Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MilestonesCard stats={milestoneData} isLoading={isLoadingEnhancedStats} />
        </Grid>

        {/* Anniversary Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <AnniversaryCard
            profileCreatedAt={milestoneData?.profileCreatedAt}
            firstEpisodeWatchedAt={milestoneData?.firstEpisodeWatchedAt}
            firstMovieWatchedAt={milestoneData?.firstMovieWatchedAt}
            totalEpisodesWatched={statistics.episodeWatchProgress.watchedEpisodes}
            totalMoviesWatched={statistics.movieStatistics.watchStatusCounts.watched}
          />
        </Grid>

        {/* Backlog Aging Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BacklogAgingCard stats={timeToWatchData} />
        </Grid>

        {/* Watching Velocity Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <WatchVelocityCard velocityData={velocityData} isLoading={isLoadingEnhancedStats} />
        </Grid>

        {/* Activity Timeline Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ActivityTimelineChart timeline={timelineData} isLoading={isLoadingEnhancedStats} />
        </Grid>

        {/* Binge-Watching Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BingeWatchingCard bingeData={bingeData} isLoading={isLoadingEnhancedStats} />
        </Grid>

        {/* Watch Streak Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <WatchStreakCard streakData={streakData} isLoading={isLoadingEnhancedStats} />
        </Grid>

        {/* Time to Watch Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          {isLoadingEnhancedStats ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TimeToWatchCard stats={timeToWatchData} />
          )}
        </Grid>

        {/* Seasonal Viewing Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          {isLoadingEnhancedStats ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <SeasonalViewingCard stats={seasonalData} />
          )}
        </Grid>
      </>
    );
  }, [
    statistics,
    velocityData,
    timelineData,
    bingeData,
    streakData,
    timeToWatchData,
    seasonalData,
    milestoneData,
    isLoadingEnhancedStats,
  ]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Enhanced Viewing Statistics
        </Typography>
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No statistics available
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <BaseStatisticsDashboard
      statistics={statistics}
      isLoading={isLoading}
      dashboardTitle="Viewing Statistics"
      summaryCardProps={summaryCardProps}
      contentSections={contentSections}
    />
  );
}
