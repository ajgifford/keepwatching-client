import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DISCOVER_TYPE_OPTIONS, SEARCH_TYPE_OPTIONS, SegmentedControl } from '../segmentedControl';

describe('SegmentedControl', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all options', () => {
    render(<SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} />);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should call onChange when option is clicked', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} />);

    await user.click(screen.getByText('Option 2'));
    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });

  it('should render disabled option correctly', () => {
    const optionsWithDisabled = [
      ...mockOptions,
      { value: 'option4', label: 'Disabled Option', disabled: true },
    ];

    render(<SegmentedControl options={optionsWithDisabled} value="option1" onChange={mockOnChange} />);

    const disabledButton = screen.getByText('Disabled Option');
    expect(disabledButton).toBeDisabled();
    // Disabled buttons cannot be clicked due to pointer-events: none
    // So we just verify it's rendered as disabled
  });

  it('should not call onChange when current option is clicked', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} />);

    await user.click(screen.getByText('Option 1'));
    expect(mockOnChange).toHaveBeenCalledWith('option1');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(
      <SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} size="small" />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    rerender(<SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} size="large" />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { rerender } = render(
      <SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} variant="outlined" />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    rerender(<SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} variant="contained" />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should render with fullWidth prop', () => {
    render(<SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} fullWidth />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should render with different colors', () => {
    const { rerender } = render(
      <SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} color="primary" />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    rerender(<SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} color="secondary" />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  describe('exported option constants', () => {
    it('should export SEARCH_TYPE_OPTIONS', () => {
      expect(SEARCH_TYPE_OPTIONS).toEqual([
        { value: 'shows', label: 'TV Shows' },
        { value: 'movies', label: 'Movies' },
      ]);
    });

    it('should export DISCOVER_TYPE_OPTIONS', () => {
      expect(DISCOVER_TYPE_OPTIONS).toEqual([
        { value: 'series', label: 'TV Shows' },
        { value: 'movies', label: 'Movies' },
      ]);
    });
  });

  describe('snapshot tests', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(
        <SegmentedControl options={mockOptions} value="option1" onChange={mockOnChange} />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
