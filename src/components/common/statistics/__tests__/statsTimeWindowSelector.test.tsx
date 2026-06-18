import { fireEvent, render, screen } from '@testing-library/react';

import StatsTimeWindowSelector from '../statsTimeWindowSelector';
import userEvent from '@testing-library/user-event';

const mockOnChange = jest.fn();

const defaultProps = {
  value: 30 as const,
  onChange: mockOnChange,
};

describe('StatsTimeWindowSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all time window options', () => {
      render(<StatsTimeWindowSelector {...defaultProps} />);
      expect(screen.getByRole('button', { name: /30d/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /90d/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /6m/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /1y/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    });

    it('renders the time window label', () => {
      render(<StatsTimeWindowSelector {...defaultProps} />);
      expect(screen.getByText(/time window/i)).toBeInTheDocument();
    });

    it('renders the info icon', () => {
      render(<StatsTimeWindowSelector {...defaultProps} />);
      expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument();
    });

    it('marks the current value as selected', () => {
      render(<StatsTimeWindowSelector {...defaultProps} value={90} />);
      expect(screen.getByRole('button', { name: /90d/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('marks All as selected when value is null', () => {
      render(<StatsTimeWindowSelector {...defaultProps} value={null} />);
      expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('marks 30D as selected by default', () => {
      render(<StatsTimeWindowSelector {...defaultProps} value={30} />);
      expect(screen.getByRole('button', { name: /30d/i })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('selection', () => {
    it('calls onChange with 90 when 90D is clicked', async () => {
      const user = userEvent.setup();
      render(<StatsTimeWindowSelector {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /90d/i }));
      expect(mockOnChange).toHaveBeenCalledWith(90);
    });

    it('calls onChange with 180 when 6M is clicked', async () => {
      const user = userEvent.setup();
      render(<StatsTimeWindowSelector {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /6m/i }));
      expect(mockOnChange).toHaveBeenCalledWith(180);
    });

    it('calls onChange with 365 when 1Y is clicked', async () => {
      const user = userEvent.setup();
      render(<StatsTimeWindowSelector {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /1y/i }));
      expect(mockOnChange).toHaveBeenCalledWith(365);
    });

    it('calls onChange with null when All is clicked', async () => {
      const user = userEvent.setup();
      render(<StatsTimeWindowSelector {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /all/i }));
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('calls onChange with 30 when 30D is clicked', async () => {
      const user = userEvent.setup();
      render(<StatsTimeWindowSelector {...defaultProps} value={90} />);
      await user.click(screen.getByRole('button', { name: /30d/i }));
      expect(mockOnChange).toHaveBeenCalledWith(30);
    });

    it('does not call onChange when the already-selected button is clicked', async () => {
      const user = userEvent.setup();
      render(<StatsTimeWindowSelector {...defaultProps} value={30} />);
      await user.click(screen.getByRole('button', { name: /30d/i }));
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(<StatsTimeWindowSelector {...defaultProps} disabled />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('does not call onChange when disabled', () => {
      render(<StatsTimeWindowSelector {...defaultProps} disabled />);
      fireEvent.click(screen.getByRole('button', { name: /90d/i }));
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
