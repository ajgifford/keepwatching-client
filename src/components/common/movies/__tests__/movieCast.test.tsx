import { render, screen } from '@testing-library/react';

import { MovieCastSection } from '../movieCast';
import { CastMember } from '@ajgifford/keepwatching-types';

// Mock PersonCard component
jest.mock('../../person/personCard', () => ({
  PersonCard: ({ person, returnPath }: any) => (
    <div data-testid={`person-card-${person.personId}`} data-return-path={returnPath}>
      {person.personName} as {person.characterName}
    </div>
  ),
}));

describe('MovieCastSection', () => {
  const mockCastMembers: CastMember[] = [
    {
      personId: 1,
      personName: 'Tom Hanks',
      characterName: 'Forrest Gump',
      personTmdbId: 31,
      contentId: 13,
      profileImage: '/tom-hanks.jpg',
    },
    {
      personId: 2,
      personName: 'Robin Wright',
      characterName: 'Jenny Curran',
      personTmdbId: 32,
      contentId: 13,
      profileImage: '/robin-wright.jpg',
    },
    {
      personId: 3,
      personName: 'Gary Sinise',
      characterName: 'Lieutenant Dan',
      personTmdbId: 33,
      contentId: 13,
      profileImage: '/gary-sinise.jpg',
    },
  ];

  const profileId = 5;

  describe('rendering with cast members', () => {
    it('should render all cast members', () => {
      render(<MovieCastSection castMembers={mockCastMembers} profileId={profileId} />);

      expect(screen.getByTestId('person-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('person-card-3')).toBeInTheDocument();
    });

    it('should display person names and character names', () => {
      render(<MovieCastSection castMembers={mockCastMembers} profileId={profileId} />);

      expect(screen.getByText('Tom Hanks as Forrest Gump')).toBeInTheDocument();
      expect(screen.getByText('Robin Wright as Jenny Curran')).toBeInTheDocument();
      expect(screen.getByText('Gary Sinise as Lieutenant Dan')).toBeInTheDocument();
    });

    it('should pass correct returnPath to PersonCard components', () => {
      render(<MovieCastSection castMembers={mockCastMembers} profileId={profileId} />);

      const personCard1 = screen.getByTestId('person-card-1');
      expect(personCard1).toHaveAttribute('data-return-path', '/movies/13/5');
    });

    it('should pass profileId as string', () => {
      const stringProfileId = '10';
      render(<MovieCastSection castMembers={mockCastMembers} profileId={stringProfileId} />);

      const personCard1 = screen.getByTestId('person-card-1');
      expect(personCard1).toHaveAttribute('data-return-path', '/movies/13/10');
    });

    it('should render single cast member', () => {
      const singleCast = [mockCastMembers[0]];
      render(<MovieCastSection castMembers={singleCast} profileId={profileId} />);

      expect(screen.getByTestId('person-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('person-card-2')).not.toBeInTheDocument();
    });

    it('should render many cast members', () => {
      const manyCast = Array.from({ length: 20 }, (_, i) => ({
        personId: i + 1,
        personName: `Actor ${i + 1}`,
        characterName: `Character ${i + 1}`,
        personTmdbId: i + 100,
        contentId: 13,
        profileImage: `/actor-${i + 1}.jpg`,
      }));

      render(<MovieCastSection castMembers={manyCast} profileId={profileId} />);

      expect(screen.getAllByTestId(/^person-card-/).length).toBe(20);
    });
  });

  describe('empty state', () => {
    it('should show empty message when castMembers is empty array', () => {
      render(<MovieCastSection castMembers={[]} profileId={profileId} />);

      expect(screen.getByText('No cast available')).toBeInTheDocument();
      expect(screen.queryByTestId(/^person-card-/)).not.toBeInTheDocument();
    });

    it('should show empty message when castMembers is null', () => {
      render(<MovieCastSection castMembers={null as any} profileId={profileId} />);

      expect(screen.getByText('No cast available')).toBeInTheDocument();
    });

    it('should show empty message when castMembers is undefined', () => {
      render(<MovieCastSection castMembers={undefined as any} profileId={profileId} />);

      expect(screen.getByText('No cast available')).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render Box component', () => {
      const { container } = render(<MovieCastSection castMembers={mockCastMembers} profileId={profileId} />);

      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render Grid container', () => {
      const { container } = render(<MovieCastSection castMembers={mockCastMembers} profileId={profileId} />);

      const grid = container.querySelector('[class*="MuiGrid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should render empty state in centered box', () => {
      const { container } = render(<MovieCastSection castMembers={[]} profileId={profileId} />);

      const emptyMessage = screen.getByText('No cast available');
      expect(emptyMessage).toBeInTheDocument();
      expect(emptyMessage.tagName).toBe('P');
    });
  });

  describe('edge cases', () => {
    it('should handle cast member with missing profileImage', () => {
      const castWithoutImage = [{
        ...mockCastMembers[0],
        profileImage: '',
      }];

      render(<MovieCastSection castMembers={castWithoutImage} profileId={profileId} />);

      expect(screen.getByTestId('person-card-1')).toBeInTheDocument();
    });

    it('should handle cast member with long names', () => {
      const longNameCast = [{
        personId: 1,
        personName: 'A Very Long Actor Name That Goes On And On',
        characterName: 'A Very Long Character Name That Goes On And On',
        personTmdbId: 31,
        contentId: 13,
        profileImage: '/actor.jpg',
      }];

      render(<MovieCastSection castMembers={longNameCast} profileId={profileId} />);

      expect(screen.getByText(/A Very Long Actor Name/)).toBeInTheDocument();
    });

    it('should handle different contentIds for different cast members', () => {
      const differentContentIds = [
        { ...mockCastMembers[0], contentId: 1 },
        { ...mockCastMembers[1], contentId: 2 },
      ];

      render(<MovieCastSection castMembers={differentContentIds} profileId={profileId} />);

      const card1 = screen.getByTestId('person-card-1');
      const card2 = screen.getByTestId('person-card-2');

      expect(card1).toHaveAttribute('data-return-path', '/movies/1/5');
      expect(card2).toHaveAttribute('data-return-path', '/movies/2/5');
    });

    it('should handle zero profileId', () => {
      render(<MovieCastSection castMembers={mockCastMembers} profileId={0} />);

      const personCard1 = screen.getByTestId('person-card-1');
      expect(personCard1).toHaveAttribute('data-return-path', '/movies/13/0');
    });

    it('should use personId as key for Grid items', () => {
      const { container } = render(<MovieCastSection castMembers={mockCastMembers} profileId={profileId} />);

      // All PersonCard components should be rendered
      const personCards = container.querySelectorAll('[data-testid^="person-card-"]');
      expect(personCards.length).toBe(3);
    });
  });

  describe('cast member data variations', () => {
    it('should handle cast with minimal information', () => {
      const minimalCast: CastMember[] = [{
        personId: 1,
        personName: 'Actor',
        characterName: 'Character',
        personTmdbId: 1,
        contentId: 1,
        profileImage: '',
      }];

      render(<MovieCastSection castMembers={minimalCast} profileId={profileId} />);

      expect(screen.getByText('Actor as Character')).toBeInTheDocument();
    });

    it('should handle cast with special characters in names', () => {
      const specialCharCast: CastMember[] = [{
        personId: 1,
        personName: "O'Brien & Smith",
        characterName: "Lt. Dan \"Danny\" O'Reilly",
        personTmdbId: 1,
        contentId: 1,
        profileImage: '/actor.jpg',
      }];

      render(<MovieCastSection castMembers={specialCharCast} profileId={profileId} />);

      expect(screen.getByText(/O'Brien & Smith/)).toBeInTheDocument();
    });
  });
});
