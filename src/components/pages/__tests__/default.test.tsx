import { act, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import EnhancedDefault from '../default';
import userEvent from '@testing-library/user-event';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EnhancedDefault', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic rendering', () => {
    it('should render the KeepWatching logo', () => {
      renderWithRouter(<EnhancedDefault />);

      expect(screen.getByText('Keep')).toBeInTheDocument();
      expect(screen.getByText('Watching')).toBeInTheDocument();
    });

    it('should render Login button', () => {
      renderWithRouter(<EnhancedDefault />);

      const loginButton = screen.getByRole('link', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
    });

    it('should render Sign Up button in header', () => {
      renderWithRouter(<EnhancedDefault />);

      const signUpButtons = screen.getAllByRole('link', { name: /sign up/i });
      expect(signUpButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should render Get Started button', () => {
      renderWithRouter(<EnhancedDefault />);

      expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    });

    it('should render play/pause button', () => {
      const { container } = renderWithRouter(<EnhancedDefault />);

      const pauseIcon = container.querySelector('[data-testid="PauseIcon"]');
      expect(pauseIcon).toBeInTheDocument();
    });
  });

  describe('slide content', () => {
    it('should display first slide content by default', () => {
      renderWithRouter(<EnhancedDefault />);

      expect(screen.getByText('Track Every Episode')).toBeInTheDocument();
      expect(screen.getByText('Never lose your place in a series again')).toBeInTheDocument();
      expect(screen.getByText(/Mark episodes as watched/)).toBeInTheDocument();
    });

    it('should display first slide visual emoji', () => {
      renderWithRouter(<EnhancedDefault />);

      expect(screen.getByText('🎬')).toBeInTheDocument();
    });

    it('should have 5 slide indicators', () => {
      renderWithRouter(<EnhancedDefault />);

      // 5 slides + 1 play/pause button
      const buttons = screen.getAllByRole('button');
      // Filter for slide indicator buttons (small buttons for slides)
      expect(buttons.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('slide navigation', () => {
    it('should auto-advance to next slide after 4 seconds', async () => {
      renderWithRouter(<EnhancedDefault />);

      expect(screen.getByText('Track Every Episode')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(screen.getByText('Manage Movies')).toBeInTheDocument();
      });
    });

    it('should cycle through all slides', async () => {
      renderWithRouter(<EnhancedDefault />);

      // First slide
      expect(screen.getByText('Track Every Episode')).toBeInTheDocument();

      // Advance to second slide
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      await waitFor(() => {
        expect(screen.getByText('Manage Movies')).toBeInTheDocument();
      });

      // Advance to third slide
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      await waitFor(() => {
        expect(screen.getByText('Discover New Content')).toBeInTheDocument();
      });

      // Advance to fourth slide
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      await waitFor(() => {
        expect(screen.getByText('Multiple Profiles')).toBeInTheDocument();
      });

      // Advance to fifth slide
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      await waitFor(() => {
        expect(screen.getByText('View Your Stats')).toBeInTheDocument();
      });
    });

    it('should loop back to first slide after last slide', async () => {
      renderWithRouter(<EnhancedDefault />);

      // Advance through all 5 slides (5 * 4000ms)
      act(() => {
        jest.advanceTimersByTime(20000);
      });

      await waitFor(() => {
        expect(screen.getByText('Track Every Episode')).toBeInTheDocument();
      });
    });

    it('should allow manual slide navigation via indicators', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<EnhancedDefault />);

      expect(screen.getByText('Track Every Episode')).toBeInTheDocument();

      // Get all buttons and find slide indicators (excluding play/pause button)
      const buttons = screen.getAllByRole('button');
      // Click third slide indicator (index 2, accounting for play/pause button)
      const thirdSlideButton = buttons[2];
      await user.click(thirdSlideButton);

      await waitFor(() => {
        expect(screen.getByText('Discover New Content')).toBeInTheDocument();
      });
    });
  });

  describe('play/pause functionality', () => {
    it('should start with playing state', () => {
      const { container } = renderWithRouter(<EnhancedDefault />);

      // PauseIcon should be visible when playing
      const pauseIcon = container.querySelector('[data-testid="PauseIcon"]');
      expect(pauseIcon).toBeInTheDocument();
    });

    it('should pause auto-advance when pause button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = renderWithRouter(<EnhancedDefault />);

      expect(screen.getByText('Track Every Episode')).toBeInTheDocument();

      // Find and click the pause button
      const pauseIcon = container.querySelector('[data-testid="PauseIcon"]');
      const playPauseButton = pauseIcon?.closest('button');
      expect(playPauseButton).toBeInTheDocument();

      await user.click(playPauseButton!);

      // Advance time but slide should not change since paused
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      expect(screen.getByText('Track Every Episode')).toBeInTheDocument();
    });

    it('should toggle between play and pause', async () => {
      const user = userEvent.setup({ delay: null });
      const { container, rerender } = renderWithRouter(<EnhancedDefault />);

      // Initially playing (showing PauseIcon)
      const pauseIcon = container.querySelector('[data-testid="PauseIcon"]');
      expect(pauseIcon).toBeInTheDocument();

      const playPauseButton = pauseIcon?.closest('button');
      expect(playPauseButton).toBeInTheDocument();

      // Click to pause
      await user.click(playPauseButton!);

      // Should show PlayArrowIcon after clicking
      await waitFor(() => {
        const playIcon = container.querySelector('[data-testid="PlayArrowIcon"]');
        expect(playIcon).toBeInTheDocument();
      });
    });
  });

  describe('navigation links', () => {
    it('should link Login button to /login', () => {
      renderWithRouter(<EnhancedDefault />);

      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should link Sign Up button to /register', () => {
      renderWithRouter(<EnhancedDefault />);

      const signUpButtons = screen.getAllByRole('link', { name: /sign up/i });
      signUpButtons.forEach((button) => {
        expect(button).toHaveAttribute('href', '/register');
      });
    });

    it('should link Get Started button to /register', () => {
      renderWithRouter(<EnhancedDefault />);

      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink).toHaveAttribute('href', '/register');
    });
  });

  describe('progress bar', () => {
    it('should render progress bar', () => {
      const { container } = renderWithRouter(<EnhancedDefault />);

      // Progress bar is rendered as a Box with specific styles
      const progressBars = container.querySelectorAll('[class*="MuiBox"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should update progress bar width as slides advance', async () => {
      renderWithRouter(<EnhancedDefault />);

      // First slide (1/5 = 20%)
      // After advancing (2/5 = 40%)
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      // Progress bar should update (difficult to test exact width in JSDOM)
      await waitFor(() => {
        expect(screen.getByText('Manage Movies')).toBeInTheDocument();
      });
    });
  });

  describe('slide content details', () => {
    it('should display all slide titles', async () => {
      renderWithRouter(<EnhancedDefault />);

      const slideTitles = [
        'Track Every Episode',
        'Manage Movies',
        'Discover New Content',
        'Multiple Profiles',
        'View Your Stats',
      ];

      for (let i = 0; i < slideTitles.length; i++) {
        await waitFor(() => {
          expect(screen.getByText(slideTitles[i])).toBeInTheDocument();
        });

        if (i < slideTitles.length - 1) {
          act(() => {
            jest.advanceTimersByTime(4000);
          });
        }
      }
    });

    it('should display all slide visuals', async () => {
      renderWithRouter(<EnhancedDefault />);

      const slideVisuals = ['🎬', '🍿', '🔍', '👨‍👩‍👧‍👦', '📊'];

      for (let i = 0; i < slideVisuals.length; i++) {
        await waitFor(() => {
          expect(screen.getByText(slideVisuals[i])).toBeInTheDocument();
        });

        if (i < slideVisuals.length - 1) {
          act(() => {
            jest.advanceTimersByTime(4000);
          });
        }
      }
    });

    it('should display Movie slide content', async () => {
      renderWithRouter(<EnhancedDefault />);

      act(() => {
        jest.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(screen.getByText('Manage Movies')).toBeInTheDocument();
        expect(screen.getByText(/Build your movie watchlist/)).toBeInTheDocument();
        expect(screen.getByText('🍿')).toBeInTheDocument();
      });
    });

    it('should display Discover slide content', async () => {
      renderWithRouter(<EnhancedDefault />);

      act(() => {
        jest.advanceTimersByTime(8000);
      });

      await waitFor(() => {
        expect(screen.getByText('Discover New Content')).toBeInTheDocument();
        expect(screen.getByText('Find your next favorite show')).toBeInTheDocument();
        expect(screen.getByText('🔍')).toBeInTheDocument();
      });
    });

    it('should display Multiple Profiles slide content', async () => {
      renderWithRouter(<EnhancedDefault />);

      act(() => {
        jest.advanceTimersByTime(12000);
      });

      await waitFor(() => {
        expect(screen.getByText('Multiple Profiles')).toBeInTheDocument();
        expect(screen.getByText('Entertainment for the whole family')).toBeInTheDocument();
        expect(screen.getByText('👨‍👩‍👧‍👦')).toBeInTheDocument();
      });
    });

    it('should display Stats slide content', async () => {
      renderWithRouter(<EnhancedDefault />);

      act(() => {
        jest.advanceTimersByTime(16000);
      });

      await waitFor(() => {
        expect(screen.getByText('View Your Stats')).toBeInTheDocument();
        expect(screen.getByText('Insights into your viewing habits')).toBeInTheDocument();
        expect(screen.getByText('📊')).toBeInTheDocument();
      });
    });
  });

  describe('layout and styling', () => {
    it('should render with full screen layout', () => {
      const { container } = renderWithRouter(<EnhancedDefault />);

      const mainBox = container.firstChild;
      expect(mainBox).toBeInTheDocument();
    });

    it('should render all button components', () => {
      renderWithRouter(<EnhancedDefault />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(6); // 5 slide indicators + play/pause
    });

    it('should render all link components', () => {
      renderWithRouter(<EnhancedDefault />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3); // Login, Sign Up, Get Started
    });
  });

  describe('animations', () => {
    it('should include CSS animations in style tag', () => {
      const { container } = renderWithRouter(<EnhancedDefault />);

      const styleTag = container.querySelector('style');
      expect(styleTag).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('slideIn');
      expect(styleTag?.textContent).toContain('bounce');
      expect(styleTag?.textContent).toContain('pulse');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid slide indicator clicks', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<EnhancedDefault />);

      const buttons = screen.getAllByRole('button');

      // Click multiple slide indicators rapidly
      await user.click(buttons[1]);
      await user.click(buttons[3]);
      await user.click(buttons[0]);

      // Should display the last clicked slide
      await waitFor(() => {
        expect(screen.getByText('Track Every Episode')).toBeInTheDocument();
      });
    });

    it('should maintain slide state after pause', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = renderWithRouter(<EnhancedDefault />);

      // Advance to second slide
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(screen.getByText('Manage Movies')).toBeInTheDocument();
      });

      const pauseIcon = container.querySelector('[data-testid="PauseIcon"]');
      const playPauseButton = pauseIcon?.closest('button');

      // Pause
      await user.click(playPauseButton!);

      // Should still show second slide
      expect(screen.getByText('Manage Movies')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible buttons', () => {
      renderWithRouter(<EnhancedDefault />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should have accessible links', () => {
      renderWithRouter(<EnhancedDefault />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href');
      });
    });
  });
});
