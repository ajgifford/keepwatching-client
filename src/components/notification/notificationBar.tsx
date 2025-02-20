import { useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Card, CardContent, Collapse, IconButton, Tooltip, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentAccount } from '../../app/slices/accountSlice';
import { dismissNotification, selectSystemNotifications } from '../../app/slices/systemNotificationsSlice';

function NotificationBar() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectSystemNotifications);
  const account = useAppSelector(selectCurrentAccount);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [startIndex, setStartIndex] = useState(0);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const nextNotifications = () => {
    if (startIndex + 2 < notifications.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevNotifications = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  if (notifications.length === 0) return null;

  const onDismiss = (id: number) => {
    if (account) {
      dispatch(dismissNotification({ accountId: account.id, notificationId: id }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '98%', margin: '0 auto' }}>
      {notifications.slice(startIndex, startIndex + 2).map(({ notification_id, message }) => {
        const firstLine = message.split('\n')[0];
        const hasMoreText = message.includes('\n');

        return (
          <Card key={notification_id} sx={{ width: '100%', boxShadow: 1 }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '4px',
                '&:last-child': { paddingBottom: '4px' },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography color="primary" variant="body2">
                  {firstLine}
                </Typography>
                <Collapse in={!!expanded[notification_id]}>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {message}
                  </Typography>
                </Collapse>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {hasMoreText && (
                  <IconButton size="small" onClick={() => toggleExpand(notification_id)}>
                    {expanded[notification_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
                <Tooltip title="Dismiss">
                  <IconButton size="small" onClick={() => onDismiss(notification_id)}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {notifications.length > 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '4px' }}>
          <IconButton onClick={prevNotifications} disabled={startIndex === 0}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2">
            {startIndex + 1} - {Math.min(startIndex + 2, notifications.length)} of {notifications.length}
          </Typography>
          <IconButton onClick={nextNotifications} disabled={startIndex + 2 >= notifications.length}>
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

export default NotificationBar;
