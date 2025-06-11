import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AccessTime, CalendarToday, ExpandMore, Star, WatchLater } from '@mui/icons-material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  IconButton,
  Rating,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  clearActiveMovie,
  fetchMovieWithDetails,
  selectMovie,
  selectMovieError,
  selectMovieLoading,
  selectRecommendedMovies,
  selectSimilarMovies,
} from '../../app/slices/activeMovieSlice';
import { updateMovieStatus } from '../../app/slices/activeProfileSlice';
import { ErrorComponent } from '../common/errorComponent';
import { LoadingComponent } from '../common/loadingComponent';
import { MediaCard } from '../common/media/mediaCard';
import { ScrollableMediaRow } from '../common/media/scrollableMediaRow';
import { buildTMDBImagePath } from '../utility/contentUtility';
import { ProfileMovie, WatchStatus } from '@ajgifford/keepwatching-types';

function MovieDetails() {
  const { movieId, profileId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState<string[]>(['info']);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const movie = useAppSelector(selectMovie);
  const recommendedMovies = useAppSelector(selectRecommendedMovies);
  const similarMovies = useAppSelector(selectSimilarMovies);
  const movieDetailsLoading = useAppSelector(selectMovieLoading);
  const movieDetailsError = useAppSelector(selectMovieError);

  const location = useLocation();
  const returnPath = location.state?.returnPath || '/movies';
  const genreFilter = location.state?.genre || '';
  const streamingServiceFilter = location.state?.streamingService || '';
  const watchStatusFilter = location.state?.watchStatus || '';

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
    event.stopPropagation();

    const nextStatus = movie.watchStatus === WatchStatus.WATCHED ? WatchStatus.NOT_WATCHED : WatchStatus.WATCHED;

    await dispatch(
      updateMovieStatus({
        profileId: Number(profileId),
        movieId: movie.id,
        status: nextStatus,
      })
    );
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded((prev) => (isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)));
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

  const formatRuntime = (minutes: number | undefined) => {
    if (minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return '';
  };

  const formatUserRating = (rating: number | undefined) => {
    if (rating) {
      return `${rating.toFixed(2)} / 10`;
    }
    return 'Unknown';
  };

  const formatYear = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
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
        <Card elevation={2} sx={{ overflow: 'visible', borderRadius: { xs: 1, md: 2 } }}>
          <Box sx={{ position: 'relative' }}>
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
                }}
              />
            ) : (
              <Box
                sx={{
                  height: isMobile ? '200px' : '320px',
                  backgroundColor: 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            )}

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
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
                }}
                src={buildTMDBImagePath(movie?.posterImage, 'w500')}
                alt={movie?.title}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://placehold.co/300x450/gray/white?text=No+Image';
                }}
              />

              <Box sx={{ flexGrow: 1, pb: 2 }}>
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
                    maxWidth: { xs: '90%', md: '80%' },
                  }}
                >
                  <i>{movie?.description}</i>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{new Date(movie?.releaseDate!).getFullYear()}</Typography>
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
                  onClick={(event) => handleMovieWatchStatusChange(movie!, event)}
                  startIcon={<WatchLater />}
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                    },
                  }}
                >
                  {movie?.watchStatus === 'WATCHED' ? 'Mark Unwatched' : 'Mark as Watched'}
                </Button>
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 } }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Director
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      -- Coming Soon --
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      User Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={movie?.userRating! / 2} precision={0.1} readOnly size="small" />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatUserRating(movie?.userRating)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Budget
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      -- Coming Soon --
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Box Office
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      -- Coming Soon --
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Genres
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {movie?.genres
                        .split(',')
                        .map((genre) => (
                          <Chip key={genre} label={genre.trim()} variant="outlined" size="small" color="primary" />
                        ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Streaming Services
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {movie?.streamingServices || 'Not available for streaming'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Production Companies
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {`-- Coming Soon --`}
                    </Typography>
                  </Grid>
                </Grid>

                <Accordion
                  expanded={expanded.includes('related')}
                  onChange={handleAccordionChange('related')}
                  elevation={1}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recommended & Similar
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <ScrollableMediaRow
                        title="Recommended Movies"
                        items={recommendedMovies}
                        isLoading={movieDetailsLoading}
                        emptyMessage="No recommended movies found"
                        renderItem={(movie) => <MediaCard item={movie} searchType="movies" />}
                      />
                      <Divider sx={{ my: 3 }} />
                      <ScrollableMediaRow
                        title="Similar Movies"
                        items={similarMovies}
                        isLoading={movieDetailsLoading}
                        emptyMessage="No similar movies found"
                        renderItem={(movie) => <MediaCard item={movie} searchType="movies" />}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default MovieDetails;
