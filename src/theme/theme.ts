import { Theme, createTheme } from '@mui/material/styles';
import { PaletteColor, PaletteColorOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    rewatch: PaletteColor;
  }
  interface PaletteOptions {
    rewatch?: PaletteColorOptions;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    rewatch: true;
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    rewatch: true;
  }
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function luminance(hex: string): number {
  return [1, 3, 5].reduce((acc, offset, i) => {
    const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    const linear = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return acc + linear * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

function deriveAccentPalette(hex: string): { main: string; light: string; dark: string; contrastText: string } {
  const [h, s, l] = hexToHsl(hex);
  const light = hslToHex(h, Math.min(s, 90), Math.min(l + 20, 85));
  const dark = hslToHex(h, Math.min(s, 90), Math.max(l - 20, 15));
  const contrastText = luminance(hex) > 0.179 ? 'rgba(0, 0, 0, 0.87)' : '#fff';
  return { main: hex, light, dark, contrastText };
}

const SHARED_SHAPE = { borderRadius: 8 };
const SHARED_TYPOGRAPHY = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
};
const REWATCH_LIGHT = { main: '#f59e0b', light: '#fcd34d', dark: '#d97706', contrastText: 'rgba(0, 0, 0, 0.87)' };
const REWATCH_DARK = { main: '#fbbf24', light: '#fde68a', dark: '#f59e0b', contrastText: 'rgba(0, 0, 0, 0.87)' };

export function buildTheme(mode: 'light' | 'dark', accentColor?: string | null): Theme {
  const accent = accentColor ? deriveAccentPalette(accentColor) : null;

  if (mode === 'dark') {
    return createTheme({
      palette: {
        mode: 'dark',
        primary: accent ?? {
          main: '#90caf9',
          light: '#e3f2fd',
          dark: '#42a5f5',
          contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        secondary: {
          main: '#f48fb1',
          light: '#ffc1e3',
          dark: '#bf5f82',
          contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        background: { default: '#121212', paper: '#1e1e1e' },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
          disabled: 'rgba(255, 255, 255, 0.5)',
        },
        error: { main: '#f44336' },
        warning: { main: '#ffa726' },
        info: { main: '#29b6f6' },
        success: { main: '#66bb6a' },
        rewatch: REWATCH_DARK,
        divider: 'rgba(255, 255, 255, 0.12)',
      },
      shape: SHARED_SHAPE,
      typography: SHARED_TYPOGRAPHY,
    });
  }

  return createTheme({
    palette: {
      mode: 'light',
      primary: accent ?? {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#fff',
      },
      secondary: {
        main: '#dc004e',
        light: '#ff5983',
        dark: '#9a0036',
        contrastText: '#fff',
      },
      background: { default: '#fafafa', paper: '#ffffff' },
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
        disabled: 'rgba(0, 0, 0, 0.38)',
      },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' },
      info: { main: '#2196f3' },
      success: { main: '#4caf50' },
      rewatch: REWATCH_LIGHT,
      divider: 'rgba(0, 0, 0, 0.12)',
    },
    shape: SHARED_SHAPE,
    typography: SHARED_TYPOGRAPHY,
  });
}

export const lightTheme: Theme = buildTheme('light');
export const darkTheme: Theme = buildTheme('dark');

export const getTheme = (mode: 'light' | 'dark'): Theme => buildTheme(mode);
