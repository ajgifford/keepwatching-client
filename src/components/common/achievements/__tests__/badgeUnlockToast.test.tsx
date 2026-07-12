import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { UnlockedBadgeSummary } from '../../../../app/slices/badgeNotificationSlice';
import BadgeUnlockToast from '../badgeUnlockToast';
import userEvent from '@testing-library/user-event';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../../app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockState),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockBadge: UnlockedBadgeSummary = {
  id: 'episodes-250',
  category: 'episodes',
  tier: 'silver',
  title: '250 Episodes Watched',
  achievedDate: '2026-07-11T00:00:00.000Z',
};

let mockState: {
  badgeNotification: { open: boolean; badge: UnlockedBadgeSummary | null; additionalCount: number };
} = {
  badgeNotification: { open: false, badge: null, additionalCount: 0 },
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <BadgeUnlockToast />
    </BrowserRouter>
  );

describe('BadgeUnlockToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { badgeNotification: { open: false, badge: null, additionalCount: 0 } };
  });

  it('renders nothing when there is no badge', () => {
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the badge title and tier when open', () => {
    mockState = { badgeNotification: { open: true, badge: mockBadge, additionalCount: 0 } };
    renderComponent();

    expect(screen.getByText('Badge unlocked')).toBeInTheDocument();
    expect(screen.getByText('250 Episodes Watched · Silver')).toBeInTheDocument();
  });

  it('shows an "+N more" line when additional badges unlocked at the same time', () => {
    mockState = { badgeNotification: { open: true, badge: mockBadge, additionalCount: 2 } };
    renderComponent();

    expect(screen.getByText('+2 more badges unlocked')).toBeInTheDocument();
  });

  it('does not show the "+N more" line when nothing else unlocked', () => {
    mockState = { badgeNotification: { open: true, badge: mockBadge, additionalCount: 0 } };
    renderComponent();

    expect(screen.queryByText(/more badge/)).not.toBeInTheDocument();
  });

  it('navigates to the badge deep link and hides the toast when "View Badge" is clicked', async () => {
    mockState = { badgeNotification: { open: true, badge: mockBadge, additionalCount: 0 } };
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText('VIEW BADGE'));

    expect(mockNavigate).toHaveBeenCalledWith('/achievements?badge=episodes-250');
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'badgeNotification/hideBadgeUnlockNotification' })
    );
  });

  it('hides the toast when the close button is clicked without navigating', async () => {
    mockState = { badgeNotification: { open: true, badge: mockBadge, additionalCount: 0 } };
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'badgeNotification/hideBadgeUnlockNotification' })
    );
  });
});
