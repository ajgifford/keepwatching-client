import { ProfileEpisode, ProfileSeason, ProfileShowWithSeasons, WatchStatus } from '@ajgifford/keepwatching-types';
import { parseLocalDate } from '@ajgifford/keepwatching-ui';

const PACE_WINDOW_DAYS = 60;
const MIN_EPISODES_FOR_PACE = 2;
const MIN_SPAN_DAYS_FOR_PACE = 2;

// Below this, the existing "Next Episode" / Keep Watching panels (which surface 1-6 episodes)
// already cover it — Catch-Up Mode should only kick in once there's a real backlog.
const MIN_EPISODES_REMAINING_TO_SHOW = 3;

export interface SeasonCatchUpBreakdown {
  seasonId: number;
  seasonNumber: number;
  episodesRemaining: number;
  runtimeRemaining: number;
  hasMissingRuntime: boolean;
}

export interface CatchUpPace {
  episodesPerWeek: number;
  estimatedCompletionDate: string | null;
}

export interface CatchUpStats {
  totalEpisodesRemaining: number;
  totalRuntimeRemaining: number;
  hasMissingRuntime: boolean;
  seasons: SeasonCatchUpBreakdown[];
  pace: CatchUpPace | null;
}

function isUnwatchedAndAired(episode: ProfileEpisode, today: Date): boolean {
  return episode.watchStatus !== WatchStatus.WATCHED && !!episode.airDate && parseLocalDate(episode.airDate) <= today;
}

function calculatePace(seasons: ProfileSeason[], today: Date): CatchUpPace | null {
  const windowStart = new Date(today.getTime() - PACE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const recentlyWatchedDates = seasons
    .flatMap((season) => season.episodes)
    .filter((episode) => episode.watchStatus === WatchStatus.WATCHED && !episode.isPriorWatch && episode.watchedAt)
    .map((episode) => new Date(episode.watchedAt as string))
    .filter((date) => !isNaN(date.getTime()) && date >= windowStart && date <= today)
    .sort((a, b) => a.getTime() - b.getTime());

  if (recentlyWatchedDates.length < MIN_EPISODES_FOR_PACE) {
    return null;
  }

  const spanMs = recentlyWatchedDates[recentlyWatchedDates.length - 1].getTime() - recentlyWatchedDates[0].getTime();
  const spanDays = spanMs / (24 * 60 * 60 * 1000);
  if (spanDays < MIN_SPAN_DAYS_FOR_PACE) {
    return null;
  }

  const episodesPerWeek = recentlyWatchedDates.length / (spanDays / 7);
  return { episodesPerWeek, estimatedCompletionDate: null };
}

export function calculateCatchUpStats(show: ProfileShowWithSeasons | null): CatchUpStats | null {
  if (!show || !show.seasons || show.seasons.length === 0) {
    return null;
  }

  const today = new Date();
  let totalEpisodesRemaining = 0;
  let totalRuntimeRemaining = 0;
  let hasMissingRuntime = false;

  // Skipped seasons are an explicit "not watching this" choice — their episodes shouldn't
  // count toward the backlog or get written to history by "Mark Caught Up".
  const seasons: SeasonCatchUpBreakdown[] = show.seasons
    .filter((season) => season.watchStatus !== WatchStatus.SKIPPED)
    .map((season) => {
      const remainingEpisodes = season.episodes.filter((episode) => isUnwatchedAndAired(episode, today));
      const runtimeRemaining = remainingEpisodes.reduce((sum, episode) => sum + (episode.runtime || 0), 0);
      const seasonHasMissingRuntime = remainingEpisodes.some((episode) => !episode.runtime);

      totalEpisodesRemaining += remainingEpisodes.length;
      totalRuntimeRemaining += runtimeRemaining;
      if (seasonHasMissingRuntime) {
        hasMissingRuntime = true;
      }

      return {
        seasonId: season.id,
        seasonNumber: season.seasonNumber,
        episodesRemaining: remainingEpisodes.length,
        runtimeRemaining,
        hasMissingRuntime: seasonHasMissingRuntime,
      };
    });

  if (totalEpisodesRemaining < MIN_EPISODES_REMAINING_TO_SHOW) {
    return null;
  }

  const pace = calculatePace(show.seasons, today);
  if (pace) {
    const weeksRemaining = totalEpisodesRemaining / pace.episodesPerWeek;
    const estimatedDate = new Date(today.getTime() + weeksRemaining * 7 * 24 * 60 * 60 * 1000);
    pace.estimatedCompletionDate = estimatedDate.toISOString();
  }

  return {
    totalEpisodesRemaining,
    totalRuntimeRemaining,
    hasMissingRuntime,
    seasons: seasons.filter((season) => season.episodesRemaining > 0),
    pace,
  };
}
