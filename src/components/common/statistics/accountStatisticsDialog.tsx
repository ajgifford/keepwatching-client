import { useEffect, useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import axiosInstance from '../../../app/api/axiosInstance';
import AccountStatisticsDashboard from './accountStatisticsDashboard';
import { AccountStatisticsResponse } from '@ajgifford/keepwatching-types';

interface AccountStatisticsDialogProps {
  open: boolean;
  title: string;
  accountId: number;
  onClose: () => void;
}

const AccountStatisticsDialog = ({ open, title, accountId, onClose }: AccountStatisticsDialogProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<AccountStatisticsResponse | null>(null);

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
        <AccountStatisticsDashboard statistics={statistics} isLoading={loading} />
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
