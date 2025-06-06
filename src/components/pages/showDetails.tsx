import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
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
import {
  clearActiveShow,
  fetchShowWithDetails,
  selectSeasons,
  selectShow,
  selectShowError,
  selectShowLoading,
  selectWatchedEpisodes,
  updateEpisodeWatchStatus,
  updateSeasonWatchStatus,
} from '../../app/slices/activeShowSlice';
import { ErrorComponent } from '../common/errorComponent';
import { LoadingComponent } from '../common/loadingComponent';
import { KeepWatchingShowComponent } from '../common/shows/keepWatchingShowComponent';
import { RecommendedShowsComponent } from '../common/shows/recommendedShowsComponent';
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
  canChangeWatchStatus,
  determineNextSeasonWatchStatus,
  getSeasonWatchStatusTooltip,
  getWatchStatusDisplay,
} from '../utility/watchStatusUtility';
import { ProfileEpisode, ProfileSeason, WatchStatus } from '@ajgifford/keepwatching-types';

function ShowDetails() {
  const { showId, profileId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const watchedEpisodes = useAppSelector(selectWatchedEpisodes);
  const seasons = useAppSelector(selectSeasons);
  const showDetailsLoading = useAppSelector(selectShowLoading);
  const showDetailsError = useAppSelector(selectShowError);

  const [tabValue, setTabValue] = useState(0);
  const [loadingSeasons, setLoadingSeasons] = useState<Record<number, boolean>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState<Record<number, boolean>>({});

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

  const handleSeasonWatchStatusChange = async (season: ProfileSeason, event: React.MouseEvent) => {
    event.stopPropagation();

    setLoadingSeasons((prev) => ({ ...prev, [season.id]: true }));
    const nextStatus = determineNextSeasonWatchStatus(season, show!);

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

  const handleEpisodeWatchStatusChange = async (season: ProfileSeason, episode: ProfileEpisode) => {
    setLoadingEpisodes((prev) => ({ ...prev, [episode.id]: true }));

    try {
      const nextStatus = watchedEpisodes[episode.id] ? 'NOT_WATCHED' : 'WATCHED';

      await dispatch(
        updateEpisodeWatchStatus({
          profileId: Number(profileId),
          season,
          episode,
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

  const buildServicesLine = (streamingServices: string | undefined) => {
    if (!streamingServices) {
      return 'Not available for streaming';
    }

    // Helper function to filter out 'Unknown' from streaming services
    const filterUnknown = (services: string) => {
      return services
        .split(',')
        .map((service) => service.trim())
        .filter((service) => service.toLowerCase() !== 'unknown')
        .join(', ');
    };

    return filterUnknown(streamingServices);
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Back button */}
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

      {/* Show Header Card */}
      <Card
        sx={{
          mb: 4,
          position: 'relative',
          borderRadius: { xs: 1, md: 2 },
          overflow: 'hidden',
          boxShadow: 2,
        }}
      >
        {/* Backdrop Image Section */}
        <Box sx={{ position: 'relative' }}>
          {show?.backdropImage ? (
            <CardMedia
              component="img"
              height={isMobile ? '380' : '320'}
              image={`https://image.tmdb.org/t/p/w1280${show.backdropImage}`}
              alt={show.title}
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

          {/* Overlay Content */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
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
              }}
              src={buildTMDBImagePath(show?.posterImage, 'w500')}
              alt={show?.title}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = 'https://placehold.co/300x450/gray/white?text=No+Image';
              }}
            />

            {/* Show Details */}
            <Box sx={{ flexGrow: 1, pb: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
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
                    WebkitLineClamp: { xs: 5, sm: 7 }, // Adjust line count as needed
                    maxWidth: { xs: '90%', md: '97%' },
                  }}
                >
                  <i>{show?.description}</i>
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  mb: { xs: 1, md: 1.5 },
                  opacity: 1,
                  fontWeight: 'medium',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                }}
              >
                {formatYear(show?.releaseDate)} • {show?.seasonCount} Seasons • {show?.episodeCount} Episodes
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap">
                {show?.network && (
                  <Chip
                    size="small"
                    label={show?.network}
                    color="primary"
                    sx={{
                      fontWeight: 'medium',
                      boxShadow: 1,
                    }}
                  />
                )}
                <Chip
                  size="small"
                  label={show?.contentRating || 'Not Rated'}
                  color="secondary"
                  sx={{ fontWeight: 'medium', boxShadow: 1 }}
                />
                <Chip size="small" label={show?.type} color="info" sx={{ fontWeight: 'medium', boxShadow: 1 }} />
                <Chip
                  size="small"
                  label={show?.status}
                  color={show?.status === 'Ended' ? 'error' : 'success'}
                  sx={{ fontWeight: 'medium', boxShadow: 1 }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Additional Show Details */}
        <CardContent
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 1.5, md: 2 },
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Genres
                    </Typography>
                    <Typography variant="body2">{show?.genres || 'Not specified'}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Streaming On
                    </Typography>
                    <Typography variant="body2">{buildServicesLine(show?.streamingServices)}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Watch Status
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WatchStatusIcon status={show?.watchStatus!} fontSize="small" />
                      {getWatchStatusDisplay(show?.watchStatus)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
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
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Last Episode
                    </Typography>
                  </Grid>
                  <Grid item xs={8} sm={9} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={500}>
                      {show?.lastEpisode ? buildEpisodeLineDetails(show?.lastEpisode) : 'No Last Episode'}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1, opacity: 0.6 }} />

                <Grid container>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Next Episode
                    </Typography>
                  </Grid>
                  <Grid item xs={8} sm={9} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={500}>
                      {show?.nextEpisode ? buildEpisodeLineDetails(show?.nextEpisode) : 'No Next Episode'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
          <Tab label="Related Content" {...a11yProps(2)} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {profileId && <KeepWatchingShowComponent profileId={Number(profileId)} />}
      </TabPanel>

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
                    <Tooltip title={getSeasonWatchStatusTooltip(season, show!)}>
                      <IconButton
                        onClick={(event) => handleSeasonWatchStatusChange(season, event)}
                        disabled={loadingSeasons[season.id] || !canChangeWatchStatus(season, show!)}
                        size="medium"
                        sx={{ my: 'auto' }}
                      >
                        <WatchStatusIcon status={season.watchStatus} />
                      </IconButton>
                    </Tooltip>
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
                                {buildEpisodeAirDate(episode.airDate)} • {calculateRuntimeDisplay(episode.runtime)}
                              </Typography>
                            </Box>

                            <Box sx={{ position: 'relative', mt: { xs: 2, sm: 0 }, ml: { xs: 0, sm: 2 } }}>
                              <Tooltip title={watchedEpisodes[episode.id] ? 'Mark Not Watched' : 'Mark Watched'}>
                                <IconButton
                                  color={watchedEpisodes[episode.id] ? 'success' : 'default'}
                                  onClick={() => handleEpisodeWatchStatusChange(season, episode)}
                                  disabled={loadingEpisodes[episode.id]}
                                >
                                  <WatchStatusIcon
                                    status={watchedEpisodes[episode.id] ? WatchStatus.WATCHED : WatchStatus.NOT_WATCHED}
                                  />
                                </IconButton>
                              </Tooltip>
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

      <TabPanel value={tabValue} index={2}>
        {show && <RecommendedShowsComponent showId={show.id} profileId={Number(profileId)} />}
        {show && <SimilarShowsComponent showId={show.id} profileId={Number(profileId)} />}
      </TabPanel>
    </Box>
  );
}

export default ShowDetails;
