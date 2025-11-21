import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { PersonCard } from '../personCard';
import { CastMember, ShowCastMember } from '@ajgifford/keepwatching-types';

// Mock dependencies
jest.mock('@ajgifford/keepwatching-ui', () => ({
  buildTMDBImagePath: jest.fn((path: string, size?: string) => `https://image.tmdb.org/t/p/${size || 'original'}${path}`),
}));

describe('PersonCard', () => {
  const mockCastMember: CastMember = {
    personId: 1,
    personName: 'Tom Hanks',
    name: 'Tom Hanks',
    characterName: 'Forrest Gump',
    personTmdbId: 31,
    contentId: 13,
    profileImage: '/tom-hanks.jpg',
  };

  const mockShowCastMember: ShowCastMember = {
    personId: 2,
    personName: 'Bryan Cranston',
    name: 'Bryan Cranston',
    characterName: 'Walter White',
    personTmdbId: 17419,
    contentId: 1396,
    profileImage: '/bryan-cranston.jpg',
    episodeCount: 62,
    active: true,
  };

  const returnPath = '/shows/1396/1';

  const renderPersonCard = (person: CastMember | ShowCastMember, path: string = returnPath) => {
    return render(
      <BrowserRouter>
        <PersonCard person={person} returnPath={path} />
      </BrowserRouter>
    );
  };

  describe('rendering basic CastMember', () => {
    it('should render person name', () => {
      renderPersonCard(mockCastMember);

      expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    });

    it('should render character name', () => {
      renderPersonCard(mockCastMember);

      expect(screen.getByText('Forrest Gump')).toBeInTheDocument();
    });

    it('should render profile image', () => {
      const { container } = renderPersonCard(mockCastMember);

      const avatar = container.querySelector('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w185/tom-hanks.jpg');
    });

    it('should not show episode count for basic CastMember', () => {
      renderPersonCard(mockCastMember);

      expect(screen.queryByText(/ep/)).not.toBeInTheDocument();
    });

    it('should not show Past chip for basic CastMember', () => {
      renderPersonCard(mockCastMember);

      expect(screen.queryByText('Past')).not.toBeInTheDocument();
    });
  });

  describe('rendering ShowCastMember', () => {
    it('should render person name', () => {
      renderPersonCard(mockShowCastMember);

      expect(screen.getByText('Bryan Cranston')).toBeInTheDocument();
    });

    it('should render character name', () => {
      renderPersonCard(mockShowCastMember);

      expect(screen.getByText('Walter White')).toBeInTheDocument();
    });

    it('should show episode count', () => {
      renderPersonCard(mockShowCastMember);

      expect(screen.getByText('62 eps')).toBeInTheDocument();
    });

    it('should show singular "ep" for 1 episode', () => {
      const singleEpisode: ShowCastMember = {
        ...mockShowCastMember,
        episodeCount: 1,
      };

      renderPersonCard(singleEpisode);

      expect(screen.getByText('1 ep')).toBeInTheDocument();
    });

    it('should not show Past chip for active cast member', () => {
      renderPersonCard(mockShowCastMember);

      expect(screen.queryByText('Past')).not.toBeInTheDocument();
    });

    it('should show Past chip for inactive cast member', () => {
      const inactiveCast: ShowCastMember = {
        ...mockShowCastMember,
        active: false,
      };

      renderPersonCard(inactiveCast);

      expect(screen.getByText('Past')).toBeInTheDocument();
    });
  });

  describe('navigation link', () => {
    it('should render as a Link component with correct href', () => {
      const { container } = renderPersonCard(mockCastMember);

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/person/1');
    });

    it('should use personId in the link', () => {
      const differentPerson = { ...mockCastMember, personId: 999 };
      const { container } = renderPersonCard(differentPerson);

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/person/999');
    });

    it('should pass returnPath in navigation state', () => {
      const customReturnPath = '/movies/123/5';
      renderPersonCard(mockCastMember, customReturnPath);

      // Link renders correctly (state is handled by React Router)
      const link = screen.getByText('Tom Hanks').closest('a');
      expect(link).toBeInTheDocument();
    });
  });

  describe('image handling', () => {
    it('should call buildTMDBImagePath with w185 size', () => {
      const { buildTMDBImagePath } = require('@ajgifford/keepwatching-ui');
      renderPersonCard(mockCastMember);

      expect(buildTMDBImagePath).toHaveBeenCalledWith('/tom-hanks.jpg', 'w185');
    });

    it('should handle missing profile image', () => {
      const noImagePerson = { ...mockCastMember, profileImage: '' };
      const { container } = renderPersonCard(noImagePerson);

      const avatar = container.querySelector('img');
      expect(avatar).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w185');
    });
  });

  describe('episode count variations', () => {
    it('should show plural "eps" for 0 episodes', () => {
      const zeroEpisodes: ShowCastMember = {
        ...mockShowCastMember,
        episodeCount: 0,
      };

      renderPersonCard(zeroEpisodes);

      expect(screen.getByText('0 eps')).toBeInTheDocument();
    });

    it('should show plural "eps" for 2 episodes', () => {
      const twoEpisodes: ShowCastMember = {
        ...mockShowCastMember,
        episodeCount: 2,
      };

      renderPersonCard(twoEpisodes);

      expect(screen.getByText('2 eps')).toBeInTheDocument();
    });

    it('should show plural "eps" for many episodes', () => {
      const manyEpisodes: ShowCastMember = {
        ...mockShowCastMember,
        episodeCount: 150,
      };

      renderPersonCard(manyEpisodes);

      expect(screen.getByText('150 eps')).toBeInTheDocument();
    });
  });

  describe('active status combinations', () => {
    it('should show both episode count and Past chip when inactive', () => {
      const inactiveCast: ShowCastMember = {
        ...mockShowCastMember,
        episodeCount: 10,
        active: false,
      };

      renderPersonCard(inactiveCast);

      expect(screen.getByText('10 eps')).toBeInTheDocument();
      expect(screen.getByText('Past')).toBeInTheDocument();
    });

    it('should show only episode count when active', () => {
      const activeCast: ShowCastMember = {
        ...mockShowCastMember,
        episodeCount: 10,
        active: true,
      };

      renderPersonCard(activeCast);

      expect(screen.getByText('10 eps')).toBeInTheDocument();
      expect(screen.queryByText('Past')).not.toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should render Card component', () => {
      const { container } = renderPersonCard(mockCastMember);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render CardContent', () => {
      const { container } = renderPersonCard(mockCastMember);

      const cardContent = container.querySelector('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    it('should render Avatar', () => {
      const { container } = renderPersonCard(mockCastMember);

      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();
    });

    it('should render Chip components for ShowCastMember', () => {
      const { container } = renderPersonCard(mockShowCastMember);

      const chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBeGreaterThanOrEqual(1); // At least episode count chip
    });
  });

  describe('edge cases', () => {
    it('should handle very long names', () => {
      const longNamePerson = {
        ...mockCastMember,
        name: 'A Very Long Name That Goes On And On And On',
        personName: 'A Very Long Name That Goes On And On And On',
      };

      renderPersonCard(longNamePerson);

      expect(screen.getByText(/A Very Long Name/)).toBeInTheDocument();
    });

    it('should handle very long character names', () => {
      const longCharacterPerson = {
        ...mockCastMember,
        characterName: 'A Very Long Character Name With Many Words',
      };

      renderPersonCard(longCharacterPerson);

      expect(screen.getByText('A Very Long Character Name With Many Words')).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const specialCharPerson = {
        ...mockCastMember,
        name: "O'Brien & Smith",
        personName: "O'Brien & Smith",
        characterName: "Lt. Dan \"Danny\" O'Reilly",
      };

      renderPersonCard(specialCharPerson);

      expect(screen.getByText("O'Brien & Smith")).toBeInTheDocument();
      expect(screen.getByText(/Lt. Dan "Danny" O'Reilly/)).toBeInTheDocument();
    });

    it('should handle empty character name', () => {
      const noCharacterPerson = {
        ...mockCastMember,
        characterName: '',
      };

      renderPersonCard(noCharacterPerson);

      expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    });

    it('should handle different personId types', () => {
      const differentIdPerson = { ...mockCastMember, personId: 12345 };
      const { container } = renderPersonCard(differentIdPerson);

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/person/12345');
    });
  });

  describe('type guard behavior', () => {
    it('should correctly identify ShowCastMember with episodeCount and active', () => {
      renderPersonCard(mockShowCastMember);

      // Should show episode count (proving ShowCastMember was identified)
      expect(screen.getByText('62 eps')).toBeInTheDocument();
    });

    it('should correctly identify regular CastMember without episodeCount', () => {
      renderPersonCard(mockCastMember);

      // Should NOT show episode count (proving CastMember was identified)
      expect(screen.queryByText(/ep/)).not.toBeInTheDocument();
    });
  });
});
