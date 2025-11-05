import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AccessTime, CalendarToday, Star } from '@mui/icons-material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
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
import { MediaCard } from '../common/media/mediaCard';
import { ScrollableMediaRow } from '../common/media/scrollableMediaRow';
import { MovieCastSection } from '../common/movies/movieCast';
import { TabPanel, a11yProps } from '../common/tabs/tabPanel';
import { WatchStatusIcon } from '../utility/watchStatusUtility';
import { ProfileMovie, WatchStatus } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';
import {
  ErrorComponent,
  LoadingComponent,
  formatCurrency,
  formatRuntime,
  formatUserRating,
} from '@ajgifford/keepwatching-ui';

function MovieDetails() {
  const { movieId, profileId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const movie = useAppSelector(selectMovie);
  const recommendedMovies = useAppSelector(selectRecommendedMovies);
  const similarMovies = useAppSelector(selectSimilarMovies);
  const castMembers = useAppSelector(selectCastMembers);
  const movieDetailsLoading = useAppSelector(selectMovieLoading);
  const movieDetailsError = useAppSelector(selectMovieError);

  const location = useLocation();
  const returnPath = location.state?.returnPath || '/movies';
  const genreFilter = location.state?.genre || '';
  const streamingServiceFilter = location.state?.streamingService || '';
  const watchStatusFilter = location.state?.watchStatus || '';

  const [tabValue, setTabValue] = useState(0);
  const [loadingWatchStatus, setLoadingWatchStatus] = useState<boolean>(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (movieId && profileId) {
      dispatch(fetchMovieWithDetails({ profileId: Number(profileId), movieId: Number(movieId) }));
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
    setLoadingWatchStatus(true);
    try {
      event.stopPropagation();

      const nextStatus = movie.watchStatus === WatchStatus.WATCHED ? WatchStatus.NOT_WATCHED : WatchStatus.WATCHED;

      await dispatch(
        updateMovieWatchStatus({
          profileId: Number(profileId),
          movieId: movie.id,
          status: nextStatus,
        })
      );
    } finally {
      setLoadingWatchStatus(false);
    }
  };

  const buildBackButtonPath = () => {
    let path = returnPath;
    if (genreFilter) {
      path += path.includes('?') ? '&' : '?';
      path += `genre=${encodeURIComponent(genreFilter)}`;
    }
    if (streamingServiceFilter) {
      path += path.includes('?') ? '&' : '?';
      path += `streamingService=${encodeURIComponent(streamingServiceFilter)}`;
    }
    if (watchStatusFilter) {
      path += path.includes('?') ? '&' : '?';
      path += `watchStatus=${encodeURIComponent(watchStatusFilter)}`;
    }
    return path;
  };

  const getBackButtonTooltip = () => {
    const basePath = returnPath.split('?')[0];

    const pathMap: Record<string, string> = {
      '/movies': 'Back to Movies',
      '/search': 'Back to Search',
      '/discover': 'Back to Discover',
      '/home': 'Back to Home',
    };

    return pathMap[basePath] || 'Back';
  };

  function formatReleaseDate(releaseDate: string | undefined): string {
    if (!releaseDate) {
      return 'TBD';
    }
    const inputDate = new Date(releaseDate);
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    if (inputDate > today || inputDate >= ninetyDaysAgo) {
      return releaseDate;
    }

    return inputDate.getFullYear().toString();
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      {/* Back button */}
      <Box
        sx={{
          px: 2,
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          mt={1}
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Tooltip title={getBackButtonTooltip()}>
            <IconButton
              aria-label="back"
              onClick={() => {
                navigate(buildBackButtonPath());
              }}
              sx={{ color: 'text.primary' }}
            >
              <ArrowBackIosIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Movie Details Card */}
        <Card elevation={2} sx={{ overflow: 'visible', borderRadius: { xs: 1, md: 2 } }}>
          {/* Backdrop Image Section */}
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            {movie?.backdropImage ? (
              <CardMedia
                component="img"
                height={isMobile ? '380' : '320'}
                image={buildTMDBImagePath(movie?.backdropImage, 'w1280')}
                alt={movie.title}
                sx={{
                  filter: 'brightness(0.65)',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  width: '100%',
                }}
              />
            ) : (
              <Box
                sx={{
                  height: isMobile ? '200px' : '320px',
                  backgroundColor: 'grey.800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            )}

            {/* Overlay Content */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 100%)',
                color: 'white',
                pt: { xs: 3, sm: 4 },
                pb: { xs: 1.5, sm: 2 },
                px: { xs: 1.5, sm: 2 },
                display: 'flex',
                alignItems: 'flex-end',
                minHeight: { xs: '140px', sm: '180px' },
              }}
            >
              {/* Poster */}
              <Box
                component="img"
                sx={{
                  width: { xs: 80, sm: 120, md: 140 },
                  height: { xs: 120, sm: 180, md: 210 },
                  mr: { xs: 2, sm: 2, md: 3 },
                  borderRadius: 1,
                  boxShadow: 3,
                  transform: 'translateY(-30px)',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
                src={buildTMDBImagePath(movie?.posterImage, 'w500')}
                alt={movie?.title}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://placehold.co/300x450/gray/white?text=No+Image';
                }}
              />

              {/* Movie Details */}
              <Box sx={{ flexGrow: 1, pb: 2, minWidth: 0 }}>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  fontWeight="bold"
                  sx={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    mb: 1,
                  }}
                >
                  {movie?.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 1.5,
                    opacity: 1,
                    lineHeight: 1.4,
                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: { xs: 3, sm: 4 },
                  }}
                >
                  <i>{movie?.description}</i>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{formatReleaseDate(movie?.releaseDate)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{formatRuntime(movie?.runtime)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="body2">{formatUserRating(movie?.userRating)}</Typography>
                  </Box>
                  <Chip label={movie?.mpaRating} size="small" color="primary" sx={{ fontWeight: 500 }} />
                </Box>

                <Button
                  variant="contained"
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
                    mt: 1,
                    // Enhanced styling for better visibility
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker, more opaque background
                    backdropFilter: 'blur(12px)', // Increased blur
                    border: '2px solid rgba(255, 255, 255, 0.4)', // More prominent border
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)', // Text shadow for readability
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)', // Drop shadow
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
                    // Add a subtle gradient overlay for extra depth
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
                    // Ensure content is above the gradient
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
              </Box>
            </Box>
          </Box>

          {/* Additional Movie Details */}
          <CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Streaming On
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {movie?.streamingServices || 'Not available for streaming'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Director
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {movie?.director || 'Unknown'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Production Companies
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {movie?.productionCompanies || 'Unknown'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Genres
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {movie?.genres.split(',').map((genre) => (
                    <Chip key={genre} label={genre.trim()} variant="outlined" size="small" color="primary" />
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Box Office
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatCurrency(movie?.revenue)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Budget
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatCurrency(movie?.budget)}
                </Typography>
              </Grid>
            </Grid>

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
                    renderItem={(movie) => <MediaCard item={movie} searchType="movies" />}
                  />
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <ScrollableMediaRow
                    title="Similar Movies"
                    items={similarMovies}
                    isLoading={movieDetailsLoading}
                    emptyMessage="No similar movies found"
                    renderItem={(movie) => <MediaCard item={movie} searchType="movies" />}
                  />
                </Box>
              </Box>
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default MovieDetails;
