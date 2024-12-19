import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  SnackbarCloseReason,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { Account, Profile } from '../../model/account';
import { useAccount } from '../context/accountContext';
import NotLoggedIn from '../login/notLoggedIn';
import axios from 'axios';

const ManageAccount = () => {
  const { account, setAccount } = useAccount();
  const [saveSnackOpen, setSaveSnackOpen] = useState<boolean>(false);
  const [addProfileDialogOpen, setAddProfileDialogOpen] = useState<boolean>(false);
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState<boolean>(false);
  const [deleteProfile, setDeleteProfile] = useState<Profile>();
  const [snackMessage, setSnackMessage] = useState<string>('');

  const handleSaveSnackClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSaveSnackOpen(false);
  };

  const handleAddProfileButton = () => {
    setAddProfileDialogOpen(true);
  };

  const handleCloseAddProfileDialog = () => {
    setAddProfileDialogOpen(false);
  };

  const handleDeleteProfileButton = (profile: Profile) => {
    setDeleteProfile(profile);
    setDeleteProfileDialogOpen(true);
  };

  const handleCloseDeleteProfileDialog = () => {
    setDeleteProfileDialogOpen(false);
  };

  async function handleConfirmDeleteProfile() {
    if (account) {
      try {
        setDeleteProfileDialogOpen(false);
        await axios.delete(`/api/account/${account.id}/profiles/${deleteProfile?.id}`);
        const updatedProfiles = account.profiles.filter((profile) => profile !== deleteProfile);
        const updatedAccount: Account = {
          ...account,
          profiles: updatedProfiles,
        };
        setAccount(updatedAccount);
        setSnackMessage(`Profile ${deleteProfile?.name} deleted successfully`);
        setSaveSnackOpen(true);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  async function handleAdProfile(profileName: string) {
    if (account) {
      try {
        const response = await axios.post(`/api/account/${account.id}/profiles`, { name: profileName });
        const newProfile: Profile = JSON.parse(response.data);
        if (newProfile) {
          const updatedProfiles: Profile[] = [...account.profiles, newProfile];
          const updatedAccount: Account = {
            ...account,
            profiles: updatedProfiles,
          };

          updatedAccount.profiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
          setAccount(updatedAccount);
          setSnackMessage(`Profile ${profileName} added successfully`);
          setSaveSnackOpen(true);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  return (
    <>
      {!account ? (
        <NotLoggedIn />
      ) : (
        <>
          <Grid container spacing={2} alignItems="center">
            <Box
              component="img"
              src={account.image}
              alt={account.name}
              sx={{
                borderRadius: 2,
              }}
            />
            <Typography variant="h2" gutterBottom>
              {account.name}
            </Typography>
          </Grid>
          <Box sx={{ p: 2 }}>
            <Typography variant="h4">Profiles</Typography>
            <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
              {account.profiles.map((profile) => (
                <Chip
                  id={profile.id}
                  key={profile.id}
                  label={profile.name}
                  variant="filled"
                  color="primary"
                  onDelete={() => {
                    handleDeleteProfileButton(profile);
                  }}
                />
              ))}
              <Chip
                id="addProfile"
                key="addProfile"
                label="Add"
                icon={<AddIcon />}
                variant="outlined"
                color="primary"
                onClick={handleAddProfileButton}
              />
            </Stack>
          </Box>
        </>
      )}
      <Snackbar
        open={saveSnackOpen}
        autoHideDuration={5000}
        onClose={handleSaveSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSaveSnackClose} severity="success" variant="filled" sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
      <Dialog
        open={addProfileDialogOpen}
        onClose={handleCloseAddProfileDialog}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const profileName = formJson.profileName;
            handleAdProfile(profileName);
            handleCloseAddProfileDialog();
          },
        }}
      >
        <DialogTitle>Add Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="profileName"
            name="profileName"
            label="Profile"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddProfileDialog}>Cancel</Button>
          <Button type="submit">Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteProfileDialogOpen}
        onClose={handleCloseDeleteProfileDialog}
        aria-labelledby="delete-profile-dialog-title"
        aria-describedby="delete-profile-dialog-description"
      >
        <DialogTitle id="delete-profile-dialog-title">Confirm Profile Deletion - {deleteProfile?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-profile-dialog-description">
            Deleting this profile will also delete all linked shows for this profile. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteProfileDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteProfile} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageAccount;
