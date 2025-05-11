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
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Episode, Season } from '../../app/model/shows';
import {
  clearActiveShow,
  fetchShowWithDetails,
  selectSeasons,
  selectShow,
  selectShowError,
  selectShowLoading,
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
  determineNextSeasonWatchStatus,
  getSeasonWatchStatusTooltip,
  getWatchStatusDisplay,
} from '../utility/watchStatusUtility';

function ShowDetails() {
  const { showId, profileId } = useParams();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
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
      dispatch(fetchShowWithDetails({ profileId, showId }));
    }
  }, [profileId, showId, dispatch]);

  if (showDetailsLoading) {
    return <LoadingComponent />;
  }
  if (showDetailsError) {
    return <ErrorComponent error={showDetailsError} />;
  }

  const handleSeasonWatchStatusChange = async (season: Season, event: React.MouseEvent) => {
    event.stopPropagation();

    setLoadingSeasons((prev) => ({ ...prev, [season.season_id]: true }));
    const nextStatus = determineNextSeasonWatchStatus(season, show!);

    try {
      await dispatch(
        updateSeasonWatchStatus({
          profileId,
          season,
          seasonStatus: nextStatus,
        })
      );
    } finally {
      setLoadingSeasons((prev) => ({ ...prev, [season.season_id]: false }));
    }
  };

  const handleEpisodeWatchStatusChange = async (season: Season, episode: Episode) => {
    setLoadingEpisodes((prev) => ({ ...prev, [episode.episode_id]: true }));

    try {
      const nextStatus = episode.watch_status === 'WATCHED' ? 'NOT_WATCHED' : 'WATCHED';

      await dispatch(
        updateEpisodeWatchStatus({
          profileId,
          season,
          episode,
          episodeStatus: nextStatus,
        })
      );
    } finally {
      setLoadingEpisodes((prev) => ({ ...prev, [episode.episode_id]: false }));
    }
  };

  const buildBackButtonPath = () => {
    let path = returnPath;
    if (genreFilter) {
      path += `&genre=${encodeURIComponent(genreFilter)}`;
    }
    if (streamingServiceFilter) {
      path += `&streamingService=${encodeURIComponent(streamingServiceFilter)}`;
    }
    if (watchStatusFilter) {
      path += `&watchStatus=${encodeURIComponent(watchStatusFilter)}`;
    }
    return path;
  };

  const formatYear = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
    });
  };

  return (
    <>
      <Box>
        <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <IconButton
              aria-label="back"
              onClick={() => {
                dispatch(clearActiveShow());
                navigate(buildBackButtonPath());
              }}
              sx={{ mr: 2 }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="h4">{show?.title}</Typography>
          </Box>
        </Box>

        <Card sx={{ mb: 4, position: 'relative' }}>
          <Box sx={{ position: 'relative' }}>
            {show?.backdrop_image ? (
              <CardMedia
                component="img"
                height="300"
                image={`https://image.tmdb.org/t/p/w1280${show.backdrop_image}`}
                alt={show.title}
                sx={{ filter: 'brightness(0.7)' }}
              />
            ) : (
              <Box
                sx={{
                  height: '300px',
                  backgroundColor: 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No backdrop image available
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <>
                <Box
                  component="img"
                  sx={{
                    width: 140,
                    height: 210,
                    mr: 3,
                    borderRadius: 1,
                    boxShadow: 3,
                    transform: 'translateY(-30px)',
                  }}
                  src={`https://image.tmdb.org/t/p/w500${show?.poster_image}`}
                  alt={show?.title}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/placeholder-poster.png';
                  }}
                />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {show?.title}
                  </Typography>
                  <Typography variant="body1">
                    <i>{show?.description}</i>
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                    {formatYear(show?.release_date)} • {show?.season_count} Seasons • {show?.episode_count} Episodes
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {show?.network && <Chip size="small" label={show?.network} color="primary" />}
                    <Chip size="small" label={show?.content_rating || 'Unknown'} color="secondary" />
                    <Chip size="small" label={show?.type} color="warning" />
                    <Chip size="small" label={show?.status} color="success" />
                  </Box>
                </Box>
              </>
            </Box>
          </Box>

          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <>
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Genres
                    </Typography>
                    <Typography variant="body1">{show?.genres}</Typography>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Streaming On
                    </Typography>
                    <Typography variant="body1">{show?.streaming_services || 'Not available for streaming'}</Typography>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Watch Status
                    </Typography>
                    <Typography variant="body1">{getWatchStatusDisplay(show?.watch_status)}</Typography>
                  </Box>
                </>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Episodes
                  </Typography>

                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Last Episode
                      </Typography>
                      <Typography variant="body2">
                        {show?.last_episode ? buildEpisodeLineDetails(show?.last_episode) : 'No Last Episode'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Next Episode
                      </Typography>
                      <Typography variant="body2">
                        {show?.next_episode ? buildEpisodeLineDetails(show?.next_episode) : 'No Next Episode'}
                      </Typography>
                    </Box>
                  </>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <br></br>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="home content tabs"
        >
          <Tab label="Keep Watching" {...a11yProps(0)} />
          <Tab label="Seasons & Episodes" {...a11yProps(1)} />
          <Tab label="Related Content" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {profileId && <KeepWatchingShowComponent profileId={profileId} />}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {seasons ? (
          <Box>
            {seasons.map((season) => (
              <Accordion key={season.season_id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center', // Align items vertically
                    },
                  }}
                >
                  <ListItemAvatar sx={{ width: 96, height: 140, p: 1 }}>
                    <Avatar
                      alt={season.name}
                      src={buildTMDBImagePath(season.poster_image)}
                      variant="rounded"
                      sx={{ width: 96, height: 140 }}
                    />
                  </ListItemAvatar>
                  <Box ml={2} flexGrow={1}>
                    <Typography variant="h6">{season.name}</Typography>
                    <Typography variant="subtitle1">Season: {season.season_number}</Typography>
                    <Typography variant="body2">
                      {season.number_of_episodes} Episodes | {buildSeasonAirDate(season.release_date)}
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={getSeasonWatchStatusTooltip(season, show!)}>
                      <IconButton
                        onClick={(event) => handleSeasonWatchStatusChange(season, event)}
                        disabled={loadingSeasons[season.season_id]}
                        size="medium"
                        sx={{ my: 'auto' }}
                      >
                        <WatchStatusIcon status={season.watch_status} />
                      </IconButton>
                    </Tooltip>
                    {loadingSeasons[season.season_id] && (
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
                <AccordionDetails>
                  {season.episodes ? (
                    <List>
                      {season.episodes.map((episode) => (
                        <React.Fragment key={episode.episode_id}>
                          <ListItem
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'center', sm: 'flex-start' },
                              textAlign: { xs: 'center', sm: 'left' },
                            }}
                          >
                            <ListItemAvatar sx={{ width: 140, height: 96, p: 1 }}>
                              <Avatar
                                alt={episode.title}
                                src={buildTMDBImagePath(episode.still_image)}
                                variant="rounded"
                                sx={{ width: 140, height: 96 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={episode.title}
                              secondary={
                                <>
                                  <i>{episode.overview}</i> <br />
                                  Episode: {episode.episode_number} {' (' + episode.episode_type + ')'} |{' '}
                                  {buildEpisodeAirDate(episode.air_date)} | Runtime:{' '}
                                  {calculateRuntimeDisplay(episode.runtime)}
                                </>
                              }
                            />
                            <Box sx={{ position: 'relative', mt: { xs: 2, sm: 0 } }}>
                              <Tooltip title={episode.watch_status === 'WATCHED' ? 'Mark Not Watched' : 'Mark Watched'}>
                                <IconButton
                                  color={episode.watch_status === 'WATCHED' ? 'success' : 'default'}
                                  onClick={() => handleEpisodeWatchStatusChange(season, episode)}
                                  disabled={loadingEpisodes[episode.episode_id]}
                                >
                                  <WatchStatusIcon status={episode.watch_status} />
                                </IconButton>
                              </Tooltip>
                              {loadingEpisodes[episode.episode_id] && (
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
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <div>No Episodes Available</div>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : null}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {show && <RecommendedShowsComponent showId={String(show.show_id)} profileId={profileId || ''} />}
        {show && <SimilarShowsComponent showId={String(show.show_id)} profileId={profileId || ''} />}
      </TabPanel>
    </>
  );
}

export default ShowDetails;
