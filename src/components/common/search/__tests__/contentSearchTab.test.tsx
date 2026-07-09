import { render, screen, waitFor } from '@testing-library/react';

import { showActivityNotification } from '../../../../app/slices/activityNotificationSlice';
import { ContentSearchTab } from '../contentSearchTab';
import { DiscoverAndSearchResult } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosResponse } from 'axios';

const mockDispatch = jest.fn();
const mockAxiosGet = jest.fn();

jest.mock('../../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
  },
}));

jest.mock('../../../../app/slices/activityNotificationSlice', () => ({
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

jest.mock('@ajgifford/keepwatching-ui', () => ({
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
}));

jest.mock('../searchResults', () => ({
  __esModule: true,
  default: ({ results, searchType, isLoading, searchPerformed, searchQuery }: any) => (
    <div
      data-testid="search-results"
      data-search-type={searchType}
      data-is-loading={String(isLoading)}
      data-search-performed={String(searchPerformed)}
      data-search-query={searchQuery || ''}
    >
      {results.map((r: any) => (
        <div key={r.id} data-testid="result-item" data-title={r.title}>
          {r.title}
        </div>
      ))}
    </div>
  ),
}));

const makeResults = (overrides: Partial<DiscoverAndSearchResult>[] = []): DiscoverAndSearchResult[] => {
  const defaults: DiscoverAndSearchResult[] = [
    {
      id: '1',
      title: 'Breaking Bad',
      popularity: 95,
      premiered: '2008-01-20',
      genres: [],
      rating: 9.5,
      summary: '',
      image: '',
    },
    {
      id: '2',
      title: 'Arrested Development',
      popularity: 70,
      premiered: '2003-11-02',
      genres: [],
      rating: 8.7,
      summary: '',
      image: '',
    },
    {
      id: '3',
      title: 'The Wire',
      popularity: 85,
      premiered: '2002-06-02',
      genres: [],
      rating: 9.3,
      summary: '',
      image: '',
    },
  ];
  return overrides.length ? overrides.map((o, i) => ({ ...defaults[i], ...o })) : defaults;
};

const mockSearchResponse = (results = makeResults()): AxiosResponse => ({
  data: { results, totalResults: results.length },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('ContentSearchTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockImplementation((action) => action);
    mockAxiosGet.mockResolvedValue(mockSearchResponse());
  });

  describe('rendering by searchType prop', () => {
    it('should show correct placeholder for movies', () => {
      render(<ContentSearchTab searchType="movies" />);
      expect(screen.getByLabelText('Search for movies...')).toBeInTheDocument();
    });

    it('should show correct placeholder for shows', () => {
      render(<ContentSearchTab searchType="shows" />);
      expect(screen.getByLabelText('Search for TV shows...')).toBeInTheDocument();
    });

    it('should show Release Year label for movies', () => {
      render(<ContentSearchTab searchType="movies" />);
      expect(screen.getAllByText('Release Year').length).toBeGreaterThan(0);
    });

    it('should show First Air Date Year label for shows', () => {
      render(<ContentSearchTab searchType="shows" />);
      expect(screen.getAllByText('First Air Date Year').length).toBeGreaterThan(0);
    });

    it('should use movie prefix for text field id', () => {
      render(<ContentSearchTab searchType="movies" />);
      expect(document.getElementById('movieSearchTextField')).toBeInTheDocument();
    });

    it('should use show prefix for text field id', () => {
      render(<ContentSearchTab searchType="shows" />);
      expect(document.getElementById('showSearchTextField')).toBeInTheDocument();
    });
  });

  describe('initial state', () => {
    it('should render Search button', () => {
      render(<ContentSearchTab searchType="movies" />);
      expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
    });

    it('should enable Search button initially', () => {
      render(<ContentSearchTab searchType="movies" />);
      expect(screen.getByRole('button', { name: /^search$/i })).not.toBeDisabled();
    });

    it('should not show clear button when input is empty', () => {
      render(<ContentSearchTab searchType="movies" />);
      expect(screen.queryByRole('button', { name: /clear input/i })).not.toBeInTheDocument();
    });

    it('should not show sort controls before a search', () => {
      render(<ContentSearchTab searchType="movies" />);
      expect(screen.queryByText('Sort By')).not.toBeInTheDocument();
    });

    it('should show SearchResults with searchPerformed=false initially', () => {
      render(<ContentSearchTab searchType="movies" />);
      const searchResults = screen.getByTestId('search-results');
      expect(searchResults).toHaveAttribute('data-search-performed', 'false');
    });

    it('should show SearchResults with correct searchType prop', () => {
      render(<ContentSearchTab searchType="shows" />);
      expect(screen.getByTestId('search-results')).toHaveAttribute('data-search-type', 'shows');
    });

    it('should render All Years option when year dropdown is opened', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);
      await user.click(screen.getByRole('combobox'));
      expect(await screen.findByRole('option', { name: 'All Years' })).toBeInTheDocument();
    });
  });

  describe('search input interactions', () => {
    it('should update search text as user types', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      const input = screen.getByLabelText('Search for movies...');
      await user.type(input, 'Breaking Bad');

      expect(input).toHaveValue('Breaking Bad');
    });

    it('should show clear button when text is entered', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');

      expect(screen.getByRole('button', { name: /clear input/i })).toBeInTheDocument();
    });

    it('should clear text when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      const input = screen.getByLabelText('Search for movies...');
      await user.type(input, 'Breaking Bad');
      await user.click(screen.getByRole('button', { name: /clear input/i }));

      expect(input).toHaveValue('');
    });

    it('should clear results when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      const input = screen.getByLabelText('Search for movies...');
      await user.type(input, 'Breaking Bad');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getAllByTestId('result-item')).toHaveLength(3);
      });

      await user.click(screen.getByRole('button', { name: /clear input/i }));

      expect(screen.queryByTestId('result-item')).not.toBeInTheDocument();
    });

    it('should not call axiosInstance when search text is empty', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('should trigger search on Enter key press', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      const input = screen.getByLabelText('Search for movies...');
      await user.type(input, 'Breaking Bad');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should not trigger search on non-Enter key press', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      const input = screen.getByLabelText('Search for movies...');
      await user.type(input, 'Test');
      await user.keyboard('{Escape}');

      expect(mockAxiosGet).not.toHaveBeenCalled();
    });
  });

  describe('search API calls', () => {
    it('should call axiosInstance.get with correct endpoint for movies', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Breaking Bad');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/search/movies', expect.any(Object));
      });
    });

    it('should call axiosInstance.get with correct endpoint for shows', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="shows" />);

      await user.type(screen.getByLabelText('Search for TV shows...'), 'Breaking Bad');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith('/search/shows', expect.any(Object));
      });
    });

    it('should replace spaces with + in the search string', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Breaking Bad');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          '/search/movies',
          expect.objectContaining({
            params: expect.objectContaining({ searchString: 'Breaking+Bad' }),
          })
        );
      });
    });

    it('should use page 1 for a new search', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          '/search/movies',
          expect.objectContaining({
            params: expect.objectContaining({ page: '1' }),
          })
        );
      });
    });

    it('should not include year in params when year is not selected', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        const callParams = mockAxiosGet.mock.calls[0][1].params;
        expect(callParams).not.toHaveProperty('year');
      });
    });

    it('should display results after a successful search', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Breaking Bad');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getAllByTestId('result-item')).toHaveLength(3);
      });
    });

    it('should display result titles after search', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
        expect(screen.getByText('Arrested Development')).toBeInTheDocument();
        expect(screen.getByText('The Wire')).toBeInTheDocument();
      });
    });

    it('should pass searchPerformed=true to SearchResults after search', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toHaveAttribute('data-search-performed', 'true');
      });
    });

    it('should show a "Showing X of Y results" counter after a successful search', async () => {
      const user = userEvent.setup();
      mockAxiosGet.mockResolvedValue(mockSearchResponse(makeResults().slice(0, 2)));

      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 2 results')).toBeInTheDocument();
      });
    });

    it('should not show a results counter before a search is performed', () => {
      render(<ContentSearchTab searchType="movies" />);
      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show LoadingComponent while waiting for first page results', async () => {
      const user = userEvent.setup();
      mockAxiosGet.mockReturnValue(new Promise(() => {}));

      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(await screen.findByTestId('loading-component')).toBeInTheDocument();
    });

    it('should disable Search button while loading', async () => {
      const user = userEvent.setup();
      mockAxiosGet.mockReturnValue(new Promise(() => {}));

      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      expect(await screen.findByRole('button', { name: /^search$/i })).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('should dispatch error notification on generic error', async () => {
      const user = userEvent.setup();
      mockAxiosGet.mockRejectedValue(new Error('Network error'));

      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(showActivityNotification).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'Search failed. Please try again.' })
        );
      });
    });

    it('should use AxiosError response data as error message', async () => {
      const user = userEvent.setup();
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        data: 'Server error message',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };
      mockAxiosGet.mockRejectedValue(axiosError);

      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(showActivityNotification).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'Server error message' })
        );
      });
    });

    it('should use AxiosError message when response has no data', async () => {
      const user = userEvent.setup();
      const axiosError = new AxiosError('Connection refused');
      mockAxiosGet.mockRejectedValue(axiosError);

      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(showActivityNotification).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'Connection refused' })
        );
      });
    });

    it('should dispatch error notification via dispatch', async () => {
      const user = userEvent.setup();
      mockAxiosGet.mockRejectedValue(new Error('Network error'));

      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('sort controls', () => {
    const setupWithResults = async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getAllByTestId('result-item')).toHaveLength(3);
      });

      return user;
    };

    it('should show Sort By control after results are returned', async () => {
      await setupWithResults();
      expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    });

    it('should show sort order toggle button when sortBy is not none', async () => {
      await setupWithResults();
      const downIcon = screen.getByTestId('ArrowDownwardIcon');
      expect(downIcon).toBeInTheDocument();
    });

    it('should show descending icon initially', async () => {
      await setupWithResults();
      expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();
      expect(screen.queryByTestId('ArrowUpwardIcon')).not.toBeInTheDocument();
    });

    it('should toggle to ascending icon when sort order button is clicked', async () => {
      const user = await setupWithResults();

      const toggleButton = screen.getByTestId('ArrowDownwardIcon').closest('button')!;
      await user.click(toggleButton);

      expect(screen.getByTestId('ArrowUpwardIcon')).toBeInTheDocument();
      expect(screen.queryByTestId('ArrowDownwardIcon')).not.toBeInTheDocument();
    });

    it('should toggle back to descending when clicked again', async () => {
      const user = await setupWithResults();

      const toggleButton = screen.getByTestId('ArrowDownwardIcon').closest('button')!;
      await user.click(toggleButton);
      await user.click(screen.getByTestId('ArrowUpwardIcon').closest('button')!);

      expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();
    });

    it('should hide sort order toggle when Sort By is set to none', async () => {
      const user = await setupWithResults();

      const sortBySelect = screen.getByLabelText('Sort By');
      await user.click(sortBySelect);
      await user.click(await screen.findByRole('option', { name: 'None' }));

      expect(screen.queryByTestId('ArrowDownwardIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ArrowUpwardIcon')).not.toBeInTheDocument();
    });

    it('should show sort controls for both movies and shows', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="shows" />);

      await user.type(screen.getByLabelText('Search for TV shows...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getAllByTestId('result-item')).toHaveLength(3);
      });

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    });
  });

  describe('sort options for content type', () => {
    const setupWithResults = async (searchType: 'movies' | 'shows' = 'movies') => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType={searchType} />);

      const label = searchType === 'movies' ? 'Search for movies...' : 'Search for TV shows...';
      await user.type(screen.getByLabelText(label), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getAllByTestId('result-item')).toHaveLength(3);
      });

      return user;
    };

    it('should show Air Date sort option for shows', async () => {
      const user = await setupWithResults('shows');

      const sortBySelect = screen.getByLabelText('Sort By');
      await user.click(sortBySelect);

      expect(await screen.findByRole('option', { name: 'Air Date' })).toBeInTheDocument();
    });

    it('should show Release Date sort option for movies', async () => {
      const user = await setupWithResults('movies');

      const sortBySelect = screen.getByLabelText('Sort By');
      await user.click(sortBySelect);

      expect(await screen.findByRole('option', { name: 'Release Date' })).toBeInTheDocument();
    });
  });

  describe('result sorting', () => {
    it('should sort results by popularity descending by default (highest first)', async () => {
      const user = userEvent.setup();
      mockAxiosGet.mockResolvedValue(
        mockSearchResponse([
          {
            id: '2',
            title: 'Low Popularity',
            popularity: 40,
            premiered: '2020-01-01',
            genres: [],
            rating: 7,
            summary: '',
            image: '',
          },
          {
            id: '1',
            title: 'High Popularity',
            popularity: 90,
            premiered: '2021-01-01',
            genres: [],
            rating: 8,
            summary: '',
            image: '',
          },
        ])
      );

      render(<ContentSearchTab searchType="shows" />);
      await user.type(screen.getByLabelText('Search for TV shows...'), 'Show');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        const items = screen.getAllByTestId('result-item');
        expect(items[0]).toHaveAttribute('data-title', 'High Popularity');
        expect(items[1]).toHaveAttribute('data-title', 'Low Popularity');
      });
    });

    it('should re-sort results when sort order is toggled to ascending', async () => {
      const user = userEvent.setup();
      mockAxiosGet.mockResolvedValue(
        mockSearchResponse([
          {
            id: '2',
            title: 'Low Popularity',
            popularity: 40,
            premiered: '',
            genres: [],
            rating: 7,
            summary: '',
            image: '',
          },
          {
            id: '1',
            title: 'High Popularity',
            popularity: 90,
            premiered: '',
            genres: [],
            rating: 8,
            summary: '',
            image: '',
          },
        ])
      );

      render(<ContentSearchTab searchType="movies" />);
      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getAllByTestId('result-item')).toHaveLength(2);
      });

      // Toggle to ascending
      const toggleButton = screen.getByTestId('ArrowDownwardIcon').closest('button')!;
      await user.click(toggleButton);

      const items = screen.getAllByTestId('result-item');
      expect(items[0]).toHaveAttribute('data-title', 'Low Popularity');
      expect(items[1]).toHaveAttribute('data-title', 'High Popularity');
    });
  });

  describe('year filter', () => {
    it('should include year options starting from current year', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);
      await user.click(screen.getByRole('combobox'));
      const currentYear = new Date().getFullYear();
      expect(await screen.findByRole('option', { name: String(currentYear) })).toBeInTheDocument();
    });

    it('should include 46 year options plus All Years', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);
      await user.click(screen.getByRole('combobox'));
      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(47); // 46 years + "All Years"
    });
  });

  describe('filter change resets search state', () => {
    it('should reset searchPerformed when year filter changes', async () => {
      const user = userEvent.setup();
      render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toHaveAttribute('data-search-performed', 'true');
      });

      // After results appear there are two comboboxes: year filter (index 0) and Sort By (index 1)
      const currentYear = new Date().getFullYear();
      const yearSelect = screen.getAllByRole('combobox')[0];
      await user.click(yearSelect);
      await user.click(await screen.findByRole('option', { name: String(currentYear) }));

      expect(screen.getByTestId('search-results')).toHaveAttribute('data-search-performed', 'false');
    });
  });

  describe('searchType prop change resets state', () => {
    it('should clear search text when searchType changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test Movie');

      rerender(<ContentSearchTab searchType="shows" />);

      expect(screen.getByLabelText('Search for TV shows...')).toHaveValue('');
    });

    it('should clear results when searchType changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getAllByTestId('result-item')).toHaveLength(3);
      });

      rerender(<ContentSearchTab searchType="shows" />);

      expect(screen.queryByTestId('result-item')).not.toBeInTheDocument();
    });

    it('should hide sort controls when searchType changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ContentSearchTab searchType="movies" />);

      await user.type(screen.getByLabelText('Search for movies...'), 'Test');
      await user.click(screen.getByRole('button', { name: /^search$/i }));

      await waitFor(() => {
        expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
      });

      rerender(<ContentSearchTab searchType="shows" />);

      expect(screen.queryByText('Sort By')).not.toBeInTheDocument();
    });
  });
});
