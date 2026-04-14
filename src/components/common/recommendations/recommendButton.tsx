import React, { useState } from 'react';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  ActivityNotificationType,
  showActivityNotification,
} from '../../../app/slices/activityNotificationSlice';
import {
  addRecommendation,
  removeRecommendation,
  selectHasRecommended,
  selectSendLoading,
} from '../../../app/slices/communityRecommendationsSlice';
import { selectRatingForContent } from '../../../app/slices/ratingsSlice';
import { RatingContentType } from '@ajgifford/keepwatching-types';

interface RecommendButtonProps {
  profileId: number;
  contentType: RatingContentType;
  contentId: number;
  contentTitle: string;
}

export const RecommendButton = ({ profileId, contentType, contentId, contentTitle }: RecommendButtonProps) => {
  const dispatch = useAppDispatch();
  const hasRecommended = useAppSelector(selectHasRecommended(contentType, contentId));
  const sendLoading = useAppSelector(selectSendLoading);
  const existingRating = useAppSelector(selectRatingForContent(contentType, contentId));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [includeRating, setIncludeRating] = useState(false);

  const handleRecommendClick = () => {
    if (hasRecommended) {
      handleUnrecommend();
    } else {
      setIncludeRating(!!existingRating);
      setMessage(existingRating?.note || '');
      setDialogOpen(true);
    }
  };

  const handleUnrecommend = async () => {
    try {
      await dispatch(removeRecommendation({ profileId, contentType, contentId })).unwrap();
      dispatch(
        showActivityNotification({
          message: `Removed recommendation for ${contentTitle}.`,
          type: ActivityNotificationType.Info,
        }),
      );
    } catch {
      dispatch(
        showActivityNotification({
          message: 'Failed to remove recommendation.',
          type: ActivityNotificationType.Error,
        }),
      );
    }
  };

  const handleSubmit = async () => {
    try {
      await dispatch(
        addRecommendation({
          profileId,
          contentType,
          contentId,
          rating: includeRating && existingRating ? existingRating.rating : null,
          message: message.trim() || null,
        }),
      ).unwrap();
      setDialogOpen(false);
      setMessage('');
      dispatch(
        showActivityNotification({
          message: `Recommended ${contentTitle} to the community!`,
          type: ActivityNotificationType.Success,
        }),
      );
    } catch {
      dispatch(
        showActivityNotification({
          message: 'Failed to add recommendation.',
          type: ActivityNotificationType.Error,
        }),
      );
    }
  };

  return (
    <>
      <Button
        variant={hasRecommended ? 'contained' : 'outlined'}
        size="small"
        startIcon={hasRecommended ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
        onClick={handleRecommendClick}
        disabled={sendLoading}
        color={hasRecommended ? 'primary' : 'inherit'}
      >
        {hasRecommended ? 'Recommended' : 'Recommend'}
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recommend {contentTitle}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Share this with the community. Attribution is kept anonymous.
          </Typography>
          <TextField
            label="Message (optional)"
            multiline
            minRows={2}
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            inputProps={{ maxLength: 500 }}
            size="small"
            fullWidth
          />
          {existingRating && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeRating}
                  onChange={(e) => setIncludeRating(e.target.checked)}
                />
              }
              label={`Include my rating (${existingRating.rating} stars)`}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={sendLoading}>
            Recommend
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
