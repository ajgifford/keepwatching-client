import React, { useEffect, useRef, useState } from 'react';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import MovieIcon from '@mui/icons-material/Movie';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TvIcon from '@mui/icons-material/Tv';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Badge,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentAccount } from '../../app/slices/accountSlice';
import {
  dismissAllSystemNotifications,
  dismissSystemNotification,
  selectSystemNotifications,
} from '../../app/slices/systemNotificationsSlice';

interface NotificationTypeConfig {
  icon: React.ComponentType;
  color: string;
  bgColor: string;
}

const getNotificationConfig = (message: string): NotificationTypeConfig => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('episode') || lowerMessage.includes('season')) {
    return {
      icon: TvIcon,
      color: '#1976d2',
      bgColor: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    };
  }

  if (lowerMessage.includes('movie')) {
    return {
      icon: MovieIcon,
      color: '#7b1fa2',
      bgColor: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
    };
  }

  if (lowerMessage.includes('welcome') || lowerMessage.includes('back')) {
    return {
      icon: CheckCircleIcon,
      color: '#388e3c',
      bgColor: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
    };
  }

  if (lowerMessage.includes('error') || lowerMessage.includes('failed')) {
    return {
      icon: ErrorIcon,
      color: '#d32f2f',
      bgColor: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
    };
  }

  if (lowerMessage.includes('warning') || lowerMessage.includes('issue')) {
    return {
      icon: WarningIcon,
      color: '#f57c00',
      bgColor: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
    };
  }

  return {
    icon: InfoIcon,
    color: '#1976d2',
    bgColor: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  };
};

const formatTimestamp = (createdAt?: Date): string => {
  if (!createdAt) return 'Just now';

  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

function NotificationIconDropdown() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectSystemNotifications);
  const account = useAppSelector(selectCurrentAccount);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  const notificationCount = notifications.length;
  const hasNotifications = notifications.length > 0;

  const handleToggle = () => {
    if (iconRef.current) {
      setAnchorEl(iconRef.current);
      setOpen(!open);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handleDismiss = (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (account) {
      dispatch(
        dismissSystemNotification({
          accountId: account.id,
          notificationId,
        })
      );
    }
  };

  const handleDismissAll = () => {
    if (account) {
      dispatch(dismissAllSystemNotifications({ accountId: account.id }));
    }
  };

  const parseMessage = (message: string) => {
    return message.replace(/{{account_name}}/g, account?.name || '');
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          ref={iconRef}
          onClick={handleToggle}
          sx={{
            color: 'inherit',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              transform: 'scale(1.05)',
            },
          }}
        >
          <Badge
            badgeContent={notificationCount}
            color="error"
            variant={notificationCount > 0 ? 'standard' : 'dot'}
            invisible={!hasNotifications}
            sx={{
              '& .MuiBadge-badge': {
                animation: notificationCount > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' },
                },
              },
            }}
          >
            {hasNotifications ? <NotificationsActiveIcon /> : <NotificationsIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        style={{ zIndex: theme.zIndex.modal }}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={0}
            sx={{
              width: 400,
              maxHeight: 500,
              background: alpha('#ffffff', 0.9),
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#ffffff', 0.2)}`,
              borderRadius: 3,
              boxShadow: `
                    0 8px 32px ${alpha('#000000', 0.12)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.3)}
                  `,
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.6)}, transparent)`,
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                background: alpha('#ffffff', 0.4),
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderBottom: `1px solid ${alpha('#ffffff', 0.3)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  textShadow: `0 1px 2px ${alpha('#ffffff', 0.8)}`,
                }}
              >
                Notifications
                {notificationCount > 0 && (
                  <Chip label={notificationCount} size="small" color="error" sx={{ ml: 1, height: 20 }} />
                )}
              </Typography>

              {hasNotifications && notificationCount > 0 && (
                <Button
                  size="small"
                  onClick={handleDismissAll}
                  startIcon={<DeleteIcon />}
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    background: alpha(theme.palette.primary.main, 0.1),
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  Dismiss All
                </Button>
              )}
            </Box>

            {/* Notification List */}
            {hasNotifications ? (
              <List
                sx={{
                  maxHeight: 400,
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha('#000000', 0.05),
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: 3,
                  },
                }}
              >
                {notifications.slice(0, 10).map((notification, index) => {
                  const config = getNotificationConfig(notification.message);
                  const IconComponent = config.icon;
                  const parsedMessage = parseMessage(notification.message);

                  return (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        sx={{
                          py: 1.5,
                          px: 2,
                          background: alpha(theme.palette.primary.main, 0.08),
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          borderLeft: `3px solid ${config.color}`,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            background: alpha(config.color, 0.1),
                            transform: 'translateX(2px)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: config.bgColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              boxShadow: `0 4px 12px ${alpha(config.color, 0.3)}`,
                              fontSize: 20, // Move fontSize here instead of on the icon
                              '& > *': {
                                fontSize: 'inherit', // Make child inherit the fontSize
                              },
                            }}
                          >
                            <IconComponent />
                          </Box>
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                lineHeight: 1.4,
                                textShadow: `0 1px 1px ${alpha('#ffffff', 0.6)}`,
                              }}
                            >
                              {parsedMessage.length > 80 ? `${parsedMessage.substring(0, 80)}...` : parsedMessage}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '0.7rem',
                                mt: 0.5,
                              }}
                            >
                              {formatTimestamp(notification.startDate)}
                            </Typography>
                          }
                        />

                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {/* Dismiss Button */}
                            <Tooltip title="Dismiss notification">
                              <IconButton
                                size="small"
                                onClick={(e) => handleDismiss(notification.id, e)}
                                sx={{
                                  background: alpha('#ffffff', 0.3),
                                  backdropFilter: 'blur(8px)',
                                  WebkitBackdropFilter: 'blur(8px)',
                                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                                  width: 28,
                                  height: 28,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    background: alpha(theme.palette.error.main, 0.2),
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                    color: theme.palette.error.main,
                                  },
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < notifications.length - 1 && <Divider sx={{ opacity: 0.3 }} />}
                    </React.Fragment>
                  );
                })}

                {notifications.length > 10 && (
                  <ListItem
                    sx={{
                      justifyContent: 'center',
                      py: 2,
                      background: alpha('#ffffff', 0.2),
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      +{notifications.length - 10} more notifications...
                    </Typography>
                  </ListItem>
                )}
              </List>
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: alpha('#ffffff', 0.2),
                }}
              >
                <NotificationsIcon
                  sx={{
                    fontSize: 48,
                    color: theme.palette.text.disabled,
                    mb: 1,
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No notifications yet
                </Typography>
              </Box>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

export default NotificationIconDropdown;
