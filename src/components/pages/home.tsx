import { Box, Button, Typography } from '@mui/material';

import { Account } from '../../model/account';
import { useAccount } from '../context/accountContext';
import axios from 'axios';

const Home = () => {
  const { account, setAccount } = useAccount();

  async function handleLogin() {
    try {
      const response = await axios.get(`/api/account/1`);
      const account: Account = JSON.parse(response.data);
      if (account) {
        account.profiles.sort((a, b) => (a.name < b.name ? -1 : 1));
      }
      setAccount(account);
    } catch (error) {
      console.error('Error:', error);
    }
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
