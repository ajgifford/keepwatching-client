import { render, screen, waitFor } from '@testing-library/react';

import { EpisodeCard } from '../episodeCard';
import { NextEpisode, WatchStatus } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn(
    (path: string, size?: string, alt?: string) => `https://image.tmdb.org/t/p/${size || 'original'}${path || ''}`
  ),
}));

jest.mock('../../../utility/watchStatusUtility', () => ({
  WatchStatusIcon: ({ status }: any) => (
    <div data-testid="watch-status-icon" data-status={status}>
      Icon
    </div>
  ),
}));

describe('EpisodeCard', () => {
  const mockEpisode: NextEpisode = {
    showId: 1,
    showName: 'Breaking Bad',
    seasonNumber: 5,
    episodeNumber: 14,
    episodeTitle: 'Ozymandias',
    episodeStillImage: '/ozymandias.jpg',
    airDate: '2013-09-15',
    network: 'AMC',
    streamingServices: 'Netflix',
  };

  const mockOnWatchStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z')); // Set current date to future from episode
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic rendering', () => {
    it('should render episode title', () => {
      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('Ozymandias')).toBeInTheDocument();
    });

    it('should render season and episode number', () => {
      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('S5 E14')).toBeInTheDocument();
    });

    it('should render air date', () => {
      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('2013-09-15')).toBeInTheDocument();
    });

    it('should render episode image', () => {
      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original/ozymandias.jpg');
      expect(img).toHaveAttribute('alt', 'Ozymandias');
    });

    it('should render watch status icon', () => {
      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByTestId('watch-status-icon')).toBeInTheDocument();
    });
  });

  describe('network and streaming services', () => {
    it('should display network when available', () => {
      const mockEpisodeWithRuntime = {
        ...mockEpisode,
        runtime: 46,
      };
      render(<EpisodeCard episode={mockEpisodeWithRuntime} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('AMC • 46 minutes')).toBeInTheDocument();
    });

    it('should display streaming services when network is not available', () => {
      const episodeWithoutNetwork = {
        ...mockEpisode,
        network: '',
        runtime: 65,
      };

      render(<EpisodeCard episode={episodeWithoutNetwork} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('Netflix • 1 hour, 5 minutes')).toBeInTheDocument();
    });

    it('should prioritize network over streaming services', () => {
      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('AMC • TBD')).toBeInTheDocument();
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
    });
  });

  describe('watch status determination', () => {
    it('should show NOT_WATCHED status for aired episode', () => {
      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const icon = screen.getByTestId('watch-status-icon');
      expect(icon).toHaveAttribute('data-status', WatchStatus.NOT_WATCHED);
    });

    it('should show UNAIRED status for future episode', () => {
      const futureEpisode = {
        ...mockEpisode,
        airDate: '2025-12-31',
      };

      render(<EpisodeCard episode={futureEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const icon = screen.getByTestId('watch-status-icon');
      expect(icon).toHaveAttribute('data-status', WatchStatus.UNAIRED);
    });

    it('should show UNAIRED status when airDate is missing', () => {
      const noAirDateEpisode = {
        ...mockEpisode,
        airDate: '',
      };

      render(<EpisodeCard episode={noAirDateEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const icon = screen.getByTestId('watch-status-icon');
      expect(icon).toHaveAttribute('data-status', WatchStatus.UNAIRED);
    });

    it('should show WATCHED status after clicking watch button', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnWatchStatusChange.mockResolvedValue(undefined);

      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const icon = screen.getByTestId('watch-status-icon');
        expect(icon).toHaveAttribute('data-status', WatchStatus.WATCHED);
      });
    });
  });

  describe('watch status button interaction', () => {
    it('should call onWatchStatusChange when clicking watch button', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnWatchStatusChange.mockResolvedValue(undefined);

      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockOnWatchStatusChange).toHaveBeenCalledWith(mockEpisode, WatchStatus.WATCHED);
      });
    });

    it('should toggle isWatched state when clicking button', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnWatchStatusChange.mockResolvedValue(undefined);

      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');

      // First click - mark as watched
      await user.click(button);
      await waitFor(() => {
        const icon = screen.getByTestId('watch-status-icon');
        expect(icon).toHaveAttribute('data-status', WatchStatus.WATCHED);
      });

      // Wait for button to be enabled again
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });

      // Second click - mark as not watched
      await user.click(button);
      await waitFor(() => {
        const icon = screen.getByTestId('watch-status-icon');
        expect(icon).toHaveAttribute('data-status', WatchStatus.NOT_WATCHED);
      });
    });

    it('should show loading state while updating watch status', async () => {
      const user = userEvent.setup({ delay: null });
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnWatchStatusChange.mockReturnValue(promise);

      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Loading indicator should appear
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePromise!();

      // Loading indicator should disappear
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });

    it('should disable button for unaired episodes', () => {
      const futureEpisode = {
        ...mockEpisode,
        airDate: '2025-12-31',
      };

      render(<EpisodeCard episode={futureEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button while loading', async () => {
      const user = userEvent.setup({ delay: null });
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnWatchStatusChange.mockReturnValue(promise);

      render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });

      resolvePromise!();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('tooltip text', () => {
    it('should render button with tooltip wrapper for unwatched aired episode', () => {
      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Tooltip is rendered via MUI Tooltip component which wraps the IconButton
      const tooltipWrapper = container.querySelector('.MuiBox-root');
      expect(tooltipWrapper).toBeInTheDocument();
    });

    it('should show empty tooltip for unaired episode', () => {
      const futureEpisode = {
        ...mockEpisode,
        airDate: '2025-12-31',
      };

      render(<EpisodeCard episode={futureEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('should handle missing episode image', () => {
      const noImage = {
        ...mockEpisode,
        episodeStillImage: '',
      };

      const { container } = render(<EpisodeCard episode={noImage} onWatchStatusChange={mockOnWatchStatusChange} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original');
    });

    it('should handle episode number 1', () => {
      const firstEpisode = {
        ...mockEpisode,
        seasonNumber: 1,
        episodeNumber: 1,
      };

      render(<EpisodeCard episode={firstEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('S1 E1')).toBeInTheDocument();
    });

    it('should handle double-digit season and episode numbers', () => {
      const doubleDigits = {
        ...mockEpisode,
        seasonNumber: 12,
        episodeNumber: 24,
      };

      render(<EpisodeCard episode={doubleDigits} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('S12 E24')).toBeInTheDocument();
    });

    it('should handle special characters in episode title', () => {
      const specialChars = {
        ...mockEpisode,
        episodeTitle: 'The "Best" Episode',
      };

      render(<EpisodeCard episode={specialChars} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('The "Best" Episode')).toBeInTheDocument();
    });

    it('should handle very long episode title', () => {
      const longTitle = {
        ...mockEpisode,
        episodeTitle: 'A'.repeat(100),
      };

      render(<EpisodeCard episode={longTitle} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle empty network and streaming services', () => {
      const noServices = {
        ...mockEpisode,
        network: '',
        streamingServices: '',
      };

      render(<EpisodeCard episode={noServices} onWatchStatusChange={mockOnWatchStatusChange} />);

      expect(screen.getByText('Ozymandias')).toBeInTheDocument(); // Renders without errors
    });
  });

  describe('layout and styling', () => {
    it('should render Card component', () => {
      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render CardContent component', () => {
      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    it('should render IconButton component', () => {
      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const iconButton = container.querySelector('.MuiIconButton-root');
      expect(iconButton).toBeInTheDocument();
    });

    it('should render Typography components', () => {
      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const typographies = container.querySelectorAll('.MuiTypography-root');
      expect(typographies.length).toBeGreaterThanOrEqual(3); // Title, air date, network/services
    });

    it('should render Tooltip component', () => {
      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      const tooltip = button.closest('.MuiBox-root');
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('button color', () => {
    it('should show default color for unwatched episode', () => {
      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = container.querySelector('.MuiIconButton-root');
      expect(button).not.toHaveClass('MuiIconButton-colorSuccess');
    });

    it('should show success color for watched episode', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnWatchStatusChange.mockResolvedValue(undefined);

      const { container } = render(<EpisodeCard episode={mockEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const iconButton = container.querySelector('.MuiIconButton-colorSuccess');
        expect(iconButton).toBeInTheDocument();
      });
    });
  });

  describe('date comparison edge cases', () => {
    it('should handle airDate exactly equal to current date', () => {
      jest.setSystemTime(new Date('2013-09-15T12:00:00Z'));

      const todayEpisode = {
        ...mockEpisode,
        airDate: '2013-09-15',
      };

      render(<EpisodeCard episode={todayEpisode} onWatchStatusChange={mockOnWatchStatusChange} />);

      const icon = screen.getByTestId('watch-status-icon');
      // Should be NOT_WATCHED since it's not in the future
      expect(icon).toHaveAttribute('data-status', WatchStatus.NOT_WATCHED);
    });

    it('should handle invalid airDate format', () => {
      const invalidDate = {
        ...mockEpisode,
        airDate: 'invalid-date',
      };

      render(<EpisodeCard episode={invalidDate} onWatchStatusChange={mockOnWatchStatusChange} />);

      // Should still render without crashing
      expect(screen.getByText('Ozymandias')).toBeInTheDocument();
    });
  });
});
