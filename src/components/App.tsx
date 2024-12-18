import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Container } from '@mui/material';

import { AccountProvider } from './context/accountContext';
import Navigation from './navigation/navigation';
import Discover from './pages/discover';
import FilteredShows from './pages/filteredShows';
import Home from './pages/home';
import ManageAccount from './pages/manageAccount';
import Movies from './pages/movies';
import ShowSeasons from './pages/showSeasons';
import Shows from './pages/shows';

function App() {
  return (
    <BrowserRouter>
      <AccountProvider>
        <Navigation />
        <div style={{ padding: '4px' }}>
          <Container maxWidth="xl" sx={{ p: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shows" element={<FilteredShows />} />
              <Route path="/shows/:id" element={<ShowSeasons />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/manageAccount" element={<ManageAccount />} />
            </Routes>
          </Container>
        </div>
      </AccountProvider>
    </BrowserRouter>
  );
}

export default App;
