import { WatchStatus } from '@ajgifford/keepwatching-types';

export const WATCH_STATUS_COLORS = {
  watched: '#4CAF50', // Green - completed content
  watching: '#FFC107', // Amber - currently in progress
  notWatched: '#F44336', // Red - not started
  upToDate: '#2196F3', // Blue - caught up with latest episodes
  unaired: '#9E9E9E', // Grey - content not yet available
} as const;

// Alternative color schemes for different themes
export const WATCH_STATUS_COLORS_DARK = {
  watched: '#66BB6A',
  watching: '#FFB74D',
  notWatched: '#EF5350',
  upToDate: '#42A5F5',
  unaired: '#BDBDBD',
} as const;

export const WATCH_STATUS_COLORS_ACCESSIBLE = {
  watched: '#2E7D32', // Darker green for better contrast
  watching: '#F57C00', // Darker orange
  notWatched: '#C62828', // Darker red
  upToDate: '#1565C0', // Darker blue
  unaired: '#616161', // Darker grey
} as const;

// Type for watch status color keys
export type WatchStatusColorKey = keyof typeof WATCH_STATUS_COLORS;

// Utility function to get color by watch status
export const getWatchStatusColor = (
  status: WatchStatus,
  theme: 'default' | 'dark' | 'accessible' = 'default'
): string => {
  const colorMap = {
    default: WATCH_STATUS_COLORS,
    dark: WATCH_STATUS_COLORS_DARK,
    accessible: WATCH_STATUS_COLORS_ACCESSIBLE,
  }[theme];

  switch (status) {
    case WatchStatus.WATCHED:
      return colorMap.watched;
    case WatchStatus.WATCHING:
      return colorMap.watching;
    case WatchStatus.NOT_WATCHED:
      return colorMap.notWatched;
    case WatchStatus.UP_TO_DATE:
      return colorMap.upToDate;
    case WatchStatus.UNAIRED:
      return colorMap.unaired;
    default:
      return colorMap.notWatched;
  }
};

// Utility function to get all status colors as an array (useful for charts)
export const getWatchStatusColorsArray = (theme: 'default' | 'dark' | 'accessible' = 'default'): string[] => {
  const colorMap = {
    default: WATCH_STATUS_COLORS,
    dark: WATCH_STATUS_COLORS_DARK,
    accessible: WATCH_STATUS_COLORS_ACCESSIBLE,
  }[theme];

  return Object.values(colorMap);
};

// Utility function to get color with opacity
export const getWatchStatusColorWithOpacity = (
  status: WatchStatus,
  opacity: number = 1,
  theme: 'default' | 'dark' | 'accessible' = 'default'
): string => {
  const baseColor = getWatchStatusColor(status, theme);

  // Convert hex to rgba
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Progress bar color mapping based on completion percentage
export const getProgressBarColor = (percentage: number): 'success' | 'warning' | 'error' | 'info' => {
  if (percentage === 0) return 'error'; // Red for 0%
  if (percentage === 100) return 'success'; // Green for 100%
  if (percentage >= 75) return 'info'; // Blue for 75%+
  return 'warning'; // Orange/amber for in-progress
};

// Material-UI theme-compatible color mapping
export const getMuiColorVariant = (status: WatchStatus): 'success' | 'warning' | 'error' | 'info' | 'inherit' => {
  switch (status) {
    case WatchStatus.WATCHED:
      return 'success';
    case WatchStatus.WATCHING:
      return 'warning';
    case WatchStatus.NOT_WATCHED:
      return 'error';
    case WatchStatus.UP_TO_DATE:
      return 'info';
    case WatchStatus.UNAIRED:
    default:
      return 'inherit';
  }
};

// Recharts compatible color array
export const getRechartsColors = (theme: 'default' | 'dark' | 'accessible' = 'default'): string[] => {
  return getWatchStatusColorsArray(theme);
};

// Color legend for charts and UI
export const WATCH_STATUS_LEGEND = [
  { status: WatchStatus.WATCHED, label: 'Watched', color: WATCH_STATUS_COLORS.watched },
  { status: WatchStatus.UP_TO_DATE, label: 'Up To Date', color: WATCH_STATUS_COLORS.upToDate },
  { status: WatchStatus.WATCHING, label: 'Watching', color: WATCH_STATUS_COLORS.watching },
  { status: WatchStatus.NOT_WATCHED, label: 'Not Watched', color: WATCH_STATUS_COLORS.notWatched },
  { status: WatchStatus.UNAIRED, label: 'Unaired', color: WATCH_STATUS_COLORS.unaired },
] as const;
