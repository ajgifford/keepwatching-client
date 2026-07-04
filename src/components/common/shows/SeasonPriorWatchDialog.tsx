import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

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
      <DialogTitle>What did you do with {seasonName}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          "Previously watched" logs each episode using its original air date instead of today. Episodes that aired
          before you joined are marked watched only; episodes that aired after are backdated but treated like any other
          watch.
        </DialogContentText>
      </DialogContent>
      <DialogActions disableSpacing sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, pb: 2, px: 3 }}>
        <Button onClick={onWatchedWhenAired} variant="contained" color="primary" fullWidth>
          Previously watched (use air dates)
        </Button>
        <Button onClick={onWatchedNow} variant="outlined" fullWidth>
          I just watched it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeasonPriorWatchDialog;
