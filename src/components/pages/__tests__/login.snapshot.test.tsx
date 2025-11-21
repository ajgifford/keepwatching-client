import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Login from '../login';

// Mock Firebase
jest.mock('../../../app/firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock hooks
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../app/slices/accountSlice', () => ({
  signIn: jest.fn(() => ({
    type: 'account/signIn',
  })),
  signInWithGoogle: jest.fn(() => ({
    type: 'account/signInWithGoogle',
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login - Snapshots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<Login />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of login form', () => {
    const { container } = renderWithRouter(<Login />);
    const form = container.querySelector('form');
    expect(form).toMatchSnapshot();
  });
});
