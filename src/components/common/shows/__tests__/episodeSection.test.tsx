import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { EpisodesSection } from '../episodeSection';
import { RecentUpcomingEpisode } from '@ajgifford/keepwatching-types';

// Mock DashboardEpisodeCard
jest.mock('../dashboardEpisodeCard', () => ({
  DashboardEpisodeCard: ({ episode }: any) => (
    <div data-testid={`episode-card-${episode.showId}-s${episode.seasonNumber}e${episode.episodeNumber}`}>
      {episode.showName} - S{episode.seasonNumber}E{episode.episodeNumber}
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EpisodesSection', () => {
  const mockRecentEpisodes: RecentUpcomingEpisode[] = [
    {
      showId: 1,
      showName: 'Breaking Bad',
      seasonNumber: 5,
      episodeNumber: 14,
      episodeTitle: 'Ozymandias',
      episodeStillImage: '/ozymandias.jpg',
      airDate: '2024-01-10',
      network: 'AMC',
      streamingServices: 'Netflix',
      profileId: 123,
    },
    {
      showId: 2,
      showName: 'Better Call Saul',
      seasonNumber: 6,
      episodeNumber: 13,
      episodeTitle: 'Saul Gone',
      episodeStillImage: '/saul.jpg',
      airDate: '2024-01-12',
      network: 'AMC',
      streamingServices: 'Netflix',
      profileId: 123,
    },
  ];

  const mockUpcomingEpisodes: RecentUpcomingEpisode[] = [
    {
      showId: 3,
      showName: 'The Wire',
      seasonNumber: 3,
      episodeNumber: 8,
      episodeTitle: 'Moral Midgetry',
      episodeStillImage: '/wire.jpg',
      airDate: '2024-01-20',
      network: 'HBO',
      streamingServices: 'Max',
      profileId: 123,
    },
  ];

  describe('basic rendering', () => {
    it('should render Recent Episodes section header', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByText('Recent Episodes')).toBeInTheDocument();
    });

    it('should render Upcoming Episodes section header', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByText('Upcoming Episodes')).toBeInTheDocument();
    });

    it('should render Recent Episodes subtitle chip', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByText('Aired last 7 days')).toBeInTheDocument();
    });

    it('should render Upcoming Episodes subtitle chip', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByText('Airing next 7 days')).toBeInTheDocument();
    });

    it('should render divider', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const divider = container.querySelector('.MuiDivider-root');
      expect(divider).toBeInTheDocument();
    });
  });

  describe('episode cards rendering', () => {
    it('should render all recent episode cards', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByTestId('episode-card-1-s5e14')).toBeInTheDocument();
      expect(screen.getByTestId('episode-card-2-s6e13')).toBeInTheDocument();
    });

    it('should render all upcoming episode cards', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByTestId('episode-card-3-s3e8')).toBeInTheDocument();
    });

    it('should render correct number of recent episodes', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getAllByText(/Breaking Bad|Better Call Saul/)).toHaveLength(2);
    });

    it('should render correct number of upcoming episodes', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByText(/The Wire/)).toBeInTheDocument();
    });

    it('should render single recent episode', () => {
      const singleRecentEpisode = [mockRecentEpisodes[0]];

      renderWithRouter(<EpisodesSection recentEpisodes={singleRecentEpisode} upcomingEpisodes={[]} />);

      expect(screen.getByTestId('episode-card-1-s5e14')).toBeInTheDocument();
    });

    it('should render single upcoming episode', () => {
      const singleUpcomingEpisode = [mockUpcomingEpisodes[0]];

      renderWithRouter(<EpisodesSection recentEpisodes={[]} upcomingEpisodes={singleUpcomingEpisode} />);

      expect(screen.getByTestId('episode-card-3-s3e8')).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should show empty message when no recent episodes', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={[]} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByText('No recent episodes')).toBeInTheDocument();
    });

    it('should show empty message when no upcoming episodes', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={[]} />);

      expect(screen.getByText('No upcoming episodes')).toBeInTheDocument();
    });

    it('should show both empty messages when no episodes at all', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={[]} upcomingEpisodes={[]} />);

      expect(screen.getByText('No recent episodes')).toBeInTheDocument();
      expect(screen.getByText('No upcoming episodes')).toBeInTheDocument();
    });

    it('should not render episode cards when recent episodes is empty', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={[]} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.queryByTestId('episode-card-1-s5e14')).not.toBeInTheDocument();
      expect(screen.queryByTestId('episode-card-2-s6e13')).not.toBeInTheDocument();
    });

    it('should not render episode cards when upcoming episodes is empty', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={[]} />);

      expect(screen.queryByTestId('episode-card-3-s3e8')).not.toBeInTheDocument();
    });
  });

  describe('section header links', () => {
    it('should render Recent Episodes header as link', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const links = container.querySelectorAll('a');
      const recentLink = Array.from(links).find((link) => link.textContent?.includes('Recent Episodes'));
      expect(recentLink).toBeInTheDocument();
    });

    it('should render Upcoming Episodes header as link', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const links = container.querySelectorAll('a');
      const upcomingLink = Array.from(links).find((link) => link.textContent?.includes('Upcoming Episodes'));
      expect(upcomingLink).toBeInTheDocument();
    });

    it('should link Recent Episodes to shows page with watch status filter', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const links = container.querySelectorAll('a');
      const recentLink = Array.from(links).find((link) => link.textContent?.includes('Recent Episodes'));
      expect(recentLink).toHaveAttribute('href', '/shows?watchStatus=WATCHING%2CUP_TO_DATE');
    });

    it('should link Upcoming Episodes to shows page with watch status filter', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const links = container.querySelectorAll('a');
      const upcomingLink = Array.from(links).find((link) => link.textContent?.includes('Upcoming Episodes'));
      expect(upcomingLink).toHaveAttribute('href', '/shows?watchStatus=WATCHING%2CUP_TO_DATE');
    });

    it('should have no text decoration on section header links', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const links = container.querySelectorAll('a');
      const recentLink = Array.from(links).find((link) => link.textContent?.includes('Recent Episodes'));
      expect(recentLink).toHaveStyle({ textDecoration: 'none' });
    });
  });

  describe('icons rendering', () => {
    it('should render TvIcon for Recent Episodes section', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const tvIcon = container.querySelector('[data-testid="TvIcon"]');
      expect(tvIcon).toBeInTheDocument();
    });

    it('should render ScheduleIcon for Upcoming Episodes section', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const scheduleIcon = container.querySelector('[data-testid="ScheduleIcon"]');
      expect(scheduleIcon).toBeInTheDocument();
    });
  });

  describe('chip colors', () => {
    it('should render Recent Episodes chip with primary color', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const chips = container.querySelectorAll('.MuiChip-root');
      const recentChip = Array.from(chips).find((chip) => chip.textContent === 'Aired last 7 days');
      expect(recentChip).toHaveClass('MuiChip-colorPrimary');
    });

    it('should render Upcoming Episodes chip with info color', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const chips = container.querySelectorAll('.MuiChip-root');
      const upcomingChip = Array.from(chips).find((chip) => chip.textContent === 'Airing next 7 days');
      expect(upcomingChip).toHaveClass('MuiChip-colorInfo');
    });

    it('should render chips with outlined variant', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const chips = container.querySelectorAll('.MuiChip-root');
      chips.forEach((chip) => {
        expect(chip).toHaveClass('MuiChip-outlined');
      });
    });
  });

  describe('layout and styling', () => {
    it('should render all Typography components', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const typographies = container.querySelectorAll('.MuiTypography-root');
      expect(typographies.length).toBeGreaterThan(0);
    });

    it('should render scrollable containers', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const boxes = container.querySelectorAll('.MuiBox-root');
      expect(boxes.length).toBeGreaterThan(0);
    });

    it('should render section headers with h5 variant', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={mockUpcomingEpisodes} />);

      const recentHeader = screen.getByText('Recent Episodes');
      const upcomingHeader = screen.getByText('Upcoming Episodes');

      expect(recentHeader.tagName).toBe('H5');
      expect(upcomingHeader.tagName).toBe('H5');
    });
  });

  describe('edge cases', () => {
    it('should handle large number of recent episodes', () => {
      const manyEpisodes = Array.from({ length: 20 }, (_, i) => ({
        ...mockRecentEpisodes[0],
        showId: i + 1,
        episodeNumber: i + 1,
      }));

      renderWithRouter(<EpisodesSection recentEpisodes={manyEpisodes} upcomingEpisodes={[]} />);

      expect(screen.getAllByTestId(/episode-card-/)).toHaveLength(20);
    });

    it('should handle large number of upcoming episodes', () => {
      const manyEpisodes = Array.from({ length: 15 }, (_, i) => ({
        ...mockUpcomingEpisodes[0],
        showId: i + 100,
        episodeNumber: i + 1,
      }));

      renderWithRouter(<EpisodesSection recentEpisodes={[]} upcomingEpisodes={manyEpisodes} />);

      expect(screen.getAllByTestId(/episode-card-/)).toHaveLength(15);
    });

    it('should handle episodes with same show but different seasons', () => {
      const sameShowEpisodes = [
        { ...mockRecentEpisodes[0], seasonNumber: 1, episodeNumber: 1 },
        { ...mockRecentEpisodes[0], seasonNumber: 2, episodeNumber: 1 },
      ];

      renderWithRouter(<EpisodesSection recentEpisodes={sameShowEpisodes} upcomingEpisodes={[]} />);

      expect(screen.getByTestId('episode-card-1-s1e1')).toBeInTheDocument();
      expect(screen.getByTestId('episode-card-1-s2e1')).toBeInTheDocument();
    });

    it('should handle episodes with same show and season but different episodes', () => {
      const sameSeasonEpisodes = [
        { ...mockRecentEpisodes[0], episodeNumber: 1 },
        { ...mockRecentEpisodes[0], episodeNumber: 2 },
      ];

      renderWithRouter(<EpisodesSection recentEpisodes={sameSeasonEpisodes} upcomingEpisodes={[]} />);

      expect(screen.getByTestId('episode-card-1-s5e1')).toBeInTheDocument();
      expect(screen.getByTestId('episode-card-1-s5e2')).toBeInTheDocument();
    });

    it('should render when only recent episodes provided', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={[]} />);

      expect(screen.getByText('Recent Episodes')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Episodes')).toBeInTheDocument();
      expect(screen.getByText('No upcoming episodes')).toBeInTheDocument();
    });

    it('should render when only upcoming episodes provided', () => {
      renderWithRouter(<EpisodesSection recentEpisodes={[]} upcomingEpisodes={mockUpcomingEpisodes} />);

      expect(screen.getByText('Recent Episodes')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Episodes')).toBeInTheDocument();
      expect(screen.getByText('No recent episodes')).toBeInTheDocument();
    });
  });

  describe('unique keys', () => {
    it('should generate unique keys for recent episodes', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={mockRecentEpisodes} upcomingEpisodes={[]} />
      );

      const episodeCards = container.querySelectorAll('[data-testid^="episode-card-"]');
      const keys = Array.from(episodeCards).map((card) => card.getAttribute('data-testid'));
      const uniqueKeys = new Set(keys);

      expect(keys).toHaveLength(uniqueKeys.size);
    });

    it('should generate unique keys for upcoming episodes', () => {
      const { container } = renderWithRouter(
        <EpisodesSection recentEpisodes={[]} upcomingEpisodes={mockUpcomingEpisodes} />
      );

      const episodeCards = container.querySelectorAll('[data-testid^="episode-card-"]');
      const keys = Array.from(episodeCards).map((card) => card.getAttribute('data-testid'));
      const uniqueKeys = new Set(keys);

      expect(keys).toHaveLength(uniqueKeys.size);
    });
  });
});
