import LockIcon from '@mui/icons-material/Lock';
import { Box, Card, CardActionArea, LinearProgress, Typography, alpha } from '@mui/material';

import { BadgeInstance } from './badgeDefinitions';
import { TIER_STYLES } from './badgeTierStyles';

interface AchievementBadgeCardProps {
  badge: BadgeInstance;
  onClick?: (badge: BadgeInstance) => void;
}

export function AchievementBadgeCard({ badge, onClick }: AchievementBadgeCardProps) {
  const tierStyle = TIER_STYLES[badge.tier];
  const Icon = badge.icon;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        opacity: badge.achieved ? 1 : 0.6,
        borderColor: badge.achieved ? tierStyle.color : undefined,
        borderWidth: badge.achieved ? 2 : 1,
      }}
    >
      <CardActionArea
        onClick={() => onClick?.(badge)}
        sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(tierStyle.color, badge.achieved ? 0.2 : 0.1),
            color: badge.achieved ? tierStyle.color : 'text.disabled',
          }}
        >
          {badge.achieved ? <Icon sx={{ fontSize: 32 }} /> : <LockIcon sx={{ fontSize: 28 }} />}
        </Box>

        <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
          {badge.title}
        </Typography>

        {badge.achieved && badge.category === 'firstWatch' && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            {badge.description}
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: tierStyle.color, fontWeight: 600 }}>
          {tierStyle.label}
        </Typography>

        {badge.achieved ? (
          badge.achievedDate && (
            <Typography variant="caption" color="text.secondary">
              Unlocked {new Date(badge.achievedDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </Typography>
          )
        ) : (
          <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate" value={badge.progress} sx={{ borderRadius: 1 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}
            >
              {Math.round(badge.progress)}%
            </Typography>
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
}
