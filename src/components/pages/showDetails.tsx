import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalMoviesOutlinedIcon from '@mui/icons-material/LocalMoviesOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { useDateFormatters } from '../../app/hooks/useDateFormatters';
import {
  dismissBulkMarkedShow,
  getBulkMarkedShows,
  markShowAsPriorWatched,
  retroactivelyMarkShowAsPrior,
  selectActiveProfile,
  updateShowWatchStatus,
} from '../../app/slices/activeProfileSlice';
import { recordEpisodeRewatch, startSeasonRewatch, startShowRewatch } from '../../app/slices/watchHistorySlice';
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
import BulkMarkBanner from '../common/shows/BulkMarkBanner';
import PriorWatchPromptDialog from '../common/shows/PriorWatchPromptDialog';
import SeasonPriorWatchDialog from '../common/shows/SeasonPriorWatchDialog';
import SkippedEpisodesDialog from '../common/shows/SkippedEpisodesDialog';
import { OptionalTooltipControl } from '../common/controls/optionalTooltipControl';
import { KeepWatchingShowComponent } from '../common/shows/keepWatchingShowComponent';
import { RecommendedShowsComponent } from '../common/shows/recommendedShowsComponent';
import { ShowCastSection } from '../common/shows/showCast';
import { SimilarShowsComponent } from '../common/shows/similarShowsComponent';
import { TabPanel, a11yProps } from '../common/tabs/tabPanel';
import {
  buildEpisodeAirDate,
  buildEpisodeLineDetails,
  buildSeasonAirDate,
  calculateRuntimeDisplay,
} from '../utility/contentUtility';
import {
  WatchStatusIcon,
  canChangeEpisodeWatchStatus,
  canChangeSeasonWatchStatus,
  determineNextSeasonWatchStatus,
  getWatchStatusAction,
} from '../utility/watchStatusUtility';
import { ProfileEpisode, ProfileSeason, ProfileShowWithSeasons, UserWatchStatus, WatchStatus } from '@ajgifford/keepwatching-types';
import { ErrorComponent, LoadingComponent, buildTMDBImagePath, formatUserRating } from '@ajgifford/keepwatching-ui';
import { getWatchStatusDisplay } from '@ajgifford/keepwatching-ui';

