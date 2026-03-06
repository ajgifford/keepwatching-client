import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import { Alert, AlertTitle, Box, Button, Stack, Typography } from '@mui/material';

interface BulkMarkBannerProps {
  onFix: () => void;
  onDismiss: () => void;
}

const BulkMarkBanner = ({ onFix, onDismiss }: BulkMarkBannerProps) => {
  return (
    <Alert
      severity="info"
      icon={<HistoryIcon />}
      sx={{ mb: 2 }}
      action={
        <Button color="inherit" size="small" onClick={onDismiss} startIcon={<CloseIcon />}>
          Dismiss
        </Button>
      }
    >
      <AlertTitle>Improve your watch history accuracy</AlertTitle>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">
          It looks like many episodes of this show were marked as watched on the same day. If you watched this show
          before joining KeepWatching, you can use the original air dates for more accurate statistics.
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" color="info" startIcon={<AutoFixHighIcon />} onClick={onFix}>
          Fix watch dates
        </Button>
      </Stack>
    </Alert>
  );
};

export default BulkMarkBanner;
