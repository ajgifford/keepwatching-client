import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCurrentAccount } from '../../../app/slices/accountSlice';
import { selectPreferences, updateEmailPreferences, updatePreferences } from '../../../app/slices/preferencesSlice';
import { DisplayPreferences } from '@ajgifford/keepwatching-types';
import { getAuth } from 'firebase/auth';

interface PreferencesDialogProps {
  open: boolean;
  onClose: () => void;
}

const PreferencesDialog = ({ open, onClose }: PreferencesDialogProps) => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);
  const preferences = useAppSelector(selectPreferences);
  const displayPreferences = preferences.display as DisplayPreferences;

  const auth = getAuth();
  const user = auth.currentUser;

  // Local state for preferences (not saved until user clicks Save)
  const [localTheme, setLocalTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [localWeeklyDigest, setLocalWeeklyDigest] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalTheme(displayPreferences?.theme || 'auto');
      setLocalWeeklyDigest(preferences.email?.weeklyDigest ?? true);
    }
  }, [open, displayPreferences?.theme, preferences.email?.weeklyDigest]);

  const handleSave = async () => {
    if (!account) return;

    setIsSaving(true);
    try {
      // Save theme preference
      await dispatch(
        updatePreferences({
          accountId: account.id,
          preferenceType: 'display',
          updates: {
            theme: localTheme,
          },
        })
      );

      // Save email preferences
      await dispatch(
        updateEmailPreferences({
          accountId: account.id,
          emailPreferences: {
            weeklyDigest: localWeeklyDigest,
          },
        })
      );

      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset local state to current preferences
    setLocalTheme(displayPreferences?.theme || 'auto');
    setLocalWeeklyDigest(preferences.email?.weeklyDigest ?? true);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Preferences</DialogTitle>
      <DialogContent dividers>
        {/* Theme Preference */}
        <FormControl component="fieldset" sx={{ mt: 1, mb: 3 }}>
          <FormLabel component="legend" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Theme Preference
          </FormLabel>
          <RadioGroup
            row
            value={localTheme}
            onChange={(e) => setLocalTheme(e.target.value as 'light' | 'dark' | 'auto')}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              value="light"
              control={<Radio color="primary" />}
              label="Light"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: 'primary.main',
                },
              }}
            />
            <FormControlLabel
              value="dark"
              control={<Radio color="primary" />}
              label="Dark"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: 'primary.main',
                },
              }}
            />
            <FormControlLabel
              value="auto"
              control={<Radio color="primary" />}
              label="Auto"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: 'primary.main',
                },
              }}
            />
          </RadioGroup>
        </FormControl>

        {/* Email Preferences */}
        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 500 }}>
          Email Preferences
        </Typography>
        <FormControlLabel
          disabled={!user?.emailVerified}
          control={
            <Switch
              checked={localWeeklyDigest}
              onChange={(e) => setLocalWeeklyDigest(e.target.checked)}
              color="primary"
            />
          }
          label="Receive weekly digest emails"
          sx={{
            ml: 2,
            '& .MuiFormControlLabel-label': {
              color: 'primary.main',
              fontWeight: 500,
            },
          }}
        />
        {!user?.emailVerified && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'block', mt: 1 }}>
            Email must be verified to enable email preferences
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="outlined" disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreferencesDialog;
