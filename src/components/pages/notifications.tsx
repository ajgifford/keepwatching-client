import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import MovieIcon from '@mui/icons-material/Movie';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import TvIcon from '@mui/icons-material/Tv';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
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
  fetchSystemNotifications,
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
  // Simple parsing to remove any HTML tags if present
  const div = document.createElement('div');
  div.innerHTML = message;
  return div.textContent || div.innerText || '';
};

type FilterType = 'all' | 'unread' | 'content' | 'system';

const Notifications: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const notifications = useAppSelector(selectSystemNotifications);
  const currentAccount = useAppSelector(selectCurrentAccount);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Fetch notifications on component mount
  useEffect(() => {
    if (currentAccount?.id) {
      dispatch(fetchSystemNotifications(currentAccount.id));
    }
  }, [currentAccount?.id, dispatch]);

  const handleBack = (): void => {
    navigate(-1);
  };

  const handleMarkAsRead = (notificationId: number, hasBeenRead: boolean): void => {
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

  const handleDismiss = (notificationId: number): void => {
    if (currentAccount) {
      dispatch(
        dismissSystemNotification({
          accountId: currentAccount.id,
          notificationId,
        })
      );
    }
  };

  const handleMarkAllRead = (): void => {
    if (currentAccount) {
      dispatch(markAllSystemNotificationsRead({ accountId: currentAccount.id, hasBeenRead: true }));
    }
  };

  const handleMarkAllUnread = (): void => {
    if (currentAccount) {
      dispatch(markAllSystemNotificationsRead({ accountId: currentAccount.id, hasBeenRead: false }));
    }
  };

  const handleDismissAll = (): void => {
    if (currentAccount) {
      dispatch(dismissAllSystemNotifications({ accountId: currentAccount.id }));
    }
  };

  // Filter and search logic
  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter = (() => {
      switch (filter) {
        case 'unread':
          return !notification.read;
        case 'content':
          return notification.type === 'tv' || notification.type === 'movie';
        case 'system':
          return notification.type === 'issue' || notification.type === 'feature';
        case 'all':
        default:
          return true;
      }
    })();

    const parsedMessage = parseMessage(notification.message);
    const matchesSearch = searchTerm === '' || parsedMessage.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            onClick={handleBack}
            sx={{
              mr: 2,
              background: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={600}>
              Notifications
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          background: alpha('#ffffff', 0.95),
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${alpha('#ffffff', 0.3)}`,
          boxShadow: `0 8px 32px ${alpha('#000000', 0.12)}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: alpha('#ffffff', 0.8),
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value as FilterType)}
                sx={{
                  background: alpha('#ffffff', 0.8),
                }}
              >
                <MenuItem value="all">All Notifications</MenuItem>
                <MenuItem value="unread">Unread ({unreadCount})</MenuItem>
                <MenuItem value="content">Content Updates</MenuItem>
                <MenuItem value="system">System Notifications</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {unreadCount === 0 ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleMarkAllUnread}
                  disabled={notifications.length === 0}
                >
                  Mark All Unread
                </Button>
              ) : (
                <Button size="small" variant="outlined" onClick={handleMarkAllRead}>
                  Mark All Read
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleDismissAll}
                disabled={notifications.length === 0}
              >
                Dismiss All
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Notifications List */}
      <Card
        sx={{
          background: alpha('#ffffff', 0.95),
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${alpha('#ffffff', 0.3)}`,
          boxShadow: `0 8px 32px ${alpha('#000000', 0.12)}`,
          overflow: 'hidden',
        }}
      >
        {filteredNotifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => {
              const config = getNotificationConfig(notification);
              const IconComponent = config.icon;
              const isUnread = !notification.read;
              const parsedMessage = parseMessage(notification.message);

              return (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      backgroundColor: isUnread ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.1),
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={isUnread ? 'Mark as read' : 'Mark as unread'}>
                          <IconButton
                            size="small"
                            onClick={() => handleMarkAsRead(notification.id, isUnread)}
                            sx={{
                              background: alpha('#ffffff', 0.3),
                              backdropFilter: 'blur(8px)',
                              WebkitBackdropFilter: 'blur(8px)',
                              border: `1px solid ${alpha('#ffffff', 0.2)}`,
                              width: 32,
                              height: 32,
                              transition: 'all 0.2s ease',
                              color: isUnread ? theme.palette.success.main : theme.palette.text.secondary,
                              '&:hover': {
                                background: alpha(isUnread ? theme.palette.success.main : theme.palette.info.main, 0.2),
                                border: `1px solid ${alpha(
                                  isUnread ? theme.palette.success.main : theme.palette.info.main,
                                  0.3
                                )}`,
                                transform: 'scale(1.05)',
                              },
                            }}
                          >
                            {isUnread ? (
                              <MarkEmailReadIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <MarkEmailUnreadIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Dismiss notification">
                          <IconButton
                            size="small"
                            onClick={() => handleDismiss(notification.id)}
                            sx={{
                              background: alpha('#ffffff', 0.3),
                              backdropFilter: 'blur(8px)',
                              WebkitBackdropFilter: 'blur(8px)',
                              border: `1px solid ${alpha('#ffffff', 0.2)}`,
                              width: 32,
                              height: 32,
                              transition: 'all 0.2s ease',
                              color: theme.palette.text.secondary,
                              '&:hover': {
                                background: alpha(theme.palette.error.main, 0.2),
                                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                color: theme.palette.error.main,
                                transform: 'scale(1.05)',
                              },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 56 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: config.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
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
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={isUnread ? 600 : 400}
                            sx={{ color: theme.palette.text.primary }}
                          >
                            {notification.title}
                          </Typography>
                          {isUnread && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 0.5,
                              lineHeight: 1.4,
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {parsedMessage}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: '0.7rem',
                            }}
                          >
                            {formatTimestamp(notification.startDate)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>

                  {index < filteredNotifications.length - 1 && (
                    <Divider
                      sx={{
                        background: alpha(theme.palette.divider, 0.1),
                        mx: 3,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              background: alpha('#ffffff', 0.2),
            }}
          >
            <NotificationsIcon
              sx={{
                fontSize: 64,
                color: theme.palette.text.disabled,
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : "You're all caught up! New notifications will appear here."}
            </Typography>
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default Notifications;
