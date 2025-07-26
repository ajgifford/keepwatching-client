import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Container } from '@mui/material';

import store from '../app/store';
import { Footer } from './common/footer';
import { WebSocketProvider } from './common/webSocketProvider';
import DefaultLayout from './navigation/defaultLayout';
import Navigation from './navigation/navigation';
import ProtectedLayout from './navigation/protectedLayout';
import ActivityNotificationBar from './notification/activityNotificationBar';
import Default from './pages/default';
import Discover from './pages/discover';
import Home from './pages/home';
import Login from './pages/login';
import ManageAccount from './pages/manageAccount';
import MovieDetails from './pages/movieDetails';
import Movies from './pages/movies';
import Notifications from './pages/notifications';
import PersonDetails from './pages/personDetails';
import Register from './pages/register';
import Search from './pages/search';
import ShowDetails from './pages/showDetails';
import Shows from './pages/shows';

function useFooterHeight() {
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
}

function App() {
  useFooterHeight();

  return (
    <Provider store={store}>
      <WebSocketProvider />
      <div className="app-container">
        <BrowserRouter>
          <Navigation />
          <ActivityNotificationBar />
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
                  <Route path="/shows/:showId/:profileId" element={<ShowDetails />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/movies/:movieId/:profileId" element={<MovieDetails />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/manageAccount" element={<ManageAccount />} />
                  <Route path="/person/:personId" element={<PersonDetails />} />
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
