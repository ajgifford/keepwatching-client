import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import { ShowListItem, FilterProps } from '../showListItem';
import { ProfileShow, WatchStatus } from '@ajgifford/keepwatching-types';

// Mock dependencies
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((path: string) => (path ? `https://image.tmdb.org/t/p/original${path}` : '')),
}));

jest.mock('../../../utility/contentUtility', () => ({
  buildEpisodeLine: jest.fn((show: any) => `Next: S${show.seasonCount}E1`),
  buildServicesLine: jest.fn((show: any) => `Streaming: ${show.streamingServices || 'N/A'}`),
  buildShowAirDate: jest.fn((date: string) => `Premiered: ${date}`),
}));

jest.mock('../../../utility/watchStatusUtility', () => ({
  WatchStatusIcon: ({ status }: any) => <div data-testid="watch-status-icon" data-status={status}>Icon</div>,
  determineNextShowWatchStatus: jest.fn((show: any) =>
    show.watchStatus === WatchStatus.WATCHED ? WatchStatus.NOT_WATCHED : WatchStatus.WATCHED
  ),
  getWatchStatusAction: jest.fn((status: string) => {
    if (status === WatchStatus.WATCHED) return 'Mark Not Watched';
    if (status === WatchStatus.NOT_WATCHED) return 'Mark Watched';
    return '';
  }),
}));

