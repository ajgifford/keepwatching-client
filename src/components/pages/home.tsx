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
  }, [profilesStatus, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  let content: React.ReactNode;

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
        <Typography variant="h2" gutterBottom>
          KeepWatching!
        </Typography>
        <Button onClick={handleLogout}>Log Out</Button>
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
