import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import axiosInstance from '../../../app/api/axiosInstance';

interface NameEditDialogProps {
  open: boolean;
  title: string;
  profileId: string;
  onClose: () => void;
}

interface ProfileStatistics {
  totalShows: number;
}

const ProfileStatsDialog = ({ open, title, profileId, onClose }: NameEditDialogProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<ProfileStatistics | null>(null);

  useEffect(() => {
    const fetchProfileStats = async () => {
      setLoading(true);
      const response = await axiosInstance.get(`/profiles/${profileId}/shows/statistics`);
      setStatistics(response.data.results);
      setLoading(false);
    };
    if (profileId) {
      fetchProfileStats();
    }
  }, [profileId]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}
        {statistics && (
          <Stack direction="column" spacing={2} sx={{ pt: '8px' }}>
            <Typography variant="body1">
              <b>Shows: </b>
              {statistics.totalShows}
            </Typography>
            <Typography variant="subtitle1">
              <b>Total Shows: </b>
              {statistics.totalShows}
            </Typography>
            <Typography variant="subtitle2">
              <b>Total Shows: </b>
              {statistics.totalShows}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileStatsDialog;
