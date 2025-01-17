import { Box, Typography } from '@mui/material';

function Default() {
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
    </Box>
  );
}

export default Default;
