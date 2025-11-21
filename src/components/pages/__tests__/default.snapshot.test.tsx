import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import EnhancedDefault from '../default';

// Custom serializer to normalize MUI dynamic class names in snapshots
const normalizeMuiClasses = (html: string): string => {
  // Replace dynamic MUI class names (css-xxxxxx) with a stable placeholder
  return html.replace(/css-[a-z0-9]+/g, 'css-normalized');
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EnhancedDefault - Snapshots', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should match snapshot for initial render', () => {
    const { container } = renderWithRouter(<EnhancedDefault />);
    const normalizedHtml = normalizeMuiClasses(container.innerHTML);
    expect(normalizedHtml).toMatchSnapshot();
  });

  it('should match snapshot with first slide content', () => {
    const { container } = renderWithRouter(<EnhancedDefault />);
    const element = container.querySelector('[class*="MuiBox"]');
    const normalizedHtml = element ? normalizeMuiClasses(element.outerHTML) : '';
    expect(normalizedHtml).toMatchSnapshot();
  });
});
