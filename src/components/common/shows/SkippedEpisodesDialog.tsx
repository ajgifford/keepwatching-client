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

import { ProfileEpisode } from '@ajgifford/keepwatching-types';

interface SkippedEpisodesDialogProps {
  open: boolean;
  skippedEpisodes: ProfileEpisode[];
  targetEpisode: ProfileEpisode | null;
  onMarkAll: () => void;
  onMarkJustThis: () => void;
  onClose: () => void;
}

const SkippedEpisodesDialog = ({
  open,
  skippedEpisodes,
  targetEpisode,
  onMarkAll,
  onMarkJustThis,
  onClose,
}: SkippedEpisodesDialogProps) => {
  if (!targetEpisode) return null;

  const episodeLabel = (ep: ProfileEpisode) =>
    `S${ep.seasonNumber} E${ep.episodeNumber}${ep.title ? ` – ${ep.title}` : ''}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Earlier episodes aren't marked as watched</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You're marking <strong>{episodeLabel(targetEpisode)}</strong> as watched, but the following earlier{' '}
          {skippedEpisodes.length === 1 ? 'episode has' : 'episodes have'} not been watched yet:
        </DialogContentText>
        <List dense disablePadding sx={{ mt: 1 }}>
          {skippedEpisodes.map((ep) => (
            <ListItem key={ep.id} disableGutters>
              <ListItemText primary={episodeLabel(ep)} />
            </ListItem>
          ))}
        </List>
        <DialogContentText sx={{ mt: 1 }}>
          Would you like to mark {skippedEpisodes.length === 1 ? 'it' : 'them'} as watched too?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, pb: 2, px: 3 }}>
        <Button onClick={onMarkAll} variant="contained" color="primary" fullWidth>
          Yes, mark all as watched
        </Button>
        <Button onClick={onMarkJustThis} variant="outlined" fullWidth>
          No, just mark this episode
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkippedEpisodesDialog;
