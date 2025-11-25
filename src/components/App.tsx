import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Container } from '@mui/material';

import { auth } from '../app/firebaseConfig';
import { useActivityTracking } from '../app/hooks/useActivityTracking';
import store from '../app/store';
import { AppThemeProvider } from '../theme/ThemeProvider';
import ErrorBoundary from './common/errorBoundary';
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
import { onAuthStateChanged } from 'firebase/auth';

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

/**
 * Component to initialize activity tracking
 * Must be rendered inside Redux Provider to access state
 */
function ActivityTracker() {
  useActivityTracking();
  return null;
}

function App() {
  useFooterHeight();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Wait for Firebase auth to initialize before rendering the app
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Don't render the app until Firebase auth has initialized
  if (!authInitialized) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppThemeProvider>
          <WebSocketProvider />
          <ActivityTracker />
          <div className="app-container">
            <BrowserRouter>
              <ErrorBoundary>
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
                        <Route
                          path="/home"
                          element={
                            <ErrorBoundary>
                              <Home />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/shows"
                          element={
                            <ErrorBoundary>
                              <Shows />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/shows/:showId/:profileId"
                          element={
                            <ErrorBoundary>
                              <ShowDetails />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/movies"
                          element={
                            <ErrorBoundary>
                              <Movies />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/movies/:movieId/:profileId"
                          element={
                            <ErrorBoundary>
                              <MovieDetails />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/discover"
                          element={
                            <ErrorBoundary>
                              <Discover />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/search"
                          element={
                            <ErrorBoundary>
                              <Search />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <ErrorBoundary>
                              <Notifications />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/manageAccount"
                          element={
                            <ErrorBoundary>
                              <ManageAccount />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/person/:personId"
                          element={
                            <ErrorBoundary>
                              <PersonDetails />
                            </ErrorBoundary>
                          }
                        />
                      </Route>
                    </Routes>
                  </Container>
                </div>
              </ErrorBoundary>
            </BrowserRouter>
            <footer className="footer">
              <Footer />
            </footer>
          </div>
        </AppThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
