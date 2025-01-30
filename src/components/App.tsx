import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Container } from '@mui/material';

import store from '../app/store';
import { Footer } from './common/footer';
import DefaultLayout from './navigation/defaultLayout';
import Navigation from './navigation/navigation';
import ProtectedLayout from './navigation/protectedLayout';
import NotificationBar from './notification/notificationBar';
import Default from './pages/default';
import Discover from './pages/discover';
import Home from './pages/home';
import Login from './pages/login';
import ManageAccount from './pages/manageAccount';
import Movies from './pages/movies';
import Register from './pages/register';
import Search from './pages/search';
import ShowSeasons from './pages/showSeasons';
import Shows from './pages/shows';

function App() {
  useEffect(() => {
    const updateFooterHeight = () => {
      const footer = document.querySelector('.footer') as HTMLElement | null;
      if (footer) {
        document.documentElement.style.setProperty('--footer-height', `${footer.offsetHeight}px`);
      }
    };

    updateFooterHeight();
    window.addEventListener('resize', updateFooterHeight);

    return () => window.removeEventListener('resize', updateFooterHeight);
  }, []);

  return (
    <Provider store={store}>
      <div className="app-container">
        <BrowserRouter>
          <Navigation />
          <NotificationBar />
          <div className="content">
            <Container maxWidth="xl" sx={{ p: 1 }}>
              <Routes>
                <Route element={<DefaultLayout />}>
                  <Route path="/" element={<Default />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                <Route element={<ProtectedLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/shows" element={<Shows />} />
                  <Route path="/shows/:showId/:profileId" element={<ShowSeasons />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/manageAccount" element={<ManageAccount />} />
                </Route>
              </Routes>
            </Container>
          </div>
        </BrowserRouter>
        <footer className="footer">
          <Footer />
        </footer>
      </div>
    </Provider>
  );
}

export default App;
