import { useCallback, useEffect, useState } from 'react';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HistoryIcon from '@mui/icons-material/History';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';

import { useAppDispatch } from '../../../app/hooks';
import { useDateFormatters } from '../../../app/hooks/useDateFormatters';
import { dismissBulkMarkedShow, getBulkMarkedShows, retroactivelyMarkShowAsPrior } from '../../../app/slices/activeProfileSlice';
import { BulkMarkedShow } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

interface ReviewWatchHistoryPanelProps {
  profileId: number;
}

const ReviewWatchHistoryPanel = ({ profileId }: ReviewWatchHistoryPanelProps) => {
  const dispatch = useAppDispatch();
  const formatters = useDateFormatters();

  const [loading, setLoading] = useState(false);
  const [bulkMarkedShows, setBulkMarkedShows] = useState<BulkMarkedShow[]>([]);
  const [fixingShowId, setFixingShowId] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const loadBulkMarkedShows = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dispatch(getBulkMarkedShows({ profileId })).unwrap();
      setBulkMarkedShows(result);
    } catch {
      // silently fail — this is an optional feature
    } finally {
      setLoading(false);
    }
  }, [dispatch, profileId]);

  useEffect(() => {
    loadBulkMarkedShows();
  }, [loadBulkMarkedShows]);

  const addToDismissed = (showId: number) => {
    setDismissed((prev) => new Set(prev).add(showId));
  };

  const handleFix = async (show: BulkMarkedShow) => {
    setFixingShowId(show.showId);
    try {
      await dispatch(retroactivelyMarkShowAsPrior({ profileId, showId: show.showId })).unwrap();
      addToDismissed(show.showId);
    } catch {
      // silently fail
    } finally {
      setFixingShowId(null);
    }
  };

  const handleDismiss = (showId: number) => {
    addToDismissed(showId);
    dispatch(dismissBulkMarkedShow({ profileId, showId }));
  };

  const visibleShows = bulkMarkedShows.filter((show) => !dismissed.has(show.showId));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!loading && visibleShows.length === 0) {
    return (
      <Alert severity="success" icon={<HistoryIcon />}>
        Your watch history looks accurate — no issues detected.
      </Alert>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        The following shows appear to have been marked as watched all at once. If you watched them before joining
        KeepWatching, fixing their watch dates will use the original air dates for more accurate statistics.
      </Alert>
      <List disablePadding>
        {visibleShows.map((show, index) => (
          <Box key={show.showId}>
            <ListItem
              sx={{ px: 0, py: 1.5 }}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    startIcon={
                      fixingShowId === show.showId ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <AutoFixHighIcon />
                      )
                    }
                    disabled={fixingShowId === show.showId}
                    onClick={() => handleFix(show)}
                  >
                    Fix dates
                  </Button>
                  <Button size="small" variant="text" color="inherit" onClick={() => handleDismiss(show.showId)}>
                    Dismiss
                  </Button>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar
                  variant="rounded"
                  src={buildTMDBImagePath(show.posterImage, 'w92')}
                  alt={show.title}
                  sx={{ width: 48, height: 72 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={show.title}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {show.episodeCount} episodes marked on {formatters.activityDate(show.markDate)}
                  </Typography>
                }
              />
            </ListItem>
            {index < visibleShows.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default ReviewWatchHistoryPanel;
