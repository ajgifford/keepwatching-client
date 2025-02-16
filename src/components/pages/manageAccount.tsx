import { useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Profile } from '../../app/model/profile';
import { selectCurrentAccount, updateAccount, updateAccountImage, verifyEmail } from '../../app/slices/accountSlice';
import { selectActiveProfile, selectLastUpdated, setActiveProfile } from '../../app/slices/activeProfileSlice';
import {
  addProfile,
  deleteProfile,
  editProfile,
  selectAllProfiles,
  selectProfileById,
} from '../../app/slices/profilesSlice';
import NameEditDialog from '../common/nameEditDialog';
import { ProfileCard } from '../common/profileCard';
import { getAuth } from 'firebase/auth';

const ManageAccount = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount)!;
  const profiles = useAppSelector(selectAllProfiles);
  const activeProfile = useAppSelector(selectActiveProfile)!;
  const lastUpdated = useAppSelector(selectLastUpdated);
  const defaultProfile = useAppSelector((state) => selectProfileById(state, account.default_profile_id));

  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState<boolean>(false);
  const [managedProfile, setManagedProfile] = useState<Profile | null>();
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [onSaveCallback, setOnSaveCallback] = useState<(name: string) => void>(() => () => {});

  const auth = getAuth();
  const user = auth.currentUser;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddProfileButton = () => {
    openNameDialog('Add Profile', '', async (newName) => {
      await dispatch(addProfile({ accountId: account.id, newProfileName: newName }));
    });
  };

  const handleDeleteProfileButton = (profile: Profile) => {
    setManagedProfile(profile);
    setDeleteProfileDialogOpen(true);
  };

  const handleCloseDeleteProfileDialog = () => {
    setDeleteProfileDialogOpen(false);
  };

  const handleEditProfileButton = (profile: Profile) => {
    openNameDialog('Edit Profile', profile.name, (newName) => {
      dispatch(editProfile({ accountId: account.id, id: profile.id, name: newName }));
    });
  };

  const handleEditAccountName = () => {
    openNameDialog('Edit Account Name', account.name, (newName) => {
      dispatch(
        updateAccount({
          account_id: account.id,
          account_name: newName,
          default_profile_id: account.default_profile_id,
        }),
      );
    });
  };

  const openNameDialog = (title: string, initialName: string, onSave: (name: string) => void) => {
    setDialogTitle(title);
    setCurrentName(initialName);
    setOnSaveCallback(() => onSave);
    setNameDialogOpen(true);
  };

  async function handleConfirmDeleteProfile() {
    if (managedProfile) {
      setDeleteProfileDialogOpen(false);
      await dispatch(deleteProfile({ accountId: account.id, profileId: managedProfile.id }));
      setManagedProfile(null);
    }
  }

  async function handleSetDefaultProfile(profile: Profile) {
    await dispatch(
      updateAccount({
        account_id: account.id,
        account_name: account.name,
        default_profile_id: profile.id,
      }),
    );
  }

  async function handlSetActiveProfile(profile: Profile) {
    await dispatch(setActiveProfile({ accountId: account.id, profileId: profile.id }));
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }
    const file = files[0];
    dispatch(updateAccountImage({ accountId: account.id, file }));
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleVerifyEmail = async () => {
    if (user) {
      dispatch(verifyEmail(user));
    }
  };

  return (
    <>
      <Grid container spacing={2} alignItems="center" justifyContent={{ xs: 'center', md: 'left' }}>
        <Grid>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              width: { sm: '95%', md: '100%' },
              maxWidth: 455,
              height: 'auto',
              mx: 'auto',
              borderRadius: 2,
              cursor: 'pointer',
              overflow: 'hidden',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleImageClick}
          >
            <Box
              crossOrigin="anonymous"
              component="img"
              src={account.image}
              alt={account.name}
              referrerPolicy="no-referrer"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
            {isHovered && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderRadius: 2,
                  pointerEvents: 'none',
                }}
              >
                Upload Image
              </Box>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </Box>
        </Grid>

        <Grid
          direction="column"
          sx={{
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ mb: '5px', display: 'flex', alignItems: 'center', gap: 1 }}>
            {account.name}
            <IconButton size="small" onClick={handleEditAccountName} color="primary">
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Typography>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Email: {account.email}{' '}
            <Button
              color="primary"
              size="small"
              variant="text"
              disabled={user?.emailVerified}
              onClick={handleVerifyEmail}
            >
              {user?.emailVerified ? '(Email Verified)' : '(Verify Email)'}
            </Button>
          </Typography>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Default Profile: {defaultProfile.name}
          </Typography>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Active Profile: {activeProfile.name}
          </Typography>
          {lastUpdated && (
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Last Updated: {lastUpdated}
            </Typography>
          )}
        </Grid>
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
        <Stack
          spacing={{ xs: 1, sm: 2 }}
          direction={{ xs: 'column', sm: 'row' }}
          useFlexGap
          sx={{ flexWrap: 'wrap', p: 2, justifyContent: { xs: 'center', md: 'left' } }}
        >
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              handleEdit={handleEditProfileButton}
              handleDelete={handleDeleteProfileButton}
              handleSetDefault={handleSetDefaultProfile}
              handleSetActive={handlSetActiveProfile}
            />
          ))}
        </Stack>
      </Box>
      <NameEditDialog
        open={nameDialogOpen}
        title={dialogTitle}
        initialName={currentName}
        onClose={() => setNameDialogOpen(false)}
        onSave={onSaveCallback}
      />
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
          <Button onClick={handleCloseDeleteProfileDialog} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteProfile} variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageAccount;
