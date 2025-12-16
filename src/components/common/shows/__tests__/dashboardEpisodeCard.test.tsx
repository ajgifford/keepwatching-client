import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { DashboardEpisodeCard } from '../dashboardEpisodeCard';
import { RecentUpcomingEpisode } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((path: string, size?: string) =>
    path ? `https://image.tmdb.org/t/p/${size || 'original'}${path}` : null
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DashboardEpisodeCard', () => {
  const mockEpisode: RecentUpcomingEpisode = {
    showId: 1,
    showName: 'Breaking Bad',
    seasonNumber: 5,
    episodeNumber: 14,
    episodeTitle: 'Ozymandias',
    episodeStillImage: '/ozymandias.jpg',
    airDate: '2024-01-15',
    runtime: 47,
    network: 'AMC',
    streamingServices: 'Netflix',
    profileId: 123,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z')); // Set current date to match episode air date
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic rendering', () => {
    it('should render show name', () => {
      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should render season and episode number', () => {
      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('S5 E14')).toBeInTheDocument();
    });

    it('should render episode title', () => {
      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('Ozymandias')).toBeInTheDocument();
    });

    it('should render episode runtime', () => {
      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('47 minutes')).toBeInTheDocument();
    });

    it('should render episode image', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/ozymandias.jpg');
      expect(img).toHaveAttribute('alt', 'Ozymandias');
    });
  });

  describe('network and streaming services', () => {
    it('should display network when available', () => {
      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('AMC')).toBeInTheDocument();
    });

    it('should display streaming services when network is not available', () => {
      const episodeWithoutNetwork = {
        ...mockEpisode,
        network: '',
      };

      renderWithRouter(<DashboardEpisodeCard episode={episodeWithoutNetwork} />);

      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    it('should prioritize network over streaming services', () => {
      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('AMC')).toBeInTheDocument();
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
    });
  });

  describe('air date formatting', () => {
    it('should show "Today" for today\'s air date', () => {
      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should show "Tomorrow" for tomorrow\'s air date', () => {
      const tomorrowEpisode = {
        ...mockEpisode,
        airDate: '2024-01-16',
      };

      renderWithRouter(<DashboardEpisodeCard episode={tomorrowEpisode} />);

      expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    });

    it('should show "Yesterday" for yesterday\'s air date', () => {
      const yesterdayEpisode = {
        ...mockEpisode,
        airDate: '2024-01-14',
      };

      renderWithRouter(<DashboardEpisodeCard episode={yesterdayEpisode} />);

      expect(screen.getByText('Yesterday')).toBeInTheDocument();
    });

    it('should show "In X days" for future dates', () => {
      const futureEpisode = {
        ...mockEpisode,
        airDate: '2024-01-20',
      };

      renderWithRouter(<DashboardEpisodeCard episode={futureEpisode} />);

      expect(screen.getByText('In 5 days')).toBeInTheDocument();
    });

    it('should show "X days ago" for past dates', () => {
      const pastEpisode = {
        ...mockEpisode,
        airDate: '2024-01-10',
      };

      renderWithRouter(<DashboardEpisodeCard episode={pastEpisode} />);

      expect(screen.getByText('5 days ago')).toBeInTheDocument();
    });

    it('should handle 1 day in the future', () => {
      const oneDayFutureEpisode = {
        ...mockEpisode,
        airDate: '2024-01-16',
      };

      renderWithRouter(<DashboardEpisodeCard episode={oneDayFutureEpisode} />);

      expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    });

    it('should handle multiple days in the future', () => {
      const multipleDaysFutureEpisode = {
        ...mockEpisode,
        airDate: '2024-01-25',
      };

      renderWithRouter(<DashboardEpisodeCard episode={multipleDaysFutureEpisode} />);

      expect(screen.getByText('In 10 days')).toBeInTheDocument();
    });

    it('should handle multiple days in the past', () => {
      const multipleDaysPastEpisode = {
        ...mockEpisode,
        airDate: '2024-01-05',
      };

      renderWithRouter(<DashboardEpisodeCard episode={multipleDaysPastEpisode} />);

      expect(screen.getByText('10 days ago')).toBeInTheDocument();
    });
  });

  describe('link navigation', () => {
    it('should render as a Link component', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
    });

    it('should link to correct show page', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/shows/1/123');
    });

    it('should have correct link with different showId and profileId', () => {
      const differentEpisode = {
        ...mockEpisode,
        showId: 456,
        profileId: 789,
      };

      const { container } = renderWithRouter(<DashboardEpisodeCard episode={differentEpisode} />);

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/shows/456/789');
    });

    it('should have no text decoration on link', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const link = container.querySelector('a');
      expect(link).toHaveStyle({ textDecoration: 'none' });
    });
  });

  describe('image handling', () => {
    it('should use buildTMDBImagePath for episode image', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/ozymandias.jpg');
    });

    it('should use placeholder when episodeStillImage is empty', () => {
      const noImageEpisode = {
        ...mockEpisode,
        episodeStillImage: '',
      };

      const { container } = renderWithRouter(<DashboardEpisodeCard episode={noImageEpisode} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', 'https://placehold.co/280x180/gray/white?text=No+Image');
    });
  });

  describe('layout and styling', () => {
    it('should render Card component', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render CardContent component', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    it('should render Chip component', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('should render Typography components', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const typographies = container.querySelectorAll('.MuiTypography-root');
      expect(typographies.length).toBeGreaterThanOrEqual(4); // Show name, S/E number, episode title, air date
    });
  });

  describe('edge cases', () => {
    it('should handle no runtime', () => {
      const noRuntimeEpisode = {
        ...mockEpisode,
        runtime: undefined,
      };

      renderWithRouter(<DashboardEpisodeCard episode={noRuntimeEpisode as unknown as RecentUpcomingEpisode} />);

      expect(screen.getByText('TBD')).toBeInTheDocument();
    });

    it('should handle very long show name with noWrap', () => {
      const longNameEpisode = {
        ...mockEpisode,
        showName: 'A'.repeat(100),
      };

      renderWithRouter(<DashboardEpisodeCard episode={longNameEpisode} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle very long episode title with noWrap', () => {
      const longTitleEpisode = {
        ...mockEpisode,
        episodeTitle: 'B'.repeat(100),
      };

      renderWithRouter(<DashboardEpisodeCard episode={longTitleEpisode} />);

      expect(screen.getByText('B'.repeat(100))).toBeInTheDocument();
    });

    it('should handle episode number 1', () => {
      const firstEpisode = {
        ...mockEpisode,
        seasonNumber: 1,
        episodeNumber: 1,
      };

      renderWithRouter(<DashboardEpisodeCard episode={firstEpisode} />);

      expect(screen.getByText('S1 E1')).toBeInTheDocument();
    });

    it('should handle double-digit season and episode numbers', () => {
      const doubleDigits = {
        ...mockEpisode,
        seasonNumber: 12,
        episodeNumber: 24,
      };

      renderWithRouter(<DashboardEpisodeCard episode={doubleDigits} />);

      expect(screen.getByText('S12 E24')).toBeInTheDocument();
    });

    it('should handle special characters in episode title', () => {
      const specialChars = {
        ...mockEpisode,
        episodeTitle: 'The "Best" Episode!',
      };

      renderWithRouter(<DashboardEpisodeCard episode={specialChars} />);

      expect(screen.getByText('The "Best" Episode!')).toBeInTheDocument();
    });

    it('should handle special characters in show name', () => {
      const specialChars = {
        ...mockEpisode,
        showName: "It's Always Sunny",
      };

      renderWithRouter(<DashboardEpisodeCard episode={specialChars} />);

      expect(screen.getByText("It's Always Sunny")).toBeInTheDocument();
    });

    it('should handle empty network and streaming services', () => {
      const noServices = {
        ...mockEpisode,
        network: '',
        streamingServices: '',
      };

      const { container } = renderWithRouter(<DashboardEpisodeCard episode={noServices} />);

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
      // Chip will be empty but still rendered
    });

    it('should handle profileId as string', () => {
      const stringProfileIdEpisode = {
        ...mockEpisode,
        profileId: '456' as any,
      };

      const { container } = renderWithRouter(<DashboardEpisodeCard episode={stringProfileIdEpisode} />);

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/shows/1/456');
    });

    it('should handle showId as string', () => {
      const stringShowIdEpisode = {
        ...mockEpisode,
        showId: '789' as any,
      };

      const { container } = renderWithRouter(<DashboardEpisodeCard episode={stringShowIdEpisode} />);

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/shows/789/123');
    });
  });

  describe('date edge cases', () => {
    it('should handle dates far in the future', () => {
      const farFutureEpisode = {
        ...mockEpisode,
        airDate: '2025-12-31',
      };

      renderWithRouter(<DashboardEpisodeCard episode={farFutureEpisode} />);

      expect(screen.getByText(/In \d+ days/)).toBeInTheDocument();
    });

    it('should handle dates far in the past', () => {
      const farPastEpisode = {
        ...mockEpisode,
        airDate: '2023-01-01',
      };

      renderWithRouter(<DashboardEpisodeCard episode={farPastEpisode} />);

      expect(screen.getByText(/\d+ days ago/)).toBeInTheDocument();
    });

    it('should handle date at midnight boundary', () => {
      jest.setSystemTime(new Date('2024-01-15T00:00:00Z'));

      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should handle date at end of day boundary', () => {
      jest.setSystemTime(new Date('2024-01-15T23:59:59Z'));

      renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('component as Card Link', () => {
    it('should render card with cursor pointer style', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toHaveStyle({ cursor: 'pointer' });
    });

    it('should render card without default link color', () => {
      const { container } = renderWithRouter(<DashboardEpisodeCard episode={mockEpisode} />);

      const link = container.querySelector('a');
      expect(link).toHaveStyle({ color: 'inherit' });
    });
  });
});
