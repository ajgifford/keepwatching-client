import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Toolbar,
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
  buildEpisodeLine,
  buildSeasonAirDate,
  buildServicesLine,
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

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: 999,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'flex-start',
            pt: 2,
          }}
        >
          <Tooltip title="Back">
            <IconButton
              edge="start"
              aria-label="back"
              onClick={() => {
                dispatch(clearActiveShow());
                navigate(buildBackButtonPath());
              }}
              sx={{
                alignSelf: { xs: 'flex-start', sm: 'center' },
                mb: { xs: 2, sm: 0 },
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              width: { xs: '70%', sm: 150, md: 200 },
              maxWidth: { xs: 200, sm: 150, md: 200 },
              height: 'auto',
              mr: { xs: 0, sm: 3, md: 4 },
              mb: { xs: 2, sm: 0 },
              borderRadius: 1,
              overflow: 'hidden',
              flexShrink: 0,
              alignSelf: { xs: 'center', sm: 'flex-start' },
            }}
          >
            <Box
              component="img"
              src={buildTMDBImagePath(show?.poster_image, 'w342')}
              alt={show?.title}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>

          <Box sx={{ p: { xs: 0, sm: 2 }, flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="h4" sx={{ textAlign: { xs: 'center', sm: 'left' } }} noWrap>
              {show?.title}
            </Typography>
            <Typography variant="subtitle1" fontStyle="italic" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              {show?.description}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              {show?.type} | {show?.status}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <b>Genres:</b> {show?.genres}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              {buildServicesLine(show)}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <b>Premiered: </b> {show?.release_date} | <b>Rated: </b> {show?.content_rating}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <b>Seasons:</b> {show?.season_count} | <b>Episodes:</b> {show?.episode_count}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              {buildEpisodeLine(show)}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <b>Status:</b> {getWatchStatusDisplay(show?.watch_status)}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
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
