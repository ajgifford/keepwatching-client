import { useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentAccount } from '../../app/slices/authSlice';
import { fetchProfiles, selectProfilesError, selectProfilesStatus } from '../../app/slices/profilesSlice';
import { ProfilesStack } from '../common/profilesStack';

const Home = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount)!;
  const profilesStatus = useAppSelector(selectProfilesStatus);
  const profileError = useAppSelector(selectProfilesError);

  useEffect(() => {
    dispatch(fetchProfiles(account.id));
  }, [account.id, dispatch]);

  if (profilesStatus === 'pending') {
    return (
      <Box
        sx={{
          textAlign: 'center',
          mt: 4,
          px: 2,
        }}
      >
        <Typography variant="h2" gutterBottom>
          Loading...
        </Typography>
      </Box>
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
        <Box
          crossOrigin="anonymous"
          component="img"
          src={account.image}
          alt={account.name}
          sx={{
            width: 455,
            height: 256,
            objectFit: 'cover',
            borderRadius: 2,
          }}
        />
        <Box sx={{ p: 2 }}>
          <ProfilesStack editable={false} />
        </Box>
      </Box>
    );
  } else if (profilesStatus === 'failed') {
    return (
      <Box
        sx={{
          textAlign: 'center',
          mt: 4,
          px: 2,
        }}
      >
        {profileError}
      </Box>
    );
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
