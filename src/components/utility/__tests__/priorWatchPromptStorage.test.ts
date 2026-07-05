import { clearPriorWatchPromptFlag, getPriorWatchPromptKey } from '../priorWatchPromptStorage';

describe('priorWatchPromptStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getPriorWatchPromptKey', () => {
    it('builds a key from showId and profileId', () => {
      expect(getPriorWatchPromptKey(1, 123)).toBe('shown-prior-prompt-1-123');
    });

    it('builds the same key regardless of number or string inputs', () => {
      expect(getPriorWatchPromptKey('1', '123')).toBe(getPriorWatchPromptKey(1, 123));
    });
  });

  describe('clearPriorWatchPromptFlag', () => {
    it('removes the flag matching getPriorWatchPromptKey', () => {
      const key = getPriorWatchPromptKey(1, 123);
      localStorage.setItem(key, 'true');

      clearPriorWatchPromptFlag(1, 123);

      expect(localStorage.getItem(key)).toBeNull();
    });

    it('does not affect flags for other shows/profiles', () => {
      localStorage.setItem(getPriorWatchPromptKey(1, 123), 'true');
      localStorage.setItem(getPriorWatchPromptKey(2, 123), 'true');

      clearPriorWatchPromptFlag(1, 123);

      expect(localStorage.getItem(getPriorWatchPromptKey(1, 123))).toBeNull();
      expect(localStorage.getItem(getPriorWatchPromptKey(2, 123))).toBe('true');
    });
  });
});
