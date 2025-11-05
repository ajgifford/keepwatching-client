import { useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  deleteAccount,
  removeAccountImage,
  selectCurrentAccount,
  updateAccount,
  updateAccountImage,
  verifyEmail,
} from '../../app/slices/accountSlice';
import { selectActiveProfile, selectLastUpdated, setActiveProfile } from '../../app/slices/activeProfileSlice';
import {
  addProfile,
  deleteProfile,
  editProfile,
  selectAllProfiles,
  selectProfileById,
} from '../../app/slices/profilesSlice';
import NameEditDialog from '../common/account/nameEditDialog';
import PreferencesDialog from '../common/account/preferencesDialog';
import { ProfileCard } from '../common/account/profileCard';
import AccountStatisticsDialog from '../common/statistics/layouts/accountStatisticsDialog';
import ProfileStatisticsDialog from '../common/statistics/layouts/profileStatisticsDialog';
import { getAccountImageUrl } from '../utility/imageUtils';
import { Profile } from '@ajgifford/keepwatching-types';
import { ErrorComponent } from '@ajgifford/keepwatching-ui';
import { getAuth } from 'firebase/auth';

const ManageAccount = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);
  const profiles = useAppSelector(selectAllProfiles);
  const activeProfile = useAppSelector(selectActiveProfile);
  const lastUpdated = useAppSelector(selectLastUpdated);
  const defaultProfile = useAppSelector((state) =>
    account ? selectProfileById(state, account.defaultProfileId) : null
  );

  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState<boolean>(false);
  const [managedProfile, setManagedProfile] = useState<Profile | null>();
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [nameDialogTitle, setNameDialogTitle] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [onSaveCallback, setOnSaveCallback] = useState<(name: string) => void>(() => () => {});
  const [changingActiveProfile, setChangingActiveProfile] = useState<number | null>(null);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState<boolean>(false);
  const [profileStatsDialogOpen, setProfileStatsDialogOpen] = useState<boolean>(false);
  const [profileStatsDialogTitle, setProfileStatsDialogTitle] = useState<string>('');
  const [profileStatsDialogProfileId, setProfileStatsDialogProfileId] = useState<number>(0);
  const [accountStatsDialogOpen, setAccountStatsDialogOpen] = useState<boolean>(false);
  const [accountStatsDialogTitle, setAccountStatsDialogTitle] = useState<string>('');
  const [accountImageMenuAnchor, setAccountImageMenuAnchor] = useState<null | HTMLElement>(null);
  const [isAccountImageHovered, setIsAccountImageHovered] = useState(false);
  const [isRemovingAccountImage, setIsRemovingAccountImage] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState<boolean>(false);
  const [deleteAccountConfirmationText, setDeleteAccountConfirmationText] = useState<string>('');

  const auth = getAuth();
  const user = auth.currentUser;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle case where account or activeProfile is not loaded
  if (!account || !activeProfile) {
    return <ErrorComponent error="Account or profile data could not be loaded. Please try refreshing the page." />;
  }

  // Create non-null references for use in closures
  const safeAccount = account;
  const safeActiveProfile = activeProfile;

  const handleAddProfileButton = () => {
    openNameDialog('Add Profile', '', async (newName) => {
      await dispatch(addProfile({ accountId: safeAccount.id, newProfileName: newName }));
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
      dispatch(editProfile({ accountId: safeAccount.id, profileId: profile.id, name: newName }));
    });
  };

  const handleEditAccountName = () => {
    openNameDialog('Edit Account Name', safeAccount.name, (newName) => {
      dispatch(
        updateAccount({
          account_id: safeAccount.id,
          name: newName,
          defaultProfileId: safeAccount.defaultProfileId,
        })
      );
    });
  };

  const handleViewAccountStatistics = () => {
    setAccountStatsDialogTitle(`${safeAccount.name}`);
    setAccountStatsDialogOpen(true);
  };

  const openNameDialog = (title: string, initialName: string, onSave: (name: string) => void) => {
    setNameDialogTitle(title);
    setCurrentName(initialName);
    setOnSaveCallback(() => onSave);
    setNameDialogOpen(true);
  };

  async function handleConfirmDeleteProfile() {
    if (managedProfile) {
      setDeleteProfileDialogOpen(false);
      await dispatch(deleteProfile({ accountId: safeAccount.id, profileId: managedProfile.id }));
      setManagedProfile(null);
    }
  }

  async function handleSetDefaultProfile(profile: Profile) {
    await dispatch(
      updateAccount({
        account_id: safeAccount.id,
        name: safeAccount.name,
        defaultProfileId: profile.id,
      })
    );
  }

  async function handleSetActiveProfile(profile: Profile) {
    setChangingActiveProfile(profile.id);
    try {
      await dispatch(setActiveProfile({ accountId: safeAccount.id, profileId: profile.id }));
    } finally {
      setChangingActiveProfile(null);
    }
  }

  function handleViewProfileStats(profile: Profile) {
    setProfileStatsDialogProfileId(profile.id);
    setProfileStatsDialogTitle(`${profile.name}`);
    setProfileStatsDialogOpen(true);
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }
    const file = files[0];
    dispatch(updateAccountImage({ accountId: safeAccount.id, file }));
  };

  const handleAccountImageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAccountImageMenuAnchor(event.currentTarget);
  };

  const handleAccountImageMenuClose = () => {
    setAccountImageMenuAnchor(null);
  };

  const handleUploadAccountImage = () => {
    handleAccountImageMenuClose();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveAccountImage = async () => {
    handleAccountImageMenuClose();
    setIsRemovingAccountImage(true);
    try {
      await dispatch(removeAccountImage({ accountId: safeAccount.id }));
    } finally {
      setIsRemovingAccountImage(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (user) {
      dispatch(verifyEmail(user));
    }
  };

  const handleDeleteAccountButton = () => {
    setDeleteAccountDialogOpen(true);
    setDeleteAccountConfirmationText('');
  };

  const handleCloseDeleteAccountDialog = () => {
    setDeleteAccountDialogOpen(false);
    setDeleteAccountConfirmationText('');
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteAccountConfirmationText === safeAccount.name) {
      await dispatch(deleteAccount({ accountId: safeAccount.id }));
      handleCloseDeleteAccountDialog();
    }
  };

  const isDeleteConfirmationValid = deleteAccountConfirmationText === safeAccount.name;

  const hasCustomAccountImage = safeAccount.image && !safeAccount.image.includes('placehold.co');

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
            onMouseEnter={() => setIsAccountImageHovered(true)}
            onMouseLeave={() => setIsAccountImageHovered(false)}
            onClick={handleAccountImageMenuOpen}
          >
            <Box
              crossOrigin="anonymous"
              component="img"
              src={getAccountImageUrl(safeAccount.image)}
              alt={safeAccount.name}
              referrerPolicy="no-referrer"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
            {(isAccountImageHovered || isRemovingAccountImage) && (
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
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {isRemovingAccountImage ? (
                  <>
                    <Typography variant="body1">Removing Image...</Typography>
                  </>
                ) : (
                  <>
                    <PhotoCameraIcon />
                    <Typography variant="body1">Manage Image</Typography>
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* Account Image Management Menu */}
          <Menu
            anchorEl={accountImageMenuAnchor}
            open={Boolean(accountImageMenuAnchor)}
            onClose={handleAccountImageMenuClose}
            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleUploadAccountImage}>
              <PhotoCameraIcon sx={{ mr: 1 }} fontSize="small" />
              {hasCustomAccountImage ? 'Change Image' : 'Upload Image'}
            </MenuItem>
            {hasCustomAccountImage && (
              <MenuItem onClick={handleRemoveAccountImage} sx={{ color: 'error.main' }}>
                <DeleteForeverIcon sx={{ mr: 1 }} fontSize="small" />
                Remove Image
              </MenuItem>
            )}
          </Menu>

          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </Grid>

        <Grid
          direction="column"
          sx={{
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ mb: '5px', display: 'flex', alignItems: 'center', gap: 1 }}>
            {safeAccount.name}
            <Tooltip title="Edit Account Name" placement="top">
              <IconButton size="small" onClick={handleEditAccountName} color="primary">
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Account Stats" placement="top">
              <IconButton size="small" onClick={handleViewAccountStatistics} color="primary">
                <QueryStatsIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Preferences" placement="top">
              <IconButton size="small" onClick={() => setPreferencesDialogOpen(true)} color="primary">
                <SettingsIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Account" placement="top">
              <IconButton size="small" onClick={handleDeleteAccountButton} color="error">
                <DeleteForeverIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Email: <i>{safeAccount.email}</i>{' '}
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
            Default Profile: <i>{defaultProfile?.name}</i>
          </Typography>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Active Profile: <i>{safeActiveProfile.name}</i>{' '}
          </Typography>
          {lastUpdated && (
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Last Updated: <i>{lastUpdated}</i>
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
              handleSetActive={handleSetActiveProfile}
              handleViewStats={handleViewProfileStats}
              isLoading={changingActiveProfile === profile.id}
            />
          ))}
        </Stack>
      </Box>
      <NameEditDialog
        open={nameDialogOpen}
        title={nameDialogTitle}
        initialName={currentName}
        onClose={() => setNameDialogOpen(false)}
        onSave={onSaveCallback}
      />
      <PreferencesDialog open={preferencesDialogOpen} onClose={() => setPreferencesDialogOpen(false)} />
      <ProfileStatisticsDialog
        open={profileStatsDialogOpen}
        title={profileStatsDialogTitle}
        accountId={safeAccount.id}
        profileId={profileStatsDialogProfileId}
        onClose={() => setProfileStatsDialogOpen(false)}
      />
      <AccountStatisticsDialog
        open={accountStatsDialogOpen}
        title={accountStatsDialogTitle}
        accountId={safeAccount.id}
        onClose={() => setAccountStatsDialogOpen(false)}
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
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleConfirmDeleteProfile}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Account Delete Dialog */}
      <Dialog
        open={deleteAccountDialogOpen}
        onClose={handleCloseDeleteAccountDialog}
        aria-labelledby="delete-account-dialog-title"
        aria-describedby="delete-account-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="delete-account-dialog-title">Delete Account - {safeAccount.name}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-account-dialog-description" sx={{ mb: 2 }}>
            Deleting your account will permanently remove all data, including all profiles and watch history. This
            action cannot be undone.
          </DialogContentText>
          <DialogContentText sx={{ mb: 2 }}>
            To confirm deletion, please type your account name: <strong>{safeAccount.name}</strong>
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Account Name"
            value={deleteAccountConfirmationText}
            onChange={(e) => setDeleteAccountConfirmationText(e.target.value)}
            placeholder={safeAccount.name}
            error={deleteAccountConfirmationText.length > 0 && !isDeleteConfirmationValid}
            helperText={
              deleteAccountConfirmationText.length > 0 && !isDeleteConfirmationValid
                ? 'Account name does not match'
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteAccountDialog} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button
            startIcon={<DeleteForeverIcon />}
            onClick={handleConfirmDeleteAccount}
            variant="contained"
            color="error"
            disabled={!isDeleteConfirmationValid}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageAccount;
