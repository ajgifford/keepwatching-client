import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export interface TwoChoiceDialogProps {
  open: boolean;
  title: string;
  body: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  onClose: () => void;
  primaryColor?: ButtonProps['color'];
  secondaryColor?: ButtonProps['color'];
}

/**
 * Shared two-choice confirmation dialog: title, explanatory body, and two full-width
 * stacked buttons. Used wherever the user must pick between two mutually-exclusive
 * outcomes (e.g. keep vs. remove watch history) rather than a simple yes/no confirm.
 */
export const TwoChoiceDialog = ({
  open,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
  primaryColor = 'primary',
  secondaryColor = 'primary',
}: TwoChoiceDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{body}</DialogContentText>
      </DialogContent>
      <DialogActions disableSpacing sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, pb: 2, px: 3 }}>
        <Button onClick={onPrimary} variant="contained" color={primaryColor} fullWidth>
          {primaryLabel}
        </Button>
        <Button onClick={onSecondary} variant="outlined" color={secondaryColor} fullWidth>
          {secondaryLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TwoChoiceDialog;
