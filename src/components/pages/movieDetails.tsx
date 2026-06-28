import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { AccessTime, CalendarToday, Replay, Star } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useDateFormatters } from '../../app/hooks/useDateFormatters';
import {
  clearActiveMovie,
  fetchMovieWithDetails,
  selectCastMembers,
  selectMovie,
  selectMovieError,
  selectMovieLoading,
  selectRecommendedMovies,
  selectSimilarMovies,
} from '../../app/slices/activeMovieSlice';
import { updateMovieWatchStatus } from '../../app/slices/activeProfileSlice';
import { fetchProfileRecommendations } from '../../app/slices/communityRecommendationsSlice';
import { fetchRatings } from '../../app/slices/ratingsSlice';
import { startMovieRewatch } from '../../app/slices/watchHistorySlice';
import {
  addToWatchlist,
  fetchWatchlist,
  removeFromWatchlist,
  selectWatchlistItems,
} from '../../app/slices/watchlistSlice';
import { MediaCard } from '../common/media/mediaCard';
import { ScrollableMediaRow } from '../common/media/scrollableMediaRow';
import MoviePriorWatchDialog from '../common/movies/MoviePriorWatchDialog';
import { MovieCastSection } from '../common/movies/movieCast';
import { StickyBackButton } from '../common/navigation/StickyBackButton';
import { ContentRatingWidget } from '../common/ratings/contentRatingWidget';
import { RecommendButton } from '../common/recommendations/recommendButton';
import { TabPanel, a11yProps } from '../common/tabs/tabPanel';
import { ProfileMovie, SimilarOrRecommendedMovie, WatchStatus } from '@ajgifford/keepwatching-types';
import {
  ErrorComponent,
  GenreChipList,
  LoadingComponent,
  MediaHeroCard,
  WatchStatusIcon,
  formatCurrency,
  formatRuntime,
  formatUserRating,
} from '@ajgifford/keepwatching-ui';

