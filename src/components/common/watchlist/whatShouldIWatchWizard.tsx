import React, { useMemo, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import MovieIcon from '@mui/icons-material/Movie';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  addToWatchlist,
  clearWizard,
  closeWizard,
  selectNotWatchedPool,
  selectWatchlistItems,
  selectWizardFilters,
  selectWizardResult,
  selectWizardStep,
  setWizardFilters,
  setWizardResult,
  setWizardStep,
} from '../../../app/slices/watchlistSlice';
import { calculateRuntimeDisplay } from '../../utility/contentUtility';
import { WatchlistContentType, WatchlistItem } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

interface WizardFilters {
  contentType: WatchlistContentType | 'both';
  genres: string[];
  maxRuntime: number | null;
  epicRuntime: boolean;
}

const STEPS = ['Content Type', 'Genre', 'Time Available'];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function computeWizardResult(pool: WatchlistItem[], filters: WizardFilters): WatchlistItem[] {
  let candidates = [...pool];
  if (filters.contentType !== 'both') {
    candidates = candidates.filter((i) => i.contentType === filters.contentType);
  }
  if (filters.genres.length > 0) {
    candidates = candidates.filter((i) => filters.genres.some((g) => i.genres.toLowerCase().includes(g.toLowerCase())));
  }
  if (filters.epicRuntime) {
    candidates = candidates.filter((i) => i.runtime === null || i.runtime >= 150);
  } else if (filters.maxRuntime !== null) {
    candidates = candidates.filter((i) => i.runtime === null || i.runtime <= filters.maxRuntime!);
  }
  return shuffleArray(candidates).slice(0, 3);
}

function ResultCard({ item }: { item: WatchlistItem }) {
  const dispatch = useAppDispatch();
  const watchlistItems = useAppSelector(selectWatchlistItems);
  const [loading, setLoading] = useState(false);

  const isInWatchlist = watchlistItems.some(
    (w) => w.contentType === item.contentType && w.contentId === item.contentId
  );

  const genres = item.genres
    ? item.genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];
  const runtimeLabel =
    item.runtime === null
      ? null
      : item.contentType === 'movie'
        ? calculateRuntimeDisplay(item.runtime)
        : `~${item.runtime} min/ep`;

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

  return (
    <Card variant="outlined" sx={{ display: 'flex', gap: 1.5, p: 1.5, alignItems: 'flex-start' }}>
      <Box
        component="img"
        src={buildTMDBImagePath(item.posterImage, 'w92')}
        alt={item.title}
        sx={{ width: 64, height: 96, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
          {item.title}
        </Typography>
        {genres.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {genres.slice(0, 3).map((g) => (
              <Chip key={g} label={g} size="small" variant="outlined" />
            ))}
          </Box>
        )}
        {runtimeLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {runtimeLabel}
          </Typography>
        )}
        <Button
          size="small"
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlaylistAddIcon />}
          onClick={handleAdd}
          disabled={loading || isInWatchlist}
          sx={{ mt: 1 }}
        >
          {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </Button>
      </Box>
    </Card>
  );
}

