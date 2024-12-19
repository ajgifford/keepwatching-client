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
  const [editedAccount, setEditedAccount] = useState<Account>(account);
  const [saveSnackOpen, setSaveSnackOpen] = useState<boolean>(false);
  const [addProfileDialogOpen, setAddProfileDialogOpen] = useState<boolean>(false);
  const [discardChangesDialogOpen, setDiscardChangesDialogOpen] = useState<boolean>(false);
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState<boolean>(false);
  const [deleteProfile, setDeleteProfile] = useState<Profile>();

  const handleSaveSnackClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSaveSnackOpen(false);
  };

  const handleSaveButton = () => {
    saveAccount();
    setAccount(editedAccount);
    setSaveSnackOpen(true);
  };

  async function saveAccount() {
    try {
      const response = await axios.put('/api/account', editedAccount);
      // get the 'saved' account from the response and update the state
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleAddProfileButton = () => {
    setAddProfileDialogOpen(true);
  };

  const handleCloseAddProfileDialog = () => {
    setAddProfileDialogOpen(false);
  };

  const handleDiscardButton = () => {
    setDiscardChangesDialogOpen(true);
  };

  const handleCloseDiscardDialog = () => {
    setDiscardChangesDialogOpen(false);
  };

  const handleConfirmDiscard = () => {
    setDiscardChangesDialogOpen(false);
    setEditedAccount(account);
  };

  const handleDeleteProfileButton = (profile: Profile) => {
    setDeleteProfile(profile);
    setDeleteProfileDialogOpen(true);
  };

  const handleCloseDeleteProfileDialog = () => {
    setDeleteProfileDialogOpen(false);
  };

  const handleConfirmDeleteProfile = () => {
    if (editedAccount) {
      const filteredProfiles = editedAccount.profiles.filter((profile) => profile !== deleteProfile);
      const updatedAccount: Account = {
        ...editedAccount,
        profiles: filteredProfiles,
      };
      setEditedAccount(updatedAccount);
    }
    setDeleteProfileDialogOpen(false);
  };

  const handleAdProfile = (profileName: string) => {
    if (editedAccount) {
      const updatedProfiles: Profile[] = [...editedAccount.profiles, { name: profileName }];
      const updatedAccount: Account = {
        ...editedAccount,
        profiles: updatedProfiles,
      };
      setEditedAccount(updatedAccount);
    }
  };

  return (
    <>
      {!editedAccount ? (
        <NotLoggedIn />
      ) : (
        <>
          <Grid container spacing={2} alignItems="center">
            <Box
              component="img"
              src={editedAccount.image}
              alt={editedAccount.name}
              sx={{
                borderRadius: 2,
              }}
            />

            <Typography variant="h2" gutterBottom>
              {editedAccount.name}
            </Typography>
          </Grid>

          <Box sx={{ p: 2 }}>
            <Typography variant="h4">Profiles</Typography>
            <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
              {editedAccount.profiles.map((profile) => (
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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 1,
              m: 1,
            }}
          >
            <Button variant="contained" onClick={handleSaveButton}>
              Save
            </Button>
            <Button onClick={handleDiscardButton}>Discard</Button>
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
          Settings saved successfully.
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
        open={discardChangesDialogOpen}
        onClose={handleCloseDiscardDialog}
        aria-labelledby="discard-dialog-title"
        aria-describedby="discard-dialog-description"
      >
        <DialogTitle id="discard-dialog-title">Confirm Discard</DialogTitle>
        <DialogContent>
          <DialogContentText id="discard-dialog-description">
            Are you sure you want to discard your changes? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiscardDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDiscard} color="error" autoFocus>
            Discard
          </Button>
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
            Deleting this profile will also delete all linked shows for this profile.
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
