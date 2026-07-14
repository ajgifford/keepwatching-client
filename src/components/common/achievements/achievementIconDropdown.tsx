import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  Badge,
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useDateFormatters } from '../../../app/hooks/useDateFormatters';
import {
  markAchievementsViewed,
  selectLastViewedAchievementsAt,
  selectMilestoneStats,
} from '../../../app/slices/activeProfileSlice';
import { BadgeInstance, getRecentlyUnlockedBadges, getUnlockedBadges } from './badgeDefinitions';
import { TIER_STYLES } from './badgeTierStyles';

function isUnseen(badge: BadgeInstance, lastViewedAchievementsAt?: string | null): boolean {
  if (!badge.achievedDate) return false;
  return !lastViewedAchievementsAt || badge.achievedDate > lastViewedAchievementsAt;
}

function AchievementIconDropdown() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const formatters = useDateFormatters();
  const milestoneStats = useAppSelector(selectMilestoneStats);
  const lastViewedAchievementsAt = useAppSelector(selectLastViewedAchievementsAt);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const recentlyUnlocked = getRecentlyUnlockedBadges(milestoneStats, 5);
  const unseenCount = getUnlockedBadges(milestoneStats).filter((badge) =>
    isUnseen(badge, lastViewedAchievementsAt)
  ).length;

  const handleToggle = () => {
    setOpen((prevOpen) => {
      const nextOpen = !prevOpen;
      if (nextOpen && unseenCount > 0) {
        dispatch(markAchievementsViewed());
      }
      return nextOpen;
    });
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  const handleViewBadge = (badgeId: string) => {
    navigate(`/achievements?badge=${badgeId}`);
    setOpen(false);
  };

  const handleViewAll = () => {
    navigate('/achievements');
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Achievements">
        <IconButton ref={anchorRef} onClick={handleToggle} sx={{ color: 'inherit' }} aria-label="achievements">
          <Badge badgeContent={unseenCount} color="warning">
            <EmojiEventsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        disablePortal
        sx={{ zIndex: theme.zIndex.modal }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper sx={{ width: 320, maxHeight: 440, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Achievements
              </Typography>
            </Box>

            {recentlyUnlocked.length > 0 ? (
              <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                {recentlyUnlocked.map((badge) => {
                  const tierStyle = TIER_STYLES[badge.tier];
                  const Icon = badge.icon;
                  return (
                    <Box
                      key={badge.id}
                      onClick={() => handleViewBadge(badge.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.25,
                        cursor: 'pointer',
                        '&:hover': { background: alpha(tierStyle.color, 0.08) },
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          flex: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: alpha(tierStyle.color, 0.16),
                          color: tierStyle.color,
                        }}
                      >
                        <Icon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {badge.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tierStyle.label}
                          {badge.achievedDate ? ` · ${formatters.notificationTimestamp(badge.achievedDate)}` : ''}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No badges unlocked yet
                </Typography>
              </Box>
            )}

            <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
              <Button size="small" variant="text" onClick={handleViewAll}>
                View All Achievements
              </Button>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

export default AchievementIconDropdown;
