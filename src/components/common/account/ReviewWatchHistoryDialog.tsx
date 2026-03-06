import HistoryIcon from '@mui/icons-material/History';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import ReviewWatchHistoryPanel from './ReviewWatchHistoryPanel';

interface ReviewWatchHistoryDialogProps {
  open: boolean;
  profileName: string;
  profileId: number;
  onClose: () => void;
}

const ReviewWatchHistoryDialog = ({ open, profileName, profileId, onClose }: ReviewWatchHistoryDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon color="primary" fontSize="small" />
        Review Watch History — {profileName}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ ml: 'auto' }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <ReviewWatchHistoryPanel profileId={profileId} />
      </DialogContent>
    </Dialog>
  );
};

export default ReviewWatchHistoryDialog;
