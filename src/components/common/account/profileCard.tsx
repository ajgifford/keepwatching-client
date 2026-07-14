import { useRef, useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HistoryIcon from '@mui/icons-material/History';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import StarsIcon from '@mui/icons-material/Stars';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { STATIC_CONTENT_URL } from '../../../app/constants/constants';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCurrentAccount } from '../../../app/slices/accountSlice';
import { selectActiveProfile } from '../../../app/slices/activeProfileSlice';
import {
  cancelProfileTransferInvitation,
  selectPendingProfileTransferInvitationByProfileId,
} from '../../../app/slices/profileTransferSlice';
import {
  removeProfileImage,
  selectAllProfiles,
  selectProfileById,
  updateProfileImage,
} from '../../../app/slices/profilesSlice';
import { buildProfileDataExport, profileDataExportFilename } from '../../utility/dataExportUtility';
import { downloadTextFile } from '../../utility/downloadFileUtility';
import { Profile } from '@ajgifford/keepwatching-types';
import { getProfileImageUrl } from '@ajgifford/keepwatching-ui';

interface PropTypes {
  profile: Profile;
  handleEdit: (profile: Profile) => void;
  handleDelete: (profile: Profile) => void;
  handleSetDefault: (profile: Profile) => void;
  handleSetActive: (profile: Profile) => void;
  handleViewStats: (profile: Profile) => void;
  handleReviewWatchHistory: (profile: Profile) => void;
  handleViewRecap: (profile: Profile) => void;
  handleCreateAccountFromProfile: (profile: Profile) => void;
  isLoading?: boolean;
}

