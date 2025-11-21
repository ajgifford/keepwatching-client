import { render, screen } from '@testing-library/react';

import { TabPanel, a11yProps } from '../tabPanel';

describe('TabPanel', () => {
  it('should render children when value matches index', () => {
    render(
      <TabPanel value={0} index={0}>
        <div>Tab Content</div>
      </TabPanel>
    );

    expect(screen.getByText('Tab Content')).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).not.toHaveAttribute('hidden');
  });

  it('should hide children when value does not match index', () => {
    render(
      <TabPanel value={1} index={0}>
        <div>Tab Content</div>
      </TabPanel>
    );

    const tabpanel = screen.getByRole('tabpanel', { hidden: true });
    expect(tabpanel).toHaveAttribute('hidden');
  });

  it('should have correct ARIA attributes', () => {
    render(
      <TabPanel value={0} index={0}>
        <div>Tab Content</div>
      </TabPanel>
    );

    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('id', 'home-tabpanel-0');
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'home-tab-0');
  });

  it('should render multiple tab panels with different indices', () => {
    const { container } = render(
      <>
        <TabPanel value={0} index={0}>
          <div>First Tab</div>
        </TabPanel>
        <TabPanel value={0} index={1}>
          <div>Second Tab</div>
        </TabPanel>
        <TabPanel value={0} index={2}>
          <div>Third Tab</div>
        </TabPanel>
      </>
    );

    expect(screen.getByText('First Tab')).toBeInTheDocument();
    expect(container.querySelector('[hidden]#home-tabpanel-1')).toBeInTheDocument();
    expect(container.querySelector('[hidden]#home-tabpanel-2')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<TabPanel value={0} index={0} />);

    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toBeInTheDocument();
  });
});

describe('a11yProps', () => {
  it('should return correct accessibility props for index 0', () => {
    const props = a11yProps(0);

    expect(props).toEqual({
      id: 'home-tab-0',
      'aria-controls': 'home-tabpanel-0',
    });
  });

  it('should return correct accessibility props for index 1', () => {
    const props = a11yProps(1);

    expect(props).toEqual({
      id: 'home-tab-1',
      'aria-controls': 'home-tabpanel-1',
    });
  });

  it('should return correct accessibility props for any index', () => {
    const props = a11yProps(5);

    expect(props).toEqual({
      id: 'home-tab-5',
      'aria-controls': 'home-tabpanel-5',
    });
  });
});
