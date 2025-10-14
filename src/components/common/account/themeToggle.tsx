import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCurrentAccount } from '../../../app/slices/accountSlice';
import { selectDisplayPreferences, updatePreferences } from '../../../app/slices/preferencesSlice';
import { DisplayPreferences } from '@ajgifford/keepwatching-types';

export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectCurrentAccount);
  const displayPreferences = useAppSelector(selectDisplayPreferences) as DisplayPreferences;

  const currentTheme = displayPreferences?.theme || 'auto';

  const handleThemeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.value as 'light' | 'dark' | 'auto';

    if (account) {
      await dispatch(
        updatePreferences({
          accountId: account.id,
          preferenceType: 'display',
          updates: {
            theme: newTheme,
          },
        })
      );
    }
  };

  return (
    <FormControl component="fieldset" sx={{ mt: 2 }}>
      <FormLabel component="legend" sx={{ color: 'primary.main', fontWeight: 500 }}>
        Theme Preference
      </FormLabel>
      <RadioGroup row value={currentTheme} onChange={handleThemeChange} sx={{ mt: 1 }}>
        <FormControlLabel
          value="light"
          control={<Radio color="primary" />}
          label="Light"
          sx={{
            '& .MuiFormControlLabel-label': {
              color: 'primary.main',
            },
          }}
        />
        <FormControlLabel
          value="dark"
          control={<Radio color="primary" />}
          label="Dark"
          sx={{
            '& .MuiFormControlLabel-label': {
              color: 'primary.main',
            },
          }}
        />
        <FormControlLabel
          value="auto"
          control={<Radio color="primary" />}
          label="Auto"
          sx={{
            '& .MuiFormControlLabel-label': {
              color: 'primary.main',
            },
          }}
        />
      </RadioGroup>
    </FormControl>
  );
};
