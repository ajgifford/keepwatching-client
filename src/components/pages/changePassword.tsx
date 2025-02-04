import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LockOutlined } from '@mui/icons-material';
import { Avatar, Box, Button, Container, CssBaseline, TextField, Typography } from '@mui/material';

import { useAppDispatch } from '../../app/hooks';
import { changePassword } from '../../app/slices/accountSlice';
import { NotificationType, showNotification } from '../../app/slices/notificationSlice';
import { getAuth } from 'firebase/auth';

const ChangePassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [password, setPassword] = useState<string>('');
  const [reenterPassword, setReenterPassword] = useState<string>('');

  const passwordValid = useMemo(() => {
    return password.length >= 8;
  }, [password]);

  const reenterPasswordValid = useMemo(() => {
    return reenterPassword === password;
  }, [password, reenterPassword]);

  const reenterHelperText = useMemo(
    () => (!reenterPasswordValid ? `Passwords don't match` : ''),
    [reenterPasswordValid],
  );

  const handleChangePassword = async () => {
    if (user && passwordValid && reenterPasswordValid) {
      try {
        await dispatch(changePassword({ user, password })).unwrap();
        navigate('/manageAccount');
      } catch (error) {
        console.error(error);
      }
    } else {
      dispatch(showNotification({ message: `Passwords don't match`, type: NotificationType.Error }));
    }
  };

  const passwordFieldValid = useMemo(() => {
    if (password === '') return true;
    return passwordValid;
  }, [password, passwordValid]);

  const reenterPasswordFieldValid = useMemo(() => {
    if (reenterPassword === '') return true;
    return reenterPasswordValid;
  }, [reenterPassword, reenterPasswordValid]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleChangePassword();
    }
  };

  return (
    <>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            mt: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.light' }}>
            <LockOutlined />
          </Avatar>
          <Typography variant="h5">Change Password</Typography>
          <Box sx={{ mt: 1 }} onKeyDown={handleKeyDown}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="changePasswordNew"
              label="New Password"
              name="newPassword"
              type="password"
              autoFocus
              value={password}
              autoComplete="true"
              onChange={(e) => setPassword(e.target.value)}
              helperText="Password must be at least 8 characters"
              error={!passwordFieldValid}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="changePasswordReenter"
              label="Re-Enter Password"
              name="reenterPassword"
              type="password"
              value={reenterPassword}
              onChange={(e) => {
                setReenterPassword(e.target.value);
              }}
              helperText={reenterHelperText}
              error={!reenterPasswordFieldValid}
            />

            <Button
              id="changePasswordButton"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleChangePassword}
              disabled={!(passwordValid && reenterPasswordValid)}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default ChangePassword;
