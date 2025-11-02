import { useEffect, useState } from 'react';

import axiosInstance from '../../../../app/api/axiosInstance';
import EnhancedProfileStatisticsDashboard from './enhancedProfileStatisticsDashboard';
import { ProfileStatisticsResponse } from '@ajgifford/keepwatching-types';

interface ProfileStatisticsComponentProps {
  accountId: number;
  profileId: number;
}

const ProfileStatisticsComponent = ({ accountId, profileId }: ProfileStatisticsComponentProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<ProfileStatisticsResponse | null>(null);

  useEffect(() => {
    const fetchProfileStats = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/statistics`);
        setStatistics(response.data.results);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accountId && profileId) {
      fetchProfileStats();
    }
  }, [accountId, profileId]);

  return (
    <EnhancedProfileStatisticsDashboard
      accountId={accountId}
      profileId={profileId}
      statistics={statistics}
      isLoading={loading}
    />
  );
};

export default ProfileStatisticsComponent;
