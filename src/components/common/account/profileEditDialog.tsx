import { useEffect, useState } from 'react';

import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { Profile } from '@ajgifford/keepwatching-types';

export const ACCENT_SWATCHES = [
  { label: 'Blue', hex: '#1976d2' },
  { label: 'Purple', hex: '#7b1fa2' },
  { label: 'Green', hex: '#388e3c' },
  { label: 'Teal', hex: '#00796b' },
  { label: 'Orange', hex: '#f57c00' },
  { label: 'Red', hex: '#d32f2f' },
  { label: 'Pink', hex: '#c2185b' },
  { label: 'Indigo', hex: '#303f9f' },
  { label: 'Brown', hex: '#5d4037' },
] as const;

interface ProfileEditDialogProps {
  open: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (name: string, accentColor: string | null) => void;
}

const ProfileEditDialog = ({ open, profile, onClose, onSave }: ProfileEditDialogProps) => {
  const [name, setName] = useState(profile.name);
  const [accentColor, setAccentColor] = useState<string | null>(profile.accentColor ?? null);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setAccentColor(profile.accentColor ?? null);
    }
  }, [open, profile.name, profile.accentColor]);

  const handleSave = () => {
    onSave(name, accentColor);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          margin="dense"
          label="Name"
          fullWidth
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Accent color
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Tooltip title="None" placement="top">
              <Box
                component="button"
                onClick={() => setAccentColor(null)}
                aria-label="No accent color"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: accentColor === null ? 'text.primary' : 'divider',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                  p: 0,
                }}
              >
                <BlockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Box>
            </Tooltip>
            {ACCENT_SWATCHES.map(({ label, hex }) => (
              <Tooltip key={hex} title={label} placement="top">
                <Box
                  component="button"
                  onClick={() => setAccentColor(hex)}
                  aria-label={`${label} accent`}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: accentColor === hex ? 'text.primary' : 'transparent',
                    cursor: 'pointer',
                    bgcolor: hex,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0,
                  }}
                >
                  {accentColor === hex && <CheckIcon sx={{ fontSize: 18, color: '#fff' }} />}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={!name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditDialog;
