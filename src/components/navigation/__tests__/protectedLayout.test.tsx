import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedLayout from '../protectedLayout';
import accountSlice from '../../../app/slices/accountSlice';

const mockAccount = {
  id: 1,
  uid: 'test-uid-123',
  email: 'test@example.com',
  name: 'Test User',
  image: '',
  defaultProfileId: 1,
  createdAt: new Date('2024-01-01'),
};

const createMockStore = (account: typeof mockAccount | null) => {
  return configureStore({
    reducer: {
      auth: accountSlice,
    },
    preloadedState: {
      auth: {
        account,
        loading: false,
        error: null,
      },
    },
  });
};

describe('ProtectedLayout', () => {
  it('renders outlet when user is logged in', () => {
    const store = createMockStore(mockAccount);
    const TestChild = () => <div>Protected Content</div>;

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<TestChild />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when user is not logged in', () => {
    const store = createMockStore(null);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<div>Protected Page</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Should redirect to login, so we should see Login Page instead of Protected Page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Page')).not.toBeInTheDocument();
  });

  it('navigates to /login with replace when account is null', () => {
    const store = createMockStore(null);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/shows']}>
          <Routes>
            <Route element={<ProtectedLayout />}>
              <Route path="/shows" element={<div>Shows Page</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Should be redirected to login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Shows Page')).not.toBeInTheDocument();
  });

  it('allows access to nested protected routes when authenticated', () => {
    const store = createMockStore(mockAccount);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/movies']}>
          <Routes>
            <Route element={<ProtectedLayout />}>
              <Route path="/movies" element={<div>Movies Page</div>} />
              <Route path="/shows" element={<div>Shows Page</div>} />
              <Route path="/discover" element={<div>Discover Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Movies Page')).toBeInTheDocument();
  });
});
