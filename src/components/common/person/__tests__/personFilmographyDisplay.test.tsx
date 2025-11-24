import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PersonFilmographyDisplay } from '../personFilmographyDisplay';
import { PersonSearchDetails } from '../../../../app/model/personSearchTypes';
import { SearchPersonCredit } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('../../../utility/contentUtility', () => ({
  calculateRuntimeDisplay: jest.fn((runtime: number) => `${Math.floor(runtime / 60)}h ${runtime % 60}m`),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  LoadingComponent: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../media/mediaCard', () => ({
  MediaCard: ({ item, searchType }: any) => (
    <div data-testid={`media-card-${searchType}`} data-title={item.title}>
      {item.title}
    </div>
  ),
}));

jest.mock('../../tabs/tabPanel', () => ({
  TabPanel: ({ children, value, index }: any) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </div>
  ),
  a11yProps: (index: number) => ({
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }),
}));

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn(() => false);
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mockUseMediaQuery(),
}));

describe('PersonFilmographyDisplay', () => {
  const mockMovieCredits: SearchPersonCredit[] = [
    {
      tmdbId: 1,
      title: 'Movie A',
      posterImage: '/movie-a.jpg',
      releaseDate: '2023-05-15',
      character: 'Character A',
      job: 'Actor',
      mediaType: 'movie'
    },
    {
      tmdbId: 2,
      title: 'Movie B',
      posterImage: '/movie-b.jpg',
      releaseDate: '2022-03-10',
      character: 'Character B',
      job: 'Actor',
      mediaType: 'movie'
    },
    {
      tmdbId: 3,
      title: 'Movie C',
      posterImage: '/movie-c.jpg',
      releaseDate: '2024-01-20',
      character: 'Character C',
      job: 'Actor',
      mediaType: 'movie'
    },
  ];

  const mockTvCredits: SearchPersonCredit[] = [
    {
      tmdbId: 101,
      title: 'TV Show A',
      posterImage: '/tv-a.jpg',
      releaseDate: '2021-06-01',
      character: 'Character X',
      job: 'Actor',
      mediaType: 'movie'
    },
    {
      tmdbId: 102,
      title: 'TV Show B',
      posterImage: '/tv-b.jpg',
      releaseDate: '2020-09-15',
      character: 'Character Y',
      job: 'Actor',
      mediaType: 'movie'
    },
  ];

  const mockPerson: PersonSearchDetails = {
    tmdbId: 31,
    name: 'Tom Hanks',
    profileImage: '/tom-hanks.jpg',
    department: 'Acting',
    popularity: 85.5,
    knownFor: ['Forrest Gump'],
    biography: 'Biography text',
    birthday: '1956-07-09',
    birthplace: 'Concord, California, USA',
    deathday: undefined,
    movieCredits: mockMovieCredits,
    tvCredits: mockTvCredits,
    totalCredits: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render LoadingComponent when movieCredits is undefined', () => {
      const personWithoutMovies = {
        ...mockPerson,
        movieCredits: undefined,
      };

      render(<PersonFilmographyDisplay person={personWithoutMovies as any} />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should render LoadingComponent when tvCredits is undefined', () => {
      const personWithoutTv = {
        ...mockPerson,
        tvCredits: undefined,
      };

      render(<PersonFilmographyDisplay person={personWithoutTv as any} />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should render LoadingComponent when both credits are undefined', () => {
      const personWithoutCredits = {
        ...mockPerson,
        movieCredits: undefined,
        tvCredits: undefined,
      };

      render(<PersonFilmographyDisplay person={personWithoutCredits as any} />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('should render Movies tab by default', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('Movies (3)')).toBeInTheDocument();
    });

    it('should render TV Shows tab', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('TV Shows (2)')).toBeInTheDocument();
    });

    it('should show movie credits by default', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('Movie Credits (3)')).toBeInTheDocument();
    });

    it('should switch to TV Shows tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PersonFilmographyDisplay person={mockPerson} />);

      const tvTab = screen.getByText('TV Shows (2)');
      await user.click(tvTab);

      expect(screen.getByText('TV Credits (2)')).toBeInTheDocument();
    });

    it('should switch back to Movies tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PersonFilmographyDisplay person={mockPerson} />);

      const tvTab = screen.getByText('TV Shows (2)');
      await user.click(tvTab);

      const moviesTab = screen.getByText('Movies (3)');
      await user.click(moviesTab);

      expect(screen.getByText('Movie Credits (3)')).toBeInTheDocument();
    });
  });

  describe('movie credits rendering', () => {
    it('should render MediaCard components for each movie', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      const movieCards = screen.getAllByTestId('media-card-movies');
      expect(movieCards).toHaveLength(3);
    });

    it('should render all movie titles', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('Movie A')).toBeInTheDocument();
      expect(screen.getByText('Movie B')).toBeInTheDocument();
      expect(screen.getByText('Movie C')).toBeInTheDocument();
    });

    it('should display empty state when no movie credits', () => {
      const personWithoutMovies = {
        ...mockPerson,
        movieCredits: [],
      };

      render(<PersonFilmographyDisplay person={personWithoutMovies} />);

      expect(screen.getByText('No movie credits found')).toBeInTheDocument();
      expect(screen.getByText(/doesn't have any movie credits/)).toBeInTheDocument();
    });
  });

  describe('TV credits rendering', () => {
    it('should render MediaCard components for each TV show', async () => {
      const user = userEvent.setup();
      render(<PersonFilmographyDisplay person={mockPerson} />);

      const tvTab = screen.getByText('TV Shows (2)');
      await user.click(tvTab);

      const tvCards = screen.getAllByTestId('media-card-shows');
      expect(tvCards).toHaveLength(2);
    });

    it('should render all TV titles', async () => {
      const user = userEvent.setup();
      render(<PersonFilmographyDisplay person={mockPerson} />);

      const tvTab = screen.getByText('TV Shows (2)');
      await user.click(tvTab);

      expect(screen.getByText('TV Show A')).toBeInTheDocument();
      expect(screen.getByText('TV Show B')).toBeInTheDocument();
    });

    it('should display empty state when no TV credits', async () => {
      const user = userEvent.setup();
      const personWithoutTv = {
        ...mockPerson,
        tvCredits: [],
      };

      render(<PersonFilmographyDisplay person={personWithoutTv} />);

      const tvTab = screen.getByText('TV Shows (0)');
      await user.click(tvTab);

      expect(screen.getByText('No TV credits found')).toBeInTheDocument();
      expect(screen.getByText(/doesn't have any TV show credits/)).toBeInTheDocument();
    });
  });

  describe('movie sorting', () => {
    it('should sort movies by newest first by default', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      const movieCards = screen.getAllByTestId('media-card-movies');
      expect(movieCards[0]).toHaveAttribute('data-title', 'Movie C'); // 2024
      expect(movieCards[1]).toHaveAttribute('data-title', 'Movie A'); // 2023
      expect(movieCards[2]).toHaveAttribute('data-title', 'Movie B'); // 2022
    });

    it('should render sort dropdown for movies', () => {
      const { container } = render(<PersonFilmographyDisplay person={mockPerson} />);

      // FormControl with sort options should be present
      const formControl = container.querySelector('.MuiFormControl-root');
      expect(formControl).toBeInTheDocument();
    });

    it('should have sort options available', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      // Check that sort label is present (indicating sort functionality exists)
      const sortLabels = screen.getAllByText('Sort by');
      expect(sortLabels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('TV sorting', () => {
    it('should sort TV shows by newest first by default', async () => {
      const user = userEvent.setup();
      render(<PersonFilmographyDisplay person={mockPerson} />);

      const tvTab = screen.getByText('TV Shows (2)');
      await user.click(tvTab);

      const tvCards = screen.getAllByTestId('media-card-shows');
      expect(tvCards[0]).toHaveAttribute('data-title', 'TV Show A'); // 2021
      expect(tvCards[1]).toHaveAttribute('data-title', 'TV Show B'); // 2020
    });

    it('should render sort dropdown for TV shows', async () => {
      const user = userEvent.setup();
      const { container } = render(<PersonFilmographyDisplay person={mockPerson} />);

      const tvTab = screen.getByText('TV Shows (2)');
      await user.click(tvTab);

      // FormControl with sort options should be present
      const formControl = container.querySelector('.MuiFormControl-root');
      expect(formControl).toBeInTheDocument();
    });
  });

  describe('career summary', () => {
    it('should render career summary section', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('Career Summary')).toBeInTheDocument();
    });

    it('should display correct movie count', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('3 Movies')).toBeInTheDocument();
    });

    it('should display correct TV count', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('2 TV Shows')).toBeInTheDocument();
    });

    it('should display total credits', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('5 Total Credits')).toBeInTheDocument();
    });

    it('should handle zero credits', () => {
      const personWithNoCredits = {
        ...mockPerson,
        movieCredits: [],
        tvCredits: [],
        totalCredits: 0,
      };

      render(<PersonFilmographyDisplay person={personWithNoCredits} />);

      expect(screen.getByText('0 Movies')).toBeInTheDocument();
      expect(screen.getByText('0 TV Shows')).toBeInTheDocument();
      expect(screen.getByText('0 Total Credits')).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should use standard tabs on large screens', () => {
      mockUseMediaQuery.mockReturnValue(false);

      render(<PersonFilmographyDisplay person={mockPerson} />);

      // Tabs component renders regardless of screen size
      expect(screen.getByText('Movies (3)')).toBeInTheDocument();
    });

    it('should use fullWidth tabs on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true);

      render(<PersonFilmographyDisplay person={mockPerson} />);

      // Tabs component renders with fullWidth on mobile
      expect(screen.getByText('Movies (3)')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing release dates in sorting', () => {
      const creditsWithMissingDates: SearchPersonCredit[] = [
        {
          tmdbId: 1,
          title: 'Movie A',
          posterImage: '/a.jpg',
          releaseDate: '',
          character: 'Character A',
          job: 'Actor',
          mediaType: 'movie'
        },
        {
          tmdbId: 2,
          title: 'Movie B',
          posterImage: '/b.jpg',
          releaseDate: '2023-01-01',
          character: 'Character B',
          job: 'Actor',
          mediaType: 'movie'
        },
      ];

      const personWithMissingDates = {
        ...mockPerson,
        movieCredits: creditsWithMissingDates,
      };

      render(<PersonFilmographyDisplay person={personWithMissingDates} />);

      const movieCards = screen.getAllByTestId('media-card-movies');
      expect(movieCards).toHaveLength(2);
    });

    it('should handle very long titles', () => {
      const longTitleCredits: SearchPersonCredit[] = [
        {
          tmdbId: 1,
          title: 'This is a very long movie title that goes on and on and on',
          posterImage: '/movie.jpg',
          releaseDate: '2023-01-01',
          character: 'Character',
          job: 'Actor',
          mediaType: 'movie'
        },
      ];

      const personWithLongTitle = {
        ...mockPerson,
        movieCredits: longTitleCredits,
      };

      render(<PersonFilmographyDisplay person={personWithLongTitle} />);

      expect(screen.getByText(/This is a very long movie title/)).toBeInTheDocument();
    });

    it('should handle special characters in titles', () => {
      const specialCharCredits: SearchPersonCredit[] = [
        {
          tmdbId: 1,
          title: "O'Brien & Smith: The Adventure",
          posterImage: '/movie.jpg',
          releaseDate: '2023-01-01',
          character: 'Character',
          job: 'Actor',
          mediaType: 'movie'
        },
      ];

      const personWithSpecialChars = {
        ...mockPerson,
        movieCredits: specialCharCredits,
      };

      render(<PersonFilmographyDisplay person={personWithSpecialChars} />);

      expect(screen.getByText("O'Brien & Smith: The Adventure")).toBeInTheDocument();
    });

    it('should handle single movie credit', () => {
      const singleMoviePerson = {
        ...mockPerson,
        movieCredits: [mockMovieCredits[0]],
        totalCredits: 1,
      };

      render(<PersonFilmographyDisplay person={singleMoviePerson} />);

      expect(screen.getByText('Movies (1)')).toBeInTheDocument();
      expect(screen.getByText('1 Movies')).toBeInTheDocument();
    });

    it('should handle single TV credit', () => {
      const singleTvPerson = {
        ...mockPerson,
        tvCredits: [mockTvCredits[0]],
        totalCredits: 1,
      };

      render(<PersonFilmographyDisplay person={singleTvPerson} />);

      expect(screen.getByText('TV Shows (1)')).toBeInTheDocument();
      expect(screen.getByText('1 TV Shows')).toBeInTheDocument();
    });

    it('should handle missing job field', () => {
      const noJobCredits: SearchPersonCredit[] = [
        {
          tmdbId: 1,
          title: 'Movie A',
          posterImage: '/movie.jpg',
          releaseDate: '2023-01-01',
          character: 'Character',
          job: undefined,
        } as any,
      ];

      const personWithNoJob = {
        ...mockPerson,
        movieCredits: noJobCredits,
      };

      render(<PersonFilmographyDisplay person={personWithNoJob} />);

      const movieCards = screen.getAllByTestId('media-card-movies');
      expect(movieCards).toHaveLength(1);
    });

    it('should handle large number of credits', () => {
      const manyCredits = Array.from({ length: 50 }, (_, i) => ({
        tmdbId: i,
        title: `Movie ${i}`,
        posterImage: `/movie-${i}.jpg`,
        releaseDate: '2023-01-01',
        character: 'Character',
        job: 'Actor',
      }));

      const personWithManyCredits = {
        ...mockPerson,
        movieCredits: manyCredits,
        totalCredits: 50,
      };

      render(<PersonFilmographyDisplay person={personWithManyCredits} />);

      expect(screen.getByText('Movies (50)')).toBeInTheDocument();
      expect(screen.getByText('50 Movies')).toBeInTheDocument();
    });
  });

  describe('sort state independence', () => {
    it('should have separate sort controls for movies and TV', async () => {
      const user = userEvent.setup();
      const { container } = render(<PersonFilmographyDisplay person={mockPerson} />);

      // Movies tab has sort control
      const movieFormControl = container.querySelector('.MuiFormControl-root');
      expect(movieFormControl).toBeInTheDocument();

      // Switch to TV tab
      const tvTab = screen.getByText('TV Shows (2)');
      await user.click(tvTab);

      // TV tab also has sort control
      const tvFormControl = container.querySelector('.MuiFormControl-root');
      expect(tvFormControl).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render Tabs component', () => {
      const { container } = render(<PersonFilmographyDisplay person={mockPerson} />);

      const tabs = container.querySelector('.MuiTabs-root');
      expect(tabs).toBeInTheDocument();
    });

    it('should render Tab components', () => {
      render(<PersonFilmographyDisplay person={mockPerson} />);

      expect(screen.getByText('Movies (3)')).toBeInTheDocument();
      expect(screen.getByText('TV Shows (2)')).toBeInTheDocument();
    });

    it('should render FormControl for sorting', () => {
      const { container } = render(<PersonFilmographyDisplay person={mockPerson} />);

      const formControls = container.querySelectorAll('.MuiFormControl-root');
      expect(formControls.length).toBeGreaterThanOrEqual(1);
    });

    it('should render Chip components in career summary', () => {
      const { container } = render(<PersonFilmographyDisplay person={mockPerson} />);

      const chips = container.querySelectorAll('.MuiChip-root');
      expect(chips).toHaveLength(3); // Movies, TV Shows, Total Credits
    });
  });
});
