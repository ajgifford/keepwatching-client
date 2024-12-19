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
      if (axios.isAxiosError(error)) {
        // Handle Axios specific errors
        if (error.response) {
          console.error('Response error:', error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Request error:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error:', error.message);
        }
      } else {
        // Handle other types of errors
        console.error('Unexpected error:', error);
      }

      // Rethrow the error to be handled further up the call stack,
      // or return a default value if appropriate
      throw error;
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
