import React from 'react';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Card, CardContent, Chip, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';

import { AbandonmentRiskStats } from '@ajgifford/keepwatching-types';

interface AbandonmentRiskCardProps {
  stats: AbandonmentRiskStats | null;
}

export const AbandonmentRiskCard: React.FC<AbandonmentRiskCardProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Abandonment Risk Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  type RiskColor = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';

  const getRiskLevel = (rate: number): { label: string; color: RiskColor } => {
    if (rate > 30) return { label: 'High', color: 'error' };
    if (rate > 15) return { label: 'Medium', color: 'warning' };
    return { label: 'Low', color: 'success' };
  };

  const riskLevel = getRiskLevel(stats.showAbandonmentRate);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Abandonment Risk Analysis
        </Typography>

        <Grid container spacing={3}>
          {/* Abandonment Rate */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h3" color={riskLevel.color}>
                {stats.showAbandonmentRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Show Abandonment Rate
              </Typography>
              <Chip label={`${riskLevel.label} Risk`} color={riskLevel.color} size="small" sx={{ mt: 1 }} />
            </Box>
          </Grid>

          {/* Shows at Risk Count */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h3" color="warning.main">
                {stats.showsAtRisk.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shows at Risk
              </Typography>
              <Typography variant="caption" color="text.secondary">
                No progress in 30+ days
              </Typography>
            </Box>
          </Grid>

          {/* Shows at Risk List */}
          {stats.showsAtRisk.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Shows Needing Attention
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.default', borderRadius: 1 }}>
                <List dense>
                  {stats.showsAtRisk.slice(0, 10).map((show) => (
                    <ListItem
                      key={show.showId}
                      sx={{
                        borderLeft: 4,
                        borderColor: show.daysSinceLastWatch > 90 ? 'error.main' : 'warning.main',
                        mb: 1,
                      }}
                    >
                      <WarningAmberIcon
                        sx={{ mr: 1, color: show.daysSinceLastWatch > 90 ? 'error.main' : 'warning.main' }}
                      />
                      <ListItemText
                        primary={show.showTitle}
                        secondary={
                          <>
                            <Typography variant="caption" component="span" display="block">
                              {show.daysSinceLastWatch} days since last watch
                            </Typography>
                            <Typography variant="caption" component="span" display="block">
                              {show.unwatchedEpisodes} unwatched episodes
                            </Typography>
                          </>
                        }
                      />
                      {show.profileName && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 2, alignSelf: 'flex-start', mt: 1 }}
                        >
                          {show.profileName}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
              {stats.showsAtRisk.length > 10 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Showing 10 of {stats.showsAtRisk.length} shows at risk
                </Typography>
              )}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
