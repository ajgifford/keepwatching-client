import { useEffect, useState } from 'react';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import axiosInstance from '../../../app/api/axiosInstance';
import StatsTimeWindowSelector, { StatsTimeWindowDays } from './statsTimeWindowSelector';
import { ProfileEnhancedStatistics, ProfileStatisticsResponse } from '@ajgifford/keepwatching-types';
import { EnhancedProfileStatisticsDashboard } from '@ajgifford/keepwatching-ui';

interface ProfileStatisticsDialogProps {
  open: boolean;
  title: string;
  accountId: number;
  profileId: number;
  onClose: () => void;
}

const ProfileStatisticsDialog = ({ open, title, accountId, profileId, onClose }: ProfileStatisticsDialogProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<ProfileStatisticsResponse | null>(null);
  const [enhancedStatistics, setEnhancedStatistics] = useState<ProfileEnhancedStatistics>({});
  const [isLoadingEnhancedStats, setIsLoadingEnhancedStats] = useState(false);
  const [selectedDays, setSelectedDays] = useState<StatsTimeWindowDays>(30);

  useEffect(() => {
    const fetchAllStats = async () => {
      if (!open || !accountId || !profileId) return;

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
          skipRateRes,
          watchlistUsageRes,
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
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/skip-rate`),
          axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics/watchlist-usage`),
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
          skipRateStats: skipRateRes.status === 'fulfilled' ? skipRateRes.value.data.results : null,
          watchlistUsage: watchlistUsageRes.status === 'fulfilled' ? watchlistUsageRes.value.data.results : null,
        };

        setEnhancedStatistics(enhanced);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
        setIsLoadingEnhancedStats(false);
      }
    };

    if (accountId && profileId && open) {
      fetchAllStats();
    }
  }, [accountId, profileId, open, selectedDays]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
          },
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <span>{title}</span>
          <StatsTimeWindowSelector value={selectedDays} onChange={setSelectedDays} disabled={loading} />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <EnhancedProfileStatisticsDashboard
          statistics={statistics}
          isLoading={loading}
          enhancedStatistics={enhancedStatistics}
          isLoadingEnhancedStats={isLoadingEnhancedStats}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileStatisticsDialog;
