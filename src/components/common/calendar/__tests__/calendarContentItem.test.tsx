import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { CalendarItem } from '../../../../app/slices/calendarSlice';
import { CalendarContentItem } from '../calendarContentItem';

const renderWithRouter = (component: React.ReactElement) => render(<BrowserRouter>{component}</BrowserRouter>);

const mockEpisodeItem: CalendarItem = {
  type: 'episode',
  date: '2024-01-15',
  data: {
    profileId: 1,
    showId: 100,
    showName: 'Breaking Bad',
    streamingServices: 'Netflix',
    network: 'AMC',
    episodeTitle: 'Ozymandias',
    airDate: '2024-01-15',
    runtime: 47,
    episodeNumber: 14,
    seasonNumber: 5,
    episodeStillImage: '/still.jpg',
  },
};

const mockMovieItem: CalendarItem = {
  type: 'movie',
  date: '2024-01-15',
  data: {
    id: 200,
    tmdbId: 27205,
    title: 'Inception',
    description: 'A thief who steals corporate secrets.',
    releaseDate: '2024-01-15',
    posterImage: '/poster.jpg',
    backdropImage: '/backdrop.jpg',
    runtime: 148,
    userRating: 8.8,
    mpaRating: 'PG-13',
    genres: 'Action, Sci-Fi',
    streamingServices: 'HBO Max',
    profileId: 1,
    watchStatus: 'NOT_WATCHED' as any,
  },
};

describe('CalendarContentItem', () => {
  describe('episode rendering', () => {
    it('should render the show name', () => {
      renderWithRouter(<CalendarContentItem item={mockEpisodeItem} profileId={1} />);
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should render season/episode number and episode title', () => {
      renderWithRouter(<CalendarContentItem item={mockEpisodeItem} profileId={1} />);
      expect(screen.getByText('S5E14 · Ozymandias')).toBeInTheDocument();
    });

    it('should link to the show page', () => {
      const { container } = renderWithRouter(<CalendarContentItem item={mockEpisodeItem} profileId={1} />);
      expect(container.querySelector('a')).toHaveAttribute('href', '/shows/100/1');
    });

    it('should use a different profileId in the link', () => {
      const { container } = renderWithRouter(<CalendarContentItem item={mockEpisodeItem} profileId={42} />);
      expect(container.querySelector('a')).toHaveAttribute('href', '/shows/100/42');
    });

    it('should show the network when available', () => {
      renderWithRouter(<CalendarContentItem item={mockEpisodeItem} profileId={1} />);
      expect(screen.getByText('AMC')).toBeInTheDocument();
    });

    it('should show streamingServices when network is empty', () => {
      const item: CalendarItem = {
        ...mockEpisodeItem,
        data: { ...(mockEpisodeItem.data as any), network: '' },
      };
      renderWithRouter(<CalendarContentItem item={item} profileId={1} />);
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    it('should not show streaming services when network is present', () => {
      renderWithRouter(<CalendarContentItem item={mockEpisodeItem} profileId={1} />);
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
    });
  });

  describe('movie rendering', () => {
    it('should render the movie title', () => {
      renderWithRouter(<CalendarContentItem item={mockMovieItem} profileId={1} />);
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    it('should render the streaming services as secondary text', () => {
      renderWithRouter(<CalendarContentItem item={mockMovieItem} profileId={1} />);
      // streamingServices appears as both secondary text and the service label on the right
      expect(screen.getAllByText('HBO Max').length).toBeGreaterThanOrEqual(1);
    });

    it('should link to the movie page', () => {
      const { container } = renderWithRouter(<CalendarContentItem item={mockMovieItem} profileId={1} />);
      expect(container.querySelector('a')).toHaveAttribute('href', '/movies/200/1');
    });

    it('should link to movie page with different profileId', () => {
      const { container } = renderWithRouter(<CalendarContentItem item={mockMovieItem} profileId={99} />);
      expect(container.querySelector('a')).toHaveAttribute('href', '/movies/200/99');
    });
  });

  describe('premiere badges', () => {
    it('should show "Series Premiere" badge for S1E1', () => {
      const item: CalendarItem = {
        ...mockEpisodeItem,
        data: { ...(mockEpisodeItem.data as any), seasonNumber: 1, episodeNumber: 1 },
      };
      renderWithRouter(<CalendarContentItem item={item} profileId={1} />);
      expect(screen.getByText('Series Premiere')).toBeInTheDocument();
    });

    it('should show "Season Premiere" badge for E1 of a non-first season', () => {
      const item: CalendarItem = {
        ...mockEpisodeItem,
        data: { ...(mockEpisodeItem.data as any), seasonNumber: 3, episodeNumber: 1 },
      };
      renderWithRouter(<CalendarContentItem item={item} profileId={1} />);
      expect(screen.getByText('Season Premiere')).toBeInTheDocument();
    });

    it('should not show a badge for regular mid-season episodes', () => {
      renderWithRouter(<CalendarContentItem item={mockEpisodeItem} profileId={1} />);
      expect(screen.queryByText('Series Premiere')).not.toBeInTheDocument();
      expect(screen.queryByText('Season Premiere')).not.toBeInTheDocument();
    });

    it('should not show a badge for movies', () => {
      renderWithRouter(<CalendarContentItem item={mockMovieItem} profileId={1} />);
      expect(screen.queryByText('Series Premiere')).not.toBeInTheDocument();
      expect(screen.queryByText('Season Premiere')).not.toBeInTheDocument();
    });
  });

  describe('link state', () => {
    it('should render as a Link component', () => {
      const { container } = renderWithRouter(<CalendarContentItem item={mockEpisodeItem} profileId={1} />);
      expect(container.querySelector('a')).toBeInTheDocument();
    });
  });
});
