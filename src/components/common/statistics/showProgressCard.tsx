import { ReactNode, useMemo } from 'react';

import { Box, Card, CardContent, Divider, LinearProgress, Typography } from '@mui/material';

import { getProgressBarColor } from '../../utility/watchStatusColors';
import { getWatchStatusDisplay } from '../../utility/watchStatusUtility';
import { ShowProgress, WatchStatus } from '@ajgifford/keepwatching-types';

export interface ShowProgressCardProps {
  title: string;
  shows: ShowProgress[];
  filters?: WatchStatus[] | WatchStatus | null;
  maxHeight?: number | string;
  emptyMessage?: string;
  footer?: ReactNode;
  sortBy?: 'completion' | 'title' | 'episodes' | 'none';
  sortOrder?: 'asc' | 'desc';
  maxItems?: number;
}

export default function ShowProgressCard({
  title,
  shows,
  filters = null,
  maxHeight = 300,
  emptyMessage,
  footer,
  sortBy = 'completion',
  sortOrder = 'desc',
  maxItems,
}: ShowProgressCardProps) {
  const filteredAndSortedShows = useMemo(() => {
    // Filter shows based on the filters prop
    let filtered = shows;

    if (filters !== null) {
      const filterArray = Array.isArray(filters) ? filters : [filters];
      filtered = shows.filter((show) => filterArray.includes(show.status));
    }

    // Sort shows based on sortBy prop
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'completion':
          comparison = a.percentComplete - b.percentComplete;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'episodes':
          comparison = a.totalEpisodes - b.totalEpisodes;
          break;
        case 'none':
        default:
          return 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Limit items if maxItems is specified
    return maxItems ? sorted.slice(0, maxItems) : sorted;
  }, [shows, filters, sortBy, sortOrder, maxItems]);

  const defaultEmptyMessage = useMemo(() => {
    if (emptyMessage) return emptyMessage;

    if (!filters || filters === null) {
      return 'No shows available';
    }

    const filterArray = Array.isArray(filters) ? filters : [filters];

    if (filterArray.length === 1) {
      const filter = filterArray[0];
      switch (filter) {
        case WatchStatus.WATCHING:
          return 'No shows currently being watched';
        case WatchStatus.WATCHED:
          return 'No shows completed yet';
        case WatchStatus.NOT_WATCHED:
          return 'No unwatched shows';
        case WatchStatus.UP_TO_DATE:
          return 'No shows up to date';
        case WatchStatus.UNAIRED:
          return 'No unaired shows';
        default:
          return 'No shows found';
      }
    }

    return `No shows found with the selected filters`;
  }, [filters, emptyMessage]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        {filteredAndSortedShows.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredAndSortedShows.length} show{filteredAndSortedShows.length !== 1 ? 's' : ''}
            {maxItems && shows.length > maxItems && ` of ${shows.length} total`}
          </Typography>
        )}

        <Box sx={{ maxHeight, overflow: 'auto' }}>
          {filteredAndSortedShows.length > 0 ? (
            filteredAndSortedShows.map((show, index) => (
              <Box key={show.showId} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {show.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {show.watchedEpisodes}/{show.totalEpisodes}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {getWatchStatusDisplay(show.status)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(show.percentComplete)}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={show.percentComplete}
                  color={getProgressBarColor(show.percentComplete)}
                  sx={{ height: 8, borderRadius: 4 }}
                />

                {index < filteredAndSortedShows.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              {defaultEmptyMessage}
            </Typography>
          )}
        </Box>
        {footer}
      </CardContent>
    </Card>
  );
}
