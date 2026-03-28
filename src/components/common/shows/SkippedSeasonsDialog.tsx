import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

import { ProfileSeason } from '@ajgifford/keepwatching-types';

interface SkippedSeasonsDialogProps {
  open: boolean;
  skippedSeasons: ProfileSeason[];
  targetSeason: ProfileSeason | null;
  onMarkAll: () => void;
  onMarkJustThis: () => void;
  onClose: () => void;
}

const SkippedSeasonsDialog = ({
  open,
  skippedSeasons,
  targetSeason,
  onMarkAll,
  onMarkJustThis,
  onClose,
}: SkippedSeasonsDialogProps) => {
  if (!targetSeason) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Earlier seasons aren't marked as watched</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You marked <strong>{targetSeason.name}</strong> as previously watched, but the following earlier{' '}
          {skippedSeasons.length === 1 ? 'season has' : 'seasons have'} not been watched yet:
        </DialogContentText>
        <List dense disablePadding sx={{ mt: 1 }}>
          {skippedSeasons.map((season) => (
            <ListItem key={season.id} disableGutters>
              <ListItemText primary={season.name} />
            </ListItem>
          ))}
        </List>
        <DialogContentText sx={{ mt: 1 }}>
          Would you like to mark {skippedSeasons.length === 1 ? 'it' : 'them'} as previously watched too?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, pb: 2, px: 3 }}>
        <Button onClick={onMarkAll} variant="contained" color="primary" fullWidth>
          Yes, mark all as previously watched
        </Button>
        <Button onClick={onMarkJustThis} variant="outlined" fullWidth>
          No, just {targetSeason.name}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkippedSeasonsDialog;
