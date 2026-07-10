import { act, render, screen, waitFor, within } from '@testing-library/react';

import { useAppSelector } from '../../../app/hooks';
import { fetchMilestoneStats, selectActiveProfile, selectMilestoneStats } from '../../../app/slices/activeProfileSlice';
import Achievements from '../achievements';
import { AchievementType, MilestoneStats } from '@ajgifford/keepwatching-types';
import userEvent from '@testing-library/user-event';

const mockDispatch = jest.fn();
const mockToPng = jest.fn();

jest.mock('../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../app/slices/activeProfileSlice', () => ({
  fetchMilestoneStats: jest.fn(() => ({ type: 'activeProfile/fetchMilestoneStats' })),
  selectActiveProfile: jest.fn(),
  selectMilestoneStats: jest.fn(),
}));

jest.mock('@ajgifford/keepwatching-ui', () => ({
  LoadingComponent: () => <div data-testid="loading-component">Loading...</div>,
}));

jest.mock('html-to-image', () => ({
  toPng: (...args: unknown[]) => mockToPng(...args),
}));

const mockProfile = { id: 7, accountId: 42, name: 'Andy' };

function mockSelectors(profile: unknown, milestoneStats: MilestoneStats | null) {
  (useAppSelector as unknown as jest.Mock).mockImplementation((selector: (state: unknown) => unknown) => {
    if (selector === selectActiveProfile) return profile;
    if (selector === selectMilestoneStats) return milestoneStats;
    return undefined;
  });
}

function buildMilestoneStats(overrides: Partial<MilestoneStats> = {}): MilestoneStats {
  return {
    totalEpisodesWatched: 0,
    totalMoviesWatched: 0,
    totalHoursWatched: 0,
    milestones: [],
    recentAchievements: [],
    allAchievements: [],
    ...overrides,
  };
}

describe('Achievements page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToPng.mockResolvedValue('data:image/png;base64,fake');
  });

  it('shows a loading state while the active profile is not yet available', () => {
    mockSelectors(null, null);
    render(<Achievements />);
    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
  });

  it('shows a loading state while milestone stats have not loaded yet', () => {
    mockSelectors(mockProfile, null);
    render(<Achievements />);
    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
  });

  it('dispatches fetchMilestoneStats on mount once a profile is available', () => {
    mockSelectors(mockProfile, buildMilestoneStats());
    render(<Achievements />);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'activeProfile/fetchMilestoneStats' });
  });

  it('shows the unlocked count and renders locked/unlocked badges', async () => {
    const stats = buildMilestoneStats({
      milestones: [
        { type: 'episodes', threshold: 10, achieved: true, progress: 100 },
        { type: 'episodes', threshold: 25, achieved: false, progress: 40 },
      ],
      allAchievements: [
        {
          description: '10 Episodes Watched',
          achievedDate: '2026-01-15T00:00:00.000Z',
          achievementType: AchievementType.EPISODES_WATCHED,
          thresholdValue: 10,
        },
      ],
    });
    mockSelectors(mockProfile, stats);

    render(<Achievements />);

    expect(await screen.findByText(/1 of 46 badges unlocked/i)).toBeInTheDocument();
    // "10 Episodes Watched" appears twice: once in Recently Unlocked, once in the Episodes section
    expect(screen.getAllByText('10 Episodes Watched').length).toBeGreaterThan(0);
    expect(screen.getByText('25 Episodes Watched')).toBeInTheDocument();
  });

  it('shows a Recently Unlocked section for badges with a known unlock date', async () => {
    const stats = buildMilestoneStats({
      milestones: [{ type: 'movies', threshold: 5, achieved: true, progress: 100 }],
      allAchievements: [
        {
          description: '5 Movies Watched',
          achievedDate: '2026-02-01T00:00:00.000Z',
          achievementType: AchievementType.MOVIES_WATCHED,
          thresholdValue: 5,
        },
      ],
    });
    mockSelectors(mockProfile, stats);

    render(<Achievements />);

    expect(await screen.findByText('Recently Unlocked')).toBeInTheDocument();
  });

  it('opens a share dialog with progress messaging for a locked badge', async () => {
    const user = userEvent.setup();
    const stats = buildMilestoneStats({
      milestones: [{ type: 'movies', threshold: 5, achieved: false, progress: 40 }],
    });
    mockSelectors(mockProfile, stats);

    render(<Achievements />);

    await user.click(screen.getByText('5 Movies Watched'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/keep watching to unlock this badge — 40%/i)).toBeInTheDocument();
    expect(within(dialog).queryByLabelText(/download as image/i)).not.toBeInTheDocument();
  });

  it('opens a share dialog with download/share actions for an unlocked badge and downloads a PNG', async () => {
    const user = userEvent.setup();
    const stats = buildMilestoneStats({
      milestones: [{ type: 'movies', threshold: 5, achieved: true, progress: 100 }],
      allAchievements: [
        {
          description: '5 Movies Watched',
          achievedDate: '2026-02-01T00:00:00.000Z',
          achievementType: AchievementType.MOVIES_WATCHED,
          thresholdValue: 5,
        },
      ],
    });
    mockSelectors(mockProfile, stats);

    render(<Achievements />);

    await user.click(screen.getAllByText('5 Movies Watched')[0]);

    const dialog = await screen.findByRole('dialog');
    const downloadButton = within(dialog).getByLabelText(/download as image/i);

    await act(async () => {
      await user.click(downloadButton);
    });

    await waitFor(() => {
      expect(mockToPng).toHaveBeenCalled();
    });
  });
});
