import { render } from '@testing-library/react';

import { ProfileEpisode, ProfileSeason, ProfileShow, WatchStatus } from '@ajgifford/keepwatching-types';

import {
  WatchStatusIcon,
  canChangeEpisodeWatchStatus,
  canChangeSeasonWatchStatus,
  canChangeShowWatchStatus,
  determineNextSeasonWatchStatus,
  determineNextShowWatchStatus,
  determineNextWatchStatus,
  getWatchStatusAction,
} from '../watchStatusUtility';

describe('watchStatusUtility', () => {
  describe('WatchStatusIcon', () => {
    it('should render WatchLaterIcon for WATCHED status', () => {
      const { container } = render(<WatchStatusIcon status={WatchStatus.WATCHED} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render WatchLaterTwoToneIcon for WATCHING status', () => {
      const { container } = render(<WatchStatusIcon status={WatchStatus.WATCHING} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render UpdateIcon for UP_TO_DATE status', () => {
      const { container } = render(<WatchStatusIcon status={WatchStatus.UP_TO_DATE} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render PendingOutlinedIcon for UNAIRED status', () => {
      const { container } = render(<WatchStatusIcon status={WatchStatus.UNAIRED} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render WatchLaterOutlinedIcon for NOT_WATCHED status', () => {
      const { container } = render(<WatchStatusIcon status={WatchStatus.NOT_WATCHED} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should accept custom fontSize prop', () => {
      const { container } = render(<WatchStatusIcon status={WatchStatus.WATCHED} fontSize="small" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('determineNextSeasonWatchStatus', () => {
    it('should return WATCHED for NOT_WATCHED status', () => {
      const season = { watchStatus: WatchStatus.NOT_WATCHED } as ProfileSeason;
      expect(determineNextSeasonWatchStatus(season)).toBe(WatchStatus.WATCHED);
    });

    it('should return WATCHED for WATCHING status', () => {
      const season = { watchStatus: WatchStatus.WATCHING } as ProfileSeason;
      expect(determineNextSeasonWatchStatus(season)).toBe(WatchStatus.WATCHED);
    });

    it('should return NOT_WATCHED for UP_TO_DATE status', () => {
      const season = { watchStatus: WatchStatus.UP_TO_DATE } as ProfileSeason;
      expect(determineNextSeasonWatchStatus(season)).toBe(WatchStatus.NOT_WATCHED);
    });

    it('should return NOT_WATCHED for WATCHED status', () => {
      const season = { watchStatus: WatchStatus.WATCHED } as ProfileSeason;
      expect(determineNextSeasonWatchStatus(season)).toBe(WatchStatus.NOT_WATCHED);
    });
  });

  describe('determineNextShowWatchStatus', () => {
    it('should return WATCHED for NOT_WATCHED status', () => {
      const show = { watchStatus: WatchStatus.NOT_WATCHED } as ProfileShow;
      expect(determineNextShowWatchStatus(show)).toBe(WatchStatus.WATCHED);
    });

    it('should return WATCHED for WATCHING status', () => {
      const show = { watchStatus: WatchStatus.WATCHING } as ProfileShow;
      expect(determineNextShowWatchStatus(show)).toBe(WatchStatus.WATCHED);
    });

    it('should return NOT_WATCHED for UP_TO_DATE status', () => {
      const show = { watchStatus: WatchStatus.UP_TO_DATE } as ProfileShow;
      expect(determineNextShowWatchStatus(show)).toBe(WatchStatus.NOT_WATCHED);
    });

    it('should return NOT_WATCHED for WATCHED status', () => {
      const show = { watchStatus: WatchStatus.WATCHED } as ProfileShow;
      expect(determineNextShowWatchStatus(show)).toBe(WatchStatus.NOT_WATCHED);
    });
  });

  describe('determineNextWatchStatus', () => {
    it('should return WATCHED for NOT_WATCHED status', () => {
      expect(determineNextWatchStatus(WatchStatus.NOT_WATCHED)).toBe(WatchStatus.WATCHED);
    });

    it('should return WATCHED for WATCHING status', () => {
      expect(determineNextWatchStatus(WatchStatus.WATCHING)).toBe(WatchStatus.WATCHED);
    });

    it('should return NOT_WATCHED for UP_TO_DATE status', () => {
      expect(determineNextWatchStatus(WatchStatus.UP_TO_DATE)).toBe(WatchStatus.NOT_WATCHED);
    });

    it('should return NOT_WATCHED for WATCHED status', () => {
      expect(determineNextWatchStatus(WatchStatus.WATCHED)).toBe(WatchStatus.NOT_WATCHED);
    });

    it('should return NOT_WATCHED for UNAIRED status (default)', () => {
      expect(determineNextWatchStatus(WatchStatus.UNAIRED)).toBe(WatchStatus.NOT_WATCHED);
    });
  });

  describe('getWatchStatusAction', () => {
    it('should return "Mark Not Watched" when next status is NOT_WATCHED', () => {
      expect(getWatchStatusAction(WatchStatus.WATCHED)).toBe('Mark Not Watched');
    });

    it('should return "Mark Watched" when next status is WATCHED', () => {
      expect(getWatchStatusAction(WatchStatus.NOT_WATCHED)).toBe('Mark Watched');
    });
  });

  describe('canChangeShowWatchStatus', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for non-UNAIRED status', () => {
      const show = {
        watchStatus: WatchStatus.NOT_WATCHED,
        releaseDate: '2024-01-20',
      } as ProfileShow;
      expect(canChangeShowWatchStatus(show)).toBe(true);
    });

    it('should return true for UNAIRED status with past release date', () => {
      const show = {
        watchStatus: WatchStatus.UNAIRED,
        releaseDate: '2024-01-10',
      } as ProfileShow;
      expect(canChangeShowWatchStatus(show)).toBe(true);
    });

    it('should return false for UNAIRED status with future release date', () => {
      const show = {
        watchStatus: WatchStatus.UNAIRED,
        releaseDate: '2024-01-20',
      } as ProfileShow;
      expect(canChangeShowWatchStatus(show)).toBe(false);
    });
  });

  describe('canChangeSeasonWatchStatus', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for non-UNAIRED status', () => {
      const season = {
        watchStatus: WatchStatus.NOT_WATCHED,
        releaseDate: '2024-01-20',
      } as ProfileSeason;
      expect(canChangeSeasonWatchStatus(season)).toBe(true);
    });

    it('should return true for UNAIRED status with past release date', () => {
      const season = {
        watchStatus: WatchStatus.UNAIRED,
        releaseDate: '2024-01-10',
      } as ProfileSeason;
      expect(canChangeSeasonWatchStatus(season)).toBe(true);
    });

    it('should return false for UNAIRED status with future release date', () => {
      const season = {
        watchStatus: WatchStatus.UNAIRED,
        releaseDate: '2024-01-20',
      } as ProfileSeason;
      expect(canChangeSeasonWatchStatus(season)).toBe(false);
    });
  });

  describe('canChangeEpisodeWatchStatus', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for non-UNAIRED status', () => {
      const episode = {
        watchStatus: WatchStatus.NOT_WATCHED,
        airDate: '2024-01-20',
      } as ProfileEpisode;
      expect(canChangeEpisodeWatchStatus(episode)).toBe(true);
    });

    it('should return true for UNAIRED status with past air date', () => {
      const episode = {
        watchStatus: WatchStatus.UNAIRED,
        airDate: '2024-01-10',
      } as ProfileEpisode;
      expect(canChangeEpisodeWatchStatus(episode)).toBe(true);
    });

    it('should return false for UNAIRED status with future air date', () => {
      const episode = {
        watchStatus: WatchStatus.UNAIRED,
        airDate: '2024-01-20',
      } as ProfileEpisode;
      expect(canChangeEpisodeWatchStatus(episode)).toBe(false);
    });

    it('should return false for UNAIRED status with no air date', () => {
      const episode = {
        watchStatus: WatchStatus.UNAIRED,
        airDate: null,
      } as ProfileEpisode;
      // The function returns null when airDate is null, which is falsy
      expect(canChangeEpisodeWatchStatus(episode)).toBeFalsy();
    });
  });
});
