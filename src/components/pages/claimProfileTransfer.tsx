import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { LockOutlined } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  claimProfileTransferWithGoogle,
  claimProfileTransferWithPassword,
  selectAccountLoading,
} from '../../app/slices/accountSlice';
import {
  ProfileTransferInvitationPreview,
  ProfileTransferInvitationPreviewResponse,
} from '@ajgifford/keepwatching-types';

const ClaimProfileTransfer = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectAccountLoading);

  const [preview, setPreview] = useState<ProfileTransferInvitationPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await axiosInstance.get<ProfileTransferInvitationPreviewResponse>(
          `/profileTransferInvitations/${token}`
        );
        if (!cancelled) {
          setPreview(response.data.preview);
          if (response.data.preview.targetName) {
            setName(response.data.preview.targetName);
          }
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
            'This invitation is no longer available.';
          setPreviewError(message);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const passwordHasError = useMemo(() => password !== '' && password.length < 8, [password]);

  const handleCreateWithPassword = async () => {
    if (!token || !preview || password.length < 8) return;
    const result = await dispatch(
      claimProfileTransferWithPassword({ token, email: preview.targetEmail, password, name: name.trim() || undefined })
    );
    if (claimProfileTransferWithPassword.fulfilled.match(result)) {
      navigate('/home');
    }
  };

  const handleContinueWithGoogle = async () => {
    if (!token) return;
    const result = await dispatch(claimProfileTransferWithGoogle({ token, name: name.trim() || undefined }));
    if (claimProfileTransferWithGoogle.fulfilled.match(result)) {
      navigate('/home');
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <Box sx={{ mt: isMobile ? 4 : 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.light' }}>
          <LockOutlined />
        </Avatar>
        <Typography variant="h5">Claim Your Profile</Typography>

        {previewLoading && (
          <Box sx={{ mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!previewLoading && previewError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {previewError}
          </Alert>
        )}

        {!previewLoading && preview && (
          <>
            <Alert severity="info" sx={{ mt: 3, mb: 1 }}>
              <strong>{preview.sourceAccountName}</strong> would like to hand you the profile{' '}
              <strong>{preview.profileName}</strong> as your very own, independent KeepWatching account. Your watch
              history, ratings, watchlist, and badges will come with you.
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Signing in as <strong>{preview.targetEmail}</strong>
            </Typography>
            <Box sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Your Name (optional)"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    required
                    fullWidth
                    label="Create a Password"
                    type="password"
                    value={password}
                    helperText="Password must be 8 or more characters"
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordHasError}
                  />
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleCreateWithPassword}
                disabled={isSubmitting || password.length < 8}
              >
                {isSubmitting ? <CircularProgress size={20} /> : 'Create Account'}
              </Button>
              <Divider sx={{ my: 1 }}>or</Divider>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{ mt: 2 }}
                onClick={handleContinueWithGoogle}
                disabled={isSubmitting}
              >
                Continue with Google
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ClaimProfileTransfer;