export function ProfileCard({
  profile,
  handleEdit,
  handleDelete,
  handleSetDefault,
  handleSetActive,
  handleViewStats,
  handleReviewWatchHistory,
  handleViewRecap,
  handleCreateAccountFromProfile,
  isLoading = false,
}: PropTypes) {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);
  const activeProfile = useAppSelector(selectActiveProfile);
  const allProfiles = useAppSelector(selectAllProfiles);
  const defaultProfile = useAppSelector((state) =>
    account ? selectProfileById(state, account.defaultProfileId) : undefined
  );
  const pendingTransferInvitation = useAppSelector((state) =>
    selectPendingProfileTransferInvitationByProfileId(state, profile.id)
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageMenuAnchor, setImageMenuAnchor] = useState<null | HTMLElement>(null);
  const [insightsAnchor, setInsightsAnchor] = useState<null | HTMLElement>(null);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isCancelingTransfer, setIsCancelingTransfer] = useState(false);

  if (!account || !activeProfile) {
    return (
      <Box sx={{ p: 2, border: '1px solid #f44336', minWidth: '250px', maxWidth: '300px', textAlign: 'center' }}>
        <Alert severity="error" icon={<ErrorOutlinedIcon />}>
          Unable to load profile data
        </Alert>
      </Box>
    );
  }

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

  const handleInsightsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setInsightsAnchor(event.currentTarget);
  };

  const handleInsightsClose = () => {
    setInsightsAnchor(null);
  };

  const handleDownloadData = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const data = await buildProfileDataExport(account.id, profile);
      downloadTextFile(JSON.stringify(data, null, 2), profileDataExportFilename(profile.name), 'application/json');
      handleInsightsClose();
    } catch {
      setExportError('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancelTransferInvitation = async () => {
    if (!pendingTransferInvitation) return;
    setIsCancelingTransfer(true);
    try {
      await dispatch(
        cancelProfileTransferInvitation({ accountId: account.id, invitationId: pendingTransferInvitation.id })
      );
    } finally {
      setIsCancelingTransfer(false);
    }
  };

  const hasCustomImage = profile.image && !profile.image.includes('placehold.co');
  const canCreateAccountFromProfile = allProfiles.length > 1;
  const isActive = profile.id === activeProfile.id;
  const isDefault = profile.id === defaultProfile?.id;

  return (
    <Box
      id={`profileCard_${profile.id}`}
      key={profile.id}
      sx={{ p: 2, border: '1px solid #4caf50', width: { xs: '100%', sm: 300 }, maxWidth: 300, textAlign: 'center' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pb: '10px',
        }}
      >
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
            src={getProfileImageUrl(profile.image, STATIC_CONTENT_URL)}
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
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {isActive ? (
            <Chip size="small" icon={<CheckIcon />} label="Active" color="success" />
          ) : (
            <Chip
              size="small"
              icon={isLoading ? <CircularProgress size={14} /> : <CheckIcon />}
              label={isLoading ? 'Setting Active…' : 'Set Active'}
              color="success"
              variant="outlined"
              disabled={isLoading}
              onClick={() => handleSetActive(profile)}
            />
          )}
          {isDefault ? (
            <Chip size="small" icon={<StarsIcon />} label="Default" color="warning" />
          ) : (
            <Chip
              size="small"
              icon={<StarsIcon />}
              label="Set Default"
              color="warning"
              variant="outlined"
              onClick={() => handleSetDefault(profile)}
            />
          )}
        </Stack>

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
          fullWidth
          onClick={handleInsightsOpen}
          aria-haspopup="true"
          aria-expanded={Boolean(insightsAnchor)}
          sx={{ justifyContent: 'space-between', textTransform: 'none', fontWeight: 700 }}
        >
          <span>Explore</span>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Stack direction="row" spacing={0.75} sx={{ color: 'text.disabled' }}>
              <QueryStatsIcon sx={{ fontSize: 14 }} />
              <HistoryIcon sx={{ fontSize: 14 }} />
              <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              <FileDownloadIcon sx={{ fontSize: 14 }} />
            </Stack>
            <ExpandMoreIcon
              fontSize="small"
              sx={{
                color: 'text.disabled',
                transform: insightsAnchor ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            />
          </Stack>
        </Button>
        <Menu anchorEl={insightsAnchor} open={Boolean(insightsAnchor)} onClose={handleInsightsClose}>
          <MenuItem
            onClick={() => {
              handleInsightsClose();
              handleViewStats(profile);
            }}
          >
            <QueryStatsIcon sx={{ mr: 1 }} fontSize="small" />
            View Stats
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleInsightsClose();
              handleReviewWatchHistory(profile);
            }}
          >
            <HistoryIcon sx={{ mr: 1 }} fontSize="small" />
            Review Watch Dates
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleInsightsClose();
              handleViewRecap(profile);
            }}
          >
            <AutoAwesomeIcon sx={{ mr: 1 }} fontSize="small" />
            View Recap
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDownloadData} disabled={isExporting}>
            {isExporting ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              <FileDownloadIcon sx={{ mr: 1 }} fontSize="small" />
            )}
            {isExporting ? 'Exporting…' : 'Download My Data'}
          </MenuItem>
          {exportError && (
            <Alert severity="error" sx={{ m: 1 }}>
              {exportError}
            </Alert>
          )}
        </Menu>

        <Divider sx={{ mt: 1 }} />
        <Box sx={{ textAlign: 'left' }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              mb: 1,
            }}
          >
            Account
          </Typography>
          {pendingTransferInvitation ? (
            <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
              <Chip label={`Invite sent to ${pendingTransferInvitation.targetEmail}`} color="info" variant="outlined" />
              <Button
                variant="text"
                size="small"
                color="error"
                startIcon={isCancelingTransfer ? <CircularProgress size={14} /> : undefined}
                onClick={handleCancelTransferInvitation}
                disabled={isCancelingTransfer}
              >
                Cancel Invite
              </Button>
            </Stack>
          ) : (
            <Tooltip
              title={canCreateAccountFromProfile ? '' : 'The account must have at least one other profile'}
              placement="top"
            >
              <span>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleCreateAccountFromProfile(profile)}
                  disabled={!canCreateAccountFromProfile}
                >
                  Create Independent Account
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ textAlign: 'left' }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'error.main',
              mb: 1,
            }}
          >
            Danger Zone
          </Typography>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={() => {
              handleDelete(profile);
            }}
            disabled={profile.id === defaultProfile?.id}
          >
            Delete
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
