import { useEffect, useMemo, useRef, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import axiosInstance from '../../../../app/api/axiosInstance';
import { getProfileSummaryProps } from '../utils/statisticsUtils';
import BaseStatisticsDashboard from './baseStatisticsDashboard';
import {
  AbandonmentRiskStats,
  BingeWatchingStats,
  ContentDepthStats,
  ContentDiscoveryStats,
  MilestoneStats,
  ProfileStatisticsResponse,
  SeasonalViewingStats,
  TimeToWatchStats,
  UnairedContentStats,
  WatchStatus,
  WatchStreakStats,
  WatchingActivityTimeline,
  WatchingVelocityStats,
} from '@ajgifford/keepwatching-types';
import {
  AbandonmentRiskCard,
  ActivityTimelineChart,
  BacklogAgingCard,
  BingeWatchingCard,
  ContentDepthCard,
  ContentDiscoveryCard,
  MilestonesAndAnniversaryCard,
  SeasonalViewingCard,
  ShowProgressCard,
  TimeToWatchCard,
  UnairedContentCard,
  WatchStreakCard,
  WatchVelocityCard,
} from '@ajgifford/keepwatching-ui';

interface EnhancedProfileStatisticsDashboardProps {
  profileId: number;
  accountId: number;
  statistics?: ProfileStatisticsResponse | null;
  isLoading?: boolean;
}

// Define section categories
const SECTION_CATEGORIES = [
  { id: 'milestones', label: 'Milestones & Achievements', icon: '🏆' },
  { id: 'progress', label: 'Progress & Activity', icon: '📊' },
  { id: 'patterns', label: 'Viewing Patterns', icon: '📺' },
  { id: 'insights', label: 'Content Insights', icon: '💡' },
  { id: 'management', label: 'Content Management', icon: '📋' },
] as const;

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
  const [contentDepthData, setContentDepthData] = useState<ContentDepthStats | null>(null);
  const [contentDiscoveryData, setContentDiscoveryData] = useState<ContentDiscoveryStats | null>(null);
  const [abandonmentRiskData, setAbandonmentRiskData] = useState<AbandonmentRiskStats | null>(null);
  const [unairedContentData, setUnairedContentData] = useState<UnairedContentStats | null>(null);
  const [isLoadingEnhancedStats, setIsLoadingEnhancedStats] = useState(false);

  // Refs for scrolling to sections
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Fetch all enhanced statistics data
  useEffect(() => {
    const fetchAllEnhancedStats = async () => {
      if (!profileId || !accountId) return;

      setIsLoadingEnhancedStats(true);

      try {
        // Fetch all statistics in parallel
        const [
          velocityRes,
          timelineRes,
          bingeRes,
          streakRes,
          timeToWatchRes,
          seasonalRes,
          milestoneRes,
          contentDepthRes,
          contentDiscoveryRes,
          abandonmentRiskRes,
          unairedContentRes,
        ] = await Promise.allSettled([
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/velocity`, {
            params: { days: 30 },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/activity/timeline`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/binge`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/streaks`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/time-to-watch`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/seasonal`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/milestones`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/content-depth`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/content-discovery`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/abandonment-risk`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/unaired-content`),
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

        // Set content depth data
        if (contentDepthRes.status === 'fulfilled') {
          setContentDepthData(contentDepthRes.value.data.results);
        } else {
          console.error('Failed to fetch content depth data:', contentDepthRes.reason);
          setContentDepthData(null);
        }

        // Set content discovery data
        if (contentDiscoveryRes.status === 'fulfilled') {
          setContentDiscoveryData(contentDiscoveryRes.value.data.results);
        } else {
          console.error('Failed to fetch content discovery data:', contentDiscoveryRes.reason);
          setContentDiscoveryData(null);
        }

        // Set abandonment risk data
        if (abandonmentRiskRes.status === 'fulfilled') {
          setAbandonmentRiskData(abandonmentRiskRes.value.data.results);
        } else {
          console.error('Failed to fetch abandonment risk data:', abandonmentRiskRes.reason);
          setAbandonmentRiskData(null);
        }

        // Set unaired content data
        if (unairedContentRes.status === 'fulfilled') {
          setUnairedContentData(unairedContentRes.value.data.results);
        } else {
          console.error('Failed to fetch unaired content data:', unairedContentRes.reason);
          setUnairedContentData(null);
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
        {/* Quick Navigation */}
        <Grid size={12}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              mb: 2,
              p: 2,
              backgroundColor: 'background.paper',
              borderRadius: 1,
              position: 'sticky',
              top: 0,
              zIndex: 10,
              boxShadow: 1,
            }}
          >
            <Typography variant="body2" sx={{ alignSelf: 'center', mr: 1, fontWeight: 'medium' }}>
              Jump to:
            </Typography>
            {SECTION_CATEGORIES.map((section) => (
              <Chip
                key={section.id}
                label={`${section.icon} ${section.label}`}
                onClick={() => scrollToSection(section.id)}
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Grid>

        {/* Milestones & Achievements Section */}
        <Grid size={12}>
          <Accordion defaultExpanded ref={(el) => (sectionRefs.current['milestones'] = el)} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">🏆 Milestones & Achievements</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <MilestonesAndAnniversaryCard stats={milestoneData} isLoading={isLoadingEnhancedStats} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Progress & Activity Section */}
        <Grid size={12}>
          <Accordion defaultExpanded ref={(el) => (sectionRefs.current['progress'] = el)} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">📊 Progress & Activity</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <ShowProgressCard
                    title="Active Shows Progress"
                    shows={statistics.episodeWatchProgress.showsProgress}
                    filters={[WatchStatus.WATCHING, WatchStatus.UP_TO_DATE]}
                    maxHeight={300}
                    maxItems={10}
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <WatchVelocityCard velocityData={velocityData} isLoading={isLoadingEnhancedStats} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ActivityTimelineChart timeline={timelineData} isLoading={isLoadingEnhancedStats} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Viewing Patterns Section */}
        <Grid size={12}>
          <Accordion ref={(el) => (sectionRefs.current['patterns'] = el)} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">📺 Viewing Patterns</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <BingeWatchingCard bingeData={bingeData} isLoading={isLoadingEnhancedStats} />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <WatchStreakCard streakData={streakData} isLoading={isLoadingEnhancedStats} />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  {isLoadingEnhancedStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <SeasonalViewingCard stats={seasonalData} />
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Content Insights Section */}
        <Grid size={12}>
          <Accordion ref={(el) => (sectionRefs.current['insights'] = el)} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">💡 Content Insights</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  {isLoadingEnhancedStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <ContentDepthCard stats={contentDepthData} />
                  )}
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  {isLoadingEnhancedStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <ContentDiscoveryCard stats={contentDiscoveryData} />
                  )}
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  {isLoadingEnhancedStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TimeToWatchCard stats={timeToWatchData} />
                  )}
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <BacklogAgingCard stats={timeToWatchData} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Content Management Section */}
        <Grid size={12}>
          <Accordion ref={(el) => (sectionRefs.current['management'] = el)} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">📋 Content Management</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  {isLoadingEnhancedStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <AbandonmentRiskCard stats={abandonmentRiskData} />
                  )}
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  {isLoadingEnhancedStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <UnairedContentCard stats={unairedContentData} />
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
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
    contentDepthData,
    contentDiscoveryData,
    abandonmentRiskData,
    unairedContentData,
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
