import {
  markSeasonIdsAsPriorWatched,
  updateEpisodeWatchStatus,
  updateSeasonWatchStatus,
} from '../../slices/activeShowSlice';
import {
  recordEpisodeRewatch,
  startMovieRewatch,
  startSeasonRewatch,
  startShowRewatch,
} from '../../slices/watchHistorySlice';
import { achievementListenerMiddleware } from '../achievementListenerMiddleware';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

const mockCheckForNewAchievements = jest.fn(() => ({ type: 'activeProfile/checkForNewAchievements/mock' }));

jest.mock('../../slices/activeProfileSlice', () => {
  const actual = jest.requireActual('../../slices/activeProfileSlice');
  return {
    ...actual,
    checkForNewAchievements: () => mockCheckForNewAchievements(),
  };
});

function buildIsolatedStore() {
  return configureStore({
    reducer: combineReducers({ noop: (state = 0) => state }),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(achievementListenerMiddleware.middleware),
  });
}

describe('achievementListenerMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['updateEpisodeWatchStatus', () => updateEpisodeWatchStatus.fulfilled({} as never, 'req-1', {} as never)],
    ['updateSeasonWatchStatus', () => updateSeasonWatchStatus.fulfilled({} as never, 'req-1', {} as never)],
    ['markSeasonIdsAsPriorWatched', () => markSeasonIdsAsPriorWatched.fulfilled({} as never, 'req-1', {} as never)],
    ['startShowRewatch', () => startShowRewatch.fulfilled({} as never, 'req-1', {} as never)],
    ['startSeasonRewatch', () => startSeasonRewatch.fulfilled({} as never, 'req-1', {} as never)],
    ['startMovieRewatch', () => startMovieRewatch.fulfilled({} as never, 'req-1', {} as never)],
    ['recordEpisodeRewatch', () => recordEpisodeRewatch.fulfilled({} as never, 'req-1', {} as never)],
  ])('dispatches checkForNewAchievements after %s fulfills', async (_name, buildAction) => {
    const store = buildIsolatedStore();
    store.dispatch(buildAction());

    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(mockCheckForNewAchievements).toHaveBeenCalledTimes(1);
  });

  it('collapses several fulfilled actions from one bulk operation into a single check', async () => {
    const store = buildIsolatedStore();

    store.dispatch(updateEpisodeWatchStatus.fulfilled({} as never, 'req-1', {} as never));
    store.dispatch(updateEpisodeWatchStatus.fulfilled({} as never, 'req-2', {} as never));
    store.dispatch(updateEpisodeWatchStatus.fulfilled({} as never, 'req-3', {} as never));

    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(mockCheckForNewAchievements).toHaveBeenCalledTimes(1);
  });

  it('ignores unrelated actions', async () => {
    const store = buildIsolatedStore();

    store.dispatch({ type: 'someOtherSlice/somethingHappened' });
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(mockCheckForNewAchievements).not.toHaveBeenCalled();
  });
});
