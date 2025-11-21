import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OptionalTooltipControl } from '../optionalTooltipControl';

describe('OptionalTooltipControl', () => {
  const mockChild = <button>Test Button</button>;

  it('should render tooltip when not disabled', async () => {
    const user = userEvent.setup();
    render(
      <OptionalTooltipControl identifier="test-tooltip" title="Tooltip Text" disabled={false}>
        {mockChild}
      </OptionalTooltipControl>
    );

    const button = screen.getByText('Test Button');
    expect(button).toBeInTheDocument();

    // Hover over button to show tooltip
    await user.hover(button);

    // Wait for tooltip to appear
    const tooltip = await screen.findByText('Tooltip Text');
    expect(tooltip).toBeInTheDocument();
  });

  it('should render children without tooltip when disabled', async () => {
    const user = userEvent.setup();
    render(
      <OptionalTooltipControl identifier="test-tooltip" title="Tooltip Text" disabled={true}>
        {mockChild}
      </OptionalTooltipControl>
    );

    const button = screen.getByText('Test Button');
    expect(button).toBeInTheDocument();

    // Hover over button
    await user.hover(button);

    // Tooltip should not appear
    expect(screen.queryByText('Tooltip Text')).not.toBeInTheDocument();
  });

  it('should render children correctly', () => {
    render(
      <OptionalTooltipControl identifier="test-tooltip" title="Tooltip Text" disabled={false}>
        <div data-testid="custom-child">Custom Content</div>
      </OptionalTooltipControl>
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });
});
