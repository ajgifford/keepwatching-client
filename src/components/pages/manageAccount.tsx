import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Profile } from '../../app/model/profile';
import { selectCurrentAccount } from '../../app/slices/authSlice';
import { addProfile, deleteProfile, editProfile, selectAllProfiles } from '../../app/slices/profilesSlice';

const ManageAccount = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount)!;
  const profiles = useAppSelector(selectAllProfiles);

  const [saveSnackOpen, setSaveSnackOpen] = useState<boolean>(false);
  const [addProfileDialogOpen, setAddProfileDialogOpen] = useState<boolean>(false);
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState<boolean>(false);
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState<boolean>(false);
  const [managedProfile, setManagedProfile] = useState<Profile | null>();
  const [managedProfileName, setManagedProfileName] = useState<string>('');
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
    setManagedProfile(profile);
    setDeleteProfileDialogOpen(true);
  };

  const handleCloseDeleteProfileDialog = () => {
    setDeleteProfileDialogOpen(false);
  };

  const handleEditProfileButton = (profile: Profile) => {
    setManagedProfile(profile);
    setManagedProfileName(profile.name);
    setEditProfileDialogOpen(true);
  };

  const handleCloseEditProfileDialog = () => {
    setEditProfileDialogOpen(false);
  };

  async function handleAddProfile(profileName: string) {
    try {
      await dispatch(addProfile({ accountId: account.id, newProfileName: profileName }));
      setSnackMessage(`Profile ${profileName} added successfully`);
      setSaveSnackOpen(true);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleConfirmDeleteProfile() {
    if (managedProfile) {
      try {
        setDeleteProfileDialogOpen(false);
        await dispatch(deleteProfile({ accountId: account.id, profileId: managedProfile.id }));
        setSnackMessage(`Profile ${managedProfile.name} deleted successfully`);
        setSaveSnackOpen(true);
        setManagedProfile(null);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  async function handleEditProfile(profileName: string) {
    if (managedProfile && managedProfileName) {
      try {
        setEditProfileDialogOpen(false);
        await dispatch(editProfile({ accountId: account.id, id: managedProfile.id, name: profileName }));
        setSnackMessage(`Profile ${profileName} edited successfully`);
        setSaveSnackOpen(true);
        setManagedProfile(null);
        setManagedProfileName('');
      } catch (error) {
        console.error('Error', error);
      }
    }
  }

  interface PropTypes {
    profile: Profile;
  }
  function ProfileCard({ profile }: PropTypes) {
    return (
      <Box id={profile.id} key={profile.id} sx={{ p: 2, border: '1px solid black' }}>
        <Box>
          <Typography variant="h5" color="primary">
            {profile.name}
          </Typography>
        </Box>
        <Box sx={{ py: '1px' }}>
          <Typography variant="body1">
            <i>Shows To Watch:</i> {profile.showsToWatch}
          </Typography>
        </Box>
        <Box sx={{ py: '1px' }}>
          <Typography variant="body1">
            <i>Shows Watching:</i> {profile.showsWatching}
          </Typography>
        </Box>
        <Box sx={{ py: '2px' }}>
          <Typography variant="body1">
            <i>Shows Watched:</i> {profile.showsWatched}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ pt: '8px' }}>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleEditProfileButton(profile)}>
            Edit
          </Button>
          <Button variant="outlined" startIcon={<DeleteIcon />} onClick={() => handleDeleteProfileButton(profile)}>
            Delete
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
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
        <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap sx={{ flexWrap: 'wrap', p: 1 }}>
          <Typography variant="h4">Profiles</Typography>
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
        <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </Stack>
      </Box>
      {/* Notifications Snackbar */}
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
      {/* Add Profile Dialog */}
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
            handleAddProfile(profileName);
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
      {/* Edit Profile Dialog */}
      <Dialog
        open={editProfileDialogOpen}
        onClose={handleCloseEditProfileDialog}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const profileName = formJson.profileName;
            handleEditProfile(profileName);
            handleCloseEditProfileDialog();
          },
        }}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="profileName"
            name="profileName"
            label="Profile"
            value={managedProfileName}
            fullWidth
            variant="standard"
            onChange={(e) => setManagedProfileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditProfileDialog}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Profile Delete Dialog */}
      <Dialog
        open={deleteProfileDialogOpen}
        onClose={handleCloseDeleteProfileDialog}
        aria-labelledby="delete-profile-dialog-title"
        aria-describedby="delete-profile-dialog-description"
      >
        <DialogTitle id="delete-profile-dialog-title">Confirm Profile Deletion - {managedProfile?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-profile-dialog-description">
            Deleting this profile will also delete all watch data for this profile. This action cannot be undone.
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
