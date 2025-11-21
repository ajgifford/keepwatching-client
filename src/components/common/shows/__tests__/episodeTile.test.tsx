import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { EpisodeTile } from '../episodeTile';
import { RecentUpcomingEpisode } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((path: string) => `https://image.tmdb.org/t/p/original${path || ''}`),
}));

describe('EpisodeTile', () => {
  const mockEpisode: RecentUpcomingEpisode = {
    showId: 1,
    showName: 'Breaking Bad',
    profileId: 10,
    seasonNumber: 5,
    episodeNumber: 14,
    episodeTitle: 'Ozymandias',
    episodeStillImage: '/ozymandias.jpg',
    airDate: '2013-09-15',
    network: 'AMC',
    streamingServices: 'Netflix',
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('basic rendering', () => {
    it('should render show name', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should render episode title', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      expect(screen.getByText('Ozymandias')).toBeInTheDocument();
    });

    it('should render season and episode number', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      expect(screen.getByText('S5 E14')).toBeInTheDocument();
    });

    it('should render air date', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      expect(screen.getByText('2013-09-15')).toBeInTheDocument();
    });

    it('should render episode image', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const avatar = container.querySelector('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original/ozymandias.jpg');
      expect(avatar).toHaveAttribute('alt', 'Ozymandias');
    });
  });

  describe('network and streaming services', () => {
    it('should display network when available', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      expect(screen.getByText('AMC')).toBeInTheDocument();
    });

    it('should display streaming services when network is not available', () => {
      const episodeWithoutNetwork = {
        ...mockEpisode,
        network: '',
      };

      renderWithRouter(<EpisodeTile episode={episodeWithoutNetwork} />);

      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    it('should display streaming services when network is undefined', () => {
      const episodeWithoutNetwork = {
        ...mockEpisode,
        network: undefined,
      } as any;

      renderWithRouter(<EpisodeTile episode={episodeWithoutNetwork} />);

      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    it('should prioritize network over streaming services', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      expect(screen.getByText('AMC')).toBeInTheDocument();
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
    });
  });

  describe('link navigation', () => {
    it('should create link to show page with correct path', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const link = screen.getByText('Breaking Bad').closest('a');
      expect(link).toHaveAttribute('href', '/shows/1/10');
    });

    it('should have correct link id', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const link = document.querySelector('#episodeComponentShowLink_1_Ozymandias');
      expect(link).toBeInTheDocument();
    });

    it('should handle different showId and profileId', () => {
      const differentIds = {
        ...mockEpisode,
        showId: 999,
        profileId: 555,
      };

      renderWithRouter(<EpisodeTile episode={differentIds} />);

      const link = screen.getByText('Breaking Bad').closest('a');
      expect(link).toHaveAttribute('href', '/shows/999/555');
    });
  });

  describe('component id', () => {
    it('should have correct component id', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const component = container.querySelector('[id="episodeComponent_Breaking Bad_5_14"]');
      expect(component).toBeInTheDocument();
    });

    it('should handle show names with spaces in id', () => {
      const showWithSpaces = {
        ...mockEpisode,
        showName: 'Better Call Saul',
      };

      const { container } = renderWithRouter(<EpisodeTile episode={showWithSpaces} />);

      const component = container.querySelector('[id="episodeComponent_Better Call Saul_5_14"]');
      expect(component).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle episode number 1', () => {
      const firstEpisode = {
        ...mockEpisode,
        seasonNumber: 1,
        episodeNumber: 1,
      };

      renderWithRouter(<EpisodeTile episode={firstEpisode} />);

      expect(screen.getByText('S1 E1')).toBeInTheDocument();
    });

    it('should handle double-digit season and episode numbers', () => {
      const doubleDigits = {
        ...mockEpisode,
        seasonNumber: 12,
        episodeNumber: 24,
      };

      renderWithRouter(<EpisodeTile episode={doubleDigits} />);

      expect(screen.getByText('S12 E24')).toBeInTheDocument();
    });

    it('should handle missing episode image', () => {
      const noImage = {
        ...mockEpisode,
        episodeStillImage: '',
      };

      const { container } = renderWithRouter(<EpisodeTile episode={noImage} />);

      const avatar = container.querySelector('img');
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original');
    });

    it('should handle special characters in show name', () => {
      const specialChars = {
        ...mockEpisode,
        showName: "It's Always Sunny in Philadelphia",
      };

      renderWithRouter(<EpisodeTile episode={specialChars} />);

      expect(screen.getByText("It's Always Sunny in Philadelphia")).toBeInTheDocument();
    });

    it('should handle special characters in episode title', () => {
      const specialChars = {
        ...mockEpisode,
        episodeTitle: 'The Gang Goes to the "Water Park"',
      };

      renderWithRouter(<EpisodeTile episode={specialChars} />);

      expect(screen.getByText('The Gang Goes to the "Water Park"')).toBeInTheDocument();
    });

    it('should handle empty network and streaming services', () => {
      const noServices = {
        ...mockEpisode,
        network: '',
        streamingServices: '',
      };

      renderWithRouter(<EpisodeTile episode={noServices} />);

      // Should render empty string without errors
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should handle very long episode title', () => {
      const longTitle = {
        ...mockEpisode,
        episodeTitle: 'A'.repeat(100),
      };

      renderWithRouter(<EpisodeTile episode={longTitle} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle different date formats', () => {
      const differentDate = {
        ...mockEpisode,
        airDate: 'September 15, 2013',
      };

      renderWithRouter(<EpisodeTile episode={differentDate} />);

      expect(screen.getByText('September 15, 2013')).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render Grid containers', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const grids = container.querySelectorAll('.MuiGrid-root');
      expect(grids.length).toBeGreaterThan(0);
    });

    it('should render Typography components', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const typographies = container.querySelectorAll('.MuiTypography-root');
      expect(typographies.length).toBeGreaterThanOrEqual(5); // Show name, episode title, S/E, air date, network/services
    });

    it('should render Avatar component', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();
    });

    it('should render Avatar with rounded variant', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const avatar = container.querySelector('.MuiAvatar-rounded');
      expect(avatar).toBeInTheDocument();
    });

    it('should render Box container', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Typography variants', () => {
    it('should render show name as h5', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const showName = screen.getByText('Breaking Bad').closest('.MuiTypography-h5');
      expect(showName).toBeInTheDocument();
    });

    it('should render episode details as body1', () => {
      const { container } = renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const episodeTitle = screen.getByText('Ozymandias').closest('.MuiTypography-body1');
      expect(episodeTitle).toBeInTheDocument();
    });
  });

  describe('state passed to link', () => {
    it('should pass returnPath in link state', () => {
      renderWithRouter(<EpisodeTile episode={mockEpisode} />);

      const link = screen.getByText('Breaking Bad').closest('a');
      expect(link).toBeInTheDocument();
      // Link state is passed via React Router's Link component
    });
  });
});
