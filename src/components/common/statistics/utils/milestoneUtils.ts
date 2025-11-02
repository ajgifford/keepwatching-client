import { MILESTONE_THRESHOLDS, Milestone, MilestoneStats } from '@ajgifford/keepwatching-types';

interface MilestoneWithType extends Milestone {
  type: 'episodes' | 'movies' | 'hours';
}

// Fallback thresholds in case import fails
const FALLBACK_THRESHOLDS = {
  episodes: [100, 500, 1000, 5000],
  movies: [25, 50, 100, 500],
  hours: [100, 500, 1000, 5000],
};

// Use imported thresholds or fallback
const THRESHOLDS = MILESTONE_THRESHOLDS || FALLBACK_THRESHOLDS;

function calculateMilestones(
  current: number,
  thresholds: number[],
  type: 'episodes' | 'movies' | 'hours'
): MilestoneWithType[] {
  return thresholds.map((threshold) => ({
    type,
    threshold,
    achieved: current >= threshold,
    progress: Math.min((current / threshold) * 100, 100),
  }));
}

export function getLastAchievedMilestone(stats: MilestoneStats | null): MilestoneWithType | null {
  if (!stats) return null;

  const allMilestones: MilestoneWithType[] = [
    ...calculateMilestones(stats.totalEpisodesWatched, THRESHOLDS.episodes, 'episodes'),
    ...calculateMilestones(stats.totalMoviesWatched, THRESHOLDS.movies, 'movies'),
    ...calculateMilestones(stats.totalHoursWatched, THRESHOLDS.hours, 'hours'),
  ];

  // Get all achieved milestones and return the one with the highest threshold
  const achieved = allMilestones.filter((m) => m.achieved);
  if (achieved.length === 0) return null;

  return achieved.reduce((highest, current) => (current.threshold > highest.threshold ? current : highest));
}

export function getNextMilestone(stats: MilestoneStats | null): MilestoneWithType | null {
  if (!stats) return null;

  const allMilestones: MilestoneWithType[] = [
    ...calculateMilestones(stats.totalEpisodesWatched, THRESHOLDS.episodes, 'episodes'),
    ...calculateMilestones(stats.totalMoviesWatched, THRESHOLDS.movies, 'movies'),
    ...calculateMilestones(stats.totalHoursWatched, THRESHOLDS.hours, 'hours'),
  ];

  // Get all unachieved milestones and return the one with the highest progress
  const unachieved = allMilestones.filter((m) => !m.achieved);
  if (unachieved.length === 0) return null;

  return unachieved.reduce((closest, current) => (current.progress > closest.progress ? current : closest));
}
