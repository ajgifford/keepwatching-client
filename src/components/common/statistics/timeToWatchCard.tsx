import React from 'react';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Card, CardContent, Chip, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

import { TimeToWatchStats } from '@ajgifford/keepwatching-types';

interface TimeToWatchCardProps {
  stats: TimeToWatchStats | null;
}

export const TimeToWatchCard: React.FC<TimeToWatchCardProps> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const hasBacklogData =
    stats.backlogAging.unwatchedOver30Days > 0 ||
    stats.backlogAging.unwatchedOver90Days > 0 ||
    stats.backlogAging.unwatchedOver365Days > 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTimeIcon color="primary" />
            <Typography variant="h6">Time to Watch</Typography>
          </Box>

          {/* Average Days to Start & Complete */}
          <Stack spacing={1}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Average Days to Start Show
              </Typography>
              <Typography variant="h4">
                {stats.averageDaysToStartShow > 0 ? stats.averageDaysToStartShow : 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Average Days to Complete Show
              </Typography>
              <Typography variant="h4">
                {stats.averageDaysToCompleteShow > 0 ? stats.averageDaysToCompleteShow : 'N/A'}
              </Typography>
            </Box>
          </Stack>

          {/* Fastest Completions */}
          {stats.fastestCompletions.length > 0 && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <SpeedIcon color="success" fontSize="small" />
                <Typography variant="subtitle2">Fastest Completions</Typography>
              </Box>
              <List dense disablePadding>
                {stats.fastestCompletions.map((completion, index) => (
                  <ListItem key={`${completion.showId}-${index}`} disablePadding sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={completion.showTitle}
                      secondary={`${completion.daysToComplete} days`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Backlog Aging */}
          {hasBacklogData && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <WarningAmberIcon color="warning" fontSize="small" />
                <Typography variant="subtitle2">Backlog Aging</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {stats.backlogAging.unwatchedOver30Days > 0 && (
                  <Chip label={`${stats.backlogAging.unwatchedOver30Days} over 30 days`} size="small" color="default" />
                )}
                {stats.backlogAging.unwatchedOver90Days > 0 && (
                  <Chip label={`${stats.backlogAging.unwatchedOver90Days} over 90 days`} size="small" color="warning" />
                )}
                {stats.backlogAging.unwatchedOver365Days > 0 && (
                  <Chip label={`${stats.backlogAging.unwatchedOver365Days} over 1 year`} size="small" color="error" />
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
