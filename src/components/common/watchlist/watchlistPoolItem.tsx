import { useState } from 'react';
import { Link } from 'react-router-dom';

import MovieIcon from '@mui/icons-material/Movie';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Chip, CircularProgress, IconButton, ListItem, Tooltip, Typography } from '@mui/material';

import { useAppDispatch } from '../../../app/hooks';
import { addToWatchlist } from '../../../app/slices/watchlistSlice';
import { calculateRuntimeDisplay } from '../../utility/contentUtility';
import { WatchlistContentType, WatchlistItem } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

interface WatchlistPoolItemProps {
  item: WatchlistItem;
}

function buildDetailRoute(item: WatchlistItem, profileId: number): string {
  if (item.contentType === 'show') return `/shows/${item.contentId}/${profileId}`;
  return `/movies/${item.contentId}/${profileId}`;
}

function getRuntimeDisplay(item: WatchlistItem): string {
  if (item.runtime === null || item.runtime === undefined) return '—';
  if (item.contentType === 'movie') return calculateRuntimeDisplay(item.runtime);
  return `~${item.runtime} min/ep`;
}

export default function WatchlistPoolItem({ item }: WatchlistPoolItemProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      await dispatch(
        addToWatchlist({
          profileId: item.profileId,
          contentType: item.contentType as WatchlistContentType,
          contentId: item.contentId,
        })
      );
    } finally {
      setLoading(false);
    }
  }

  const genres = item.genres
    ? item.genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];
  const detailRoute = buildDetailRoute(item, item.profileId);
  const runtimeDisplay = getRuntimeDisplay(item);

  return (
    <ListItem
      alignItems="flex-start"
      divider
      secondaryAction={
        <Tooltip title="Add to Watchlist">
          <span>
            <IconButton
              size="small"
              onClick={handleAdd}
              disabled={loading}
              aria-label="add to watchlist"
              color="primary"
            >
              {loading ? <CircularProgress size={16} /> : <PlaylistAddIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      }
      sx={{ pr: 8 }}
    >
      <Box
        component="img"
        src={buildTMDBImagePath(item.posterImage, 'w92')}
        alt={item.title}
        sx={{ width: 64, height: 96, objectFit: 'cover', borderRadius: 1, mr: 2, flexShrink: 0 }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
          <Typography
            component={Link}
            to={detailRoute}
            state={{ returnPath: '/watchlist' }}
            variant="subtitle1"
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {genres.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                icon={item.contentType === 'show' ? <TvIcon /> : <MovieIcon />}
                label={item.contentType === 'show' ? 'Show' : 'Movie'}
                size="small"
              />
              {genres.slice(0, 4).map((genre) => (
                <Chip key={genre} label={genre} size="small" variant="outlined" />
              ))}
            </Box>
          )}
          {item.streamingServices && (
            <Typography variant="caption" color="text.secondary">
              {item.streamingServices}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {runtimeDisplay}
          </Typography>
        </Box>
      </Box>
    </ListItem>
  );
}
