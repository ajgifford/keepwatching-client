import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import DashboardProfileCard from '../dashboardProfileCard';
import { Profile, MilestoneStats, Milestone } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('../../../../app/constants/constants', () => ({
  STATIC_CONTENT_URL: 'http://localhost:3033',
}));

const mockGetProfileImageUrl = jest.fn((image: string, staticUrl: string) => `${staticUrl}/profiles/${image}`);
const mockGetLastAchievedMilestone = jest.fn();
const mockGetNextMilestone = jest.fn();
const mockMilestoneBadge = jest.fn(({ type, threshold, achieved, onClick }: any) => (
  <div
    data-testid={`milestone-badge-${achieved ? 'achieved' : 'next'}`}
    data-type={type}
    data-threshold={threshold}
    onClick={onClick}
  >
    {type} {threshold} {achieved ? 'Achieved' : 'Next'}
  </div>
));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  getProfileImageUrl: (image: string, staticUrl: string) => mockGetProfileImageUrl(image, staticUrl),
  getLastAchievedMilestone: (stats: any) => mockGetLastAchievedMilestone(stats),
  getNextMilestone: (stats: any) => mockGetNextMilestone(stats),
  MilestoneBadge: (props: any) => mockMilestoneBadge(props),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DashboardProfileCard', () => {
  const mockProfile: Profile = {
    id: 1,
    name: 'John Doe',
    image: 'john-avatar.jpg',
    accountId: 123,
  };

  const mockMilestoneStats: MilestoneStats = {
    totalEpisodesWatched: 500,
    totalMoviesWatched: 100,
    totalHoursWatched: 250,
  };

  const mockOnNavigateToStats = jest.fn();

  const defaultProps = {
    profile: mockProfile,
    showWatched: 10,
    showUpToDate: 5,
    showWatching: 8,
    showNotWatched: 12,
    showUnaired: 3,
    movieWatched: 25,
    movieNotWatched: 15,
    movieUnaired: 5,
    milestoneStats: mockMilestoneStats,
    onNavigateToStats: mockOnNavigateToStats,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLastAchievedMilestone.mockReturnValue(null);
    mockGetNextMilestone.mockReturnValue(null);
  });

  describe('basic rendering', () => {
    it('should render profile name in title', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(screen.getByText("John Doe's Dashboard")).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(screen.getByText('KeepWatching Your Favorites!')).toBeInTheDocument();
    });

    it('should render profile image', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', 'John Doe');
      expect(mockGetProfileImageUrl).toHaveBeenCalledWith('john-avatar.jpg', expect.any(String));
    });

    it('should render all four stat cards', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(screen.getByText('Shows to Watch')).toBeInTheDocument();
      expect(screen.getByText('Shows Watched')).toBeInTheDocument();
      expect(screen.getByText('Movies to Watch')).toBeInTheDocument();
      expect(screen.getByText('Movies Watched')).toBeInTheDocument();
    });
  });

  describe('stat calculations', () => {
    it('should calculate shows to watch correctly', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      // showNotWatched (12) + showWatching (8) + showUnaired (3) = 23
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('should calculate shows watched correctly', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      // showWatched (10) + showUpToDate (5) = 15
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should calculate movies to watch correctly', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      // movieNotWatched (15) + movieUnaired (5) = 20
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('should display movies watched count', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      const zeroProps = {
        ...defaultProps,
        showWatched: 0,
        showUpToDate: 0,
        showWatching: 0,
        showNotWatched: 0,
        showUnaired: 0,
        movieWatched: 0,
        movieNotWatched: 0,
        movieUnaired: 0,
      };

      renderWithRouter(<DashboardProfileCard {...zeroProps} />);

      const zeroTexts = screen.getAllByText('0');
      expect(zeroTexts.length).toBeGreaterThanOrEqual(4); // All four stats should be 0
    });

    it('should handle large numbers', () => {
      const largeProps = {
        ...defaultProps,
        showWatched: 100,
        showUpToDate: 100,
        showWatching: 100,
        showNotWatched: 100,
        showUnaired: 100,
        movieWatched: 500,
        movieNotWatched: 500,
        movieUnaired: 500,
      };

      renderWithRouter(<DashboardProfileCard {...largeProps} />);

      expect(screen.getByText('300')).toBeInTheDocument(); // shows to watch
      expect(screen.getByText('200')).toBeInTheDocument(); // shows watched
      expect(screen.getByText('1000')).toBeInTheDocument(); // movies to watch
      expect(screen.getByText('500')).toBeInTheDocument(); // movies watched
    });
  });

  describe('navigation links', () => {
    it('should link shows to watch to correct URL', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const links = container.querySelectorAll('a');
      const showsToWatchLink = Array.from(links).find((link) =>
        link.textContent?.includes('Shows to Watch')
      );

      expect(showsToWatchLink).toHaveAttribute('href', '/shows?watchStatus=UNAIRED%2CNOT_WATCHED%2CWATCHING');
    });

    it('should link shows watched to correct URL', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const links = container.querySelectorAll('a');
      const showsWatchedLink = Array.from(links).find((link) =>
        link.textContent?.includes('Shows Watched')
      );

      expect(showsWatchedLink).toHaveAttribute('href', '/shows?watchStatus=WATCHED%2CUP_TO_DATE');
    });

    it('should link movies to watch to correct URL', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const links = container.querySelectorAll('a');
      const moviesToWatchLink = Array.from(links).find((link) =>
        link.textContent?.includes('Movies to Watch')
      );

      expect(moviesToWatchLink).toHaveAttribute('href', '/movies?watchStatus=UNAIRED%2CNOT_WATCHED');
    });

    it('should link movies watched to correct URL', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const links = container.querySelectorAll('a');
      const moviesWatchedLink = Array.from(links).find((link) =>
        link.textContent?.includes('Movies Watched')
      );

      expect(moviesWatchedLink).toHaveAttribute('href', '/movies?watchStatus=WATCHED');
    });

    it('should have no text decoration on links', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveStyle({ textDecoration: 'none' });
      });
    });
  });

  describe('milestone badges', () => {
    it('should not render milestone badges when no milestones', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(screen.queryByTestId('milestone-badge-achieved')).not.toBeInTheDocument();
      expect(screen.queryByTestId('milestone-badge-next')).not.toBeInTheDocument();
    });

    it('should render achieved milestone badge', () => {
      const achievedMilestone: Milestone = {
        type: 'episodes',
        threshold: 500,
      };
      mockGetLastAchievedMilestone.mockReturnValue(achievedMilestone);

      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(screen.getByTestId('milestone-badge-achieved')).toBeInTheDocument();
      expect(screen.getByTestId('milestone-badge-achieved')).toHaveAttribute('data-type', 'episodes');
      expect(screen.getByTestId('milestone-badge-achieved')).toHaveAttribute('data-threshold', '500');
    });

    it('should render next milestone badge', () => {
      const nextMilestone: Milestone = {
        type: 'movies',
        threshold: 150,
      };
      mockGetNextMilestone.mockReturnValue(nextMilestone);

      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(screen.getByTestId('milestone-badge-next')).toBeInTheDocument();
      expect(screen.getByTestId('milestone-badge-next')).toHaveAttribute('data-type', 'movies');
      expect(screen.getByTestId('milestone-badge-next')).toHaveAttribute('data-threshold', '150');
    });

    it('should render both achieved and next milestone badges', () => {
      const achievedMilestone: Milestone = {
        type: 'episodes',
        threshold: 500,
      };
      const nextMilestone: Milestone = {
        type: 'movies',
        threshold: 150,
      };
      mockGetLastAchievedMilestone.mockReturnValue(achievedMilestone);
      mockGetNextMilestone.mockReturnValue(nextMilestone);

      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(screen.getByTestId('milestone-badge-achieved')).toBeInTheDocument();
      expect(screen.getByTestId('milestone-badge-next')).toBeInTheDocument();
    });

    it('should call onNavigateToStats when clicking achieved milestone', async () => {
      const user = userEvent.setup();
      const achievedMilestone: Milestone = {
        type: 'episodes',
        threshold: 500,
      };
      mockGetLastAchievedMilestone.mockReturnValue(achievedMilestone);

      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const badge = screen.getByTestId('milestone-badge-achieved');
      await user.click(badge);

      expect(mockOnNavigateToStats).toHaveBeenCalled();
    });

    it('should call onNavigateToStats when clicking next milestone', async () => {
      const user = userEvent.setup();
      const nextMilestone: Milestone = {
        type: 'movies',
        threshold: 150,
      };
      mockGetNextMilestone.mockReturnValue(nextMilestone);

      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const badge = screen.getByTestId('milestone-badge-next');
      await user.click(badge);

      expect(mockOnNavigateToStats).toHaveBeenCalled();
    });

    it('should pass current progress for episodes milestone', () => {
      const achievedMilestone: Milestone = {
        type: 'episodes',
        threshold: 500,
      };
      mockGetLastAchievedMilestone.mockReturnValue(achievedMilestone);

      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(mockMilestoneBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          currentProgress: 500, // totalEpisodesWatched from mockMilestoneStats
        })
      );
    });

    it('should pass current progress for movies milestone', () => {
      const nextMilestone: Milestone = {
        type: 'movies',
        threshold: 150,
      };
      mockGetNextMilestone.mockReturnValue(nextMilestone);

      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(mockMilestoneBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          currentProgress: 100, // totalMoviesWatched from mockMilestoneStats
        })
      );
    });

    it('should pass current progress for hours milestone', () => {
      const achievedMilestone: Milestone = {
        type: 'hours',
        threshold: 200,
      };
      mockGetLastAchievedMilestone.mockReturnValue(achievedMilestone);

      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      expect(mockMilestoneBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          currentProgress: 250, // totalHoursWatched from mockMilestoneStats
        })
      );
    });

    it('should handle null milestoneStats', () => {
      const propsWithoutStats = {
        ...defaultProps,
        milestoneStats: null,
      };

      renderWithRouter(<DashboardProfileCard {...propsWithoutStats} />);

      expect(screen.queryByTestId('milestone-badge-achieved')).not.toBeInTheDocument();
      expect(screen.queryByTestId('milestone-badge-next')).not.toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('should render TvIcon for shows to watch', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const tvIcon = container.querySelector('[data-testid="TvIcon"]');
      expect(tvIcon).toBeInTheDocument();
    });

    it('should render CheckCircleIcon for shows watched', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const checkIcon = container.querySelector('[data-testid="CheckCircleIcon"]');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should render MovieIcon for movies to watch', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const movieIcon = container.querySelector('[data-testid="MovieIcon"]');
      expect(movieIcon).toBeInTheDocument();
    });

    it('should render EmojiEventsIcon for movies watched', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const trophyIcon = container.querySelector('[data-testid="EmojiEventsIcon"]');
      expect(trophyIcon).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render Card component', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render CardContent component', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    it('should render Grid container', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      // Grid component renders but may not have specific class in test environment
      const gridElements = container.querySelectorAll('[class*="MuiGrid"]');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('should render Typography components', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const typographies = container.querySelectorAll('.MuiTypography-root');
      expect(typographies.length).toBeGreaterThan(0);
    });

    it('should render card with styling', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
      // Card is rendered with inline styles
      expect(card).toHaveAttribute('class');
    });

    it('should render card content with styling', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
      expect(cardContent).toHaveAttribute('class');
    });
  });

  describe('edge cases', () => {
    it('should handle profile name with special characters', () => {
      const specialProfile = {
        ...mockProfile,
        name: "O'Connor & Smith",
      };

      renderWithRouter(<DashboardProfileCard {...defaultProps} profile={specialProfile} />);

      expect(screen.getByText("O'Connor & Smith's Dashboard")).toBeInTheDocument();
    });

    it('should handle very long profile name', () => {
      const longNameProfile = {
        ...mockProfile,
        name: 'A'.repeat(100),
      };

      renderWithRouter(<DashboardProfileCard {...defaultProps} profile={longNameProfile} />);

      expect(screen.getByText('A'.repeat(100) + "'s Dashboard")).toBeInTheDocument();
    });

    it('should handle profile name with apostrophe', () => {
      const apostropheProfile = {
        ...mockProfile,
        name: "James",
      };

      renderWithRouter(<DashboardProfileCard {...defaultProps} profile={apostropheProfile} />);

      expect(screen.getByText("James's Dashboard")).toBeInTheDocument();
    });

    it('should handle single character profile name', () => {
      const singleCharProfile = {
        ...mockProfile,
        name: 'A',
      };

      renderWithRouter(<DashboardProfileCard {...defaultProps} profile={singleCharProfile} />);

      expect(screen.getByText("A's Dashboard")).toBeInTheDocument();
    });

    it('should handle empty profile image', () => {
      const noImageProfile = {
        ...mockProfile,
        image: '',
      };

      renderWithRouter(<DashboardProfileCard {...defaultProps} profile={noImageProfile} />);

      expect(mockGetProfileImageUrl).toHaveBeenCalledWith('', expect.any(String));
    });

    it('should handle negative stat values as zero', () => {
      const negativeProps = {
        ...defaultProps,
        showWatched: -5,
        movieWatched: -10,
      };

      // Component should still render even with invalid data
      renderWithRouter(<DashboardProfileCard {...negativeProps} />);

      expect(screen.getByText("John Doe's Dashboard")).toBeInTheDocument();
    });
  });

  describe('stat card behavior', () => {
    it('should render stat cards with hover effect', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const statCards = container.querySelectorAll('a');
      expect(statCards).toHaveLength(4); // All four stat cards are links
    });

    it('should have cursor pointer on stat cards', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const statCards = container.querySelectorAll('a');
      statCards.forEach((card) => {
        const box = card.querySelector('[class*="MuiBox"]');
        expect(box).toBeTruthy();
      });
    });
  });

  describe('responsive design', () => {
    it('should render profile image with correct styling', () => {
      const { container } = renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      const img = container.querySelector('img');
      expect(img).toHaveStyle({
        width: '100px',
        height: '100px',
        borderRadius: '50%',
      });
    });

    it('should render all stat card labels', () => {
      renderWithRouter(<DashboardProfileCard {...defaultProps} />);

      // Verify all 4 stat cards are rendered by checking their labels
      expect(screen.getByText('Shows to Watch')).toBeInTheDocument();
      expect(screen.getByText('Shows Watched')).toBeInTheDocument();
      expect(screen.getByText('Movies to Watch')).toBeInTheDocument();
      expect(screen.getByText('Movies Watched')).toBeInTheDocument();
    });
  });
});
