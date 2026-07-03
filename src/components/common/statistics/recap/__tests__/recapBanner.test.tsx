import { act, render, screen } from '@testing-library/react';

import { RecapBanner, resolveRecapBannerTarget } from '../recapBanner';

const mockAxiosGet = jest.fn();

jest.mock('../../../../../app/api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
  },
}));

function setSystemDate(isoDate: string) {
  jest.useFakeTimers().setSystemTime(new Date(isoDate));
}

describe('resolveRecapBannerTarget', () => {
  it('returns a yearly-only target for the rest of December', () => {
    const target = resolveRecapBannerTarget(new Date('2026-12-15T00:00:00Z'));
    expect(target).toEqual({
      periodType: 'year',
      year: 2026,
      label: 'Your 2026 Recap is ready',
      allowedPeriodTypes: ['year'],
    });
  });

  it('allows both period types during the first 5 days of December (November overlap)', () => {
    const target = resolveRecapBannerTarget(new Date('2026-12-03T00:00:00Z'));
    expect(target).toEqual({
      periodType: 'year',
      year: 2026,
      label: 'Your 2026 Recap is ready',
      allowedPeriodTypes: ['year', 'month'],
    });
  });

  it('returns a month-only target for the previous month on days 1-5', () => {
    const target = resolveRecapBannerTarget(new Date('2026-08-03T00:00:00Z'));
    expect(target).toEqual({
      periodType: 'month',
      year: 2026,
      month: 7,
      label: 'Check out your July recap',
      allowedPeriodTypes: ['month'],
    });
  });

  it('rolls over to the previous year when days 1-5 fall in January', () => {
    const target = resolveRecapBannerTarget(new Date('2027-01-02T00:00:00Z'));
    expect(target).toEqual({
      periodType: 'month',
      year: 2026,
      month: 12,
      label: 'Check out your December recap',
      allowedPeriodTypes: ['month'],
    });
  });

  it('returns null outside the banner windows', () => {
    expect(resolveRecapBannerTarget(new Date('2026-07-15T00:00:00Z'))).toBeNull();
  });
});

describe('RecapBanner', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders nothing outside the banner windows', () => {
    setSystemDate('2026-07-15T00:00:00Z');
    const { container } = render(<RecapBanner accountId={1} profileId={2} profileName="Andy" />);
    expect(container).toBeEmptyDOMElement();
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });

  it('renders nothing when the target period has no recap data available', async () => {
    setSystemDate('2026-12-10T00:00:00Z');
    mockAxiosGet.mockResolvedValue({ data: { results: { years: [], months: [] } } });

    const { container } = await act(async () => {
      return render(<RecapBanner accountId={1} profileId={2} profileName="Andy" />);
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the yearly banner in December when data is available', async () => {
    setSystemDate('2026-12-10T00:00:00Z');
    mockAxiosGet.mockResolvedValue({ data: { results: { years: [2026], months: [] } } });

    await act(async () => {
      render(<RecapBanner accountId={1} profileId={2} profileName="Andy" />);
    });

    expect(screen.getByText('Your 2026 Recap is ready')).toBeInTheDocument();
    expect(mockAxiosGet).toHaveBeenCalledWith('/accounts/1/profiles/2/statistics/recap/available');
  });

  it('renders the monthly banner in the first days of a month when data is available', async () => {
    setSystemDate('2026-08-02T00:00:00Z');
    mockAxiosGet.mockResolvedValue({ data: { results: { years: [], months: [{ year: 2026, month: 7 }] } } });

    await act(async () => {
      render(<RecapBanner accountId={1} profileId={2} profileName="Andy" />);
    });

    expect(screen.getByText('Check out your July recap')).toBeInTheDocument();
  });
});
