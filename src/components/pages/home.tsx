import { Box, Button, Typography } from '@mui/material';

import { Account } from '../../model/account';
import { useAccount } from '../context/accountContext';

const Home = () => {
  const { account, setAccount } = useAccount();

  async function handleLogin() {
    const response = await fetch(`/api/account/1`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const account: Account = JSON.parse(data);
    if (account) {
      account.profiles.sort((a, b) => (a.name < b.name ? -1 : 1));
    }
    setAccount(account);
  }

  return (
    <>
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
        {!account ? (
          <Button onClick={handleLogin}>Log In</Button>
        ) : (
          <Button onClick={() => setAccount(null)}>Log Out</Button>
        )}
      </Box>
    </>
  );
};

export default Home;
