import { useEffect, useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import axiosInstance from '../../../app/api/axiosInstance';
import { Statistics } from '../../../app/model/statistics';
import StatisticsDashboard from './statisticsDashboard';

interface AccountStatisticsDialogProps {
  open: boolean;
  title: string;
  accountId: string;
  onClose: () => void;
}

const AccountStatisticsDialog = ({ open, title, accountId, onClose }: AccountStatisticsDialogProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchAccountStats = async () => {
      if (!open) return;

      setLoading(true);
      try {
        const response = await axiosInstance.get(`/accounts/${accountId}/statistics`);
        setStatistics(response.data.results);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accountId && open) {
      fetchAccountStats();
    }
  }, [accountId, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <StatisticsDashboard statistics={statistics} isLoading={loading} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountStatisticsDialog;
