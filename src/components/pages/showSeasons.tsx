import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Season } from '../../app/model/shows';
import {
  clearActiveShow,
  fetchShowWithDetails,
  selectSeasons,
  selectShow,
  selectWatchedEpisodes,
  updateEpisodeWatchStatus,
  updateSeasonWatchStatus,
} from '../../app/slices/activeShowSlice';
import { calculateRuntimeDisplay, getWatchStatusDisplay } from '../utility/contentUtility';

const ShowSeasons = () => {
  let { showId, profileId } = useParams();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const seasons = useAppSelector(selectSeasons);
  const watchedEpisodes = useAppSelector(selectWatchedEpisodes);

  useEffect(() => {
    if (showId && profileId) {
      dispatch(fetchShowWithDetails({ profileId, showId }));
    }
  }, [profileId, showId, dispatch]);

  const isSeasonFullyWatched = (season: Season) =>
    season.episodes.every((episode) => watchedEpisodes[episode.episode_id]);

  const isSeasonPartiallyWatched = (season: Season) =>
    season.episodes.some((episode) => watchedEpisodes[episode.episode_id]) && !isSeasonFullyWatched(season);

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar>
          <Tooltip title="Back">
            <IconButton
              edge="start"
              aria-label="back"
              onClick={() => {
                dispatch(clearActiveShow());
                navigate(`/shows?profileId=${profileId}`);
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ p: 2 }}>
            <Typography variant="h4">{show?.title}</Typography>
            <Typography variant="subtitle1" fontStyle="italic">
              {show?.description}
            </Typography>
            <Typography variant="body1">Genre: {show?.genres}</Typography>
            <Typography variant="body1">Streaming Service: {show?.streaming_services}</Typography>
            <Typography variant="body1">Status: {getWatchStatusDisplay(show?.watch_status)}</Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <br></br>
      {seasons ? (
        <Box>
          {seasons.map((season) => (
            <Accordion key={season.season_id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ListItemAvatar sx={{ width: 96, height: 140, p: 1 }}>
                  <Avatar alt={season.name} src={season.image} variant="rounded" sx={{ width: 96, height: 140 }} />
                </ListItemAvatar>
                <Box ml={2} flexGrow={1}>
                  <Typography variant="h6">{season.name}</Typography>
                  <Typography variant="subtitle1">Season: {season.season_number}</Typography>
                  <Typography variant="body2">
                    {season.number_of_episodes} Episodes | First Aired: {season.release_date}
                  </Typography>
                </Box>
                <Tooltip title={isSeasonFullyWatched(season) ? 'Mark Not Watched' : 'Mark Watched'}>
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      dispatch(
                        updateSeasonWatchStatus({
                          profileId,
                          season,
                          seasonStatus: season.watch_status === 'WATCHED' ? 'NOT_WATCHED' : 'WATCHED',
                        }),
                      );
                    }}
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
              </AccordionSummary>
              <AccordionDetails>
                {season.episodes ? (
                  <List>
                    {season.episodes.map((episode) => (
                      <React.Fragment key={episode.episode_id}>
                        <ListItem>
                          <ListItemAvatar sx={{ width: 140, height: 96, p: 1 }}>
                            <Avatar
                              alt={episode.title}
                              src={episode.image}
                              variant="rounded"
                              sx={{ width: 140, height: 96 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={episode.title}
                            secondary={
                              <>
                                <i>{episode.overview}</i> <br />
                                Episode: {episode.episode_number} {' (' + episode.episode_type + ')'} | Aired:{' '}
                                {episode.air_date ?? 'TBD'} | Runtime: {calculateRuntimeDisplay(episode.runtime)}
                              </>
                            }
                          />
                          <Tooltip title={watchedEpisodes[episode.episode_id] ? 'Mark Not Watched' : 'Mark Watched'}>
                            <IconButton
                              color={watchedEpisodes[episode.episode_id] ? 'success' : 'default'}
                              onClick={() =>
                                dispatch(
                                  updateEpisodeWatchStatus({
                                    profileId,
                                    season,
                                    episode,
                                    episodeStatus: episode?.watch_status === 'WATCHED' ? 'NOT_WATCHED' : 'WATCHED',
                                  }),
                                )
                              }
                            >
                              {watchedEpisodes[episode.episode_id] ? <WatchLaterIcon /> : <WatchLaterOutlinedIcon />}
                            </IconButton>
                          </Tooltip>
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
    </>
  );
};

export default ShowSeasons;
