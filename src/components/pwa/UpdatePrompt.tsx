import { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton, Snackbar, SnackbarContent } from '@mui/material';

type UpdateSW = (reloadPage?: boolean) => Promise<void>;

const UpdatePrompt = () => {
  const [open, setOpen] = useState(false);
  const [updateSW, setUpdateSW] = useState<UpdateSW | null>(null);

  useEffect(() => {
    const handleUpdateAvailable = (event: Event) => {
      const customEvent = event as CustomEvent<{ updateSW: UpdateSW }>;
      setUpdateSW(() => customEvent.detail.updateSW);
      setOpen(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    return () => window.removeEventListener('sw-update-available', handleUpdateAvailable);
  }, []);

  const handleUpdate = async () => {
    setOpen(false);
    if (updateSW) {
      await updateSW(true);
    }
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={null}
    >
      <SnackbarContent
        message="A new version of KeepWatching is available."
        action={
          <>
            <Button color="primary" size="small" variant="contained" onClick={handleUpdate}>
              Update
            </Button>
            <IconButton size="small" color="inherit" onClick={handleDismiss} sx={{ ml: 1 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </Snackbar>
  );
};

export default UpdatePrompt;
