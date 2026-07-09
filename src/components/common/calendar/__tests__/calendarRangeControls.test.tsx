import { fireEvent, render, screen } from '@testing-library/react';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { resolveRangeForPreset } from '../../../utility/calendarRangePresetUtility';
import { CalendarRangeControls } from '../calendarRangeControls';
import userEvent from '@testing-library/user-event';

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(e.target.value ? new Date(`${e.target.value}T00:00:00`) : null)}
      />
    </label>
  ),
}));

const renderWithLocalization = (component: React.ReactElement) =>
  render(<LocalizationProvider dateAdapter={AdapterDateFns}>{component}</LocalizationProvider>);

describe('CalendarRangeControls', () => {
  const onRangeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the current preset as selected', () => {
    renderWithLocalization(
      <CalendarRangeControls
        preset="default"
        startDate="2026-06-08"
        endDate="2026-09-06"
        onRangeChange={onRangeChange}
      />
    );
    expect(screen.getByText('Default (30 days back / 60 forward)')).toBeInTheDocument();
  });

  it('does not show custom date pickers when preset is not custom', () => {
    renderWithLocalization(
      <CalendarRangeControls
        preset="default"
        startDate="2026-06-08"
        endDate="2026-09-06"
        onRangeChange={onRangeChange}
      />
    );
    expect(screen.queryByLabelText('Start')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('End')).not.toBeInTheDocument();
  });

  it('shows the Start/End date pickers when preset is custom', () => {
    renderWithLocalization(
      <CalendarRangeControls
        preset="custom"
        startDate="2026-01-01"
        endDate="2026-02-01"
        onRangeChange={onRangeChange}
      />
    );
    expect(screen.getByLabelText('Start')).toBeInTheDocument();
    expect(screen.getByLabelText('End')).toBeInTheDocument();
  });

  it('calls onRangeChange with resolved dates when a relative preset is selected', async () => {
    const user = userEvent.setup();
    renderWithLocalization(
      <CalendarRangeControls
        preset="default"
        startDate="2026-06-08"
        endDate="2026-09-06"
        onRangeChange={onRangeChange}
      />
    );

    await user.click(screen.getByLabelText('Date Range'));
    await user.click(screen.getByRole('option', { name: 'Next 7 Days' }));

    const expected = resolveRangeForPreset('next7');
    expect(onRangeChange).toHaveBeenCalledWith({
      preset: 'next7',
      startDate: expected.startDate,
      endDate: expected.endDate,
    });
  });

  it('switches to custom mode and reveals date pickers when "Custom Range…" is selected', async () => {
    const user = userEvent.setup();
    renderWithLocalization(
      <CalendarRangeControls
        preset="default"
        startDate="2026-06-08"
        endDate="2026-09-06"
        onRangeChange={onRangeChange}
      />
    );

    await user.click(screen.getByLabelText('Date Range'));
    await user.click(screen.getByRole('option', { name: 'Custom Range…' }));

    expect(onRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({ preset: 'custom', startDate: '2026-06-08', endDate: '2026-09-06' })
    );
  });

  it('calls onRangeChange with the new start date when the Start picker changes', () => {
    renderWithLocalization(
      <CalendarRangeControls
        preset="custom"
        startDate="2026-01-01"
        endDate="2026-02-01"
        onRangeChange={onRangeChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Start'), { target: { value: '2026-01-15' } });

    expect(onRangeChange).toHaveBeenCalledWith({
      preset: 'custom',
      startDate: '2026-01-15',
      endDate: '2026-02-01',
      customStart: '2026-01-15',
      customEnd: '2026-02-01',
    });
  });

  it('calls onRangeChange with the new end date when the End picker changes', () => {
    renderWithLocalization(
      <CalendarRangeControls
        preset="custom"
        startDate="2026-01-01"
        endDate="2026-02-01"
        onRangeChange={onRangeChange}
      />
    );

    fireEvent.change(screen.getByLabelText('End'), { target: { value: '2026-03-01' } });

    expect(onRangeChange).toHaveBeenCalledWith({
      preset: 'custom',
      startDate: '2026-01-01',
      endDate: '2026-03-01',
      customStart: '2026-01-01',
      customEnd: '2026-03-01',
    });
  });

  it('clamps the end date to the 1-year max span when it would otherwise exceed it', () => {
    renderWithLocalization(
      <CalendarRangeControls
        preset="custom"
        startDate="2026-01-01"
        endDate="2026-02-01"
        onRangeChange={onRangeChange}
      />
    );

    fireEvent.change(screen.getByLabelText('End'), { target: { value: '2028-01-01' } });

    expect(onRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({ preset: 'custom', startDate: '2026-01-01', endDate: '2027-01-01' })
    );
  });

  it('shows a helper text noting the 1-year max range when in custom mode', () => {
    renderWithLocalization(
      <CalendarRangeControls
        preset="custom"
        startDate="2026-01-01"
        endDate="2026-02-01"
        onRangeChange={onRangeChange}
      />
    );
    expect(screen.getByText('Maximum range: 1 year')).toBeInTheDocument();
  });
});
