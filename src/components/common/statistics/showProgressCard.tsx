import { ReactNode, useMemo } from 'react';

import { Box, Card, CardContent, Divider, LinearProgress, Typography } from '@mui/material';

import { ShowProgress } from '@ajgifford/keepwatching-types';

export interface ShowProgressCardProps {
  title: string;
  shows: ShowProgress[];
  filter?: 'WATCHED' | 'WATCHING' | 'NOT_WATCHED' | null;
  maxHeight?: number | string;
  emptyMessage?: string;
  footer?: ReactNode;
}

export default function ShowProgressCard({
  title,
  shows,
  filter = 'WATCHING',
  maxHeight = 300,
  emptyMessage,
  footer,
}: ShowProgressCardProps) {
  const filteredShows = useMemo(() => {
    // Filter shows if a filter is provided
    const filtered = filter ? shows.filter((show) => show.status === filter) : shows;

    // Sort by completion percentage (descending)
    return [...filtered].sort((a, b) => b.percentComplete - a.percentComplete);
  }, [shows, filter]);

  const defaultEmptyMessage = useMemo(() => {
    if (emptyMessage) return emptyMessage;

    return filter === 'WATCHING'
      ? 'No shows currently being watched'
      : filter === 'WATCHED'
        ? 'No shows completed yet'
        : filter === 'NOT_WATCHED'
          ? 'No unwatched shows'
          : 'No shows available';
  }, [filter, emptyMessage]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ maxHeight, overflow: 'auto' }}>
          {filteredShows.length > 0 ? (
            filteredShows.map((show, index) => (
              <Box key={show.showId} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{show.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {show.watchedEpisodes}/{show.totalEpisodes}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={show.percentComplete}
                  color={show.percentComplete > 75 ? 'success' : show.percentComplete > 25 ? 'warning' : 'error'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                {index < filteredShows.length - 1 && <Divider sx={{ mt: 1 }} />}
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
