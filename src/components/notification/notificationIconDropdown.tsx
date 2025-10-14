import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
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
  markAllSystemNotificationsRead,
  markSystemNotificationRead,
  selectSystemNotifications,
} from '../../app/slices/systemNotificationsSlice';
import { AccountNotification } from '@ajgifford/keepwatching-types';

interface NotificationTypeConfig {
  icon: React.ComponentType;
  color: string;
  bgColor: string;
}

const getNotificationConfig = (notification: AccountNotification): NotificationTypeConfig => {
  if (notification.type === 'tv') {
    return {
      icon: TvIcon,
      color: '#1976d2',
      bgColor: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    };
  }

  if (notification.type === 'movie') {
    return {
      icon: MovieIcon,
      color: '#7b1fa2',
      bgColor: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
    };
  }

  if (notification.type === 'issue') {
    return {
      icon: WarningIcon,
      color: '#f57c00',
      bgColor: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
    };
  }

  if (notification.type === 'feature') {
    return {
      icon: AutoAwesomeIcon,
      color: '#388e3c',
      bgColor: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
    };
  }

  return {
    icon: InfoIcon,
    color: '#1976d2',
    bgColor: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  };
};

const formatTimestamp = (createdAt: Date): string => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const parseMessage = (message: string): string => {
  const div = document.createElement('div');
  div.innerHTML = message;
  return div.textContent || div.innerText || '';
};

function NotificationIconDropdown() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectSystemNotifications);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!currentAccount?.id) return;
  }, [currentAccount?.id]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleViewAll = (): void => {
    navigate('/notifications');
    setOpen(false);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  const handleMarkRead = (notificationId: number, hasBeenRead: boolean, event: React.MouseEvent) => {
    event.stopPropagation();
    if (currentAccount) {
      dispatch(
        markSystemNotificationRead({
          accountId: currentAccount.id,
          notificationId,
          hasBeenRead,
        })
      );
    }
  };

  const handleDismiss = (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (currentAccount) {
      dispatch(
        dismissSystemNotification({
          accountId: currentAccount.id,
          notificationId,
        })
      );
    }
  };

  const handleMarkAllRead = () => {
    if (currentAccount) {
      dispatch(markAllSystemNotificationsRead({ accountId: currentAccount.id, hasBeenRead: true }));
    }
  };

  const handleMarkAllUnread = () => {
    if (currentAccount) {
      dispatch(markAllSystemNotificationsRead({ accountId: currentAccount.id, hasBeenRead: false }));
    }
  };

  const handleDismissAll = () => {
    if (currentAccount) {
      dispatch(dismissAllSystemNotifications({ accountId: currentAccount.id }));
    }
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        sx={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: theme.palette.primary.contrastText,
          transition: 'all 0.3s ease',
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
        </Badge>
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        disablePortal
        sx={{ zIndex: theme.zIndex.modal }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              width: 400,
              maxHeight: 500,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Notifications
                </Typography>
                <Chip label={`${notifications.length} total`} size="small" color="primary" variant="outlined" />
              </Box>

              {notifications.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {unreadCount === 0 ? (
                    <Button size="small" variant="text" onClick={handleMarkAllUnread} sx={{ fontSize: '0.75rem' }}>
                      Mark All Unread
                    </Button>
                  ) : (
                    <Button size="small" variant="text" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem' }}>
                      Mark All Read
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    onClick={handleDismissAll}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Dismiss All
                  </Button>
                  <Button size="small" variant="text" onClick={handleViewAll} sx={{ fontSize: '0.75rem' }}>
                    View All
                  </Button>
                </Box>
              )}
            </Box>

            {notifications.length > 0 ? (
              <List
                sx={{
                  maxHeight: 400,
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha(theme.palette.divider, 0.2),
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: 3,
                  },
                }}
              >
                {notifications.slice(0, 10).map((notification, index) => {
                  const config = getNotificationConfig(notification);
                  const parsedMessage = parseMessage(notification.message);
                  const IconComponent = config.icon;
                  const isUnread = !notification.read;

                  return (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        sx={{
                          py: 1.5,
                          px: 2,
                          background: isUnread ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          borderLeft: isUnread ? `3px solid ${config.color}` : 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          position: 'relative',
                          '&:hover': {
                            background: alpha(config.color, 0.1),
                          },
                        }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title={isUnread ? 'Mark as read' : 'Mark as unread'}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMarkRead(notification.id, isUnread, e)}
                                sx={{
                                  backdropFilter: 'blur(8px)',
                                  WebkitBackdropFilter: 'blur(8px)',
                                  width: 28,
                                  height: 28,
                                  transition: 'all 0.2s ease',
                                  color: isUnread ? theme.palette.success.main : theme.palette.text.secondary,
                                  '&:hover': {
                                    background: alpha(
                                      isUnread ? theme.palette.success.main : theme.palette.info.main,
                                      0.2
                                    ),
                                    border: `1px solid ${alpha(
                                      isUnread ? theme.palette.success.main : theme.palette.info.main,
                                      0.3
                                    )}`,
                                    color: isUnread ? theme.palette.success.main : theme.palette.info.main,
                                  },
                                }}
                              >
                                {isUnread ? (
                                  <MarkEmailReadIcon sx={{ fontSize: 14 }} />
                                ) : (
                                  <MarkEmailUnreadIcon sx={{ fontSize: 14 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Dismiss notification">
                              <IconButton
                                size="small"
                                onClick={(e) => handleDismiss(notification.id, e)}
                                sx={{
                                  backdropFilter: 'blur(8px)',
                                  WebkitBackdropFilter: 'blur(8px)',
                                  width: 28,
                                  height: 28,
                                  transition: 'all 0.2s ease',
                                  color: theme.palette.text.secondary,
                                  '&:hover': {
                                    background: alpha(theme.palette.error.main, 0.2),
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                    color: theme.palette.error.main,
                                  },
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
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
                              fontSize: 20,
                              '& > *': {
                                fontSize: 'inherit',
                              },
                            }}
                          >
                            <IconComponent />
                          </Box>
                        </ListItemIcon>

                        <ListItemText
                          sx={{
                            pr: 8,
                            mr: 0,
                            width: 'calc(100% - 120px)',
                          }}
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isUnread ? 600 : 400,
                                color: theme.palette.text.primary,
                                lineHeight: 1.3,
                                textShadow: `0 1px 1px ${alpha('#ffffff', 0.6)}`,
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                fontSize: '0.875rem',
                              }}
                            >
                              {notification.title ||
                                (parsedMessage.length > 60 ? `${parsedMessage.substring(0, 60)}...` : parsedMessage)}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 0.25 }}>
                              {notification.title && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.7rem',
                                    lineHeight: 1.2,
                                    display: 'block',
                                    mb: 0.25,
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                  }}
                                >
                                  {parsedMessage.length > 50 ? `${parsedMessage.substring(0, 50)}...` : parsedMessage}
                                </Typography>
                              )}
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontSize: '0.65rem',
                                }}
                              >
                                {formatTimestamp(notification.startDate)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Math.min(notifications.length, 10) - 1 && (
                        <Divider
                          sx={{
                            background: alpha(theme.palette.divider, 0.1),
                            mx: 2,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}

                {notifications.length > 10 && (
                  <ListItem
                    sx={{
                      py: 1,
                      px: 2,
                      background: alpha(theme.palette.primary.main, 0.05),
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
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
