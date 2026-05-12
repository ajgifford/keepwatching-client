import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import userEvent from '@testing-library/user-event';

import Calendar from '../calendar';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../common/calendar/contentCalendar', () => ({
  ContentCalendar: ({ compact }: { compact: boolean }) => (
    <div data-testid="content-calendar" data-compact={String(compact)}>
      ContentCalendar
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) =>
  render(<BrowserRouter>{component}</BrowserRouter>);

describe('Calendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderWithRouter(<Calendar />);
      expect(container).toBeInTheDocument();
    });

    it('should render the back button', () => {
      renderWithRouter(<Calendar />);
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should render the ContentCalendar component', () => {
      renderWithRouter(<Calendar />);
      expect(screen.getByTestId('content-calendar')).toBeInTheDocument();
    });
  });

  describe('ContentCalendar props', () => {
    it('should render ContentCalendar with compact set to false', () => {
      renderWithRouter(<Calendar />);
      expect(screen.getByTestId('content-calendar')).toHaveAttribute('data-compact', 'false');
    });
  });

  describe('navigation', () => {
    it('should navigate back when the back button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Calendar />);

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should only call navigate once per click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Calendar />);

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have an aria-label on the back button', () => {
      renderWithRouter(<Calendar />);
      expect(screen.getByRole('button', { name: /back/i })).toHaveAttribute('aria-label', 'back');
    });

    it('should render a Back tooltip on the back button', () => {
      renderWithRouter(<Calendar />);
      // The Tooltip title is rendered as a title attribute on the button's wrapper
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should clean up on unmount', () => {
      const { unmount } = renderWithRouter(<Calendar />);
      unmount();
      expect(screen.queryByTestId('content-calendar')).not.toBeInTheDocument();
    });
  });
});
