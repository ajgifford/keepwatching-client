import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import WatchLaterTwoToneIcon from '@mui/icons-material/WatchLaterTwoTone';
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
  buildEpisodeLine,
  buildSeasonAirDate,
  buildServicesLine,
  buildTMDBImagePath,
  calculateRuntimeDisplay,
  getWatchStatusDisplay,
} from '../utility/contentUtility';

function ShowDetails() {
  const { showId, profileId } = useParams();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const seasons = useAppSelector(selectSeasons);
  const showDetailsLoading = useAppSelector(selectShowLoading);
  const showDetailsError = useAppSelector(selectShowError);
  const watchedEpisodes = useAppSelector(selectWatchedEpisodes);

  const [tabValue, setTabValue] = useState(0);
  const [loadingSeasons, setLoadingSeasons] = useState<Record<number, boolean>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState<Record<number, boolean>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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

  const isSeasonFullyWatched = (season: Season) =>
    season.episodes.every((episode) => watchedEpisodes[episode.episode_id]);

  const isSeasonPartiallyWatched = (season: Season) =>
    season.episodes.some((episode) => watchedEpisodes[episode.episode_id]) && !isSeasonFullyWatched(season);

  const handleSeasonWatchStatusChange = async (season: Season, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Set loading state for this season
    setLoadingSeasons(prev => ({ ...prev, [season.season_id]: true }));
    
    try {
      await dispatch(
        updateSeasonWatchStatus({
          profileId,
          season,
          seasonStatus: season.watch_status === 'WATCHED' ? 'NOT_WATCHED' : 'WATCHED',
        })
      ).unwrap();
    } finally {
      // Clear loading state when done
      setLoadingSeasons(prev => ({ ...prev, [season.season_id]: false }));
    }
  };

  const handleEpisodeWatchStatusChange = async (season: Season, episode: Episode) => {
    // Set loading state for this episode
    setLoadingEpisodes(prev => ({ ...prev, [episode.episode_id]: true }));
    
    try {
      await dispatch(
        updateEpisodeWatchStatus({
          profileId,
          season,
          episode,
          episodeStatus: episode?.watch_status === 'WATCHED' ? 'NOT_WATCHED' : 'WATCHED',
        })
      ).unwrap();
    } finally {
      // Clear loading state when done
      setLoadingEpisodes(prev => ({ ...prev, [episode.episode_id]: false }));
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
        <Toolbar sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Tooltip title="Back">
            <IconButton
              edge="start"
              aria-label="back"
              onClick={() => {
                dispatch(clearActiveShow());
                navigate(buildBackButtonPath());
              }}
              sx={{ mt: 2 }}
            >
              <ArrowBackIosIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              width: { xs: 120, sm: 150, md: 200 },
              height: 'auto',
              mr: { xs: 2, sm: 3, md: 4 },
              borderRadius: 1,
              overflow: 'hidden',
              flexShrink: 0,
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

          <Box sx={{ p: 2, flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="h4" noWrap>
              {show?.title}
            </Typography>
            <Typography variant="subtitle1" fontStyle="italic">
              {show?.description}
            </Typography>
            <Typography variant="body1">
              {show?.type} | {show?.status}
            </Typography>
            <Typography variant="body1">
              <b>Genres:</b> {show?.genres}
            </Typography>
            <Typography variant="body1">{buildServicesLine(show)}</Typography>
            <Typography variant="body1">
              <b>Premiered: </b> {show?.release_date} | <b>Rated: </b> {show?.content_rating}
            </Typography>
            <Typography variant="body1">
              <b>Seasons:</b> {show?.season_count} | <b>Episodes:</b> {show?.episode_count}
            </Typography>
            <Typography variant="body1">{buildEpisodeLine(show)}</Typography>
            <Typography variant="body1">
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
        <TabPanel value={tabValue} index={0}>
          {profileId && <KeepWatchingShowComponent profileId={profileId} />}
        </TabPanel>
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
                    }
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
                    <Tooltip title={isSeasonFullyWatched(season) ? 'Mark Not Watched' : 'Mark Watched'}>
                      <IconButton
                        onClick={(event) => handleSeasonWatchStatusChange(season, event)}
                        disabled={loadingSeasons[season.season_id]}
                        size="medium"
                        sx={{ my: 'auto' }} // Vertically center
                      >
                        {isSeasonFullyWatched(season) ? (
                          <WatchLaterIcon color="success" />
                        ) : isSeasonPartiallyWatched(season) ? (
                          <WatchLaterTwoToneIcon color="success" />
                        ) : (
                          <WatchLaterOutlinedIcon />
                        )}
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
                            <Box sx={{ position: 'relative' }}>
                              <Tooltip title={watchedEpisodes[episode.episode_id] ? 'Mark Not Watched' : 'Mark Watched'}>
                                <IconButton
                                  color={watchedEpisodes[episode.episode_id] ? 'success' : 'default'}
                                  onClick={() => handleEpisodeWatchStatusChange(season, episode)}
                                  disabled={loadingEpisodes[episode.episode_id]}
                                >
                                  {watchedEpisodes[episode.episode_id] ? <WatchLaterIcon /> : <WatchLaterOutlinedIcon />}
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
