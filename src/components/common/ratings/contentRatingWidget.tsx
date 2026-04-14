import React, { useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import Rating from '@mui/material/Rating';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  ActivityNotificationType,
  showActivityNotification,
} from '../../../app/slices/activityNotificationSlice';
import {
  deleteRating,
  selectRatingForContent,
  upsertRating,
} from '../../../app/slices/ratingsSlice';
import { RatingContentType } from '@ajgifford/keepwatching-types';

interface ContentRatingWidgetProps {
  profileId: number;
  contentType: RatingContentType;
  contentId: number;
  contentTitle: string;
  posterImage: string;
}

export const ContentRatingWidget = ({
  profileId,
  contentType,
  contentId,
  contentTitle,
  posterImage,
}: ContentRatingWidgetProps) => {
  const dispatch = useAppDispatch();
  const existingRating = useAppSelector(selectRatingForContent(contentType, contentId));

  const [starValue, setStarValue] = useState<number | null>(existingRating?.rating ?? null);
  const [note, setNote] = useState<string>(existingRating?.note ?? '');

  useEffect(() => {
    setStarValue(existingRating?.rating ?? null);
    setNote(existingRating?.note ?? '');
  }, [existingRating]);

  const handleSave = async () => {
    if (!starValue) return;
    try {
      await dispatch(
        upsertRating({
          profileId,
          contentType,
          contentId,
          rating: starValue,
          note: note.trim() || null,
          contentTitle,
          posterImage,
        }),
      ).unwrap();
      dispatch(
        showActivityNotification({
          message: 'Rating saved!',
          type: ActivityNotificationType.Success,
        }),
      );
    } catch {
      dispatch(
        showActivityNotification({
          message: 'Failed to save rating.',
          type: ActivityNotificationType.Error,
        }),
      );
    }
  };

  const handleDelete = async () => {
    if (!existingRating) return;
    try {
      await dispatch(deleteRating({ profileId, ratingId: existingRating.id })).unwrap();
      setStarValue(null);
      setNote('');
      dispatch(
        showActivityNotification({
          message: 'Rating removed.',
          type: ActivityNotificationType.Info,
        }),
      );
    } catch {
      dispatch(
        showActivityNotification({
          message: 'Failed to remove rating.',
          type: ActivityNotificationType.Error,
        }),
      );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="body2" color="text.secondary">
        Your rating
      </Typography>
      <Rating
        value={starValue}
        onChange={(_, newValue) => setStarValue(newValue)}
        size="large"
      />
      <TextField
        label="Notes (optional)"
        multiline
        minRows={2}
        maxRows={5}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        inputProps={{ maxLength: 1000 }}
        size="small"
        fullWidth
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!starValue}
        >
          Save
        </Button>
        {existingRating && (
          <Tooltip title="Remove rating">
            <IconButton size="small" onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};