jest.mock('../../controls/optionalTooltipControl', () => ({
  OptionalTooltipControl: ({ children, title, disabled }: any) => (
    <div data-testid="optional-tooltip" data-title={title} data-disabled={disabled}>
      {children}
    </div>
  ),
}));

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn(() => false); // Default to large screen
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mockUseMediaQuery(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ShowListItem', () => {
  const mockShow: ProfileShow = {
    id: 1,
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher turned methamphetamine producer.',
    type: 'Scripted',
    status: 'Ended',
    genres: 'Drama, Crime, Thriller',
    streamingServices: 'Netflix',
    releaseDate: '2008-01-20',
    contentRating: 'TV-MA',
    seasonCount: 5,
    episodeCount: 62,
    posterImage: '/breaking-bad.jpg',
    profileId: 123,
    watchStatus: WatchStatus.NOT_WATCHED,
    lastEpisode: null,
    nextEpisode: null,
    tmdbId: 0,
    backdropImage: '',
    userRating: 0,
    inProduction: false,
    lastAirDate: null,
    network: null
  };

  const mockGetFilters = jest.fn(
    (): FilterProps => ({
      genre: 'Drama',
      streamingService: 'Netflix',
      watchStatus: [WatchStatus.NOT_WATCHED],
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve());
  });

  describe('basic rendering', () => {
    it('should render show title', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should render show description', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/A high school chemistry teacher/)).toBeInTheDocument();
    });

    it('should render show type and status', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Scripted • Ended/)).toBeInTheDocument();
    });

    it('should render genres', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Genres:/)).toBeInTheDocument();
      expect(screen.getByText(/Drama, Crime, Thriller/)).toBeInTheDocument();
    });

    it('should render content rating', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Rated:/)).toBeInTheDocument();
      expect(screen.getByText(/TV-MA/)).toBeInTheDocument();
    });

    it('should render season and episode count', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Seasons:/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText(/Episodes:/)).toBeInTheDocument();
      expect(screen.getByText(/62/)).toBeInTheDocument();
    });

    it('should render show poster image', () => {
      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original/breaking-bad.jpg');
      expect(img).toHaveAttribute('alt', 'Breaking Bad');
    });

    it('should render watch status icon', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const icon = screen.getByTestId('watch-status-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-status', WatchStatus.NOT_WATCHED);
    });

    it('should render remove favorite button', () => {
      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const starIcon = container.querySelector('[data-testid="StarIcon"]');
      expect(starIcon).toBeInTheDocument();
    });
  });

  describe('utility function rendering', () => {
    it('should call buildEpisodeLine', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Next: S5E1/)).toBeInTheDocument();
    });

    it('should call buildServicesLine', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Streaming: Netflix/)).toBeInTheDocument();
    });

    it('should call buildShowAirDate', () => {
      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Premiered: 2008-01-20/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to show details page on click', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const listItem = screen.getByText('Breaking Bad').closest('li');
      await user.click(listItem!);

      expect(mockNavigate).toHaveBeenCalledWith('/shows/1/123', {
        state: {
          genre: 'Drama',
          streamingService: 'Netflix',
          watchStatus: [WatchStatus.NOT_WATCHED],
          returnPath: '/shows?profileId=123',
        },
      });
    });

    it('should build link state with filters and return path', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const listItem = screen.getByText('Breaking Bad').closest('li');
      await user.click(listItem!);

      expect(mockNavigate).toHaveBeenCalled();
      const navCall = mockNavigate.mock.calls[0][1];
      expect(navCall.state.returnPath).toBe('/shows?profileId=123');
    });
  });

  describe('remove favorite functionality', () => {
    it('should dispatch removeShowFavorite when remove favorite button clicked', async () => {
      const user = userEvent.setup();

      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const starIcon = container.querySelector('[data-testid="StarIcon"]')!;
      const removeButton = starIcon.closest('button');
      await user.click(removeButton!);

      // Dispatch is called with a thunk, so just verify it was called
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should not navigate when clicking remove favorite button', async () => {
      const user = userEvent.setup();

      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const starIcon = container.querySelector('[data-testid="StarIcon"]')!;
      const removeButton = starIcon.closest('button');
      await user.click(removeButton!);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('watch status change functionality', () => {
    it('should open confirmation dialog when clicking watch status button', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      expect(screen.getByText(/Mark 'Breaking Bad' Watched/)).toBeInTheDocument();
    });

    it('should show correct dialog message for marking watched', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      expect(
        screen.getByText(/Marking 'Breaking Bad' watched will mark all seasons and episodes watched/)
      ).toBeInTheDocument();
    });

    it('should show correct dialog message for marking not watched', async () => {
      const user = userEvent.setup();
      const watchedShow = { ...mockShow, watchStatus: WatchStatus.WATCHED };

      renderWithRouter(<ShowListItem show={watchedShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      expect(
        screen.getByText(/Marking 'Breaking Bad' not watched will mark all seasons and episodes not watched/)
      ).toBeInTheDocument();
    });

    it('should close dialog when clicking No', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      const noButton = screen.getByText('No');
      await user.click(noButton);

      await waitFor(() => {
        expect(screen.queryByText(/Mark 'Breaking Bad' Watched/)).not.toBeInTheDocument();
      });
    });

    it('should dispatch updateShowWatchStatus when clicking Yes', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      const yesButton = screen.getByText('Yes');
      await user.click(yesButton);

      await waitFor(() => {
        // Dispatch is called with a thunk, so just verify it was called
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should close dialog after confirming watch status change', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      const yesButton = screen.getByText('Yes');
      await user.click(yesButton);

      await waitFor(() => {
        expect(screen.queryByText(/Mark 'Breaking Bad' Watched/)).not.toBeInTheDocument();
      });
    });

    it('should not navigate when clicking watch status button', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner during watch status update', async () => {
      const user = userEvent.setup();
      let resolveDispatch: () => void;
      const dispatchPromise = new Promise<void>((resolve) => {
        resolveDispatch = resolve;
      });
      mockDispatch.mockReturnValue(dispatchPromise);

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      const yesButton = screen.getByText('Yes');
      await user.click(yesButton);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      resolveDispatch!();
      
      // Wait for the finally block to execute and update state
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });

    it('should disable watch status button during update', async () => {
      const user = userEvent.setup();
      let resolveDispatch: () => void;
      const dispatchPromise = new Promise<void>((resolve) => {
        resolveDispatch = resolve;
      });
      mockDispatch.mockReturnValue(dispatchPromise);

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      ) as HTMLButtonElement;
      await user.click(watchStatusButton!);

      const yesButton = screen.getByText('Yes');
      await user.click(yesButton);

      await waitFor(() => {
        expect(watchStatusButton).toBeDisabled();
      });

      resolveDispatch!();
      
      // Wait for the finally block to execute and update state
      await waitFor(() => {
        expect(watchStatusButton).not.toBeDisabled();
      });
    });

    it('should hide loading spinner after update completes', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      const yesButton = screen.getByText('Yes');
      await user.click(yesButton);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('unaired shows', () => {
    it('should disable watch status button for unaired shows', () => {
      const unairedShow = { ...mockShow, watchStatus: WatchStatus.UNAIRED };

      renderWithRouter(<ShowListItem show={unairedShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      ) as HTMLButtonElement;

      expect(watchStatusButton).toBeDisabled();
    });
  });

  describe('responsive behavior', () => {
    it('should show "Show More" button on small screens', async () => {
      mockUseMediaQuery.mockReturnValue(true);

      await waitFor(() => {
        renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);
      });

      expect(screen.getByText('Show More')).toBeInTheDocument();
    });

    it('should not show "Show More" button on large screens', async () => {
      mockUseMediaQuery.mockReturnValue(false);

      await waitFor(() => {
        renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);
      });

      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('should toggle to "Show Less" when clicking "Show More"', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const showMoreButton = screen.getByText('Show More');
      await user.click(showMoreButton);

      expect(screen.getByText('Show Less')).toBeInTheDocument();
      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
    });

    it('should toggle back to "Show More" when clicking "Show Less"', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const showMoreButton = screen.getByText('Show More');
      await user.click(showMoreButton);

      const showLessButton = screen.getByText('Show Less');
      await user.click(showLessButton);

      expect(screen.getByText('Show More')).toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('should not navigate when clicking "Show More" button', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const showMoreButton = screen.getByText('Show More');
      await user.click(showMoreButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle missing genres', () => {
      const noGenresShow = { ...mockShow, genres: null };

      renderWithRouter(<ShowListItem show={noGenresShow as any} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Genres:/)).toBeInTheDocument();
      expect(screen.getByText(/unknown/)).toBeInTheDocument();
    });

    it('should handle missing poster image', () => {
      const noImageShow = { ...mockShow, posterImage: '' };

      const { container } = renderWithRouter(<ShowListItem show={noImageShow} getFilters={mockGetFilters} />);

      // Avatar component will show fallback when src is empty
      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialTitleShow = { ...mockShow, title: "It's Always Sunny" };

      renderWithRouter(<ShowListItem show={specialTitleShow} getFilters={mockGetFilters} />);

      expect(screen.getByText("It's Always Sunny")).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDescriptionShow = { ...mockShow, description: 'A'.repeat(500) };

      renderWithRouter(<ShowListItem show={longDescriptionShow} getFilters={mockGetFilters} />);

      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    it('should handle zero seasons and episodes', () => {
      const zeroCountShow = { ...mockShow, seasonCount: 0, episodeCount: 0 };

      renderWithRouter(<ShowListItem show={zeroCountShow} getFilters={mockGetFilters} />);

      expect(screen.getByText(/Seasons:/)).toBeInTheDocument();
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle string profileId', async () => {
      const stringProfileIdShow = { ...mockShow, profileId: '456' as any };

      const user = userEvent.setup();
      renderWithRouter(<ShowListItem show={stringProfileIdShow} getFilters={mockGetFilters} />);

      const listItem = screen.getByText('Breaking Bad').closest('li');
      await user.click(listItem!);

      // Should still work with string profileId
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render ListItem component', () => {
      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const listItem = container.querySelector('.MuiListItem-root');
      expect(listItem).toBeInTheDocument();
    });

    it('should render ListItemAvatar component', () => {
      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const listItemAvatar = container.querySelector('.MuiListItemAvatar-root');
      expect(listItemAvatar).toBeInTheDocument();
    });

    it('should render ListItemText component', () => {
      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const listItemText = container.querySelector('.MuiListItemText-root');
      expect(listItemText).toBeInTheDocument();
    });

    it('should render Dialog component when opened', async () => {
      const user = userEvent.setup();

      renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const watchStatusButtons = screen.getAllByRole('button');
      const watchStatusButton = watchStatusButtons.find((btn) =>
        btn.querySelector('[data-testid="watch-status-icon"]')
      );
      await user.click(watchStatusButton!);

      // Dialog is rendered in a portal, so use screen.getByRole
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render IconButtons', () => {
      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const iconButtons = container.querySelectorAll('.MuiIconButton-root');
      expect(iconButtons.length).toBeGreaterThanOrEqual(2); // Remove favorite + watch status
    });

    it('should have cursor pointer style on list item', () => {
      const { container } = renderWithRouter(<ShowListItem show={mockShow} getFilters={mockGetFilters} />);

      const listItem = container.querySelector('.MuiListItem-root');
      expect(listItem).toHaveStyle({ cursor: 'pointer' });
    });
  });
});
