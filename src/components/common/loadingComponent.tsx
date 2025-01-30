import { Box, Typography } from '@mui/material';

export function LoadingComponent() {
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
}
