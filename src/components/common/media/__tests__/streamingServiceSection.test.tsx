import { act, render, screen, within } from '@testing-library/react';

import { StreamingServiceContent } from '../../../../app/slices/activeProfileSlice';
import StreamingServiceSection from '../streamingServiceSection';
import userEvent from '@testing-library/user-event';

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockSelectContentByStreamingService = jest.fn();
jest.mock('../../../../app/hooks', () => ({
  useAppSelector: (selector: any) => selector(),
}));

jest.mock('../../../../app/slices/activeProfileSlice', () => ({
  selectContentByStreamingService: () => mockSelectContentByStreamingService(),
}));

const mockTheme = {
  palette: {
    mode: 'light',
  },
};

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: () => mockTheme,
}));

jest.mock('../../../../app/constants/streamingServices', () => ({
  getServiceConfig: (serviceName: string) => ({
    name: serviceName,
    color: '#FF0000',
    colorDark: '#AA0000',
    logo: `/logos/${serviceName}.png`,
    logoDark: `/logos/${serviceName}-dark.png`,
  }),
}));

jest.mock('../../../utility/contentUtility', () => ({
  stripArticle: (title: string) => title.replace(/^(The |A |An )/i, ''),
}));

// Mock child components
jest.mock('../scrollableMediaRow', () => ({
  ScrollableMediaRow: ({ title, items, renderItem, emptyMessage }: any) => (
    <div data-testid="scrollable-media-row">
      <div data-testid="row-title">{title}</div>
      <div data-testid="row-items">
        {items.map((item: any, index: number) => (
          <div key={index}>{renderItem(item)}</div>
        ))}
      </div>
      {items.length === 0 && <div data-testid="empty-message">{emptyMessage}</div>}
    </div>
  ),
}));

jest.mock('../profileContentCard', () => ({
  ProfileContentCard: ({ content, contentType, onClick }: any) => (
    <div data-testid="profile-content-card" data-type={contentType} onClick={onClick}>
      {content.title}
    </div>
  ),
}));

