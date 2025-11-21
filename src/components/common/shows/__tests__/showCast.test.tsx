import { render, screen } from '@testing-library/react';

import { ShowCastSection } from '../showCast';
import { ShowCast, ShowCastMember } from '@ajgifford/keepwatching-types';

// Mock PersonCard component
jest.mock('../../person/personCard', () => ({
  PersonCard: ({ person, returnPath }: any) => (
    <div data-testid={`person-card-${person.personId}`} data-return-path={returnPath}>
      {person.personName} as {person.characterName}
    </div>
  ),
}));

describe('ShowCastSection', () => {
  const mockActiveCast: ShowCastMember[] = [
    {
      personId: 1,
      personName: 'Bryan Cranston',
      characterName: 'Walter White',
      profileImage: '/bryan.jpg',
      contentId: 123,
      episodeCount: 62,
      isPast: false,
    },
    {
      personId: 2,
      personName: 'Aaron Paul',
      characterName: 'Jesse Pinkman',
      profileImage: '/aaron.jpg',
      contentId: 123,
      episodeCount: 62,
      isPast: false,
    },
    {
      personId: 3,
      personName: 'Anna Gunn',
      characterName: 'Skyler White',
      profileImage: '/anna.jpg',
      contentId: 123,
      episodeCount: 62,
      isPast: false,
    },
  ];

  const mockPriorCast: ShowCastMember[] = [
    {
      personId: 4,
      personName: 'Giancarlo Esposito',
      characterName: 'Gus Fring',
      profileImage: '/giancarlo.jpg',
      contentId: 123,
      episodeCount: 26,
      isPast: true,
    },
    {
      personId: 5,
      personName: 'Bob Odenkirk',
      characterName: 'Saul Goodman',
      profileImage: '/bob.jpg',
      contentId: 123,
      episodeCount: 43,
      isPast: true,
    },
  ];

  const mockCast: ShowCast = {
    activeCast: mockActiveCast,
    priorCast: mockPriorCast,
  };

  describe('active cast rendering', () => {
    it('should render all active cast members', () => {
      render(<ShowCastSection cast={mockCast} profileId={1} />);

      expect(screen.getByText(/Bryan Cranston as Walter White/)).toBeInTheDocument();
      expect(screen.getByText(/Aaron Paul as Jesse Pinkman/)).toBeInTheDocument();
      expect(screen.getByText(/Anna Gunn as Skyler White/)).toBeInTheDocument();
    });

    it('should render PersonCard for each active cast member', () => {
      render(<ShowCastSection cast={mockCast} profileId={1} />);

      expect(screen.getByTestId('person-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-3')).toBeInTheDocument();
    });

    it('should pass correct returnPath to active cast PersonCards', () => {
      render(<ShowCastSection cast={mockCast} profileId={1} />);

      const personCard1 = screen.getByTestId('person-card-1');
      expect(personCard1).toHaveAttribute('data-return-path', '/shows/123/1');
    });

    it('should handle empty active cast', () => {
      const emptyCast: ShowCast = {
        activeCast: [],
        priorCast: mockPriorCast,
      };

      render(<ShowCastSection cast={emptyCast} profileId={1} />);

      expect(screen.getByText('No cast available')).toBeInTheDocument();
    });

    it('should handle undefined active cast', () => {
      const emptyCast: ShowCast = {
        activeCast: undefined as any,
        priorCast: mockPriorCast,
      };

      render(<ShowCastSection cast={emptyCast} profileId={1} />);

      expect(screen.getByText('No cast available')).toBeInTheDocument();
    });
  });

  describe('prior cast rendering', () => {
    it('should render all prior cast members', () => {
      render(<ShowCastSection cast={mockCast} profileId={1} />);

      expect(screen.getByText(/Giancarlo Esposito as Gus Fring/)).toBeInTheDocument();
      expect(screen.getByText(/Bob Odenkirk as Saul Goodman/)).toBeInTheDocument();
    });

    it('should render PersonCard for each prior cast member', () => {
      render(<ShowCastSection cast={mockCast} profileId={1} />);

      expect(screen.getByTestId('person-card-4')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-5')).toBeInTheDocument();
    });

    it('should pass correct returnPath to prior cast PersonCards', () => {
      render(<ShowCastSection cast={mockCast} profileId={1} />);

      const personCard4 = screen.getByTestId('person-card-4');
      expect(personCard4).toHaveAttribute('data-return-path', '/shows/123/1');
    });

    it('should handle empty prior cast', () => {
      const emptyCast: ShowCast = {
        activeCast: mockActiveCast,
        priorCast: [],
      };

      render(<ShowCastSection cast={emptyCast} profileId={1} />);

      expect(screen.getByText('No prior cast available')).toBeInTheDocument();
    });

    it('should handle undefined prior cast', () => {
      const emptyCast: ShowCast = {
        activeCast: mockActiveCast,
        priorCast: undefined as any,
      };

      render(<ShowCastSection cast={emptyCast} profileId={1} />);

      expect(screen.getByText('No prior cast available')).toBeInTheDocument();
    });
  });

  describe('both casts empty', () => {
    it('should show both empty messages when no cast members', () => {
      const emptyCast: ShowCast = {
        activeCast: [],
        priorCast: [],
      };

      render(<ShowCastSection cast={emptyCast} profileId={1} />);

      expect(screen.getByText('No cast available')).toBeInTheDocument();
      expect(screen.getByText('No prior cast available')).toBeInTheDocument();
    });
  });

  describe('profileId handling', () => {
    it('should handle numeric profileId', () => {
      render(<ShowCastSection cast={mockCast} profileId={123} />);

      const personCard = screen.getByTestId('person-card-1');
      expect(personCard).toHaveAttribute('data-return-path', '/shows/123/123');
    });

    it('should handle string profileId', () => {
      render(<ShowCastSection cast={mockCast} profileId="456" />);

      const personCard = screen.getByTestId('person-card-1');
      expect(personCard).toHaveAttribute('data-return-path', '/shows/123/456');
    });
  });

  describe('layout and styling', () => {
    it('should render Grid containers', () => {
      const { container } = render(<ShowCastSection cast={mockCast} profileId={1} />);

      const grids = container.querySelectorAll('.MuiGrid-container');
      expect(grids.length).toBeGreaterThanOrEqual(2); // At least 2 grid containers (active and prior)
    });

    it('should render Box components', () => {
      const { container } = render(<ShowCastSection cast={mockCast} profileId={1} />);

      const boxes = container.querySelectorAll('.MuiBox-root');
      expect(boxes.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle single active cast member', () => {
      const singleCast: ShowCast = {
        activeCast: [mockActiveCast[0]],
        priorCast: [],
      };

      render(<ShowCastSection cast={singleCast} profileId={1} />);

      expect(screen.getByTestId('person-card-1')).toBeInTheDocument();
      expect(screen.getByText('No prior cast available')).toBeInTheDocument();
    });

    it('should handle single prior cast member', () => {
      const singleCast: ShowCast = {
        activeCast: [],
        priorCast: [mockPriorCast[0]],
      };

      render(<ShowCastSection cast={singleCast} profileId={1} />);

      expect(screen.getByTestId('person-card-4')).toBeInTheDocument();
      expect(screen.getByText('No cast available')).toBeInTheDocument();
    });

    it('should handle large number of cast members', () => {
      const manyCastMembers = Array.from({ length: 20 }, (_, i) => ({
        personId: i,
        personName: `Actor ${i}`,
        characterName: `Character ${i}`,
        profileImage: `/actor-${i}.jpg`,
        contentId: 123,
        episodeCount: 10,
        isPast: false,
      }));

      const largeCast: ShowCast = {
        activeCast: manyCastMembers,
        priorCast: [],
      };

      render(<ShowCastSection cast={largeCast} profileId={1} />);

      manyCastMembers.forEach((member) => {
        expect(screen.getByTestId(`person-card-${member.personId}`)).toBeInTheDocument();
      });
    });

    it('should handle special characters in names', () => {
      const specialCharsCast: ShowCastMember[] = [
        {
          personId: 1,
          personName: "O'Brien & Smith-Jones",
          characterName: "D'Angelo",
          profileImage: '/actor.jpg',
          contentId: 123,
          episodeCount: 10,
          isPast: false,
        },
      ];

      const cast: ShowCast = {
        activeCast: specialCharsCast,
        priorCast: [],
      };

      render(<ShowCastSection cast={cast} profileId={1} />);

      expect(screen.getByText(/O'Brien & Smith-Jones as D'Angelo/)).toBeInTheDocument();
    });

    it('should use personId as unique key', () => {
      render(<ShowCastSection cast={mockCast} profileId={1} />);

      // Each PersonCard should have a unique testid based on personId
      expect(screen.getByTestId('person-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-4')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-5')).toBeInTheDocument();
    });
  });

  describe('empty message styling', () => {
    it('should render empty message with correct styling', () => {
      const emptyCast: ShowCast = {
        activeCast: [],
        priorCast: [],
      };

      const { container } = render(<ShowCastSection cast={emptyCast} profileId={1} />);

      const emptyMessages = container.querySelectorAll('.MuiTypography-body1');
      expect(emptyMessages).toHaveLength(2);
    });
  });

  describe('contentId handling', () => {
    it('should use contentId from cast member in return path', () => {
      const differentContentIds: ShowCast = {
        activeCast: [
          { ...mockActiveCast[0], contentId: 100 },
          { ...mockActiveCast[1], contentId: 200 },
        ],
        priorCast: [],
      };

      render(<ShowCastSection cast={differentContentIds} profileId={1} />);

      expect(screen.getByTestId('person-card-1')).toHaveAttribute('data-return-path', '/shows/100/1');
      expect(screen.getByTestId('person-card-2')).toHaveAttribute('data-return-path', '/shows/200/1');
    });
  });
});
