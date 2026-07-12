import { act, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAppSelector } from '../../../app/hooks';
import { selectActiveProfile, selectMilestoneStats } from '../../../app/slices/activeProfileSlice';
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
  markAchievementsViewed: jest.fn(() => ({ type: 'activeProfile/markAchievementsViewed' })),
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
    totalShowsCompleted: 0,
    milestones: [],
    recentAchievements: [],
    allAchievements: [],
    ...overrides,
  };
}

function renderAchievements(initialEntries: string[] = ['/achievements']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Achievements />
    </MemoryRouter>
  );
}

describe('Achievements page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToPng.mockResolvedValue('data:image/png;base64,fake');
  });

  it('shows a loading state while the active profile is not yet available', () => {
    mockSelectors(null, null);
    renderAchievements();
    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
  });

  it('shows a loading state while milestone stats have not loaded yet', () => {
    mockSelectors(mockProfile, null);
    renderAchievements();
    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
  });

  it('dispatches fetchMilestoneStats and markAchievementsViewed on mount once a profile is available', () => {
    mockSelectors(mockProfile, buildMilestoneStats());
    renderAchievements();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'activeProfile/fetchMilestoneStats' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'activeProfile/markAchievementsViewed' });
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

    renderAchievements();

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

    renderAchievements();

    expect(await screen.findByText('Recently Unlocked')).toBeInTheDocument();
  });

  it('opens a share dialog with progress messaging for a locked badge', async () => {
    const user = userEvent.setup();
    const stats = buildMilestoneStats({
      milestones: [{ type: 'movies', threshold: 5, achieved: false, progress: 40 }],
    });
    mockSelectors(mockProfile, stats);

    renderAchievements();

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

    renderAchievements();

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

  describe('?badge= deep link', () => {
    it('opens the share dialog and scrolls to the matching badge', async () => {
      const scrollIntoViewMock = jest.fn();
      const originalGetElementById = document.getElementById.bind(document);
      jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        const element = originalGetElementById(id);
        if (element) {
          (element as HTMLElement).scrollIntoView = scrollIntoViewMock;
        }
        return element;
      });

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

      renderAchievements(['/achievements?badge=movies-5']);

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByLabelText(/download as image/i)).toBeInTheDocument();
      expect(document.getElementById).toHaveBeenCalledWith('badge-card-movies-5');
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });

    it('does nothing when the badge id in the query string does not exist', async () => {
      const stats = buildMilestoneStats({
        milestones: [{ type: 'movies', threshold: 5, achieved: true, progress: 100 }],
      });
      mockSelectors(mockProfile, stats);

      renderAchievements(['/achievements?badge=not-a-real-badge']);

      await screen.findByText(/badges unlocked/i);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
