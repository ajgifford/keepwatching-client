import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface SeasonPriorWatchDialogProps {
  open: boolean;
  seasonName: string;
  onClose: () => void;
  onWatchedWhenAired: () => void;
  onWatchedNow: () => void;
}

const SeasonPriorWatchDialog = ({
  open,
  seasonName,
  onClose,
  onWatchedWhenAired,
  onWatchedNow,
}: SeasonPriorWatchDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>When did you watch {seasonName}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This helps keep your statistics accurate. If you watched it before joining, we'll use the
          original air dates instead of today.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, pb: 2, px: 3 }}>
        <Button
          onClick={onWatchedWhenAired}
          variant="contained"
          color="primary"
          fullWidth
        >
          Previously watched (use air dates)
        </Button>
        <Button
          onClick={onWatchedNow}
          variant="outlined"
          fullWidth
        >
          I just watched it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeasonPriorWatchDialog;
