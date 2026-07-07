import React from 'react';
import { Link } from 'react-router-dom';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Chip, IconButton, ListItem, Tooltip, Typography } from '@mui/material';

import { useAppDispatch } from '../../../app/hooks';
import { removeFromWatchlist, updateWatchlistPriorities } from '../../../app/slices/watchlistSlice';
import { calculateRuntimeDisplay } from '../../utility/contentUtility';
import { WatchStatus, WatchlistItem } from '@ajgifford/keepwatching-types';
import { WatchStatusIcon, buildTMDBImagePath, getWatchStatusDisplay } from '@ajgifford/keepwatching-ui';

interface WatchlistQueueItemProps {
  item: WatchlistItem;
  allItems: WatchlistItem[];
  isFirst: boolean;
  isLast: boolean;
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

export default function WatchlistQueueItem({ item, allItems, isFirst, isLast }: WatchlistQueueItemProps) {
  const dispatch = useAppDispatch();

  function handleMoveUp() {
    const idx = allItems.findIndex((i) => i.id === item.id);
    if (idx <= 0) return;
    const newItems = [...allItems];
    [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
    const priorities = newItems.map((i, pos) => ({ id: i.id, priority: pos }));
    dispatch(updateWatchlistPriorities({ profileId: item.profileId, priorities }));
  }

  function handleMoveDown() {
    const idx = allItems.findIndex((i) => i.id === item.id);
    if (idx < 0 || idx >= allItems.length - 1) return;
    const newItems = [...allItems];
    [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    const priorities = newItems.map((i, pos) => ({ id: i.id, priority: pos }));
    dispatch(updateWatchlistPriorities({ profileId: item.profileId, priorities }));
  }

  function handleRemove() {
    dispatch(removeFromWatchlist({ profileId: item.profileId, itemId: item.id }));
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Move up">
            <span>
              <IconButton size="small" onClick={handleMoveUp} disabled={isFirst} aria-label="move up">
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down">
            <span>
              <IconButton size="small" onClick={handleMoveDown} disabled={isLast} aria-label="move down">
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton size="small" onClick={handleRemove} aria-label="remove from watchlist" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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
          {item.currentWatchStatus !== WatchStatus.NOT_WATCHED && (
            <Chip
              icon={<WatchStatusIcon status={item.currentWatchStatus} fontSize="small" />}
              label={getWatchStatusDisplay(item.currentWatchStatus)}
              size="small"
              color="secondary"
            />
          )}
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
