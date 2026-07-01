import { ReactNode, useEffect, useMemo, useState } from 'react';

import { CssBaseline, ThemeProvider as MuiThemeProvider, useMediaQuery } from '@mui/material';

import { useAppSelector } from '../app/hooks';
import { selectActiveProfile } from '../app/slices/activeProfileSlice';
import { selectDisplayPreferences } from '../app/slices/preferencesSlice';
import { buildTheme } from './theme';
import { DisplayPreferences } from '@ajgifford/keepwatching-types';

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const displayPreferences = useAppSelector(selectDisplayPreferences) as DisplayPreferences;
  const activeProfile = useAppSelector(selectActiveProfile);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const themePreference = displayPreferences?.theme || 'auto';

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (themePreference === 'auto') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return themePreference;
  });

  useEffect(() => {
    if (themePreference === 'auto') {
      setThemeMode(prefersDarkMode ? 'dark' : 'light');
    } else {
      setThemeMode(themePreference);
    }
  }, [themePreference, prefersDarkMode]);

  const theme = useMemo(
    () => buildTheme(themeMode, activeProfile?.accentColor),
    [themeMode, activeProfile?.accentColor]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
