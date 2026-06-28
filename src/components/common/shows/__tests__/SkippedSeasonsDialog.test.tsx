import { render, screen } from '@testing-library/react';

import SkippedSeasonsDialog from '../SkippedSeasonsDialog';
import { WatchStatus } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

const mockSeason = (id: number, name: string) => ({
  id,
  showId: 1,
  tmdbId: 1000 + id,
  name,
  overview: '',
  seasonNumber: id,
  numberOfEpisodes: 5,
  releaseDate: '2020-01-01',
  posterImage: '',
  profileId: 1,
  watchStatus: WatchStatus.NOT_WATCHED,
  episodes: [],
});

describe('SkippedSeasonsDialog', () => {
  const mockOnMarkAll = jest.fn();
  const mockOnMarkSkipped = jest.fn();
  const mockOnMarkJustThis = jest.fn();
  const mockOnClose = jest.fn();

  const skippedSeasons = [mockSeason(2, 'Season 2'), mockSeason(3, 'Season 3')];
  const targetSeason = mockSeason(4, 'Season 4');

  const defaultProps = {
    open: true,
    skippedSeasons,
    targetSeason,
    onMarkAll: mockOnMarkAll,
    onMarkSkipped: mockOnMarkSkipped,
    onMarkJustThis: mockOnMarkJustThis,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the dialog title', () => {
      render(<SkippedSeasonsDialog {...defaultProps} />);

      expect(screen.getByText("Earlier seasons aren't marked as watched")).toBeInTheDocument();
    });

    it('uses "as watched" (not "as previously watched") in the description text', () => {
      render(<SkippedSeasonsDialog {...defaultProps} />);

      // The <strong> element inside the description should read "Season 4 as watched"
      expect(screen.getByText('Season 4 as watched')).toBeInTheDocument();
    });

    it('uses triggerLabel when provided instead of targetSeason name', () => {
      render(<SkippedSeasonsDialog {...defaultProps} targetSeason={null} triggerLabel="S4 E1 as watched" />);

      expect(screen.getByText(/S4 E1 as watched/)).toBeInTheDocument();
    });

    it('lists all skipped seasons', () => {
      render(<SkippedSeasonsDialog {...defaultProps} />);

      expect(screen.getByText('Season 2')).toBeInTheDocument();
      expect(screen.getByText('Season 3')).toBeInTheDocument();
    });

    it('renders the "Mark as previously watched" button', () => {
      render(<SkippedSeasonsDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /mark as previously watched/i })).toBeInTheDocument();
    });

    it('renders the "Mark as skipped" button', () => {
      render(<SkippedSeasonsDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /mark as skipped/i })).toBeInTheDocument();
    });

    it('renders "No, just {seasonName}" button when targetSeason is provided', () => {
      render(<SkippedSeasonsDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /no, just season 4/i })).toBeInTheDocument();
    });

    it('renders "No, continue anyway" button when no targetSeason', () => {
      render(<SkippedSeasonsDialog {...defaultProps} targetSeason={null} triggerLabel="S4 E1 as watched" />);

      expect(screen.getByRole('button', { name: /no, continue anyway/i })).toBeInTheDocument();
    });

    it('uses plural wording for multiple skipped seasons', () => {
      render(<SkippedSeasonsDialog {...defaultProps} />);

      expect(screen.getByText(/seasons have not been watched yet/i)).toBeInTheDocument();
    });

    it('uses singular wording for one skipped season', () => {
      render(<SkippedSeasonsDialog {...defaultProps} skippedSeasons={[mockSeason(2, 'Season 2')]} />);

      expect(screen.getByText(/season has not been watched yet/i)).toBeInTheDocument();
    });

    it('returns null when both targetSeason and triggerLabel are absent', () => {
      const { container } = render(
        <SkippedSeasonsDialog {...defaultProps} targetSeason={null} triggerLabel={undefined} />
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('interactions', () => {
    it('calls onMarkAll when "Mark as previously watched" is clicked', async () => {
      const user = userEvent.setup();
      render(<SkippedSeasonsDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /mark as previously watched/i }));

      expect(mockOnMarkAll).toHaveBeenCalledTimes(1);
    });

    it('calls onMarkSkipped when "Mark as skipped" is clicked', async () => {
      const user = userEvent.setup();
      render(<SkippedSeasonsDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /mark as skipped/i }));

      expect(mockOnMarkSkipped).toHaveBeenCalledTimes(1);
    });

    it('calls onMarkJustThis when "No, just Season 4" is clicked', async () => {
      const user = userEvent.setup();
      render(<SkippedSeasonsDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /no, just season 4/i }));

      expect(mockOnMarkJustThis).toHaveBeenCalledTimes(1);
    });
  });
});
