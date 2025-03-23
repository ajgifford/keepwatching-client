import { useRef, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarsIcon from '@mui/icons-material/Stars';
import { Box, Button, Stack, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Profile } from '../../../app/model/profile';
import { selectCurrentAccount } from '../../../app/slices/accountSlice';
import { selectActiveProfile } from '../../../app/slices/activeProfileSlice';
import { selectProfileById, updateProfileImage } from '../../../app/slices/profilesSlice';

interface PropTypes {
  profile: Profile;
  handleEdit: (profile: Profile) => void;
  handleDelete: (profile: Profile) => void;
  handleSetDefault: (profile: Profile) => void;
  handleSetActive: (profile: Profile) => void;
}

export function ProfileCard({ profile, handleEdit, handleDelete, handleSetDefault, handleSetActive }: PropTypes) {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount)!;
  const activeProfile = useAppSelector(selectActiveProfile)!;
  const defaultProfile = useAppSelector((state) => selectProfileById(state, account.default_profile_id));

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }
    const file = files[0];
    dispatch(updateProfileImage({ profileId: profile.id, file }));
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box
      id={`profileCard_${profile.id}`}
      key={profile.id}
      sx={{ p: 2, border: '1px solid #4caf50', minWidth: '250px', maxWidth: '300px', textAlign: 'center' }}
    >
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ pb: '10px' }}>
        <Box
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
          onClick={handleImageClick}
        >
          <Box
            crossOrigin="anonymous"
            component="img"
            src={profile.image}
            alt={profile.name}
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
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                borderRadius: 2,
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
        <Typography variant="h5" color="primary">
          {profile.name}
        </Typography>
      </Box>

      <Stack direction="column" spacing={2} sx={{ pt: '8px' }}>
        <Button
          variant="outlined"
          startIcon={<CheckIcon />}
          onClick={() => {
            handleSetActive(profile);
          }}
          disabled={profile.id === activeProfile.id}
        >
          Set Active
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
