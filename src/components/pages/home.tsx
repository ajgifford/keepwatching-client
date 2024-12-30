import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentAccount } from '../../app/slices/authSlice';
import { fetchProfiles, selectProfilesError, selectProfilesStatus } from '../../app/slices/profilesSlice';

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const account = useAppSelector(selectCurrentAccount)!;
  const profilesStatus = useAppSelector(selectProfilesStatus);
  const profileError = useAppSelector(selectProfilesError);

  useEffect(() => {
    if (profilesStatus === 'idle') {
      dispatch(fetchProfiles(account.id));
    }
  }, [account.id, profilesStatus, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  if (profilesStatus === 'pending') {
    return (
      <div>
        <Typography variant="h2" gutterBottom>
          Loading...
        </Typography>
      </div>
    );
  } else if (profilesStatus === 'succeeded') {
    return (
      <Box
        sx={{
          textAlign: 'center',
          mt: 4,
          px: 2,
        }}
      >
        <Typography variant="h2" color="primary">
          KeepWatching!
        </Typography>
        <br />
        <Typography variant="h4" color="textPrimary" gutterBottom>
          Welcome {account.name}!
        </Typography>
        <Button sx={{ mt: '20px' }} variant="outlined" onClick={handleLogout}>
          Log Out
        </Button>
      </Box>
    );
  } else if (profilesStatus === 'failed') {
    return <div>{profileError}</div>;
  } else {
    return (
      <div>
        <Typography variant="h2" gutterBottom>
          Unknown Status
        </Typography>
      </div>
    );
  }
};

export default Home;
