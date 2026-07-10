import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Box, Button } from '@mui/material';

import axiosInstance from '../../../app/api/axiosInstance';
import StatsTimeWindowSelector, { StatsTimeWindowDays } from './statsTimeWindowSelector';
import { ProfileEnhancedStatistics, ProfileStatisticsResponse } from '@ajgifford/keepwatching-types';
import { EnhancedProfileStatisticsDashboard } from '@ajgifford/keepwatching-ui';

interface ProfileStatisticsComponentProps {
  accountId: number;
  profileId: number;
}

const ProfileStatisticsComponent = ({ accountId, profileId }: ProfileStatisticsComponentProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<ProfileStatisticsResponse | null>(null);
  const [enhancedStatistics, setEnhancedStatistics] = useState<ProfileEnhancedStatistics>({});
  const [isLoadingEnhancedStats, setIsLoadingEnhancedStats] = useState(false);
  const [selectedDays, setSelectedDays] = useState<StatsTimeWindowDays>(30);

  useEffect(() => {
    const fetchAllStats = async () => {
      if (!accountId || !profileId) return;

      setLoading(true);
      setIsLoadingEnhancedStats(true);

      const velocityDays = selectedDays ?? 36500;

      try {
        // Fetch base statistics
        const baseResponse = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics`);
        setStatistics(baseResponse.data.results);

        // Fetch all enhanced statistics in parallel
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
          rewatchRes,
        ] = await Promise.allSettled([
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/velocity`, {
            params: { days: velocityDays },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/activity/timeline`, {
            params: { days: velocityDays },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/binge`, {
            params: { days: velocityDays },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/streaks`, {
            params: { days: velocityDays },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/time-to-watch`, {
            params: { days: velocityDays },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/seasonal`, {
            params: { days: velocityDays },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/milestones`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/content-depth`, {
            params: { days: velocityDays },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/content-discovery`, {
            params: { days: velocityDays },
          }),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/abandonment-risk`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/unaired-content`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/rewatches`),
        ]);

        // Build enhanced statistics object
        const enhanced: ProfileEnhancedStatistics = {
          velocity: velocityRes.status === 'fulfilled' ? velocityRes.value.data.results : null,
          timeline: timelineRes.status === 'fulfilled' ? timelineRes.value.data.results : null,
          binge: bingeRes.status === 'fulfilled' ? bingeRes.value.data.results : null,
          streak: streakRes.status === 'fulfilled' ? streakRes.value.data.results : null,
          timeToWatch: timeToWatchRes.status === 'fulfilled' ? timeToWatchRes.value.data.results : null,
          seasonal: seasonalRes.status === 'fulfilled' ? seasonalRes.value.data.results : null,
          milestones: milestoneRes.status === 'fulfilled' ? milestoneRes.value.data.results : null,
          contentDepth: contentDepthRes.status === 'fulfilled' ? contentDepthRes.value.data.results : null,
          contentDiscovery: contentDiscoveryRes.status === 'fulfilled' ? contentDiscoveryRes.value.data.results : null,
          abandonmentRisk: abandonmentRiskRes.status === 'fulfilled' ? abandonmentRiskRes.value.data.results : null,
          unairedContent: unairedContentRes.status === 'fulfilled' ? unairedContentRes.value.data.results : null,
          rewatchStats: rewatchRes.status === 'fulfilled' ? rewatchRes.value.data.results : null,
        };

        setEnhancedStatistics(enhanced);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
        setIsLoadingEnhancedStats(false);
      }
    };

    if (accountId && profileId) {
      fetchAllStats();
    }
  }, [accountId, profileId, selectedDays]);

  return (
    <Box>
      <Box
        sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
      >
        <Button component={Link} to="/achievements" size="small" variant="outlined" startIcon={<EmojiEventsIcon />}>
          View All Achievements
        </Button>
        <StatsTimeWindowSelector value={selectedDays} onChange={setSelectedDays} disabled={loading} />
      </Box>
      <EnhancedProfileStatisticsDashboard
        statistics={statistics}
        isLoading={loading}
        enhancedStatistics={enhancedStatistics}
        isLoadingEnhancedStats={isLoadingEnhancedStats}
      />
    </Box>
  );
};

export default ProfileStatisticsComponent;
