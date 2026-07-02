import { Fragment, useCallback, useEffect, useState } from 'react';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';

import { useAppSelector } from '../../../app/hooks';
import { UnratedContentItem, selectRatings, selectUnratedContent } from '../../../app/slices/ratingsSlice';
import { ContentRatingWidget } from './contentRatingWidget';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

interface BulkRatingDialogProps {
  profileId: number;
  open: boolean;
  onClose: () => void;
}

const keyFor = (item: Pick<UnratedContentItem, 'contentType' | 'contentId'>) => `${item.contentType}-${item.contentId}`;

export const BulkRatingDialog = ({ profileId, open, onClose }: BulkRatingDialogProps) => {
  const unratedContent = useAppSelector(selectUnratedContent);
  const ratings = useAppSelector(selectRatings);
  const [queue, setQueue] = useState<UnratedContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (open) {
      setQueue(unratedContent);
      setCurrentIndex(0);
      setIsDirty(false);
      setPendingAction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const current = queue[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === queue.length - 1;

  const ratedKeys = new Set(ratings.map((r) => `${r.contentType}-${r.contentId}`));
  const ratedCount = queue.filter((item) => ratedKeys.has(keyFor(item))).length;
  const allRated = queue.length > 0 && ratedCount === queue.length;

  const handleDirtyChange = useCallback((dirty: boolean) => setIsDirty(dirty), []);

  const requestNavigation = (action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action);
      return;
    }
    action();
  };

  const goTo = (index: number) => setCurrentIndex(Math.max(0, Math.min(queue.length - 1, index)));

  const handleDiscardConfirm = () => {
    const action = pendingAction;
    setPendingAction(null);
    setIsDirty(false);
    action?.();
  };

  return (
    <Fragment>
      <Dialog open={open} onClose={() => requestNavigation(onClose)} maxWidth="xs" fullWidth>
        <DialogTitle>Rate Your Library</DialogTitle>
        <DialogContent>
          {current ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                component="img"
                src={buildTMDBImagePath(current.posterImage)}
                alt={current.contentTitle}
                sx={{
                  width: 120,
                  height: 180,
                  objectFit: 'cover',
                  borderRadius: 1,
                  alignSelf: 'center',
                }}
              />
              <Typography variant="h6" align="center">
                {current.contentTitle}
              </Typography>
              <ContentRatingWidget
                key={keyFor(current)}
                profileId={profileId}
                contentType={current.contentType}
                contentId={current.contentId}
                contentTitle={current.contentTitle}
                posterImage={current.posterImage}
                autoSaveRating
                onDirtyChange={handleDirtyChange}
              />
              <Typography variant="caption" color="text.secondary" align="center">
                {currentIndex + 1} of {queue.length}
              </Typography>
              {isLast &&
                (allRated ? (
                  <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />}>
                    All done! Every item in this batch is rated.
                  </Alert>
                ) : (
                  <Alert severity="info">
                    You've reached the end — {queue.length - ratedCount} item
                    {queue.length - ratedCount === 1 ? '' : 's'} still unrated. Go back to rate them, or close for now.
                  </Alert>
                ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 3 }}>
              <CheckCircleIcon color="success" fontSize="large" />
              <Typography variant="body1">Nothing to rate! Your watched library is already fully rated.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
          <Box>
            {current && (
              <>
                <IconButton onClick={() => requestNavigation(() => goTo(0))} disabled={isFirst} aria-label="First">
                  <FirstPageIcon />
                </IconButton>
                <IconButton
                  onClick={() => requestNavigation(() => goTo(currentIndex - 1))}
                  disabled={isFirst}
                  aria-label="Back"
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </>
            )}
          </Box>
          <Button onClick={() => requestNavigation(onClose)} variant={current ? 'text' : 'contained'}>
            Close
          </Button>
          <Box>
            {current && (
              <>
                <IconButton
                  onClick={() => requestNavigation(() => goTo(currentIndex + 1))}
                  disabled={isLast}
                  aria-label="Next"
                >
                  <NavigateNextIcon />
                </IconButton>
                <IconButton
                  onClick={() => requestNavigation(() => goTo(queue.length - 1))}
                  disabled={isLast}
                  aria-label="Last"
                >
                  <LastPageIcon />
                </IconButton>
              </>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog open={pendingAction !== null} onClose={() => setPendingAction(null)} maxWidth="xs">
        <DialogTitle>Discard unsaved note?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have an unsaved note for {current?.contentTitle}. Leaving now will discard it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button onClick={handleDiscardConfirm} color="error">
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};
