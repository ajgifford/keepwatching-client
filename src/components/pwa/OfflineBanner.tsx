import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Alert, Snackbar } from '@mui/material';

import { useOnlineStatus } from '../../app/hooks/useOnlineStatus';

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  return (
    <Snackbar open={!isOnline} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity="warning" icon={<WifiOffIcon />} variant="filled" sx={{ width: '100%' }}>
        You're offline. Some features may be unavailable.
      </Alert>
    </Snackbar>
  );
};

export default OfflineBanner;
