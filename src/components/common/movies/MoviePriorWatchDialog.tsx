import { useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';

type WatchChoice = 'now' | 'prior';

interface MoviePriorWatchDialogProps {
  open: boolean;
  movieTitle: string;
  releaseDate: string;
  onJustWatched: () => void;
  onPriorWatch: (watchedAt: string) => void;
  onClose: () => void;
}

const MoviePriorWatchDialog = ({
  open,
  movieTitle,
  releaseDate,
  onJustWatched,
  onPriorWatch,
  onClose,
}: MoviePriorWatchDialogProps) => {
  const [choice, setChoice] = useState<WatchChoice>('now');
  const [watchedAt, setWatchedAt] = useState<string>(releaseDate);

  const today = new Date().toISOString().split('T')[0];
  const isUsingReleaseDate = watchedAt === releaseDate;

  const handleConfirm = () => {
    if (choice === 'prior') {
      onPriorWatch(watchedAt);
    } else {
      onJustWatched();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Have you seen {movieTitle} before?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Let us know your watch history so your statistics stay accurate.
        </DialogContentText>
        <RadioGroup value={choice} onChange={(e) => setChoice(e.target.value as WatchChoice)}>
          <FormControlLabel value="now" control={<Radio />} label="I just watched it" />
          <FormControlLabel
            value="prior"
            control={<Radio />}
            label="I've seen it before (prior watch)"
          />
        </RadioGroup>
        {choice === 'prior' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="When did you watch it?"
              type="date"
              value={watchedAt}
              onChange={(e) => setWatchedAt(e.target.value)}
              inputProps={{ max: today }}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Release date: {releaseDate}
              {!isUsingReleaseDate && (
                <>
                  {' · '}
                  <Link
                    component="button"
                    variant="caption"
                    onClick={() => setWatchedAt(releaseDate)}
                    underline="hover"
                  >
                    Use release date
                  </Link>
                </>
              )}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoviePriorWatchDialog;
