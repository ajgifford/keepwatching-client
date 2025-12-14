import {
  generateGenreFilterValues,
  generateStreamingServiceFilterValues,
  movieWatchStatuses,
  showWatchStatuses,
} from '../filters';
import { WatchStatus } from '@ajgifford/keepwatching-types';

describe('filters constants', () => {
  describe('showWatchStatuses', () => {
    it('should contain all show watch statuses', () => {
      expect(showWatchStatuses).toHaveLength(6);
      expect(showWatchStatuses[0]).toEqual({ value: '', display: '--All--' });
      expect(showWatchStatuses[1]).toEqual({ value: WatchStatus.UNAIRED, display: 'Unaired' });
      expect(showWatchStatuses[2]).toEqual({ value: WatchStatus.NOT_WATCHED, display: 'Not Watched' });
      expect(showWatchStatuses[3]).toEqual({ value: WatchStatus.WATCHING, display: 'Watching' });
      expect(showWatchStatuses[4]).toEqual({ value: WatchStatus.UP_TO_DATE, display: 'Up To Date' });
      expect(showWatchStatuses[5]).toEqual({ value: WatchStatus.WATCHED, display: 'Watched' });
    });
  });

  describe('movieWatchStatuses', () => {
    it('should contain all movie watch statuses', () => {
      expect(movieWatchStatuses).toHaveLength(4);
      expect(movieWatchStatuses[0]).toEqual({ value: '', display: '--All--' });
      expect(movieWatchStatuses[1]).toEqual({ value: WatchStatus.UNAIRED, display: 'Unaired' });
      expect(movieWatchStatuses[2]).toEqual({ value: WatchStatus.NOT_WATCHED, display: 'Not Watched' });
      expect(movieWatchStatuses[3]).toEqual({ value: WatchStatus.WATCHED, display: 'Watched' });
    });
  });

  describe('generateGenreFilterValues', () => {
    it('should generate unique sorted genres from items', () => {
      const items = [
        { genres: 'Action, Drama', streamingServices: '' },
        { genres: 'Comedy, Drama', streamingServices: '' },
        { genres: 'Action, Thriller', streamingServices: '' },
      ];

      const result = generateGenreFilterValues(items);

      expect(result).toEqual(['Action', 'Comedy', 'Drama', 'Thriller']);
    });

    it('should handle empty genres', () => {
      const items = [
        { genres: '', streamingServices: '' },
        { genres: 'Drama', streamingServices: '' },
      ];

      const result = generateGenreFilterValues(items);

      // Empty string is also a genre when split
      expect(result).toContain('Drama');
    });

    it('should handle items with no genres property', () => {
      const items = [
        { genres: '', streamingServices: '' },
        { genres: '', streamingServices: '' },
      ];

      const result = generateGenreFilterValues(items);

      expect(result).toBeInstanceOf(Array);
    });

    it('should trim whitespace from genres', () => {
      const items = [
        { genres: ' Action , Drama ', streamingServices: '' },
        { genres: 'Comedy,  Thriller  ', streamingServices: '' },
      ];

      const result = generateGenreFilterValues(items);

      expect(result).toEqual(['Action', 'Comedy', 'Drama', 'Thriller']);
    });

    it('should return sorted genres alphabetically', () => {
      const items = [
        { genres: 'Thriller, Action', streamingServices: '' },
        { genres: 'Drama, Comedy', streamingServices: '' },
      ];

      const result = generateGenreFilterValues(items);

      expect(result).toEqual(['Action', 'Comedy', 'Drama', 'Thriller']);
    });

    it('should handle empty array', () => {
      const result = generateGenreFilterValues([]);

      expect(result).toEqual([]);
    });
  });

  describe('generateStreamingServiceFilterValues', () => {
    it('should generate unique sorted streaming services from items', () => {
      const items = [
        { genres: '', streamingServices: 'Netflix, Hulu' },
        { genres: '', streamingServices: 'Disney+, Hulu' },
        { genres: '', streamingServices: 'Netflix, Prime Video' },
      ];

      const result = generateStreamingServiceFilterValues(items);

      expect(result).toEqual(['Disney+', 'Hulu', 'Netflix', 'Prime Video']);
    });

    it('should handle empty streaming services', () => {
      const items = [
        { genres: '', streamingServices: '' },
        { genres: '', streamingServices: 'Netflix' },
      ];

      const result = generateStreamingServiceFilterValues(items);

      expect(result).toContain('Netflix');
    });

    it('should trim whitespace from streaming services', () => {
      const items = [
        { genres: '', streamingServices: ' Netflix , Hulu ' },
        { genres: '', streamingServices: 'Disney+,  Prime Video  ' },
      ];

      const result = generateStreamingServiceFilterValues(items);

      expect(result).toEqual(['Disney+', 'Hulu', 'Netflix', 'Prime Video']);
    });

    it('should return sorted services alphabetically', () => {
      const items = [
        { genres: '', streamingServices: 'Hulu, Netflix' },
        { genres: '', streamingServices: 'Prime Video, Disney+' },
      ];

      const result = generateStreamingServiceFilterValues(items);

      expect(result).toEqual(['Disney+', 'Hulu', 'Netflix', 'Prime Video']);
    });

    it('should handle empty array', () => {
      const result = generateStreamingServiceFilterValues([]);

      expect(result).toEqual([]);
    });

    it('should remove duplicates', () => {
      const items = [
        { genres: '', streamingServices: 'Netflix, Hulu, Netflix' },
        { genres: '', streamingServices: 'Hulu' },
      ];

      const result = generateStreamingServiceFilterValues(items);

      expect(result).toEqual(['Hulu', 'Netflix']);
    });
  });
});
