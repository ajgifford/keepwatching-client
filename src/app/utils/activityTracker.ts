/**
 * Activity Tracker Utility
 *
 * Tracks user activity and determines when cached data should be refreshed.
 * This helps ensure users see up-to-date information when returning to the app
 * after extended periods of inactivity or when reopening the app.
 */

const ACTIVITY_STORAGE_KEY = 'userActivityTimestamp';
const DATA_FRESHNESS_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Updates the last activity timestamp in localStorage
 */
export const updateActivityTimestamp = (): void => {
  const now = new Date().toISOString();
  localStorage.setItem(ACTIVITY_STORAGE_KEY, now);
};

/**
 * Gets the last activity timestamp from localStorage
 */
export const getLastActivityTimestamp = (): Date | null => {
  const timestamp = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  return timestamp ? new Date(timestamp) : null;
};

/**
 * Determines if the cached data is stale based on the last activity timestamp
 * and the data's last updated timestamp
 *
 * @param lastUpdated - The timestamp when data was last updated (from Redux state)
 * @returns true if data should be refreshed, false otherwise
 */
export const shouldRefreshData = (lastUpdated: string | null): boolean => {
  // If no lastUpdated timestamp exists, data should be refreshed
  if (!lastUpdated) {
    return true;
  }

  const lastActivity = getLastActivityTimestamp();
  const dataTimestamp = new Date(lastUpdated);
  const now = new Date();

  // Calculate time since last data update
  const timeSinceUpdate = now.getTime() - dataTimestamp.getTime();

  // If data is older than the threshold, refresh it
  if (timeSinceUpdate > DATA_FRESHNESS_THRESHOLD_MS) {
    return true;
  }

  // If we have a last activity timestamp, check if there was a significant gap
  if (lastActivity) {
    const timeSinceActivity = now.getTime() - lastActivity.getTime();

    // If user was inactive for more than the threshold, refresh data
    if (timeSinceActivity > DATA_FRESHNESS_THRESHOLD_MS) {
      return true;
    }
  }

  return false;
};

/**
 * Clears the activity timestamp (useful on logout)
 */
export const clearActivityTimestamp = (): void => {
  localStorage.removeItem(ACTIVITY_STORAGE_KEY);
};

/**
 * Gets the data freshness threshold in milliseconds
 */
export const getFreshnessThreshold = (): number => {
  return DATA_FRESHNESS_THRESHOLD_MS;
};
