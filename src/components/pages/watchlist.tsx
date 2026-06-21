import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import MovieIcon from '@mui/icons-material/Movie';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Button, Chip, List, Tab, Tabs, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectActiveProfile } from '../../app/slices/activeProfileSlice';
import {
  fetchWatchlist,
  openWizard,
  selectFilteredNotWatchedPool,
  selectWatchlistError,
  selectWatchlistItems,
  selectWatchlistLoading,
  selectWatchlistMovies,
  selectWatchlistShows,
  selectWizardOpen,
} from '../../app/slices/watchlistSlice';
import WatchlistPoolItem from '../common/watchlist/watchlistPoolItem';
import WatchlistQueueItem from '../common/watchlist/watchlistQueueItem';
import WhatShouldIWatchWizard from '../common/watchlist/whatShouldIWatchWizard';
import { ErrorComponent, LoadingComponent } from '@ajgifford/keepwatching-ui';

export default function Watchlist() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectActiveProfile);
  const items = useAppSelector(selectWatchlistItems);
  const shows = useAppSelector(selectWatchlistShows);
  const movies = useAppSelector(selectWatchlistMovies);
  const pool = useAppSelector(selectFilteredNotWatchedPool);
  const loading = useAppSelector(selectWatchlistLoading);
  const error = useAppSelector(selectWatchlistError);
  const wizardOpen = useAppSelector(selectWizardOpen);

  const [mainTab, setMainTab] = useState(0);
  const [watchlistSubTab, setWatchlistSubTab] = useState(0);
  const [poolSubTab, setPoolSubTab] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchWatchlist(profile.id));
    }
  }, [dispatch, profile?.id]);

  const watchlistTabItems = watchlistSubTab === 0 ? items : watchlistSubTab === 1 ? shows : movies;

  const poolShows = pool.filter((i) => i.contentType === 'show');
  const poolMovies = pool.filter((i) => i.contentType === 'movie');
  const poolTabItems = poolSubTab === 0 ? pool : poolSubTab === 1 ? poolShows : poolMovies;

  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PlaylistAddIcon fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Watchlist
        </Typography>
      </Box>

      <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mb: 2 }}>
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              My Watchlist <Chip label={items.length} size="small" sx={{ ml: 0.5 }} />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Unwatched <Chip label={pool.length} size="small" sx={{ ml: 0.5 }} />
            </Box>
          }
        />
      </Tabs>

      {mainTab === 0 && (
        <>
          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">
                Your watchlist is empty. Switch to the Unwatched tab to add items.
              </Typography>
            </Box>
          ) : (
            <>
              <Tabs value={watchlistSubTab} onChange={(_, v) => setWatchlistSubTab(v)} sx={{ mb: 2 }}>
                <Tab label="All" />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TvIcon fontSize="small" /> Shows
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MovieIcon fontSize="small" /> Movies
                    </Box>
                  }
                />
              </Tabs>

              <List disablePadding>
                {watchlistTabItems.map((item, idx) => (
                  <WatchlistQueueItem
                    key={item.id}
                    item={item}
                    allItems={watchlistTabItems}
                    isFirst={idx === 0}
                    isLast={idx === watchlistTabItems.length - 1}
                  />
                ))}
              </List>
            </>
          )}
        </>
      )}

      {mainTab === 1 && (
        <>
          {pool.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="outlined" startIcon={<PlaylistAddIcon />} onClick={() => dispatch(openWizard())}>
                Help Me Decide
              </Button>
            </Box>
          )}

          {wizardOpen && <WhatShouldIWatchWizard />}

          <Tabs value={poolSubTab} onChange={(_, v) => setPoolSubTab(v)} sx={{ mb: 2 }}>
            <Tab label="All" />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TvIcon fontSize="small" /> Shows
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MovieIcon fontSize="small" /> Movies
                </Box>
              }
            />
          </Tabs>

          {poolTabItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary" gutterBottom>
                Nothing here yet. Add shows and movies to your favorites to get started.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button component={Link} to="/shows" variant="contained" startIcon={<TvIcon />}>
                  Browse Shows
                </Button>
                <Button component={Link} to="/movies" variant="outlined" startIcon={<MovieIcon />}>
                  Browse Movies
                </Button>
              </Box>
            </Box>
          ) : (
            <List disablePadding>
              {poolTabItems.map((item) => (
                <WatchlistPoolItem key={item.id} item={item} />
              ))}
            </List>
          )}
        </>
      )}
    </Box>
  );
}
