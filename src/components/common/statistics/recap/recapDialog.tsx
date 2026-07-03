import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { RecapNavigator } from './recapNavigator';
import { RecapPeriodType } from '@ajgifford/keepwatching-types';

interface RecapDialogProps {
  open: boolean;
  accountId: number;
  profileId: number;
  profileName: string;
  profileAccentColor?: string | null;
  initialPeriodType: RecapPeriodType;
  initialYear?: number;
  initialMonth?: number;
  /** Which period types can be browsed from this dialog. Defaults to both (Manage Account's
   * general browsing entry point). The home page banner restricts this to whichever period type
   * it's actively promoting, so the toggle doesn't invite wandering into an unrelated, possibly
   * still-in-progress period. */
  allowedPeriodTypes?: RecapPeriodType[];
  onClose: () => void;
}

export function RecapDialog({
  open,
  accountId,
  profileId,
  profileName,
  profileAccentColor,
  initialPeriodType,
  initialYear,
  initialMonth,
  allowedPeriodTypes,
  onClose,
}: RecapDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{profileName}'s Recap</DialogTitle>
      <DialogContent dividers>
        {open && (
          <RecapNavigator
            accountId={accountId}
            profileId={profileId}
            profileName={profileName}
            profileAccentColor={profileAccentColor}
            initialPeriodType={initialPeriodType}
            initialYear={initialYear}
            initialMonth={initialMonth}
            allowedPeriodTypes={allowedPeriodTypes}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
