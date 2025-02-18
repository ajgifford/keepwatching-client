import { Link } from 'react-router-dom';

import LoginIcon from '@mui/icons-material/Login';
import { Box, Button, Typography } from '@mui/material';

function Default() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        mt: 4,
        px: 2,
      }}
    >
      <Typography variant="h2" color="primary" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        Keep&#8203;Watching!
      </Typography>
      <Button variant="outlined" startIcon={<LoginIcon />} component={Link} to={`/login`} sx={{ mt: 4 }}>
        Login
      </Button>
    </Box>
  );
}

export default Default;
