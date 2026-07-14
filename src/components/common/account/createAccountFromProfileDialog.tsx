import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { Profile } from '@ajgifford/keepwatching-types';
import { validate } from 'email-validator';

interface CreateAccountFromProfileDialogProps {
  open: boolean;
  profile: Profile;
  isCurrentDefault: boolean;
  otherProfiles: Profile[];
  onClose: () => void;
  onSubmit: (targetEmail: string, targetName: string | undefined, newDefaultProfileId: number | undefined) => void;
}

const CreateAccountFromProfileDialog = ({
  open,
  profile,
  isCurrentDefault,
  otherProfiles,
  onClose,
  onSubmit,
}: CreateAccountFromProfileDialogProps) => {
  const [targetEmail, setTargetEmail] = useState('');
  const [targetName, setTargetName] = useState('');
  const [newDefaultProfileId, setNewDefaultProfileId] = useState<number | ''>('');

  useEffect(() => {
    if (open) {
      setTargetEmail('');
      setTargetName('');
      setNewDefaultProfileId('');
    }
  }, [open]);

  const emailHasError = targetEmail !== '' && !validate(targetEmail);
  const canSubmit = validate(targetEmail) && (!isCurrentDefault || newDefaultProfileId !== '');

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(
      targetEmail,
      targetName.trim() || undefined,
      isCurrentDefault ? (newDefaultProfileId as number) : undefined
    );
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Create Independent Account - {profile.name}
        </Typography>
        <DialogContentText sx={{ mb: 2 }}>
          This sends an invitation to claim &quot;{profile.name}&quot; as a brand-new, independent account. Watch
          history, ratings, watchlist, and badges move with it once claimed. Preferences and notifications reset for the
          new account. Nothing moves until the invitation is accepted.
        </DialogContentText>
        <TextField
          autoFocus
          required
          fullWidth
          margin="dense"
          label="New Owner's Email"
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
          error={emailHasError}
          helperText={emailHasError ? 'Invalid email format' : ''}
        />
        <TextField
          fullWidth
          margin="dense"
          label="New Owner's Name (optional)"
          value={targetName}
          onChange={(e) => setTargetName(e.target.value)}
        />
        {isCurrentDefault && (
          <TextField
            select
            required
            fullWidth
            margin="dense"
            label="This profile is the account default — choose a new default"
            value={newDefaultProfileId}
            onChange={(e) => setNewDefaultProfileId(Number(e.target.value))}
            helperText="Required since this profile is currently the account's default"
          >
            {otherProfiles.map((otherProfile) => (
              <MenuItem key={otherProfile.id} value={otherProfile.id}>
                {otherProfile.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!canSubmit}>
          Send Invitation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAccountFromProfileDialog;
