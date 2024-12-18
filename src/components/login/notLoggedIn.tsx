import { useNavigate } from 'react-router-dom';

import { Box, Button, Typography } from '@mui/material';

const NotLoggedIn = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        textAlign: 'center',
        mt: 4,
        px: 2,
      }}
    >
      <Typography variant="h2" gutterBottom>
        No Account Logged In!
      </Typography>
      <Button onClick={() => navigate(`/`)}>Home</Button>
    </Box>
  );
};

export default NotLoggedIn;
