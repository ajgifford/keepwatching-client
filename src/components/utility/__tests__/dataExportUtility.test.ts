import axiosInstance from '../../../app/api/axiosInstance';
import { buildProfileDataExport, fetchAllWatchHistory, profileDataExportFilename } from '../dataExportUtility';
import { ContentRating, Profile, WatchHistoryItem, WatchlistItem } from '@ajgifford/keepwatching-types';

jest.mock('../../../app/api/axiosInstance');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const mockProfile: Profile = {
  id: 42,
  accountId: 1,
  name: 'Test Profile',
  image: 'https://placehold.co/96x96',
};

const mockHistoryItem = (overrides: Partial<WatchHistoryItem> = {}): WatchHistoryItem => ({
  historyId: 1,
  contentType: 'episode',
  contentId: 100,
  title: 'Pilot',
  parentTitle: 'Test Show',
  seasonNumber: 1,
  episodeNumber: 1,
  posterImage: '/poster.jpg',
  watchedAt: '2024-01-15T20:30:00Z',
  watchNumber: 1,
  isPriorWatch: false,
  runtime: 45,
  ...overrides,
});

describe('dataExportUtility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAllWatchHistory', () => {
    it('stops after the first page when totalCount fits in one page', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { items: [mockHistoryItem({ historyId: 1 }), mockHistoryItem({ historyId: 2 })], totalCount: 2 },
      });

      const items = await fetchAllWatchHistory(1, 42);

      expect(items).toHaveLength(2);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/accounts/1/profiles/42/watchHistory',
        expect.objectContaining({ params: expect.objectContaining({ page: 1, pageSize: 100 }) })
      );
    });

    it('loops additional pages until totalCount is covered', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: { items: [mockHistoryItem({ historyId: 1 })], totalCount: 3 } })
        .mockResolvedValueOnce({ data: { items: [mockHistoryItem({ historyId: 2 })], totalCount: 3 } })
        .mockResolvedValueOnce({ data: { items: [mockHistoryItem({ historyId: 3 })], totalCount: 3 } });

      const items = await fetchAllWatchHistory(1, 42);

      expect(items).toHaveLength(3);
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      expect(items.map((i) => i.historyId)).toEqual([1, 2, 3]);
    });

    it('returns an empty array when there is no watch history', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { items: [], totalCount: 0 } });

      const items = await fetchAllWatchHistory(1, 42);

      expect(items).toEqual([]);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildProfileDataExport', () => {
    it('assembles favorites, ratings, watchlist, and watch history into one export object', async () => {
      const ratings: ContentRating[] = [
        {
          id: 1,
          profileId: 42,
          contentType: 'show',
          contentId: 101,
          contentTitle: 'Breaking Bad',
          posterImage: '/poster.jpg',
          rating: 5,
          note: 'Great show',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        } as ContentRating,
      ];
      const watchlist: WatchlistItem[] = [
        {
          id: 12,
          profileId: 42,
          contentType: 'show',
          contentId: 101,
          priority: 1,
          addedAt: '2024-06-01T12:00:00Z',
          title: 'Breaking Bad',
          posterImage: '/poster.jpg',
          genres: 'Drama',
          streamingServices: 'Netflix',
        } as WatchlistItem,
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: { profileWithContent: { shows: [{ id: 101 }], movies: [] } } })
        .mockResolvedValueOnce({ data: { ratings } })
        .mockResolvedValueOnce({ data: { watchlist } })
        .mockResolvedValueOnce({ data: { items: [mockHistoryItem()], totalCount: 1 } });

      const result = await buildProfileDataExport(1, mockProfile);

      expect(result.profile).toEqual({ id: 42, name: 'Test Profile' });
      expect(result.favorites).toEqual({ shows: [{ id: 101 }], movies: [] });
      expect(result.ratings).toEqual(ratings);
      expect(result.watchlist).toEqual(watchlist);
      expect(result.watchHistory).toHaveLength(1);
      expect(result.exportedAt).toEqual(expect.any(String));
    });

    it('propagates an error when one of the requests fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('network error'));

      await expect(buildProfileDataExport(1, mockProfile)).rejects.toThrow('network error');
    });
  });

  describe('profileDataExportFilename', () => {
    it('slugifies the profile name and appends a date stamp', () => {
      const now = new Date('2026-07-09T12:00:00Z');

      expect(profileDataExportFilename('John Doe', now)).toBe('keepwatching-data-john-doe-2026-07-09.json');
    });

    it('strips non-alphanumeric characters from the profile name', () => {
      const now = new Date('2026-07-09T12:00:00Z');

      expect(profileDataExportFilename("Ann's Profile!", now)).toBe('keepwatching-data-ann-s-profile-2026-07-09.json');
    });
  });
});
