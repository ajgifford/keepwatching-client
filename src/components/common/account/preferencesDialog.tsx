import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCurrentAccount } from '../../../app/slices/accountSlice';
import { selectPreferences, updateEmailPreferences, updatePreferences } from '../../../app/slices/preferencesSlice';
import { DisplayPreferences } from '@ajgifford/keepwatching-types';
import { createDateFormatters } from '@ajgifford/keepwatching-ui';
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
  const [localDateFormat, setLocalDateFormat] = useState<'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'>('MM/DD/YYYY');
  const [localRelativeDate, setLocalRelativeDate] = useState<'relative-recent' | 'always-relative' | 'always-absolute'>('relative-recent');
  const [localTimeFormat, setLocalTimeFormat] = useState<'12h' | '24h'>('12h');
  const [localWeeklyDigest, setLocalWeeklyDigest] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalTheme(displayPreferences?.theme || 'auto');
      setLocalDateFormat(displayPreferences?.dateFormat || 'MM/DD/YYYY');
      setLocalRelativeDate(displayPreferences?.relativeDate || 'relative-recent');
      setLocalTimeFormat(displayPreferences?.timeFormat || '12h');
      setLocalWeeklyDigest(preferences.email?.weeklyDigest ?? true);
    }
  }, [open, displayPreferences, preferences.email?.weeklyDigest]);

  const previewFormatters = useMemo(
    () => createDateFormatters({ dateFormat: localDateFormat, relativeDate: localRelativeDate, timeFormat: localTimeFormat }),
    [localDateFormat, localRelativeDate, localTimeFormat]
  );

  const previewDate = '2024-07-04';

  const handleSave = async () => {
    if (!account) return;

    setIsSaving(true);
    try {
      // Save display preferences
      await dispatch(
        updatePreferences({
          accountId: account.id,
          preferenceType: 'display',
          updates: {
            theme: localTheme,
            dateFormat: localDateFormat,
            relativeDate: localRelativeDate,
            timeFormat: localTimeFormat,
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
    setLocalDateFormat(displayPreferences?.dateFormat || 'MM/DD/YYYY');
    setLocalRelativeDate(displayPreferences?.relativeDate || 'relative-recent');
    setLocalTimeFormat(displayPreferences?.timeFormat || '12h');
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

        <Divider sx={{ my: 2 }} />

        {/* Date Format */}
        <FormControl component="fieldset" sx={{ mb: 3 }} fullWidth>
          <FormLabel component="legend" sx={{ color: 'primary.main', fontWeight: 500, mb: 1 }}>
            Date Format
          </FormLabel>
          <Select
            size="small"
            value={localDateFormat}
            onChange={(e) => setLocalDateFormat(e.target.value as typeof localDateFormat)}
            sx={{ maxWidth: 200 }}
          >
            <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
            <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
            <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
          </Select>
        </FormControl>

        {/* Relative Date Display */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Date Display
          </FormLabel>
          <RadioGroup
            value={localRelativeDate}
            onChange={(e) => setLocalRelativeDate(e.target.value as typeof localRelativeDate)}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              value="relative-recent"
              control={<Radio color="primary" />}
              label="Relative for recent dates (e.g. 3 days ago)"
              sx={{ '& .MuiFormControlLabel-label': { color: 'primary.main' } }}
            />
            <FormControlLabel
              value="always-relative"
              control={<Radio color="primary" />}
              label="Always relative"
              sx={{ '& .MuiFormControlLabel-label': { color: 'primary.main' } }}
            />
            <FormControlLabel
              value="always-absolute"
              control={<Radio color="primary" />}
              label="Always absolute (use date format)"
              sx={{ '& .MuiFormControlLabel-label': { color: 'primary.main' } }}
            />
          </RadioGroup>
        </FormControl>

        {/* Time Format */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Time Format
          </FormLabel>
          <RadioGroup
            row
            value={localTimeFormat}
            onChange={(e) => setLocalTimeFormat(e.target.value as typeof localTimeFormat)}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              value="12h"
              control={<Radio color="primary" />}
              label="12-hour (2:30 PM)"
              sx={{ '& .MuiFormControlLabel-label': { color: 'primary.main' } }}
            />
            <FormControlLabel
              value="24h"
              control={<Radio color="primary" />}
              label="24-hour (14:30)"
              sx={{ '& .MuiFormControlLabel-label': { color: 'primary.main' } }}
            />
          </RadioGroup>
        </FormControl>

        {/* Live Preview */}
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
            Preview (July 4, 2024)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Content date: <strong>{previewFormatters.contentDate(previewDate)}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Milestone date: <strong>{previewFormatters.milestoneDate(previewDate)}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date & time: <strong>{previewFormatters.dateTime(new Date(2024, 6, 4, 14, 30))}</strong>
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

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
