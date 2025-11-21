import { render } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import { BrowserRouter } from 'react-router-dom';

import Discover from '../discover';

// Mock dependencies
const mockDispatch = jest.fn();
const mockAxiosGet = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
  },
}));

jest.mock('../../../app/slices/activityNotificationSlice', () => ({
  showActivityNotification: jest.fn((notification) => ({
    type: 'activityNotification/show',
    payload: notification,
  })),
  ActivityNotificationType: {
    Error: 'error',
    Success: 'success',
    Warning: 'warning',
    Info: 'info',
  },
}));

jest.mock('../../common/controls/segmentedControl', () => ({
  SegmentedControl: ({ value, onChange, options }: any) => (
    <div data-testid="segmented-control">
      {options.map((option: any) => (
        <button key={option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  ),
  DISCOVER_TYPE_OPTIONS: [
    { value: 'series', label: 'TV Shows' },
    { value: 'movies', label: 'Movies' },
  ],
  SERVICE_OPTIONS: [
    { value: 'netflix', label: 'Netflix' },
    { value: 'hulu', label: 'Hulu' },
  ],
  FILTER_OPTIONS: [
    { value: 'top', label: 'Top' },
    { value: 'new', label: 'New' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'expiring', label: 'Expiring' },
  ],
}));

jest.mock('../../common/search/searchResults', () => ({
  __esModule: true,
  default: ({ results, searchPerformed }: any) => (
    <div data-testid="search-results">
      {searchPerformed && results.length === 0 && <div>No results found</div>}
      {results.map((result: any) => (
        <div key={result.id} data-testid="search-result-item">
          {result.title}
        </div>
      ))}
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Discover - Snapshots', () => {
  const mockTrendingResponse: AxiosResponse = {
    data: {
      results: [
        { id: 1, title: 'Trending Show 1', type: 'series' },
        { id: 2, title: 'Trending Show 2', type: 'series' },
      ],
      currentPage: 1,
      totalPages: 2,
      totalResults: 20,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosGet.mockResolvedValue(mockTrendingResponse);
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<Discover />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot of Trending Content tab', () => {
    const { container } = renderWithRouter(<Discover />);
    const trendingTab = container.querySelector('[role="tabpanel"]');
    expect(trendingTab).toMatchSnapshot();
  });
});
