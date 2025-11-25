import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { reloadActiveProfile, selectActiveProfile, selectLastUpdated } from '../slices/activeProfileSlice';
import { selectCurrentAccount } from '../slices/accountSlice';
import { shouldRefreshData, updateActivityTimestamp } from '../utils/activityTracker';

/**
 * Custom hook to track user activity and refresh data when stale
 * 
 * This hook:
 * 1. Checks if cached data is stale on mount and window focus
 * 2. Refreshes the active profile data if needed
 * 3. Updates activity timestamp on user interactions
 */
export const useActivityTracking = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);
  const activeProfile = useAppSelector(selectActiveProfile);
  const lastUpdated = useAppSelector(selectLastUpdated);
  const hasCheckedOnMount = useRef(false);

  // Check data freshness and refresh if needed
  const checkAndRefreshData = useCallback(async () => {
    // Only check if user is logged in and has an active profile
    if (!account || !activeProfile) {
      return;
    }

    // Check if data should be refreshed
    if (shouldRefreshData(lastUpdated)) {
      try {
        await dispatch(reloadActiveProfile()).unwrap();
      } catch (error) {
        // Error is logged by the thunk, no need to log again here
      }
    }

    // Update activity timestamp
    updateActivityTimestamp();
  }, [account, activeProfile, lastUpdated, dispatch]);

  // Check on mount (page load/reload)
  useEffect(() => {
    if (!hasCheckedOnMount.current && account && activeProfile) {
      hasCheckedOnMount.current = true;
      checkAndRefreshData();
    }
  }, [account, activeProfile, checkAndRefreshData]);

  // Check when window regains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (account && activeProfile) {
        checkAndRefreshData();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [account, activeProfile, checkAndRefreshData]);

  // Track user activity with various interaction events
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      updateActivityTimestamp();
    };

    // Add event listeners for user interactions
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Check periodically if data has become stale (every 5 minutes)
  useEffect(() => {
    if (!account || !activeProfile) {
      return;
    }

    const intervalId = setInterval(() => {
      if (shouldRefreshData(lastUpdated)) {
        checkAndRefreshData();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(intervalId);
    };
  }, [account, activeProfile, lastUpdated, checkAndRefreshData]);
};
