import { useNavigate } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Paper, Snackbar, Typography, alpha } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  hideBadgeUnlockNotification,
  selectBadgeNotificationAdditionalCount,
  selectBadgeNotificationBadge,
  selectBadgeNotificationOpen,
} from '../../../app/slices/badgeNotificationSlice';
import { CATEGORY_ICON } from './badgeDefinitions';
import { TIER_STYLES } from './badgeTierStyles';

function BadgeUnlockToast() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectBadgeNotificationOpen);
  const badge = useAppSelector(selectBadgeNotificationBadge);
  const additionalCount = useAppSelector(selectBadgeNotificationAdditionalCount);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideBadgeUnlockNotification());
  };

  const handleViewBadge = () => {
    if (badge) {
      navigate(`/achievements?badge=${badge.id}`);
    }
    dispatch(hideBadgeUnlockNotification());
  };

  if (!badge) {
    return null;
  }

  const tierStyle = TIER_STYLES[badge.tier];
  const Icon = CATEGORY_ICON[badge.category];

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: 340,
          maxWidth: '90vw',
          borderLeft: `4px solid ${tierStyle.color}`,
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(tierStyle.color, 0.16),
              color: tierStyle.color,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Badge unlocked
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {badge.title} · {tierStyle.label}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <IconButton size="small" onClick={() => handleClose()} aria-label="dismiss">
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: tierStyle.color, cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={handleViewBadge}
            >
              VIEW BADGE
            </Typography>
          </Box>
        </Box>
        {additionalCount > 0 && (
          <Box sx={{ px: 1.5, pb: 1.25 }}>
            <Typography variant="caption" color="text.secondary">
              +{additionalCount} more badge{additionalCount === 1 ? '' : 's'} unlocked
            </Typography>
          </Box>
        )}
      </Paper>
    </Snackbar>
  );
}

export default BadgeUnlockToast;
