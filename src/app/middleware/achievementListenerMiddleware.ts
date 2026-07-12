import { checkForNewAchievements } from '../slices/activeProfileSlice';
import {
  markShowAsPriorWatched,
  updateMovieWatchStatus,
  updateNextEpisodeWatchStatus,
  updateShowWatchStatus,
} from '../slices/activeProfileSlice';
import {
  markSeasonIdsAsPriorWatched,
  updateEpisodeWatchStatus,
  updateSeasonWatchStatus,
} from '../slices/activeShowSlice';
import {
  recordEpisodeRewatch,
  startMovieRewatch,
  startSeasonRewatch,
  startShowRewatch,
} from '../slices/watchHistorySlice';
import { AppDispatch, RootState } from '../store';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

export const achievementListenerMiddleware = createListenerMiddleware();

const startAppListening = achievementListenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

startAppListening({
  matcher: isAnyOf(
    updateEpisodeWatchStatus.fulfilled,
    updateSeasonWatchStatus.fulfilled,
    markSeasonIdsAsPriorWatched.fulfilled,
    updateShowWatchStatus.fulfilled,
    markShowAsPriorWatched.fulfilled,
    updateMovieWatchStatus.fulfilled,
    updateNextEpisodeWatchStatus.fulfilled,
    startShowRewatch.fulfilled,
    startSeasonRewatch.fulfilled,
    startMovieRewatch.fulfilled,
    recordEpisodeRewatch.fulfilled
  ),
  effect: async (_action, listenerApi) => {
    // Collapse a burst of fulfilled actions from a single bulk operation (e.g. marking a
    // whole season watched) into one milestone refetch instead of one per episode.
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(300);
    listenerApi.dispatch(checkForNewAchievements());
  },
});