describe('StreamingServiceSection', () => {
  const mockShow = {
    id: 1,
    tmdbId: 123,
    title: 'Breaking Bad',
    posterImage: '/breaking-bad.jpg',
    backdropImage: '/breaking-bad-backdrop.jpg',
    watchStatus: 'Watched' as const,
    isFavorite: true,
    userRating: 9.5,
    genres: 'Drama, Crime',
    streamingServices: 'Netflix',
    profileId: 1,
  };

  const mockMovie = {
    id: 2,
    tmdbId: 456,
    title: 'The Matrix',
    posterImage: '/matrix.jpg',
    backdropImage: '/matrix-backdrop.jpg',
    watchStatus: 'Watched' as const,
    isFavorite: true,
    userRating: 8.7,
    genres: 'Sci-Fi, Action',
    streamingServices: 'Netflix',
    profileId: 1,
  };

  const mockServiceContent: StreamingServiceContent[] = [
    {
      service: 'Netflix',
      shows: [mockShow],
      movies: [mockMovie],
      totalCount: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectContentByStreamingService.mockReturnValue(mockServiceContent);
    mockTheme.palette.mode = 'light';
  });

  describe('empty state', () => {
    it('should show empty message when no content', () => {
      mockSelectContentByStreamingService.mockReturnValue([]);

      render(<StreamingServiceSection />);

      expect(screen.getByText(/No content available. Add shows or movies to your favorites/)).toBeInTheDocument();
    });

    it('should not show Quick Jump when no content', () => {
      mockSelectContentByStreamingService.mockReturnValue([]);

      render(<StreamingServiceSection />);

      expect(screen.queryByText('Quick Jump:')).not.toBeInTheDocument();
    });
  });

  describe('Quick Jump navigation', () => {
    it('should render Quick Jump section with service links', () => {
      render(<StreamingServiceSection />);

      expect(screen.getByText('Quick Jump:')).toBeInTheDocument();
    });

    it('should show service logos in Quick Jump', () => {
      render(<StreamingServiceSection />);

      const logo = screen.getAllByAltText('Netflix logo')[0];
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/logos/Netflix.png');
    });

    it('should show service count chips in Quick Jump', () => {
      render(<StreamingServiceSection />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should show tooltip with counts on hover', () => {
      render(<StreamingServiceSection />);

      // The tooltip text is in the aria-label attribute
      const serviceLink = screen.getByRole('button', { name: 'Netflix: 1 shows, 1 movies' });
      expect(serviceLink).toBeInTheDocument();
    });

    it('should call scrollIntoView when service link clicked', async () => {
      const user = userEvent.setup();
      const scrollIntoViewMock = jest.fn();

      // Mock getElementById and scrollIntoView
      const mockElement = {
        scrollIntoView: scrollIntoViewMock,
      };
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

      render(<StreamingServiceSection />);

      const serviceLink = screen.getByRole('button', { name: /Netflix/i });
      await user.click(serviceLink);

      expect(document.getElementById).toHaveBeenCalledWith('service-Netflix');
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('should show service name when logo has not loaded', () => {
      render(<StreamingServiceSection />);

      // Initially, service name should be shown (logo hasn't loaded yet)
      const quickJumpSection = screen.getByText('Quick Jump:').parentElement;
      expect(within(quickJumpSection!).getByText('Netflix')).toBeInTheDocument();
    });

    it('should hide service name after logo loads', () => {
      const { container, rerender } = render(<StreamingServiceSection />);

      // Initially, service name should be shown
      const quickJumpSection1 = screen.getByText('Quick Jump:').parentElement;
      expect(within(quickJumpSection1!).getByText('Netflix')).toBeInTheDocument();

      // Find the logo and trigger onLoad
      const logos = container.querySelectorAll('img[alt="Netflix logo"]');
      const quickJumpLogo = logos[0] as HTMLImageElement;

      // Simulate logo load
      act(() => {
        quickJumpLogo.dispatchEvent(new Event('load'));
      });

      // Service name should be hidden now (not in Quick Jump section)
      const quickJumpSection2 = screen.getByText('Quick Jump:').parentElement;
      expect(within(quickJumpSection2!).queryByText('Netflix')).not.toBeInTheDocument();
    });

    it('should handle logo error', () => {
      const { container } = render(<StreamingServiceSection />);

      // Find the logo and trigger onLoad first
      const logos = container.querySelectorAll('img[alt="Netflix logo"]');
      const quickJumpLogo = logos[0] as HTMLImageElement;

      act(() => {
        quickJumpLogo.dispatchEvent(new Event('load'));
      });

      // Then trigger onError
      act(() => {
        quickJumpLogo.dispatchEvent(new Event('error'));
      });

      // Service name should be shown again after error
      const quickJumpSection = screen.getByText('Quick Jump:').parentElement;
      expect(within(quickJumpSection!).getByText('Netflix')).toBeInTheDocument();
    });
  });

  describe('service sections', () => {
    it('should render ScrollableMediaRow for each service', () => {
      render(<StreamingServiceSection />);

      expect(screen.getByTestId('scrollable-media-row')).toBeInTheDocument();
    });

    it('should show service logo in section title', () => {
      render(<StreamingServiceSection />);

      // There should be 2 logos total (1 in Quick Jump, 1 in section)
      const logos = screen.getAllByAltText('Netflix logo');
      expect(logos.length).toBeGreaterThanOrEqual(2);
    });

    it('should show service name and count chip in section title', () => {
      render(<StreamingServiceSection />);

      const rowTitle = screen.getByTestId('row-title');
      expect(within(rowTitle).getByText('Netflix')).toBeInTheDocument();
      expect(within(rowTitle).getByText('1 show, 1 movie')).toBeInTheDocument();
    });

    it('should render both shows and movies', () => {
      render(<StreamingServiceSection />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    it('should handle ProfileContentCard clicks and navigate to shows', async () => {
      const user = userEvent.setup();

      render(<StreamingServiceSection />);

      const showCard = screen.getByText('Breaking Bad').closest('[data-testid="profile-content-card"]');
      await user.click(showCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/shows/1/1', {
        state: {
          returnPath: '/home',
          genre: '',
          streamingService: '',
          watchStatus: '',
        },
      });
    });

    it('should handle ProfileContentCard clicks and navigate to movies', async () => {
      const user = userEvent.setup();

      render(<StreamingServiceSection />);

      const movieCard = screen.getByText('The Matrix').closest('[data-testid="profile-content-card"]');
      await user.click(movieCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/movies/2/1', {
        state: {
          returnPath: '/home',
          genre: '',
          streamingService: '',
          watchStatus: '',
        },
      });
    });

    it('should sort content alphabetically using stripArticle', () => {
      const contentWithArticles: StreamingServiceContent[] = [
        {
          service: 'Netflix',
          shows: [
            { ...mockShow, title: 'The Wire', id: 3 },
            { ...mockShow, title: 'Breaking Bad', id: 1 },
            { ...mockShow, title: 'A Game of Thrones', id: 2 },
          ],
          movies: [],
          totalCount: 3,
        },
      ];

      mockSelectContentByStreamingService.mockReturnValue(contentWithArticles);

      const { container } = render(<StreamingServiceSection />);

      const cards = container.querySelectorAll('[data-testid="profile-content-card"]');
      const titles = Array.from(cards).map((card) => card.textContent);

      // After stripArticle and sort: Breaking Bad, Game of Thrones, Wire
      expect(titles).toEqual(['Breaking Bad', 'A Game of Thrones', 'The Wire']);
    });

    it('should handle section title logo error gracefully', () => {
      const { container } = render(<StreamingServiceSection />);

      // Get the section logo (not Quick Jump)
      const logos = container.querySelectorAll('img[alt="Netflix logo"]');
      const sectionLogo = logos[1] as HTMLImageElement;

      // Trigger error
      act(() => {
        sectionLogo.dispatchEvent(new Event('error'));
      });

      // Logo should be hidden (display: none)
      expect(sectionLogo.style.display).toBe('none');
    });
  });

  describe('theme handling', () => {
    it('should use dark mode color/logo when isDarkMode=true', () => {
      mockTheme.palette.mode = 'dark';

      const { container } = render(<StreamingServiceSection />);

      // Check that dark logo is used
      const logos = container.querySelectorAll('img[alt="Netflix logo"]');
      logos.forEach((logo) => {
        expect(logo).toHaveAttribute('src', '/logos/Netflix-dark.png');
      });
    });

    it('should use normal color/logo when isDarkMode=false', () => {
      mockTheme.palette.mode = 'light';

      const { container } = render(<StreamingServiceSection />);

      // Check that normal logo is used
      const logos = container.querySelectorAll('img[alt="Netflix logo"]');
      logos.forEach((logo) => {
        expect(logo).toHaveAttribute('src', '/logos/Netflix.png');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle service with only shows', () => {
      const showsOnly: StreamingServiceContent[] = [
        {
          service: 'Hulu',
          shows: [mockShow],
          movies: [],
          totalCount: 1,
        },
      ];

      mockSelectContentByStreamingService.mockReturnValue(showsOnly);

      render(<StreamingServiceSection />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.queryByText('The Matrix')).not.toBeInTheDocument();
      expect(screen.getByText('1 show, 0 movies')).toBeInTheDocument();
    });

    it('should handle service with only movies', () => {
      const moviesOnly: StreamingServiceContent[] = [
        {
          service: 'HBO',
          shows: [],
          movies: [mockMovie],
          totalCount: 1,
        },
      ];

      mockSelectContentByStreamingService.mockReturnValue(moviesOnly);

      render(<StreamingServiceSection />);

      expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
      expect(screen.getByText('0 shows, 1 movie')).toBeInTheDocument();
    });

    it('should handle multiple services', () => {
      const multipleServices: StreamingServiceContent[] = [
        {
          service: 'Netflix',
          shows: [mockShow],
          movies: [],
          totalCount: 1,
        },
        {
          service: 'Hulu',
          shows: [],
          movies: [mockMovie],
          totalCount: 1,
        },
      ];

      mockSelectContentByStreamingService.mockReturnValue(multipleServices);

      render(<StreamingServiceSection />);

      expect(screen.getAllByTestId('scrollable-media-row')).toHaveLength(2);
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    it('should use profileId from shows if available', () => {
      const showsWithProfileId: StreamingServiceContent[] = [
        {
          service: 'Netflix',
          shows: [{ ...mockShow, profileId: 5 }],
          movies: [],
          totalCount: 1,
        },
      ];

      mockSelectContentByStreamingService.mockReturnValue(showsWithProfileId);

      render(<StreamingServiceSection />);

      // Verify the component renders (profileId is extracted correctly)
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('should use profileId from movies if no shows', async () => {
      const user = userEvent.setup();
      const moviesWithProfileId: StreamingServiceContent[] = [
        {
          service: 'Netflix',
          shows: [],
          movies: [{ ...mockMovie, profileId: 7 }],
          totalCount: 1,
        },
      ];

      mockSelectContentByStreamingService.mockReturnValue(moviesWithProfileId);

      render(<StreamingServiceSection />);

      const movieCard = screen.getByText('The Matrix').closest('[data-testid="profile-content-card"]');
      await user.click(movieCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/movies/2/7', expect.any(Object));
    });

    it('should handle singular forms correctly (1 show, 1 movie)', () => {
      const singleItems: StreamingServiceContent[] = [
        {
          service: 'Netflix',
          shows: [mockShow],
          movies: [mockMovie],
          totalCount: 2,
        },
      ];

      mockSelectContentByStreamingService.mockReturnValue(singleItems);

      render(<StreamingServiceSection />);

      expect(screen.getByText('1 show, 1 movie')).toBeInTheDocument();
    });

    it('should handle plural forms correctly (multiple shows and movies)', () => {
      const multipleItems: StreamingServiceContent[] = [
        {
          service: 'Netflix',
          shows: [mockShow, { ...mockShow, id: 10 }],
          movies: [mockMovie, { ...mockMovie, id: 20 }],
          totalCount: 4,
        },
      ];

      mockSelectContentByStreamingService.mockReturnValue(multipleItems);

      render(<StreamingServiceSection />);

      expect(screen.getByText('2 shows, 2 movies')).toBeInTheDocument();
    });
  });
});
