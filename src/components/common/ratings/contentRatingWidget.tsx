import React, { useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import Rating from '@mui/material/Rating';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ActivityNotificationType, showActivityNotification } from '../../../app/slices/activityNotificationSlice';
import { deleteRating, selectRatingForContent, upsertRating } from '../../../app/slices/ratingsSlice';
import { RatingContentType } from '@ajgifford/keepwatching-types';

interface ContentRatingWidgetProps {
  profileId: number;
  contentType: RatingContentType;
  contentId: number;
  contentTitle: string;
  posterImage: string;
  /** Persist the star rating immediately on selection instead of waiting for Save. Save remains available for notes. */
  autoSaveRating?: boolean;
  /** Reports whether there are unsaved changes (an unsaved note, or an unsaved rating when autoSaveRating is off). */
  onDirtyChange?: (dirty: boolean) => void;
}

export const ContentRatingWidget = ({
  profileId,
  contentType,
  contentId,
  contentTitle,
  posterImage,
  autoSaveRating = false,
  onDirtyChange,
}: ContentRatingWidgetProps) => {
  const dispatch = useAppDispatch();
  const existingRating = useAppSelector(selectRatingForContent(contentType, contentId));

  const [starValue, setStarValue] = useState<number | null>(existingRating?.rating ?? null);
  const [note, setNote] = useState<string>(existingRating?.note ?? '');

  useEffect(() => {
    setStarValue(existingRating?.rating ?? null);
    setNote(existingRating?.note ?? '');
  }, [existingRating]);

  const isNoteDirty = note !== (existingRating?.note ?? '');
  const isRatingDirty = !autoSaveRating && starValue !== (existingRating?.rating ?? null);

  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(isRatingDirty || isNoteDirty);
    // isRatingDirty/isNoteDirty are derived and can stay the same value across a real state
    // change (e.g. autoSaveRating always makes isRatingDirty false), so depend on the raw
    // state instead to make sure this re-runs whenever starValue/note/existingRating change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starValue, note, existingRating, autoSaveRating, onDirtyChange]);

  const persistRating = async (rating: number, noteValue: string) => {
    try {
      await dispatch(
        upsertRating({
          profileId,
          contentType,
          contentId,
          rating,
          note: noteValue.trim() || null,
          contentTitle,
          posterImage,
        })
      ).unwrap();
      dispatch(
        showActivityNotification({
          message: 'Rating saved!',
          type: ActivityNotificationType.Success,
        })
      );
    } catch {
      dispatch(
        showActivityNotification({
          message: 'Failed to save rating.',
          type: ActivityNotificationType.Error,
        })
      );
    }
  };

  const handleRatingChange = (newValue: number | null) => {
    setStarValue(newValue);
    if (autoSaveRating && newValue) {
      persistRating(newValue, note);
    }
  };

  const handleSave = async () => {
    if (!starValue) return;
    await persistRating(starValue, note);
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
        })
      );
    } catch {
      dispatch(
        showActivityNotification({
          message: 'Failed to remove rating.',
          type: ActivityNotificationType.Error,
        })
      );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
        }}
      >
        Your rating
      </Typography>
      <Rating value={starValue} onChange={(_, newValue) => handleRatingChange(newValue)} size="large" />
      <TextField
        label="Notes (optional)"
        multiline
        minRows={2}
        maxRows={5}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        size="small"
        fullWidth
        slotProps={{
          htmlInput: { maxLength: 1000 },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!starValue || (autoSaveRating && !isNoteDirty)}
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
