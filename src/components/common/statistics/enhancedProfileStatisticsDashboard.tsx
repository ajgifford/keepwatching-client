import { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import axiosInstance from '../../../app/api/axiosInstance';
import ActivityTimelineChart from './activityTimelineChart';
import BaseStatisticsDashboard from './baseStatisticsDashboard';
import BingeWatchingCard from './bingeWatchingCard';
import ShowProgressCard from './showProgressCard';
import { getProfileSummaryProps } from './statisticsUtils';
import WatchStreakCard from './watchStreakCard';
import WatchVelocityCard from './watchVelocityCard';
import {
  BingeWatchingStats,
  ProfileStatisticsResponse,
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
  const [isLoadingVelocity, setIsLoadingVelocity] = useState(false);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isLoadingBinge, setIsLoadingBinge] = useState(false);
  const [isLoadingStreak, setIsLoadingStreak] = useState(false);

  // Fetch velocity data
  useEffect(() => {
    const fetchVelocity = async () => {
      if (!profileId || !accountId) return;

      setIsLoadingVelocity(true);
      try {
        const response = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/velocity`, {
          params: { days: 30 },
        });
        setVelocityData(response.data.results);
      } catch (error) {
        console.error('Failed to fetch velocity data:', error);
        setVelocityData(null);
      } finally {
        setIsLoadingVelocity(false);
      }
    };

    fetchVelocity();
  }, [profileId, accountId]);

  // Fetch timeline data
  useEffect(() => {
    const fetchTimeline = async () => {
      if (!profileId || !accountId) return;

      setIsLoadingTimeline(true);
      try {
        const response = await axiosInstance.get(
          `/accounts/${accountId}/profiles/${profileId}/statistics/activity/timeline`
        );
        setTimelineData(response.data.results);
      } catch (error) {
        console.error('Failed to fetch timeline data:', error);
        setTimelineData(null);
      } finally {
        setIsLoadingTimeline(false);
      }
    };

    fetchTimeline();
  }, [profileId, accountId]);

  // Fetch binge-watching data
  useEffect(() => {
    const fetchBinge = async () => {
      if (!profileId || !accountId) return;

      setIsLoadingBinge(true);
      try {
        const response = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/binge`);
        setBingeData(response.data.results);
      } catch (error) {
        console.error('Failed to fetch binge data:', error);
        setBingeData(null);
      } finally {
        setIsLoadingBinge(false);
      }
    };

    fetchBinge();
  }, [profileId, accountId]);

  // Fetch watch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      if (!profileId || !accountId) return;

      setIsLoadingStreak(true);
      try {
        const response = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/streaks`);
        setStreakData(response.data.results);
      } catch (error) {
        console.error('Failed to fetch streak data:', error);
        setStreakData(null);
      } finally {
        setIsLoadingStreak(false);
      }
    };

    fetchStreak();
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

        {/* Watching Velocity Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <WatchVelocityCard velocityData={velocityData} isLoading={isLoadingVelocity} />
        </Grid>

        {/* Activity Timeline Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ActivityTimelineChart timeline={timelineData} isLoading={isLoadingTimeline} />
        </Grid>

        {/* Binge-Watching Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BingeWatchingCard bingeData={bingeData} isLoading={isLoadingBinge} />
        </Grid>

        {/* Watch Streak Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <WatchStreakCard streakData={streakData} isLoading={isLoadingStreak} />
        </Grid>
      </>
    );
  }, [
    statistics,
    velocityData,
    timelineData,
    bingeData,
    streakData,
    isLoadingVelocity,
    isLoadingTimeline,
    isLoadingBinge,
    isLoadingStreak,
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
