import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Search from '../search';

// Mock dependencies
const mockDispatch = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  selectActiveProfile: jest.fn(),
}));

jest.mock('../../common/search/searchResults', () => ({
  __esModule: true,
  default: ({ results }: any) => (
    <div data-testid="search-results">
      {results.map((result: any) => (
        <div key={result.id} data-testid="search-result-item">
          {result.title}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../common/search/personSearchTab', () => ({
  PersonSearchTab: () => <div data-testid="person-search-tab">PersonSearchTab</div>,
}));

jest.mock('../../common/search/contentSearchTab', () => ({
  ContentSearchTab: () => <div data-testid="content-search-tab">ContentSearchTab</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Search - Snapshots', () => {
  const mockProfile = {
    id: 1,
    accountId: 100,
    name: 'Test Profile',
    avatarColor: '#FF0000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useAppSelector } = require('../../../app/hooks');
    const { selectActiveProfile } = require('../../../app/slices/activeProfileSlice');

    useAppSelector.mockImplementation((selector: any) => {
      if (selector === selectActiveProfile) return mockProfile;
      return null;
    });
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<Search />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of search tabs', () => {
    const { container } = renderWithRouter(<Search />);
    const tabs = container.querySelector('[role="tablist"]');
    expect(tabs).toMatchSnapshot();
  });
});
