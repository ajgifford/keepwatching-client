import { Box } from '@mui/material';

interface ErrorPropTypes {
  error: string;
}

export function ErrorComponent({ error }: ErrorPropTypes) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        mt: 4,
        px: 2,
      }}
    >
      {error}
    </Box>
  );
}
