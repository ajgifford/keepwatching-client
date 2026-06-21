import { Link } from 'react-router-dom';

import MovieIcon from '@mui/icons-material/Movie';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Button, Chip, Divider, List, ListItem, Typography } from '@mui/material';

import { useAppSelector } from '../../../app/hooks';
import { selectWatchlistItems } from '../../../app/slices/watchlistSlice';
import { calculateRuntimeDisplay } from '../../utility/contentUtility';
import { WatchlistItem } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

const UP_NEXT_LIMIT = 5;

function buildDetailRoute(item: WatchlistItem): string {
  if (item.contentType === 'show') return `/shows/${item.contentId}/${item.profileId}`;
  return `/movies/${item.contentId}/${item.profileId}`;
}

function getRuntimeDisplay(item: WatchlistItem): string {
  if (item.runtime === null || item.runtime === undefined) return '';
  if (item.contentType === 'movie') return calculateRuntimeDisplay(item.runtime);
  return `~${item.runtime} min/ep`;
}

export function UpNextSection() {
  const items = useAppSelector(selectWatchlistItems);
  const topItems = items.slice(0, UP_NEXT_LIMIT);

  if (topItems.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary" gutterBottom>
          Your watchlist is empty.
        </Typography>
        <Button component={Link} to="/watchlist" variant="outlined" startIcon={<PlaylistAddIcon />} sx={{ mt: 1 }}>
          Go to Watchlist
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
      <List disablePadding>
        {topItems.map((item, idx) => {
          const genres = item.genres
            ? item.genres
                .split(',')
                .map((g) => g.trim())
                .filter(Boolean)
            : [];
          const runtime = getRuntimeDisplay(item);

          return (
            <ListItem key={item.id} alignItems="flex-start" divider={idx < topItems.length - 1} sx={{ px: 0, py: 1.5 }}>
              <Box
                component="img"
                src={buildTMDBImagePath(item.posterImage, 'w92')}
                alt={item.title}
                sx={{ width: 52, height: 78, objectFit: 'cover', borderRadius: 1, mr: 1.5, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                  <Typography
                    component={Link}
                    to={buildDetailRoute(item)}
                    state={{ returnPath: '/watchlist' }}
                    variant="subtitle2"
                    sx={{
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.hasNewSeason && <Chip label="New Season" size="small" color="secondary" />}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    icon={item.contentType === 'show' ? <TvIcon /> : <MovieIcon />}
                    label={item.contentType === 'show' ? 'Show' : 'Movie'}
                    size="small"
                  />
                  {genres.slice(0, 3).map((genre) => (
                    <Chip key={genre} label={genre} size="small" variant="outlined" />
                  ))}
                </Box>
                {runtime && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {runtime}
                  </Typography>
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mt: 1, mb: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {items.length > UP_NEXT_LIMIT && (
          <Typography variant="caption" color="text.secondary">
            Showing {UP_NEXT_LIMIT} of {items.length} items
          </Typography>
        )}
        <Button
          component={Link}
          to="/watchlist"
          variant="outlined"
          size="small"
          startIcon={<PlaylistAddIcon />}
          sx={{ ml: 'auto' }}
        >
          View full watchlist
        </Button>
      </Box>
    </Box>
  );
}
