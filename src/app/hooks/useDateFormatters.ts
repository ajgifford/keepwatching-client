import { useMemo } from 'react';

import { useAppSelector } from '../hooks';
import { selectDisplayPreferences } from '../slices/preferencesSlice';
import { DateFormatters, createDateFormatters } from '@ajgifford/keepwatching-ui';

/**
 * Returns a memoised set of date formatting functions bound to the user's
 * current display preferences.
 *
 * Components should destructure only the slots they need:
 * ```tsx
 * const { contentDate, relativeDate } = useDateFormatters();
 * ```
 *
 * The formatters are recreated only when display preferences change, so there
 * is no render-time cost beyond the selector read on every render.
 */
export function useDateFormatters(): DateFormatters {
  const displayPrefs = useAppSelector(selectDisplayPreferences);
  return useMemo(() => createDateFormatters(displayPrefs ?? {}), [displayPrefs]);
}
