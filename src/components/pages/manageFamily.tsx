import { Container, Typography } from '@mui/material';

const Settings = () => (
  <div>
    <Typography variant="h4">Settings</Typography>
  </div>
);
const Profiles = () => (
  <div>
    <Typography variant="h4">Profiles</Typography>
  </div>
);

const ManageFamily = () => {
  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Profiles />
      <Settings />
    </Container>
  );
};

export default ManageFamily;
