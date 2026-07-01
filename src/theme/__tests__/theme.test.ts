import { buildTheme, darkTheme, getTheme, lightTheme } from '../theme';

describe('buildTheme', () => {
  it('returns light theme by default with no accent', () => {
    const theme = buildTheme('light');
    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.primary.main).toBe('#1976d2');
  });

  it('returns dark theme by default with no accent', () => {
    const theme = buildTheme('dark');
    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.primary.main).toBe('#90caf9');
  });

  it('overrides primary color with accent in light mode', () => {
    const theme = buildTheme('light', '#7b1fa2');
    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.primary.main).toBe('#7b1fa2');
    expect(theme.palette.primary.light).not.toBe('#7b1fa2');
    expect(theme.palette.primary.dark).not.toBe('#7b1fa2');
  });

  it('overrides primary color with accent in dark mode', () => {
    const theme = buildTheme('dark', '#388e3c');
    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.primary.main).toBe('#388e3c');
  });

  it('falls back to default primary when accent is null', () => {
    const theme = buildTheme('light', null);
    expect(theme.palette.primary.main).toBe('#1976d2');
  });

  it('falls back to default primary when accent is undefined', () => {
    const theme = buildTheme('dark', undefined);
    expect(theme.palette.primary.main).toBe('#90caf9');
  });

  it('preserves rewatch custom palette color', () => {
    const light = buildTheme('light', '#c2185b');
    const dark = buildTheme('dark', '#c2185b');
    expect(light.palette.rewatch.main).toBe('#f59e0b');
    expect(dark.palette.rewatch.main).toBe('#fbbf24');
  });

  it('sets correct contrastText for a light accent color', () => {
    const theme = buildTheme('light', '#fcd34d');
    expect(theme.palette.primary.contrastText).toBe('rgba(0, 0, 0, 0.87)');
  });

  it('sets correct contrastText for a dark accent color', () => {
    const theme = buildTheme('light', '#1a237e');
    expect(theme.palette.primary.contrastText).toBe('#fff');
  });
});

describe('static exports', () => {
  it('lightTheme is the default light theme', () => {
    expect(lightTheme.palette.mode).toBe('light');
    expect(lightTheme.palette.primary.main).toBe('#1976d2');
  });

  it('darkTheme is the default dark theme', () => {
    expect(darkTheme.palette.mode).toBe('dark');
    expect(darkTheme.palette.primary.main).toBe('#90caf9');
  });

  it('getTheme returns correct theme for mode', () => {
    expect(getTheme('light').palette.mode).toBe('light');
    expect(getTheme('dark').palette.mode).toBe('dark');
  });
});
