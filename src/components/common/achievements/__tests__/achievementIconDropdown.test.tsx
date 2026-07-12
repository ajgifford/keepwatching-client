import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useAppSelector } from '../../../../app/hooks';
import { selectLastViewedAchievementsAt, selectMilestoneStats } from '../../../../app/slices/activeProfileSlice';
import AchievementIconDropdown from '../achievementIconDropdown';
import { AchievementType, MilestoneStats } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockNotificationTimestamp = jest.fn(() => '2 hours ago');

jest.mock('../../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../../app/hooks/useDateFormatters', () => ({
  useDateFormatters: () => ({
    notificationTimestamp: mockNotificationTimestamp,
  }),
}));

jest.mock('../../../../app/slices/activeProfileSlice', () => ({
  markAchievementsViewed: jest.fn(() => ({ type: 'activeProfile/markAchievementsViewed' })),
  selectMilestoneStats: jest.fn(),
  selectLastViewedAchievementsAt: jest.fn(),
}));

const mockMilestoneStats: MilestoneStats = {
  totalEpisodesWatched: 250,
  totalMoviesWatched: 5,
  totalHoursWatched: 100,
  totalShowsCompleted: 1,
  milestones: [
    { type: 'episodes', threshold: 250, achieved: true, progress: 100 },
    { type: 'movies', threshold: 5, achieved: true, progress: 100 },
  ],
  recentAchievements: [],
  allAchievements: [
    {
      description: '250 episodes watched',
      achievedDate: '2026-07-11T00:00:00.000Z',
      achievementType: AchievementType.EPISODES_WATCHED,
      thresholdValue: 250,
    },
    {
      description: '5 movies watched',
      achievedDate: '2026-07-10T00:00:00.000Z',
      achievementType: AchievementType.MOVIES_WATCHED,
      thresholdValue: 5,
    },
  ],
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <AchievementIconDropdown />
    </BrowserRouter>
  );

const setupSelectors = (
  milestoneStats: MilestoneStats | null = mockMilestoneStats,
  lastViewedAchievementsAt?: string
) => {
  jest.mocked(useAppSelector).mockImplementation((selector: any) => {
    if (selector === selectMilestoneStats) return milestoneStats;
    if (selector === selectLastViewedAchievementsAt) return lastViewedAchievementsAt;
    return null;
  });
};

describe('AchievementIconDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelectors();
  });

  it('renders the trophy icon button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /achievements/i })).toBeInTheDocument();
  });

  it('shows a count badge for badges unlocked since the last view', () => {
    renderComponent();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not show a count once everything has been viewed', () => {
    setupSelectors(mockMilestoneStats, '2026-07-12T00:00:00.000Z');
    renderComponent();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('opens the dropdown and marks achievements viewed when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.queryByRole('heading', { name: 'Achievements' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /achievements/i }));

    expect(screen.getByRole('heading', { name: 'Achievements' })).toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'activeProfile/markAchievementsViewed' });
  });

  it('lists recently unlocked badges, newest first', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /achievements/i }));

    expect(screen.getByText('250 Episodes Watched')).toBeInTheDocument();
    expect(screen.getByText('5 Movies Watched')).toBeInTheDocument();
  });

  it('navigates to the badge deep link when a row is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /achievements/i }));
    await user.click(screen.getByText('250 Episodes Watched'));

    expect(mockNavigate).toHaveBeenCalledWith('/achievements?badge=episodes-250');
  });

  it('navigates to the full page from "View All Achievements"', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /achievements/i }));
    await user.click(screen.getByRole('button', { name: /view all achievements/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/achievements');
  });

  describe('empty state', () => {
    beforeEach(() => {
      setupSelectors(null);
    });

    it('shows a friendly empty message', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /achievements/i }));

      expect(screen.getByText('No badges unlocked yet')).toBeInTheDocument();
    });

    it('still offers a way to view the full page', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /achievements/i }));

      expect(screen.getByRole('button', { name: /view all achievements/i })).toBeInTheDocument();
    });
  });
});
