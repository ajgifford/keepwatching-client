import { render } from '@testing-library/react';

import { ProfileShow, ShowEpisode, WatchStatus } from '@ajgifford/keepwatching-types';

import {
  buildEpisodeAirDate,
  buildEpisodeLine,
  buildEpisodeLineDetails,
  buildSeasonAirDate,
  buildServicesLine,
  buildShowAirDate,
  calculateRuntimeDisplay,
  stripArticle,
} from '../contentUtility';

describe('contentUtility', () => {
  describe('calculateRuntimeDisplay', () => {
    it('should return "TBD" for 0 runtime', () => {
      expect(calculateRuntimeDisplay(0)).toBe('TBD');
    });

    it('should return minutes for runtime less than 60', () => {
      expect(calculateRuntimeDisplay(45)).toBe('45 minutes');
    });

    it('should return hours and minutes for runtime between 60-119', () => {
      expect(calculateRuntimeDisplay(90)).toBe('1 hours, 30 minutes');
    });

    it('should return hours and minutes for runtime >= 120', () => {
      expect(calculateRuntimeDisplay(150)).toBe('2 hours, 30 minutes');
    });

    it('should handle exact hour', () => {
      expect(calculateRuntimeDisplay(120)).toBe('2 hours, 0 minutes');
    });
  });

  describe('stripArticle', () => {
    it('should strip "a" from beginning', () => {
      expect(stripArticle('a Test')).toBe('Test');
    });

    it('should strip "an" from beginning', () => {
      expect(stripArticle('an Example')).toBe('Example');
    });

    it('should strip "the" from beginning', () => {
      expect(stripArticle('the Movie')).toBe('Movie');
    });

    it('should strip article case-insensitively', () => {
      expect(stripArticle('The Movie')).toBe('Movie');
      expect(stripArticle('A Test')).toBe('Test');
      expect(stripArticle('An Example')).toBe('Example');
    });

    it('should not strip articles from middle of string', () => {
      expect(stripArticle('Game of the Thrones')).toBe('Game of the Thrones');
    });

    it('should return original if no article', () => {
      expect(stripArticle('Movie')).toBe('Movie');
    });
  });

  describe('buildEpisodeAirDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Aired" for past dates', () => {
      expect(buildEpisodeAirDate('2024-01-10')).toBe('Aired: 2024-01-10');
    });

    it('should return "Airing" for future dates', () => {
      expect(buildEpisodeAirDate('2024-01-20')).toBe('Airing: 2024-01-20');
    });

    it('should return "Airing: TBD" for empty date', () => {
      expect(buildEpisodeAirDate('')).toBe('Airing: TBD');
    });
  });

  describe('buildSeasonAirDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "First Aired" for past dates', () => {
      expect(buildSeasonAirDate('2024-01-10')).toBe('First Aired: 2024-01-10');
    });

    it('should return "Premiering On" for future dates', () => {
      expect(buildSeasonAirDate('2024-01-20')).toBe('Premiering On: 2024-01-20');
    });

    it('should return "Premiering On: TBD" for empty date', () => {
      expect(buildSeasonAirDate('')).toBe('Premiering On: TBD');
    });
  });

  describe('buildShowAirDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return JSX with "Premiered" for past dates', () => {
      const result = render(<div>{buildShowAirDate('2024-01-10')}</div>);
      expect(result.container.textContent).toBe('Premiered:  2024-01-10');
    });

    it('should return JSX with "Premiering On" for future dates', () => {
      const result = render(<div>{buildShowAirDate('2024-01-20')}</div>);
      expect(result.container.textContent).toBe('Premiering On:  2024-01-20');
    });

    it('should return JSX with "Premiering On: TBD" for empty date', () => {
      const result = render(<div>{buildShowAirDate('')}</div>);
      expect(result.container.textContent).toBe('Premiering On:  TBD');
    });
  });

  describe('buildServicesLine', () => {
    it('should return empty fragment for null show', () => {
      const result = render(<div>{buildServicesLine(null)}</div>);
      expect(result.container.textContent).toBe('');
    });

    it('should display network only when no streaming services', () => {
      const show = {
        network: 'HBO',
        streamingServices: '',
      } as ProfileShow;
      const result = render(<div>{buildServicesLine(show)}</div>);
      expect(result.container.textContent).toBe('Network:  HBO');
    });

    it('should display streaming services only when no network', () => {
      const show = {
        network: 'Unknown',
        streamingServices: 'Netflix, Hulu',
      } as ProfileShow;
      const result = render(<div>{buildServicesLine(show)}</div>);
      expect(result.container.textContent).toBe('Streaming Service(s):  Netflix, Hulu');
    });

    it('should display both network and streaming services when different', () => {
      const show = {
        network: 'HBO',
        streamingServices: 'Netflix, Hulu',
      } as ProfileShow;
      const result = render(<div>{buildServicesLine(show)}</div>);
      expect(result.container.textContent).toBe('Network:  HBO • Streaming Service(s):  Netflix, Hulu');
    });

    it('should display only streaming services when network is included in services', () => {
      const show = {
        network: 'HBO',
        streamingServices: 'HBO, Netflix',
      } as ProfileShow;
      const result = render(<div>{buildServicesLine(show)}</div>);
      expect(result.container.textContent).toBe('Streaming Service(s):  HBO, Netflix');
    });

    it('should filter out "Unknown" from streaming services', () => {
      const show = {
        network: 'HBO',
        streamingServices: 'Netflix, Unknown, Hulu',
      } as ProfileShow;
      const result = render(<div>{buildServicesLine(show)}</div>);
      expect(result.container.textContent).toBe('Network:  HBO • Streaming Service(s):  Netflix, Hulu');
    });

    it('should return no streaming service message when all data is unknown', () => {
      const show = {
        network: 'Unknown',
        streamingServices: 'Unknown',
      } as ProfileShow;
      const result = render(<div>{buildServicesLine(show)}</div>);
      expect(result.container.textContent).toBe('No Streaming Service Information');
    });
  });

  describe('buildEpisodeLine', () => {
    it('should return "No Episode Data" for null show', () => {
      const result = render(<div>{buildEpisodeLine(null)}</div>);
      expect(result.container.textContent).toBe('No Episode Data');
    });

    it('should return "No Episode Data" for show without lastEpisode', () => {
      const show = {} as ProfileShow;
      const result = render(<div>{buildEpisodeLine(show)}</div>);
      expect(result.container.textContent).toBe('No Episode Data');
    });

    it('should display last episode only when no next episode', () => {
      const show = {
        lastEpisode: {
          seasonNumber: 1,
          episodeNumber: 5,
          title: 'Last Episode',
          airDate: '2024-01-10',
        } as ShowEpisode,
      } as ProfileShow;
      const result = render(<div>{buildEpisodeLine(show)}</div>);
      expect(result.container.textContent).toBe('Last Episode:  S1 E5 - Last Episode - 2024-01-10');
    });

    it('should display both last and next episodes when available', () => {
      const show = {
        lastEpisode: {
          seasonNumber: 1,
          episodeNumber: 5,
          title: 'Last Episode',
          airDate: '2024-01-10',
        } as ShowEpisode,
        nextEpisode: {
          seasonNumber: 1,
          episodeNumber: 6,
          title: 'Next Episode',
          airDate: '2024-01-17',
        } as ShowEpisode,
      } as ProfileShow;
      const result = render(<div>{buildEpisodeLine(show)}</div>);
      expect(result.container.textContent).toBe(
        'Last Episode: S1 E5 - Last Episode - 2024-01-10 • Next Episode: S1 E6 - Next Episode - 2024-01-17'
      );
    });
  });

  describe('buildEpisodeLineDetails', () => {
    it('should format episode details correctly', () => {
      const episode = {
        seasonNumber: 2,
        episodeNumber: 10,
        title: 'Episode Title',
        airDate: '2024-01-15',
      } as ShowEpisode;
      const result = render(<div>{buildEpisodeLineDetails(episode)}</div>);
      expect(result.container.textContent).toBe('S2 E10 - Episode Title - 2024-01-15');
    });
  });
});
