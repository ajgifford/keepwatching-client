import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Container } from '@mui/material';

import store from '../app/store';
import DefaultLayout from './navigation/defaultLayout';
import Navigation from './navigation/navigation';
import ProtectedLayout from './navigation/protectedLayout';
import Discover from './pages/discover';
import FilteredShows from './pages/filteredShows';
import Home from './pages/home';
import Login from './pages/login';
import ManageAccount from './pages/manageAccount';
import Movies from './pages/movies';
import Register from './pages/register';
import ShowSeasons from './pages/showSeasons';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navigation />
        <div style={{ padding: '4px' }}>
          <Container maxWidth="xl" sx={{ p: 1 }}>
            <Routes>
              <Route element={<DefaultLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shows" element={<FilteredShows />} />
                <Route path="/shows/:id" element={<ShowSeasons />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/manageAccount" element={<ManageAccount />} />
              </Route>
            </Routes>
          </Container>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