function ShowDetails() {
  const { showId, profileId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const formatters = useDateFormatters();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const watchedEpisodes = useAppSelector(selectWatchedEpisodes);
  const seasons = useAppSelector(selectSeasons);
  const cast = useAppSelector(selectShowCast);
  const showDetailsLoading = useAppSelector(selectShowLoading);
  const showDetailsError = useAppSelector(selectShowError);
  const activeProfile = useAppSelector(selectActiveProfile);

  const [tabValue, setTabValue] = useState(0);
  const [loadingSeasons, setLoadingSeasons] = useState<Record<number, boolean>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState<Record<number, boolean>>({});
  const [loadingShowWatchStatus, setLoadingShowWatchStatus] = useState<boolean>(false);

  // Prior watch history state
  const [priorWatchPromptOpen, setPriorWatchPromptOpen] = useState(false);
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [pendingSeason, setPendingSeason] = useState<ProfileSeason | null>(null);
  const [bulkMarkBannerVisible, setBulkMarkBannerVisible] = useState(false);

  // Skipped episodes prompt state
  const [skippedEpisodesDialogOpen, setSkippedEpisodesDialogOpen] = useState(false);
  const [pendingEpisode, setPendingEpisode] = useState<ProfileEpisode | null>(null);
  const [skippedEpisodes, setSkippedEpisodes] = useState<ProfileEpisode[]>([]);

  // Rewatch state
  const [loadingEpisodeRewatches, setLoadingEpisodeRewatches] = useState<Record<number, boolean>>({});
  const [rewatchConfirmOpen, setRewatchConfirmOpen] = useState(false);
  const [loadingShowRewatch, setLoadingShowRewatch] = useState(false);
  const [rewatchSeasonConfirmOpen, setRewatchSeasonConfirmOpen] = useState(false);
  const [pendingRewatchSeason, setPendingRewatchSeason] = useState<ProfileSeason | null>(null);
  const [loadingSeasonRewatch, setLoadingSeasonRewatch] = useState<Record<number, boolean>>({});

  const priorPromptShownKey = `shown-prior-prompt-${showId}-${profileId}`;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const location = useLocation();
  const returnPath = location.state?.returnPath || '/shows';
  const genreFilter = location.state?.genre || '';
  const streamingServiceFilter = location.state?.streamingService || '';
  const watchStatusFilter = location.state?.watchStatus || '';

  const getCompletedPriorSeasons = useCallback(
    (seasons: ProfileSeason[]) => {
      const today = new Date();
      return seasons.filter((season) => {
        if (season.seasonNumber === 0) return false; // skip specials
        const allAired = season.episodes.every((ep) => ep.airDate && new Date(ep.airDate) < today);
        const noneWatched = season.episodes.every((ep) => ep.watchStatus === WatchStatus.NOT_WATCHED);
        return allAired && noneWatched && season.episodes.length > 0;
      });
    },
    []
  );

  useEffect(() => {
    if (showId && profileId) {
      dispatch(fetchShowWithDetails({ profileId: Number(profileId), showId: Number(showId) }));
    }

    // Cleanup function to clear the active show when component unmounts
    return () => {
      dispatch(clearActiveShow());
    };
  }, [profileId, showId, dispatch]);

  // Check for prior watch prompt and bulk mark banner after show loads
  useEffect(() => {
    if (!show || !seasons || showDetailsLoading) return;

    // Check for prior watch prompt (only show once per show+profile, and only if never watched before)
    const hasWatchHistory = seasons.some((season) => season.episodes.some((ep) => (ep.watchCount ?? 0) > 0));
    if (show.watchStatus === WatchStatus.NOT_WATCHED && !hasWatchHistory && !localStorage.getItem(priorPromptShownKey)) {
      const completedPriorSeasons = getCompletedPriorSeasons(seasons);
      if (completedPriorSeasons.length > 0) {
        setPriorWatchPromptOpen(true);
        localStorage.setItem(priorPromptShownKey, 'true');
      }
    }

    // Check for bulk mark banner
    if (activeProfile) {
      dispatch(getBulkMarkedShows({ profileId: activeProfile.id }))
        .unwrap()
        .then((bulkShows) => {
          const isBulkMarked = bulkShows.some((s) => s.showId === show.id);
          if (isBulkMarked) {
            setBulkMarkBannerVisible(true);
          }
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show?.id, showDetailsLoading]);

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

    const nextStatus = determineNextSeasonWatchStatus(season);

    // If marking a completed season as watched, ask when they watched it
    if (nextStatus === WatchStatus.WATCHED && season.episodes.length > 0) {
      const today = new Date();
      const allAired = season.episodes.every((ep) => ep.airDate && new Date(ep.airDate) < today);
      if (allAired) {
        setPendingSeason(season);
        setSeasonDialogOpen(true);
        return;
      }
    }

    await dispatchSeasonWatchUpdate(season, nextStatus);
  };

  const dispatchSeasonWatchUpdate = async (season: ProfileSeason, nextStatus: UserWatchStatus) => {
    setLoadingSeasons((prev) => ({ ...prev, [season.id]: true }));
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

  const handleSeasonWatchedWhenAired = async () => {
    if (!pendingSeason || !show) return;
    setLoadingSeasons((prev) => ({ ...prev, [pendingSeason.id]: true }));
    try {
      await dispatch(
        markShowAsPriorWatched({
          profileId: Number(profileId),
          showId: show.id,
          upToSeasonNumber: pendingSeason.seasonNumber,
        })
      );
    } finally {
      setLoadingSeasons((prev) => ({ ...prev, [pendingSeason.id]: false }));
      setPendingSeason(null);
    }
  };

  const handleSeasonWatchedNow = async () => {
    if (!pendingSeason) return;
    await dispatchSeasonWatchUpdate(pendingSeason, WatchStatus.WATCHED);
    setPendingSeason(null);
  };

  const dispatchEpisodeWatchUpdate = async (episode: ProfileEpisode, status: UserWatchStatus) => {
    setLoadingEpisodes((prev) => ({ ...prev, [episode.id]: true }));
    try {
      await dispatch(
        updateEpisodeWatchStatus({
          profileId: Number(profileId),
          episodeId: episode.id,
          episodeStatus: status,
        })
      );
    } finally {
      setLoadingEpisodes((prev) => ({ ...prev, [episode.id]: false }));
    }
  };

  const handleEpisodeWatchStatusChange = async (episode: ProfileEpisode) => {
    const nextStatus = watchedEpisodes[episode.id] ? WatchStatus.NOT_WATCHED : WatchStatus.WATCHED;

    if (nextStatus === WatchStatus.WATCHED && seasons) {
      const today = new Date();
      const currentSeason = seasons.find((s) => s.episodes.some((e) => e.id === episode.id));
      if (currentSeason) {
        const unwatchedPrior = currentSeason.episodes.filter(
          (e) =>
            e.episodeNumber < episode.episodeNumber &&
            !watchedEpisodes[e.id] &&
            e.airDate &&
            new Date(e.airDate) <= today
        );
        if (unwatchedPrior.length > 0) {
          setPendingEpisode(episode);
          setSkippedEpisodes(unwatchedPrior);
          setSkippedEpisodesDialogOpen(true);
          return;
        }
      }
    }

    await dispatchEpisodeWatchUpdate(episode, nextStatus);
  };

  const handleMarkAllSkippedAndTarget = async () => {
    setSkippedEpisodesDialogOpen(false);
    for (const ep of skippedEpisodes) {
      await dispatchEpisodeWatchUpdate(ep, WatchStatus.WATCHED);
    }
    if (pendingEpisode) {
      await dispatchEpisodeWatchUpdate(pendingEpisode, WatchStatus.WATCHED);
    }
    setPendingEpisode(null);
    setSkippedEpisodes([]);
  };

  const handleMarkJustTarget = async () => {
    setSkippedEpisodesDialogOpen(false);
    if (pendingEpisode) {
      await dispatchEpisodeWatchUpdate(pendingEpisode, WatchStatus.WATCHED);
    }
    setPendingEpisode(null);
    setSkippedEpisodes([]);
  };

  const handleStartShowRewatch = async () => {
    if (!show) return;
    setRewatchConfirmOpen(false);
    setLoadingShowRewatch(true);
    try {
      await dispatch(startShowRewatch({ profileId: Number(profileId), showId: show.id }));
    } finally {
      setLoadingShowRewatch(false);
    }
  };

  const handleStartSeasonRewatch = async () => {
    if (!pendingRewatchSeason) return;
    setRewatchSeasonConfirmOpen(false);
    const seasonId = pendingRewatchSeason.id;
    setLoadingSeasonRewatch((prev) => ({ ...prev, [seasonId]: true }));
    setPendingRewatchSeason(null);
    try {
      await dispatch(startSeasonRewatch({ profileId: Number(profileId), seasonId }));
    } finally {
      setLoadingSeasonRewatch((prev) => ({ ...prev, [seasonId]: false }));
    }
  };

  const handleEpisodeRewatch = async (episode: ProfileEpisode) => {
    setLoadingEpisodeRewatches((prev) => ({ ...prev, [episode.id]: true }));
    try {
      await dispatch(recordEpisodeRewatch({ profileId: Number(profileId), episodeId: episode.id }));
    } finally {
      setLoadingEpisodeRewatches((prev) => ({ ...prev, [episode.id]: false }));
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

  const handlePriorWatchAll = async () => {
    if (!show) return;
    await dispatch(markShowAsPriorWatched({ profileId: Number(profileId), showId: show.id }));
  };

  const handlePriorWatchThrough = async (seasonNumber: number) => {
    if (!show) return;
    await dispatch(markShowAsPriorWatched({ profileId: Number(profileId), showId: show.id, upToSeasonNumber: seasonNumber }));
  };

  const completedSeasons = seasons ? getCompletedPriorSeasons(seasons) : [];

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

      {bulkMarkBannerVisible && (
        <Box sx={{ px: 2, pt: 1 }}>
          <BulkMarkBanner
            onFix={async () => {
              setBulkMarkBannerVisible(false);
              if (show) {
                await dispatch(retroactivelyMarkShowAsPrior({ profileId: Number(profileId), showId: show.id }));
                dispatch(fetchShowWithDetails({ profileId: Number(profileId), showId: show.id }));
              }
            }}
            onDismiss={() => {
              setBulkMarkBannerVisible(false);
              if (show) {
                dispatch(dismissBulkMarkedShow({ profileId: Number(profileId), showId: show.id }));
              }
            }}
          />
        </Box>
      )}

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
                    <Typography variant="body2">{formatters.yearOnly(show?.releaseDate)}</Typography>
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
                {(show?.watchStatus === WatchStatus.WATCHED || show?.watchStatus === WatchStatus.UP_TO_DATE) && (
                  <Button
                    variant="outlined"
                    disabled={loadingShowRewatch}
                    onClick={() => setRewatchConfirmOpen(true)}
                    startIcon={
                      loadingShowRewatch ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <ReplayIcon sx={{ color: 'rewatch.main' }} />
                      )
                    }
                    sx={{
                      mt: 1,
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
                    {loadingShowRewatch ? 'Loading...' : 'Start Rewatch'}
                  </Button>
                )}
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
                      {show?.genres.split(',').map((genre: string) => (
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
                        {show?.lastEpisode ? buildEpisodeLineDetails(show?.lastEpisode, formatters.contentDate) : 'No Last Episode'}
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
                        {show?.nextEpisode ? buildEpisodeLineDetails(show?.nextEpisode, formatters.contentDate) : 'No Next Episode'}
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
                  {seasons.map((season: ProfileSeason) => (
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
                            {buildSeasonAirDate(season.releaseDate, formatters.contentDate)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              cursor:
                                loadingSeasons[season.id] || !canChangeSeasonWatchStatus(season) ? 'default' : 'pointer',
                              opacity: loadingSeasons[season.id] || !canChangeSeasonWatchStatus(season) ? 0.5 : 1,
                              p: 1,
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor:
                                  loadingSeasons[season.id] || !canChangeSeasonWatchStatus(season)
                                    ? 'transparent'
                                    : 'action.hover',
                              },
                            }}
                            onClick={(event) => {
                              if (!loadingSeasons[season.id] && canChangeSeasonWatchStatus(season)) {
                                handleSeasonWatchStatusChange(season, event);
                              }
                            }}
                            title={
                              loadingSeasons[season.id] || !canChangeSeasonWatchStatus(season)
                                ? ''
                                : getWatchStatusAction(season.watchStatus)
                            }
                          >
                            <WatchStatusIcon status={season.watchStatus} />
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
                          {season.watchStatus === WatchStatus.WATCHED && (
                            <Tooltip title="Rewatch Season">
                              <span>
                                <IconButton
                                  component="span"
                                  color="rewatch"
                                  size="small"
                                  disabled={!!loadingSeasonRewatch[season.id]}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setPendingRewatchSeason(season);
                                    setRewatchSeasonConfirmOpen(true);
                                  }}
                                >
                                  {loadingSeasonRewatch[season.id] ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <ReplayIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 0 }}>
                        {season.episodes && season.episodes.length > 0 ? (
                          <List disablePadding>
                            {season.episodes.map((episode: ProfileEpisode, index: number) => (
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                      <Typography variant="subtitle1" fontWeight="medium">
                                        {episode.title}
                                      </Typography>
                                      {(episode.watchCount ?? 0) >= 2 && (
                                        <Chip
                                          icon={<ReplayIcon sx={{ fontSize: '0.9rem !important' }} />}
                                          label={`×${episode.watchCount}`}
                                          size="small"
                                          color="rewatch"
                                          variant="outlined"
                                        />
                                      )}
                                    </Box>
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
                                      {buildEpisodeAirDate(episode.airDate, formatters.contentDate)} •{' '}
                                      {calculateRuntimeDisplay(episode.runtime)}
                                      {episode.watchedAt && ` • Last Watched: ${formatters.activityDate(episode.watchedAt.slice(0, 10))}`}
                                    </Typography>
                                  </Box>

                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mt: { xs: 2, sm: 0 },
                                      ml: { xs: 0, sm: 2 },
                                    }}
                                  >
                                    <Box sx={{ position: 'relative' }}>
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
                                    {watchedEpisodes[episode.id] && (
                                      <Box sx={{ position: 'relative' }}>
                                        <OptionalTooltipControl
                                          identifier={`rewatchTooltip_${show?.id || 0}_${season.id}_${episode.id}`}
                                          title="Rewatch this episode"
                                          disabled={loadingEpisodeRewatches[episode.id]}
                                        >
                                          <IconButton
                                            color="rewatch"
                                            onClick={() => handleEpisodeRewatch(episode)}
                                            disabled={loadingEpisodeRewatches[episode.id]}
                                            size="small"
                                          >
                                            <ReplayIcon />
                                          </IconButton>
                                        </OptionalTooltipControl>
                                        {loadingEpisodeRewatches[episode.id] && (
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

      {/* Prior watch history dialogs */}
      <PriorWatchPromptDialog
        open={priorWatchPromptOpen}
        showTitle={show?.title || ''}
        completedSeasons={completedSeasons}
        onClose={() => setPriorWatchPromptOpen(false)}
        onStartingFresh={() => setPriorWatchPromptOpen(false)}
        onWatchedAll={handlePriorWatchAll}
        onWatchedThrough={handlePriorWatchThrough}
      />

      <SeasonPriorWatchDialog
        open={seasonDialogOpen}
        seasonName={pendingSeason?.name || ''}
        onClose={() => {
          setSeasonDialogOpen(false);
          setPendingSeason(null);
        }}
        onWatchedWhenAired={handleSeasonWatchedWhenAired}
        onWatchedNow={handleSeasonWatchedNow}
      />

      <SkippedEpisodesDialog
        open={skippedEpisodesDialogOpen}
        skippedEpisodes={skippedEpisodes}
        targetEpisode={pendingEpisode}
        onMarkAll={handleMarkAllSkippedAndTarget}
        onMarkJustThis={handleMarkJustTarget}
        onClose={() => {
          setSkippedEpisodesDialogOpen(false);
          setPendingEpisode(null);
          setSkippedEpisodes([]);
        }}
      />

      <Dialog open={rewatchConfirmOpen} onClose={() => setRewatchConfirmOpen(false)}>
        <DialogTitle>Start Rewatch?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Starting a rewatch of "{show?.title}" will reset all episode statuses so you can track your progress
            through the show again. Your original watch history will be preserved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRewatchConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleStartShowRewatch} variant="contained" startIcon={<ReplayIcon />}>
            Start Rewatch
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rewatchSeasonConfirmOpen} onClose={() => { setRewatchSeasonConfirmOpen(false); setPendingRewatchSeason(null); }}>
        <DialogTitle>Rewatch Season?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rewatching "{pendingRewatchSeason?.name}" will reset all of its episode statuses so you can track your
            progress again. Your original watch history will be preserved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRewatchSeasonConfirmOpen(false); setPendingRewatchSeason(null); }}>Cancel</Button>
          <Button onClick={handleStartSeasonRewatch} variant="contained" startIcon={<ReplayIcon />}>
            Rewatch Season
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ShowDetails;
