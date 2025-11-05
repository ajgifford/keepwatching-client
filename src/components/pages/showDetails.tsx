import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalMoviesOutlinedIcon from '@mui/icons-material/LocalMoviesOutlined';
import StarIcon from '@mui/icons-material/Star';
import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
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
  List,
  ListItem,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateShowWatchStatus } from '../../app/slices/activeProfileSlice';
import {
  clearActiveShow,
  fetchShowWithDetails,
  selectSeasons,
  selectShow,
  selectShowCast,
  selectShowError,
  selectShowLoading,
  selectWatchedEpisodes,
  updateEpisodeWatchStatus,
  updateSeasonWatchStatus,
} from '../../app/slices/activeShowSlice';
import { OptionalTooltipControl } from '../common/controls/optionalTooltipControl';
import { ErrorComponent } from '../common/errorComponent';
import { LoadingComponent } from '../common/loadingComponent';
import { KeepWatchingShowComponent } from '../common/shows/keepWatchingShowComponent';
import { RecommendedShowsComponent } from '../common/shows/recommendedShowsComponent';
import { ShowCastSection } from '../common/shows/showCast';
import { SimilarShowsComponent } from '../common/shows/similarShowsComponent';
import { TabPanel, a11yProps } from '../common/tabs/tabPanel';
import {
  buildEpisodeAirDate,
  buildEpisodeLineDetails,
  buildSeasonAirDate,
  buildTMDBImagePath,
  calculateRuntimeDisplay,
} from '../utility/contentUtility';
import {
  WatchStatusIcon,
  canChangeEpisodeWatchStatus,
  canChangeSeasonWatchStatus,
  determineNextSeasonWatchStatus,
  getWatchStatusAction,
  getWatchStatusDisplay,
} from '../utility/watchStatusUtility';
import { ProfileEpisode, ProfileSeason, ProfileShowWithSeasons, WatchStatus } from '@ajgifford/keepwatching-types';

