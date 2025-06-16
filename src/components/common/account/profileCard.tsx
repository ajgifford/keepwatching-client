import { useRef, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import StarsIcon from '@mui/icons-material/Stars';
import { Box, Button, CircularProgress, Menu, MenuItem, Stack, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCurrentAccount } from '../../../app/slices/accountSlice';
import { selectActiveProfile } from '../../../app/slices/activeProfileSlice';
import { removeProfileImage, selectProfileById, updateProfileImage } from '../../../app/slices/profilesSlice';
import { getProfileImageUrl } from '../../utility/imageUtils';
import { Profile } from '@ajgifford/keepwatching-types';

interface PropTypes {
  profile: Profile;
  handleEdit: (profile: Profile) => void;
  handleDelete: (profile: Profile) => void;
  handleSetDefault: (profile: Profile) => void;
  handleSetActive: (profile: Profile) => void;
  handleViewStats: (profile: Profile) => void;
  isLoading?: boolean;
}

export function ProfileCard({
  profile,
  handleEdit,
  handleDelete,
  handleSetDefault,
  handleSetActive,
  handleViewStats,
  isLoading = false,
}: PropTypes) {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount)!;
  const activeProfile = useAppSelector(selectActiveProfile)!;
  const defaultProfile = useAppSelector((state) => selectProfileById(state, account.defaultProfileId));

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageMenuAnchor, setImageMenuAnchor] = useState<null | HTMLElement>(null);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }
    const file = files[0];
    dispatch(updateProfileImage({ accountId: account.id, profileId: profile.id, file }));
  };

  const handleImageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setImageMenuAnchor(event.currentTarget);
  };

  const handleImageMenuClose = () => {
    setImageMenuAnchor(null);
  };

  const handleUploadImage = () => {
    handleImageMenuClose();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = async () => {
    handleImageMenuClose();
    setIsRemovingImage(true);
    try {
      await dispatch(removeProfileImage({ accountId: account.id, profileId: profile.id }));
    } finally {
      setIsRemovingImage(false);
    }
  };

  const hasCustomImage = profile.image && !profile.image.includes('placehold.co');

  return (
    <Box
      id={`profileCard_${profile.id}`}
      key={profile.id}
      sx={{ p: 2, border: '1px solid #4caf50', minWidth: '250px', maxWidth: '300px', textAlign: 'center' }}
    >
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ pb: '10px' }}>
        <Box
          className="image-upload-area"
          sx={{
            position: 'relative',
            display: 'inline-block',
            width: 96,
            height: 96,
            borderRadius: 2,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleImageMenuOpen}
        >
          <Box
            crossOrigin="anonymous"
            component="img"
            src={getProfileImageUrl(profile.image)}
            alt={profile.name}
            className={`profile-image ${isRemovingImage ? 'loading' : ''}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 2,
            }}
          />
          {(isHovered || isRemovingImage) && (
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
                color: 'white',
                fontWeight: 'bold',
                fontSize: 14,
                borderRadius: 2,
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {isRemovingImage ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  <PhotoCameraIcon fontSize="small" />
                  <Typography variant="caption">Manage Image</Typography>
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Image Management Menu */}
        <Menu
          className="image-management-menu"
          anchorEl={imageMenuAnchor}
          open={Boolean(imageMenuAnchor)}
          onClose={handleImageMenuClose}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleUploadImage}>
            <PhotoCameraIcon sx={{ mr: 1 }} fontSize="small" />
            {hasCustomImage ? 'Change Image' : 'Upload Image'}
          </MenuItem>
          {hasCustomImage && (
            <MenuItem onClick={handleRemoveImage} className="error-item" sx={{ color: 'error.main' }}>
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

        <Typography variant="h5" color="primary">
          {profile.name}
        </Typography>
      </Box>

      <Stack direction="column" spacing={2} sx={{ pt: '8px' }}>
        <Button
          variant="outlined"
          startIcon={isLoading ? <CircularProgress size={16} /> : <CheckIcon />}
          onClick={() => {
            handleSetActive(profile);
          }}
          disabled={profile.id === activeProfile.id || isLoading}
        >
          {isLoading ? 'Setting Active...' : 'Set Active'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<StarsIcon />}
          onClick={() => {
            handleSetDefault(profile);
          }}
          disabled={profile.id === defaultProfile.id}
        >
          Set Default
        </Button>
        <Button
          variant="outlined"
          startIcon={<QueryStatsIcon />}
          onClick={() => {
            handleViewStats(profile);
          }}
        >
          View Stats
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => {
            handleEdit(profile);
          }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={() => {
            handleDelete(profile);
          }}
          disabled={profile.id === defaultProfile.id}
        >
          Delete
        </Button>
      </Stack>
    </Box>
  );
}
