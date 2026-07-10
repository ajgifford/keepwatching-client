import { forwardRef } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { accentGradientStops } from '../statistics/recap/periodRecapCard';
import { BadgeInstance } from './badgeDefinitions';
import { TIER_STYLES } from './badgeTierStyles';

interface BadgeShareCardProps {
  profileName: string;
  badge: BadgeInstance;
}

export const BadgeShareCard = forwardRef<HTMLDivElement, BadgeShareCardProps>(({ profileName, badge }, ref) => {
  const theme = useTheme();
  const tierStyle = TIER_STYLES[badge.tier];
  const gradientStops = accentGradientStops(tierStyle.color);
  const Icon = badge.icon;

  return (
    <Box
      ref={ref}
      data-testid="badge-share-card"
      sx={{
        width: '100%',
        maxWidth: 420,
        aspectRatio: '9 / 16',
        borderRadius: 3,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
        color: 'common.white',
        background: `linear-gradient(160deg, ${gradientStops.start} 0%, ${gradientStops.mid} 45%, ${gradientStops.end} 100%)`,
        boxShadow: theme.shadows[8],
      }}
    >
      <Box>
        <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>
          Achievement Unlocked
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {profileName}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '3px solid rgba(255,255,255,0.4)',
          }}
        >
          <Icon sx={{ fontSize: 64 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {badge.title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>
          {tierStyle.label} Tier
        </Typography>
        {badge.category === 'firstWatch' && (
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {badge.description}
          </Typography>
        )}
        {badge.achievedDate && (
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Unlocked {new Date(badge.achievedDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </Typography>
        )}
      </Box>

      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        KeepWatching
      </Typography>
    </Box>
  );
});

BadgeShareCard.displayName = 'BadgeShareCard';