function ShowDetails() {
  const { showId, profileId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const watchedEpisodes = useAppSelector(selectWatchedEpisodes);
  const seasons = useAppSelector(selectSeasons);
  const cast = useAppSelector(selectShowCast);
  const showDetailsLoading = useAppSelector(selectShowLoading);
  const showDetailsError = useAppSelector(selectShowError);

  const [tabValue, setTabValue] = useState(0);
  const [loadingSeasons, setLoadingSeasons] = useState<Record<number, boolean>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState<Record<number, boolean>>({});
  const [loadingShowWatchStatus, setLoadingShowWatchStatus] = useState<boolean>(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const location = useLocation();
  const returnPath = location.state?.returnPath || '/shows';
  const genreFilter = location.state?.genre || '';
  const streamingServiceFilter = location.state?.streamingService || '';
  const watchStatusFilter = location.state?.watchStatus || '';

  useEffect(() => {
    if (showId && profileId) {
      dispatch(fetchShowWithDetails({ profileId: Number(profileId), showId: Number(showId) }));
    }

    // Cleanup function to clear the active show when component unmounts
    return () => {
      dispatch(clearActiveShow());
    };
  }, [profileId, showId, dispatch]);

  if (showDetailsLoading) {
    return <LoadingComponent />;
  }
  if (showDetailsError) {
    return <ErrorComponent error={showDetailsError} />;
  }

  const handleShowWatchStatusChange = async (show: ProfileShowWithSeasons, event: React.MouseEvent) => {
    setLoadingShowWatchStatus(true);
    try {
      event.stopPropagation();

      const nextStatus =
        show.watchStatus === WatchStatus.WATCHED || show.watchStatus === WatchStatus.UP_TO_DATE
          ? WatchStatus.NOT_WATCHED
          : WatchStatus.WATCHED;

      await dispatch(
        updateShowWatchStatus({
          profileId: Number(profileId),
          showId: show.id,
          status: nextStatus,
        })
      );
    } finally {
      setLoadingShowWatchStatus(false);
    }
  };

  const handleSeasonWatchStatusChange = async (season: ProfileSeason, event: React.MouseEvent) => {
    event.stopPropagation();

    setLoadingSeasons((prev) => ({ ...prev, [season.id]: true }));
    const nextStatus = determineNextSeasonWatchStatus(season);

    try {
      await dispatch(
        updateSeasonWatchStatus({
          profileId: Number(profileId),
          seasonId: season.id,
          seasonStatus: nextStatus,
        })
      );
    } finally {
      setLoadingSeasons((prev) => ({ ...prev, [season.id]: false }));
    }
  };

  const handleEpisodeWatchStatusChange = async (episode: ProfileEpisode) => {
    setLoadingEpisodes((prev) => ({ ...prev, [episode.id]: true }));

    try {
      const nextStatus = watchedEpisodes[episode.id] ? WatchStatus.NOT_WATCHED : WatchStatus.WATCHED;

      await dispatch(
        updateEpisodeWatchStatus({
          profileId: Number(profileId),
          episodeId: episode.id,
          episodeStatus: nextStatus,
        })
      );
    } finally {
      setLoadingEpisodes((prev) => ({ ...prev, [episode.id]: false }));
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
      '/shows': 'Back to Shows',
      '/search': 'Back to Search',
      '/discover': 'Back to Discover',
      '/home': 'Back to Home',
    };

    return pathMap[basePath] || 'Back';
  };

  const formatYear = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
    });
  };

  const formatUserRating = (rating: number | undefined) => {
    if (rating) {
      return `${rating.toFixed(2)} / 10`;
    }
    return 'Unknown';
  };

  const formatSeasons = (seasons: number | undefined) => {
    if (seasons) {
      if (seasons === 1) {
        return '1 season';
      }
      return `${seasons} seasons`;
    }
    return 'No seasons';
  };

  const buildServicesLine = (network: string | null | undefined, streamingServices: string | undefined) => {
    if (!network && !streamingServices) {
      return 'No Network or Streaming Service';
    }

    // Helper function to filter out 'Unknown' from streaming services
    const filterUnknown = (services: string) => {
      return services
        .split(',')
        .map((service) => service.trim())
        .filter((service) => service.toLowerCase() !== 'unknown')
        .join(', ');
    };

    const services = streamingServices ? filterUnknown(streamingServices) : 'No Streaming Service';
    return `${network || 'No Network'} • ${services}`;
  };

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
        {/* Show Details Card */}
        <Card elevation={2} sx={{ overflow: 'visible', borderRadius: { xs: 1, md: 2 } }}>
          {/* Backdrop Image Section */}
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            {show?.backdropImage ? (
              <CardMedia
                component="img"
                height={isMobile ? '380' : '320'}
                image={buildTMDBImagePath(show?.backdropImage, 'w1280')}
                alt={show.title}
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
                bgcolor: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 100%)',
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
                src={buildTMDBImagePath(show?.posterImage, 'w500')}
                alt={show?.title}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://placehold.co/300x450/gray/white?text=No+Image';
                }}
              />

              {/* Show Details */}
              <Box sx={{ flexGrow: 1, pb: 2, minWidth: 0 }}>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  fontWeight="bold"
                  sx={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    mb: 1,
                  }}
                >
                  {show?.title}
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
                    WebkitLineClamp: { xs: 5, sm: 7 },
                  }}
                >
                  <i>{show?.description}</i>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{formatYear(show?.releaseDate)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TvOutlinedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{formatSeasons(show?.seasonCount)} </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocalMoviesOutlinedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{show?.episodeCount} Episodes</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="body2">{formatUserRating(show?.userRating)}</Typography>
                  </Box>
                  <Chip label={show?.contentRating} size="small" color="primary" sx={{ fontWeight: 500 }} />
                </Box>

                <Button
                  variant="contained"
                  disabled={loadingShowWatchStatus || show?.watchStatus === WatchStatus.UNAIRED}
                  onClick={(event) => show && handleShowWatchStatusChange(show, event)}
                  startIcon={
                    loadingShowWatchStatus ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <WatchStatusIcon status={show?.watchStatus || WatchStatus.NOT_WATCHED} />
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
                  {loadingShowWatchStatus
                    ? 'Loading...'
                    : show?.watchStatus === WatchStatus.WATCHED || show?.watchStatus === WatchStatus.UP_TO_DATE
                      ? 'Mark Unwatched'
                      : 'Mark as Watched'}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Additional Show Details */}
          <CardContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <Grid container spacing={2} sx={{ mb: 6 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Genres
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {show?.genres.split(',').map((genre) => (
                        <Chip key={genre} label={genre.trim()} variant="outlined" size="small" color="primary" />
                      ))}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Network • Streaming On
                      </Typography>
                      <Typography variant="body2">
                        {buildServicesLine(show?.network, show?.streamingServices)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Watch Status
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WatchStatusIcon status={show?.watchStatus || WatchStatus.NOT_WATCHED} fontSize="small" />
                        {getWatchStatusDisplay(show?.watchStatus)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Show Status
                      </Typography>
                      <Typography variant="body2">{`${show?.type} • ${show?.status}`}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: theme.palette.background.default,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Episodes
                  </Typography>

                  <Grid container sx={{ mb: 1 }}>
                    <Grid size={{ xs: 4, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Last Episode
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8, sm: 9 }} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {show?.lastEpisode ? buildEpisodeLineDetails(show?.lastEpisode) : 'No Last Episode'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1, opacity: 0.6 }} />

                  <Grid container>
                    <Grid size={{ xs: 4, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Next Episode
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8, sm: 9 }} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {show?.nextEpisode ? buildEpisodeLineDetails(show?.nextEpisode) : 'No Next Episode'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
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
                <Tab label="Keep Watching" {...a11yProps(0)} />
                <Tab label="Seasons & Episodes" {...a11yProps(1)} />
                <Tab label="Cast" {...a11yProps(2)} />
                <Tab label="Related Content" {...a11yProps(3)} />
              </Tabs>
            </Box>

            {/* KeepWatching Component */}
            <TabPanel value={tabValue} index={0}>
              {profileId && <KeepWatchingShowComponent profileId={Number(profileId)} />}
            </TabPanel>

            {/* Seasons & Episodes Component */}
            <TabPanel value={tabValue} index={1}>
              {seasons ? (
                <Box>
                  {seasons.map((season) => (
                    <Accordion
                      key={season.id}
                      sx={{
                        mb: 1.5,
                        '&:before': { display: 'none' },
                        borderRadius: 1,
                        overflow: 'hidden',
                        boxShadow: 1,
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            gap: 2,
                          },
                          backgroundColor: theme.palette.background.default,
                        }}
                      >
                        <Avatar
                          alt={season.name}
                          src={buildTMDBImagePath(season.posterImage)}
                          variant="rounded"
                          sx={{
                            width: { xs: 70, sm: 90 },
                            height: { xs: 105, sm: 135 },
                          }}
                        />

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                            {season.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Season {season.seasonNumber} • {season.numberOfEpisodes} Episodes
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {buildSeasonAirDate(season.releaseDate)}
                          </Typography>
                        </Box>

                        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <OptionalTooltipControl
                            identifier={`watchStatusTooltip_${show?.id || 0}_${season.id}`}
                            title={getWatchStatusAction(season.watchStatus)}
                            disabled={loadingSeasons[season.id] || !canChangeSeasonWatchStatus(season)}
                          >
                            <IconButton
                              onClick={(event) => handleSeasonWatchStatusChange(season, event)}
                              disabled={loadingSeasons[season.id] || !canChangeSeasonWatchStatus(season)}
                              size="medium"
                              sx={{ my: 'auto' }}
                            >
                              <WatchStatusIcon status={season.watchStatus} />
                            </IconButton>
                          </OptionalTooltipControl>
                          {loadingSeasons[season.id] && (
                            <CircularProgress
                              size={24}
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                              }}
                            />
                          )}
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 0 }}>
                        {season.episodes && season.episodes.length > 0 ? (
                          <List disablePadding>
                            {season.episodes.map((episode, index) => (
                              <React.Fragment key={episode.id}>
                                <ListItem
                                  sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'center', sm: 'flex-start' },
                                    textAlign: { xs: 'center', sm: 'left' },
                                    px: { xs: 1, sm: 2 },
                                    py: 2,
                                    bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
                                  }}
                                >
                                  <Box sx={{ position: 'relative', mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}>
                                    <Avatar
                                      alt={episode.title}
                                      src={buildTMDBImagePath(episode.stillImage)}
                                      variant="rounded"
                                      sx={{
                                        width: { xs: 200, sm: 160 },
                                        height: { xs: 120, sm: 90 },
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        bgcolor: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        px: 1,
                                        py: 0.25,
                                        fontSize: '0.75rem',
                                        borderTopRightRadius: 4,
                                      }}
                                    >
                                      S{season.seasonNumber} E{episode.episodeNumber}
                                    </Box>
                                  </Box>

                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                      {episode.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        mb: 1,
                                        opacity: 0.9,
                                      }}
                                    >
                                      <i>{episode.overview || 'No description available.'}</i>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {buildEpisodeAirDate(episode.airDate)} •{' '}
                                      {calculateRuntimeDisplay(episode.runtime)}
                                    </Typography>
                                  </Box>

                                  <Box sx={{ position: 'relative', mt: { xs: 2, sm: 0 }, ml: { xs: 0, sm: 2 } }}>
                                    <OptionalTooltipControl
                                      identifier={`watchStatusTooltip_${show?.id || 0}_${season.id}_${episode.id}`}
                                      title={watchedEpisodes[episode.id] ? 'Mark Not Watched' : 'Mark Watched'}
                                      disabled={loadingEpisodes[episode.id] || !canChangeEpisodeWatchStatus(episode)}
                                    >
                                      <IconButton
                                        color={watchedEpisodes[episode.id] ? 'success' : 'default'}
                                        onClick={() => handleEpisodeWatchStatusChange(episode)}
                                        disabled={loadingEpisodes[episode.id] || !canChangeEpisodeWatchStatus(episode)}
                                      >
                                        <WatchStatusIcon status={episode.watchStatus} />
                                      </IconButton>
                                    </OptionalTooltipControl>
                                    {loadingEpisodes[episode.id] && (
                                      <CircularProgress
                                        size={24}
                                        sx={{
                                          position: 'absolute',
                                          top: '50%',
                                          left: '50%',
                                          marginTop: '-12px',
                                          marginLeft: '-12px',
                                        }}
                                      />
                                    )}
                                  </Box>
                                </ListItem>
                                {index < season.episodes.length - 1 && <Divider />}
                              </React.Fragment>
                            ))}
                          </List>
                        ) : (
                          <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                              No Episodes Available
                            </Typography>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No seasons available for this show
                  </Typography>
                </Box>
              )}
            </TabPanel>

            {/* Cast Component */}
            <TabPanel value={tabValue} index={2}>
              {profileId && <ShowCastSection cast={cast} profileId={profileId} />}
            </TabPanel>

            {/* Related Content Component */}
            <TabPanel value={tabValue} index={3}>
              {show && <RecommendedShowsComponent showId={show.id} profileId={Number(profileId)} />}
              {show && <SimilarShowsComponent showId={show.id} profileId={Number(profileId)} />}
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default ShowDetails;
