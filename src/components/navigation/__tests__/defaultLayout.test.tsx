import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DefaultLayout from '../defaultLayout';
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

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={component} />
        <Route path="/home" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('DefaultLayout', () => {
  it('renders outlet when user is not logged in', () => {
    const store = createMockStore(null);
    const TestChild = () => <div>Child Component</div>;

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<DefaultLayout />}>
              <Route path="/" element={<TestChild />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('redirects to /home when user is logged in', () => {
    const store = createMockStore(mockAccount);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<DefaultLayout />}>
              <Route path="/" element={<div>Default Page</div>} />
            </Route>
            <Route path="/home" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Should redirect to home, so we should see Home Page instead of Default Page
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Default Page')).not.toBeInTheDocument();
  });

  it('navigates to /home with replace when account exists', () => {
    const store = createMockStore(mockAccount);

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<DefaultLayout />}>
              <Route path="/login" element={<div>Login Page</div>} />
            </Route>
            <Route path="/home" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Should be redirected to home page
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
