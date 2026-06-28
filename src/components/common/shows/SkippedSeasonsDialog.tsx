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
  triggerLabel?: string;
  onMarkAll: () => void;
  onMarkSkipped: () => void;
  onMarkJustThis: () => void;
  onClose: () => void;
}

const SkippedSeasonsDialog = ({
  open,
  skippedSeasons,
  targetSeason,
  triggerLabel,
  onMarkAll,
  onMarkSkipped,
  onMarkJustThis,
  onClose,
}: SkippedSeasonsDialogProps) => {
  if (!targetSeason && !triggerLabel) return null;

  const description = triggerLabel ?? `${targetSeason?.name} as watched`;
  const justThisLabel = targetSeason ? `No, just ${targetSeason.name}` : 'No, continue anyway';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Earlier seasons aren't marked as watched</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You marked <strong>{description}</strong>, but the following earlier{' '}
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
          What would you like to do with {skippedSeasons.length === 1 ? 'it' : 'them'}?
        </DialogContentText>
      </DialogContent>
      <DialogActions disableSpacing sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, pb: 2, px: 3 }}>
        <Button onClick={onMarkAll} variant="contained" color="primary" fullWidth>
          Mark as previously watched
        </Button>
        <Button onClick={onMarkSkipped} variant="outlined" color="primary" fullWidth>
          Mark as skipped
        </Button>
        <Button onClick={onMarkJustThis} variant="outlined" color="primary" fullWidth>
          {justThisLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkippedSeasonsDialog;