function MovieDetails() {
  const { movieId, profileId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const formatters = useDateFormatters();

  const dispatch = useAppDispatch();
  const movie = useAppSelector(selectMovie);
  const recommendedMovies = useAppSelector(selectRecommendedMovies);
  const similarMovies = useAppSelector(selectSimilarMovies);
  const castMembers = useAppSelector(selectCastMembers);
  const movieDetailsLoading = useAppSelector(selectMovieLoading);
  const movieDetailsError = useAppSelector(selectMovieError);
  const watchlistItems = useAppSelector(selectWatchlistItems);

  const location = useLocation();
  const returnPath = location.state?.returnPath || '/movies';
  const genreFilter = location.state?.genre || '';
  const streamingServiceFilter = location.state?.streamingService || '';
  const watchStatusFilter = location.state?.watchStatus || '';

  const [tabValue, setTabValue] = useState(0);
  const [loadingWatchStatus, setLoadingWatchStatus] = useState<boolean>(false);
  const [loadingMovieRewatch, setLoadingMovieRewatch] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [priorWatchDialogOpen, setPriorWatchDialogOpen] = useState(false);
  const [pendingWatchMovie, setPendingWatchMovie] = useState<ProfileMovie | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (movieId && profileId) {
      dispatch(fetchMovieWithDetails({ profileId: Number(profileId), movieId: Number(movieId) }));
      dispatch(fetchRatings({ profileId: Number(profileId) }));
      dispatch(fetchProfileRecommendations({ profileId: Number(profileId) }));
      dispatch(fetchWatchlist(Number(profileId)));
    }

    return () => {
      dispatch(clearActiveMovie());
    };
  }, [profileId, movieId, dispatch]);

  if (movieDetailsLoading) {
    return <LoadingComponent />;
  }
  if (movieDetailsError) {
    return <ErrorComponent error={movieDetailsError} />;
  }

  const handleMovieWatchStatusChange = async (movie: ProfileMovie, event: React.MouseEvent) => {
    event.stopPropagation();
    const nextStatus = movie.watchStatus === WatchStatus.WATCHED ? WatchStatus.NOT_WATCHED : WatchStatus.WATCHED;

    if (nextStatus === WatchStatus.WATCHED) {
      setPendingWatchMovie(movie);
      setPriorWatchDialogOpen(true);
    } else {
      setLoadingWatchStatus(true);
      try {
        await dispatch(updateMovieWatchStatus({ profileId: Number(profileId), movieId: movie.id, status: nextStatus }));
      } finally {
        setLoadingWatchStatus(false);
      }
    }
  };

  const handleDispatchWatched = async (isPriorWatch: boolean, watchedAt?: string) => {
    if (!pendingWatchMovie) return;
    setLoadingWatchStatus(true);
    try {
      await dispatch(
        updateMovieWatchStatus({
          profileId: Number(profileId),
          movieId: pendingWatchMovie.id,
          status: WatchStatus.WATCHED,
          isPriorWatch,
          watchedAt,
        })
      );
    } finally {
      setLoadingWatchStatus(false);
      setPendingWatchMovie(null);
    }
  };

  const handleStartMovieRewatch = async () => {
    if (!movie) return;
    setLoadingMovieRewatch(true);
    try {
      await dispatch(startMovieRewatch({ profileId: Number(profileId), movieId: movie.id }));
    } finally {
      setLoadingMovieRewatch(false);
    }
  };

  const watchlistEntry = watchlistItems.find((i) => i.contentType === 'movie' && i.contentId === movie?.id);

  const handleToggleWatchlist = async () => {
    if (!movie) return;
    setLoadingWatchlist(true);
    try {
      if (watchlistEntry) {
        await dispatch(removeFromWatchlist({ profileId: Number(profileId), itemId: watchlistEntry.id }));
      } else {
        await dispatch(addToWatchlist({ profileId: Number(profileId), contentType: 'movie', contentId: movie.id }));
      }
    } finally {
      setLoadingWatchlist(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      <StickyBackButton
        returnPath={returnPath}
        genreFilter={genreFilter}
        streamingServiceFilter={streamingServiceFilter}
        watchStatusFilter={watchStatusFilter}
        pathLabelMap={{
          '/movies': 'Back to Movies',
          '/search': 'Back to Search',
          '/discover': 'Back to Discover',
          '/home': 'Back to Home',
          '/watchlist': 'Back to Watchlist',
        }}
      />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Movie Details Card */}
        <MediaHeroCard
          backdropImage={movie?.backdropImage}
          posterImage={movie?.posterImage}
          title={movie?.title}
          description={movie?.description}
          isMobile={isMobile}
          metadata={[
            { icon: <CalendarToday sx={{ fontSize: 16 }} />, label: formatters.relativeDate(movie?.releaseDate) },
            { icon: <AccessTime sx={{ fontSize: 16 }} />, label: formatRuntime(movie?.runtime) },
            { icon: <Star sx={{ fontSize: 16, color: 'warning.main' }} />, label: formatUserRating(movie?.userRating) },
          ]}
          contentRatingLabel={movie?.mpaRating}
          descriptionClamp={{ xs: 3, sm: 4 }}
          actions={
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap',
                gap: 1,
                mt: 1,
                alignItems: { xs: 'stretch', sm: 'center' },
              }}
            >
              <Button
                variant="contained"
                size={isMobile ? 'small' : 'medium'}
                disabled={loadingWatchStatus || movie?.watchStatus === WatchStatus.UNAIRED}
                onClick={(event) => movie && handleMovieWatchStatusChange(movie, event)}
                startIcon={
                  loadingWatchStatus ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <WatchStatusIcon status={movie?.watchStatus || WatchStatus.NOT_WATCHED} />
                  )
                }
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  color: 'white',
                  fontWeight: 600,
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '2px solid rgba(255, 255, 255, 0.6)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.5)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(128, 128, 128, 0.8)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  },
                  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
                    position: 'relative',
                    zIndex: 2,
                  },
                  '& .MuiButton-label': {
                    position: 'relative',
                    zIndex: 2,
                  },
                }}
              >
                {loadingWatchStatus
                  ? 'Loading...'
                  : movie?.watchStatus === WatchStatus.WATCHED
                    ? 'Mark Unwatched'
                    : 'Mark as Watched'}
              </Button>
              {movie?.watchStatus === WatchStatus.WATCHED && (
                <Button
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  disabled={loadingMovieRewatch}
                  onClick={handleStartMovieRewatch}
                  startIcon={
                    loadingMovieRewatch ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Replay sx={{ color: 'rewatch.main' }} />
                    )
                  }
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '2px solid rgba(255, 255, 255, 0.6)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.5)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(128, 128, 128, 0.8)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {loadingMovieRewatch ? 'Loading...' : 'Mark Rewatched'}
                </Button>
              )}
              {movie?.watchStatus !== WatchStatus.WATCHED && (
                <Button
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  disabled={loadingWatchlist}
                  onClick={handleToggleWatchlist}
                  startIcon={
                    loadingWatchlist ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : watchlistEntry ? (
                      <PlaylistRemoveIcon />
                    ) : (
                      <PlaylistAddIcon />
                    )
                  }
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '2px solid rgba(255, 255, 255, 0.6)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.5)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(128, 128, 128, 0.8)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {loadingWatchlist ? 'Loading...' : watchlistEntry ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>
              )}
              {movie && profileId && (
                <RecommendButton
                  profileId={Number(profileId)}
                  contentType="movie"
                  contentId={movie.id}
                  contentTitle={movie.title}
                  size={isMobile ? 'small' : 'medium'}
                />
              )}
            </Box>
          }
        >
          {/* Additional Movie Details */}
          <CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Streaming On
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {movie?.streamingServices || 'Not available for streaming'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Director
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {movie?.director || 'Unknown'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Production Companies
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {movie?.productionCompanies || 'Unknown'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Genres
                </Typography>
                <GenreChipList genres={movie?.genres ?? ''} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Box Office
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatCurrency(movie?.revenue)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Budget
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatCurrency(movie?.budget)}
                </Typography>
              </Grid>
            </Grid>

            {/* Your Rating & Notes */}
            {movie && profileId && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'medium',
                    }}
                  >
                    Your Rating &amp; Notes
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ContentRatingWidget
                    profileId={Number(profileId)}
                    contentType="movie"
                    contentId={movie.id}
                    contentTitle={movie.title}
                    posterImage={movie.posterImage}
                  />
                </AccordionDetails>
              </Accordion>
            )}

            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="show content tabs"
              >
                <Tab label="Cast" {...a11yProps(0)} />
                <Tab label="Related Content" {...a11yProps(1)} />
              </Tabs>
            </Box>

            {/* Cast Component */}
            <TabPanel value={tabValue} index={0}>
              {profileId && <MovieCastSection castMembers={castMembers} profileId={profileId} />}
            </TabPanel>

            {/* Related Content Component */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 2, py: 1 }}>
                <Box sx={{ mb: 4 }}>
                  <ScrollableMediaRow
                    title="Recommended Movies"
                    items={recommendedMovies}
                    isLoading={movieDetailsLoading}
                    emptyMessage="No recommended movies found"
                    renderItem={(movie: SimilarOrRecommendedMovie) => <MediaCard item={movie} searchType="movies" />}
                    getItemKey={(movie) => movie.id}
                  />
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <ScrollableMediaRow
                    title="Similar Movies"
                    items={similarMovies}
                    isLoading={movieDetailsLoading}
                    emptyMessage="No similar movies found"
                    renderItem={(movie: SimilarOrRecommendedMovie) => <MediaCard item={movie} searchType="movies" />}
                    getItemKey={(movie) => movie.id}
                  />
                </Box>
              </Box>
            </TabPanel>
          </CardContent>
        </MediaHeroCard>
      </Box>
      <MoviePriorWatchDialog
        open={priorWatchDialogOpen}
        movieTitle={pendingWatchMovie?.title ?? ''}
        releaseDate={pendingWatchMovie?.releaseDate ?? ''}
        onJustWatched={() => handleDispatchWatched(false)}
        onPriorWatch={(watchedAt) => handleDispatchWatched(true, watchedAt)}
        onClose={() => {
          setPriorWatchDialogOpen(false);
          setPendingWatchMovie(null);
        }}
      />
    </Box>
  );
}

export default MovieDetails;
