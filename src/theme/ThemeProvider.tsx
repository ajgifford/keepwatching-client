import { ReactNode, useEffect, useMemo, useState } from 'react';

import { CssBaseline, ThemeProvider as MuiThemeProvider, useMediaQuery } from '@mui/material';

import { useAppSelector } from '../app/hooks';
import { selectDisplayPreferences } from '../app/slices/preferencesSlice';
import { darkTheme, lightTheme } from './theme';
import { DisplayPreferences } from '@ajgifford/keepwatching-types';

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const displayPreferences = useAppSelector(selectDisplayPreferences) as DisplayPreferences;
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Get the theme preference from Redux (default to 'auto' if not set)
  const themePreference = displayPreferences?.theme || 'auto';

  // State to track the current theme mode
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (themePreference === 'auto') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return themePreference;
  });

  // Update theme mode when preferences or system preference changes
  useEffect(() => {
    if (themePreference === 'auto') {
      setThemeMode(prefersDarkMode ? 'dark' : 'light');
    } else {
      setThemeMode(themePreference);
    }
  }, [themePreference, prefersDarkMode]);

  // Memoize the theme to avoid unnecessary re-renders
  const theme = useMemo(() => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
