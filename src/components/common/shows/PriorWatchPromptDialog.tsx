import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from '@mui/material';
import { ProfileSeason } from '@ajgifford/keepwatching-types';

type WatchHistoryChoice = 'fresh' | 'all' | 'through';

interface PriorWatchPromptDialogProps {
  open: boolean;
  showTitle: string;
  completedSeasons: ProfileSeason[];
  onClose: () => void;
  onStartingFresh: () => void;
  onWatchedAll: () => void;
  onWatchedThrough: (seasonNumber: number) => void;
}

const PriorWatchPromptDialog = ({
  open,
  showTitle,
  completedSeasons,
  onClose,
  onStartingFresh,
  onWatchedAll,
  onWatchedThrough,
}: PriorWatchPromptDialogProps) => {
  const [choice, setChoice] = useState<WatchHistoryChoice>('fresh');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(
    completedSeasons.length > 0 ? completedSeasons[completedSeasons.length - 1].seasonNumber : 1
  );

  const handleConfirm = () => {
    if (choice === 'fresh') {
      onStartingFresh();
    } else if (choice === 'all') {
      onWatchedAll();
    } else {
      onWatchedThrough(selectedSeasonNumber);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Have you watched {showTitle} before?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {showTitle} has completed seasons available. Let us know your watch history so your
          statistics stay accurate.
        </DialogContentText>
        <RadioGroup value={choice} onChange={(e) => setChoice(e.target.value as WatchHistoryChoice)}>
          <FormControlLabel
            value="fresh"
            control={<Radio />}
            label="Starting fresh — I haven't watched it"
          />
          <FormControlLabel
            value="all"
            control={<Radio />}
            label="I've watched everything up to the current season"
          />
          <FormControlLabel
            value="through"
            control={<Radio />}
            label="I've watched through a specific season"
          />
        </RadioGroup>
        {choice === 'through' && completedSeasons.length > 0 && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Select
              value={selectedSeasonNumber}
              onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
            >
              {completedSeasons.map((season) => (
                <MenuItem key={season.id} value={season.seasonNumber}>
                  {season.name || `Season ${season.seasonNumber}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Skip
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PriorWatchPromptDialog;
