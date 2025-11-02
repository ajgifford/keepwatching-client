import { AccessTime as ClockIcon, Warning as WarningIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material';

import { TimeToWatchStats } from '@ajgifford/keepwatching-types';

interface BacklogAgingCardProps {
  stats: TimeToWatchStats | null;
  isLoading?: boolean;
}

interface BacklogAgingDataPoint {
  label: string;
  count: number;
  color: string;
  severity: 'low' | 'medium' | 'high';
}

export default function BacklogAgingCard({ stats }: BacklogAgingCardProps) {
  const theme = useTheme();

  if (!stats || !stats.backlogAging) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Backlog Aging
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No backlog data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const backlogData: BacklogAgingDataPoint[] = [
    {
      label: '30+ Days',
      count: stats.backlogAging.unwatchedOver30Days,
      color: theme.palette.warning.light,
      severity: 'low',
    },
    {
      label: '90+ Days',
      count: stats.backlogAging.unwatchedOver90Days,
      color: theme.palette.warning.main,
      severity: 'medium',
    },
    {
      label: '365+ Days',
      count: stats.backlogAging.unwatchedOver365Days,
      color: theme.palette.error.main,
      severity: 'high',
    },
  ];

  const totalBacklog = backlogData.reduce((sum, item) => sum + item.count, 0);
  const hasBacklog = totalBacklog > 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ClockIcon color="primary" />
          <Typography variant="h6">Backlog Aging</Typography>
        </Box>

        {!hasBacklog ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Typography variant="body1" color="success.main" fontWeight={600}>
              No Aging Backlog
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You&apos;re staying on top of your watch list!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* Total Backlog Summary */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: '2rem' }} />
              <Box>
                <Typography variant="h4" color="warning.main">
                  {totalBacklog}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unwatched Shows
                </Typography>
              </Box>
            </Box>

            {/* Breakdown by Age */}
            <Stack spacing={1.5}>
              {backlogData.map((item) => {
                const percentage = totalBacklog > 0 ? (item.count / totalBacklog) * 100 : 0;

                return (
                  <Box key={item.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({percentage.toFixed(0)}%)
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.grey[500], 0.1),
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                          transition: 'width 0.3s ease-in-out',
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            {/* Average Time Stats */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Average Time
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    {Math.round(stats.averageDaysToStartShow)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Days to Start
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="primary">
                    {Math.round(stats.averageDaysToCompleteShow)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Days to Complete
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Fastest Completions */}
            {stats.fastestCompletions && stats.fastestCompletions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Fastest Completions
                </Typography>
                <Stack spacing={1}>
                  {stats.fastestCompletions.slice(0, 3).map((completion, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {completion.showTitle}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {completion.daysToComplete} days
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
