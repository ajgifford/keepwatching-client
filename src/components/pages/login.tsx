import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { LockOutlined } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useAppDispatch } from '../../app/hooks';
import { googleLogin, login } from '../../app/slices/accountSlice';
import { ActivityNotificationType, showActivityNotification } from '../../app/slices/activityNotificationSlice';
import { validate } from 'email-validator';

const Login = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const emailHasError = useMemo(() => {
    if (email === '') return false;
    const emailValid = validate(email);
    return !emailValid;
  }, [email]);

  const passwordHasError = useMemo(() => {
    if (password === '') return false;
    return password.length < 8;
  }, [password]);

  const emailHelperText = useMemo(() => (emailHasError ? 'Invalid email format' : ''), [emailHasError]);

  const handleLogin = async () => {
    if (email && password) {
      try {
        await dispatch(login({ email, password }));
      } catch (error) {
        console.error(error);
      }
    } else {
      dispatch(
        showActivityNotification({
          message: 'Please provide an email and password',
          type: ActivityNotificationType.Error,
        })
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(googleLogin());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            mt: isMobile ? 4 : 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.light' }}>
            <LockOutlined />
          </Avatar>
          <Typography variant="h5">Login</Typography>
          <Box sx={{ mt: 1 }} onKeyDown={handleKeyDown}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="loginEmailText"
              label="Email"
              name="email"
              type="email"
              autoFocus
              value={email}
              autoComplete="true"
              onChange={(e) => setEmail(e.target.value)}
              helperText={emailHelperText}
              error={emailHasError}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="loginPasswordText"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              helperText="Password must be at least 8 characters"
              error={passwordHasError}
            />

            <Button id="loginButton" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleLogin}>
              Login
            </Button>
            <Grid container justifyContent="center" sx={{ gap: 2 }}>
              <Button variant="outlined" startIcon={<HowToRegIcon />} component={Link} to="/register">
                No Account? Register
              </Button>
              <Button variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogleSignIn}>
                Sign In/Register with Google
              </Button>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Login;
