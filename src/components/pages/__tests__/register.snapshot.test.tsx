import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Register from '../register';

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
  signUp: jest.fn(() => ({
    type: 'account/signUp',
  })),
  signInWithGoogle: jest.fn(() => ({
    type: 'account/signInWithGoogle',
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Register - Snapshots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<Register />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of registration form', () => {
    const { container } = renderWithRouter(<Register />);
    const form = container.querySelector('form');
    expect(form).toMatchSnapshot();
  });
});
