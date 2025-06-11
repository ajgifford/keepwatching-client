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
  Stack,
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
  const returnPath = location.state?.returnPath || '/shows';
  const genreFilter = location.state?.genre || '';
  const streamingServiceFilter = location.state?.streamingService || '';
  const watchStatusFilter = location.state?.watchStatus || '';

  useEffect(() => {
    if (movieId && profileId) {
      dispatch(fetchMovieWithDetails({ profileId: Number(profileId), movieId: Number(movieId) }));
    }

    // Cleanup function to clear the active movie when component unmounts
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

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const formatUserRating = (rating: number | undefined) => {
    if (rating) {
      return `${rating.toFixed(2)} / 10`;
    }
    return 'Unknown';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
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

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card elevation={2} sx={{ overflow: 'visible' }}>
          {/* Movie Header with Backdrop */}
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
              ></Box>
            )}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 2, md: 3 },
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                color: 'white',
              }}
            >
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {movie?.title}
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
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={3}>
              {/* Left Column - Poster and Actions */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', md: 'column' },
                    gap: 2,
                    alignItems: { xs: 'flex-start', md: 'center' },
                  }}
                >
                  <Card
                    elevation={3}
                    sx={{
                      width: { xs: 140, md: 240 },
                      flexShrink: 0,
                      mt: { xs: 0, md: -8 },
                      position: { xs: 'static', md: 'relative' },
                      zIndex: 1,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={buildTMDBImagePath(movie?.posterImage, 'w500')}
                      alt={movie?.title}
                      sx={{
                        height: { xs: 210, md: 360 },
                        objectFit: 'cover',
                      }}
                    />
                  </Card>

                  <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
                    <Button
                      variant="outlined"
                      onClick={(event) => handleMovieWatchStatusChange(movie!, event)}
                      startIcon={<WatchLater />}
                      fullWidth
                    >
                      {movie?.watchStatus === 'WATCHED' ? 'Mark Unwatched' : 'Mark as Watched'}
                    </Button>
                  </Stack>
                </Box>
              </Grid>

              {/* Right Column - Details */}
              <Grid item xs={12} md={8}>
                {/* Overview */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Overview
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                    {movie?.description}
                  </Typography>
                </Box>

                {/* Movie Information Accordion */}
                <Accordion
                  expanded={expanded.includes('info')}
                  onChange={handleAccordionChange('info')}
                  elevation={1}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Movie Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Director
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {`-- Coming Soon --`}
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
                          {`-- Coming Soon --`}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Box Office
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {`-- Coming Soon --`}
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
                              <Chip key={genre} label={genre} variant="outlined" size="small" color="primary" />
                            ))}
                        </Box>
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
                  </AccordionDetails>
                </Accordion>

                {/* Cast & Crew Accordion */}
                {/* <Accordion
                  expanded={expanded.includes('cast')}
                  onChange={handleAccordionChange('cast')}
                  elevation={1}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Cast & Crew
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {mockMovie.cast.map((actor, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 50, height: 50 }}>
                              {actor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {actor.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {actor.role}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion> */}

                {/* Similar & Recommended Accordion */}
                <Accordion
                  expanded={expanded.includes('related')}
                  onChange={handleAccordionChange('related')}
                  elevation={1}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Similar & Recommended
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
