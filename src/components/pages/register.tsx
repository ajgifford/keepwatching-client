import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { LockOutlined } from '@mui/icons-material';
import { Avatar, Box, Button, Container, CssBaseline, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useAppDispatch } from '../../app/hooks';
import { register } from '../../app/slices/authSlice';
import { NotificationType, showNotification } from '../../app/slices/notificationSlice';
import { validate } from 'email-validator';

const Register = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const nameHasError = useMemo(() => {
    if (name === '') return false;
    return name.length < 3;
  }, [name]);
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

  const handleRegister = async () => {
    // This is only a basic validation of inputs. Improve this as needed.
    if (name && email && password) {
      try {
        await dispatch(register({ name, email, password })).unwrap();
      } catch (error) {
        console.error(error);
      }
    } else {
      dispatch(showNotification({ message: 'Please fill out all required fields', type: NotificationType.Error }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleRegister();
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
          <Typography variant="h5">Register</Typography>
          <Box sx={{ mt: 3 }} onKeyDown={handleKeyDown}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  autoFocus
                  value={name}
                  autoComplete="true"
                  helperText="Name must be 3 or more characters"
                  onChange={(e) => setName(e.target.value)}
                  error={nameHasError}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  value={email}
                  helperText={emailHelperText}
                  autoComplete="true"
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailHasError}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  helperText="Password must be 8 or more characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordHasError}
                />
              </Grid>
            </Grid>
            <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleRegister}>
              Register
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid>
                <Link to="/login">Already have an account? Login</Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Register;