export default function WhatShouldIWatchWizard() {
  const dispatch = useAppDispatch();
  const pool = useAppSelector(selectNotWatchedPool);
  const step = useAppSelector(selectWizardStep);
  const filters = useAppSelector(selectWizardFilters);
  const result = useAppSelector(selectWizardResult);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const item of pool) {
      if (!item.genres) continue;
      for (const g of item.genres.split(',')) {
        const trimmed = g.trim();
        if (trimmed) set.add(trimmed);
      }
    }
    return ['No preference', ...Array.from(set).sort()];
  }, [pool]);

  function handleNext() {
    if (step < STEPS.length - 1) {
      dispatch(setWizardStep(step + 1));
    } else {
      const computed = computeWizardResult(pool, filters as WizardFilters);
      dispatch(setWizardResult(computed));
    }
  }

  function handleBack() {
    if (step > 0) dispatch(setWizardStep(step - 1));
  }

  function handleBroaden() {
    const broadenedFilters: WizardFilters = { ...filters, genres: [], maxRuntime: null, epicRuntime: false };
    dispatch(setWizardFilters(broadenedFilters));
    dispatch(setWizardResult(computeWizardResult(pool, broadenedFilters)));
  }

  function handleTryAgain() {
    dispatch(clearWizard());
    dispatch(setWizardStep(0));
  }

  const isOnResults = result !== null;

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Help Me Decide</Typography>
          <IconButton size="small" onClick={() => dispatch(closeWizard())} aria-label="close wizard">
            <CloseIcon />
          </IconButton>
        </Box>

        {!isOnResults && (
          <>
            <Stepper activeStep={step} sx={{ mb: 3 }}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {step === 0 && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  What do you feel like watching?
                </Typography>
                <ToggleButtonGroup
                  value={filters.contentType}
                  exclusive
                  onChange={(_, val) => val && dispatch(setWizardFilters({ contentType: val }))}
                  sx={{ mt: 1 }}
                >
                  <ToggleButton value="show">
                    <LiveTvIcon sx={{ mr: 1 }} /> Shows
                  </ToggleButton>
                  <ToggleButton value="movie">
                    <MovieIcon sx={{ mr: 1 }} /> Movies
                  </ToggleButton>
                  <ToggleButton value="both">Either</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            {step === 1 && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Any genre preference?
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {allGenres.map((genre) => {
                    const selected =
                      genre === 'No preference' ? filters.genres.length === 0 : filters.genres.includes(genre);
                    return (
                      <Chip
                        key={genre}
                        label={genre}
                        onClick={() => {
                          if (genre === 'No preference') {
                            dispatch(setWizardFilters({ genres: [] }));
                          } else {
                            const newGenres = filters.genres.includes(genre)
                              ? filters.genres.filter((g) => g !== genre)
                              : [...filters.genres, genre];
                            dispatch(setWizardFilters({ genres: newGenres }));
                          }
                        }}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            {step === 2 && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  How much time do you have?
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
                  {filters.contentType !== 'show' && (
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                        Movie length
                      </Typography>
                      {[
                        { label: 'Quick (< 90 min)', maxRuntime: 90, epic: false },
                        { label: 'Standard (90–120 min)', maxRuntime: 120, epic: false },
                        { label: 'Long (120–150 min)', maxRuntime: 150, epic: false },
                        { label: 'Epic (150+ min)', maxRuntime: null, epic: true },
                      ].map(({ label, maxRuntime, epic }) => {
                        const selected = epic
                          ? filters.epicRuntime
                          : filters.maxRuntime === maxRuntime && !filters.epicRuntime;
                        return (
                          <Chip
                            key={label}
                            label={label}
                            onClick={() => dispatch(setWizardFilters({ maxRuntime, epicRuntime: epic }))}
                            color={selected ? 'primary' : 'default'}
                            variant={selected ? 'filled' : 'outlined'}
                          />
                        );
                      })}
                    </>
                  )}
                  {filters.contentType !== 'movie' && (
                    <>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ width: '100%', mt: filters.contentType === 'both' ? 1 : 0 }}
                      >
                        Episode length
                      </Typography>
                      {[
                        { label: 'Quick (< 30 min/ep)', maxRuntime: 30, epic: false },
                        { label: 'Standard (30–50 min/ep)', maxRuntime: 50, epic: false },
                        { label: 'Long (50–70 min/ep)', maxRuntime: 70, epic: false },
                        { label: 'Any length', maxRuntime: null, epic: false },
                      ].map(({ label, maxRuntime, epic }) => {
                        const selected = !epic && filters.maxRuntime === maxRuntime && !filters.epicRuntime;
                        return (
                          <Chip
                            key={label}
                            label={label}
                            onClick={() => dispatch(setWizardFilters({ maxRuntime, epicRuntime: false }))}
                            color={selected ? 'primary' : 'default'}
                            variant={selected ? 'filled' : 'outlined'}
                          />
                        );
                      })}
                    </>
                  )}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack} disabled={step === 0}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={step === STEPS.length - 1 ? <ShuffleIcon /> : undefined}
              >
                {step === STEPS.length - 1 ? 'Find Something!' : 'Next'}
              </Button>
            </Box>
          </>
        )}

        {isOnResults && (
          <>
            {result!.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  No matches — try fewer filters.
                </Typography>
                <Button variant="outlined" onClick={handleBroaden} sx={{ mr: 1 }}>
                  Broaden Search
                </Button>
                <Button onClick={handleTryAgain}>Start Over</Button>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Here are some picks for you:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {result!.map((item) => (
                    <ResultCard key={item.id} item={item} />
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={handleTryAgain} variant="outlined">
                    Try Again
                  </Button>
                  <Button onClick={() => dispatch(closeWizard())}>Close</Button>
                </Box>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
