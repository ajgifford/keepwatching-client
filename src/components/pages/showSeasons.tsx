import React, { useEffect, useState } from 'react';
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

import axiosInstance from '../../app/api/axiosInstance';
import { Season, Show } from '../../app/model/shows';
import { calculateRuntimeDisplay, toTitleCase } from '../utility/contentUtility';

const ShowSeasons = () => {
  let { showId, profileId } = useParams();

  const navigate = useNavigate();
  const [show, setShow] = useState<Show>();
  const [seasons, setSeasons] = useState<Season[] | undefined>([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchSeasons() {
      try {
        const response = await axiosInstance.get(`api/profiles/${profileId}/shows/${showId}/seasons`);
        const results = response.data.results;
        const show: Show = results[0];
        const seasons: Season[] = show.seasons!;
        setShow(show);
        setSeasons(seasons);

        const watchedEpisodesMap: Record<number, boolean> = {};
        seasons.forEach((season) => {
          season.episodes.forEach((episode) => {
            watchedEpisodesMap[episode.episode_id] = episode.watch_status === 'WATCHED';
          });
        });
        setWatchedEpisodes(watchedEpisodesMap);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchSeasons();
  }, [showId, profileId]);

  const isSeasonFullyWatched = (season: Season) =>
    season.episodes.every((episode) => watchedEpisodes[episode.episode_id]);

  const isSeasonPartiallyWatched = (season: Season) =>
    season.episodes.some((episode) => watchedEpisodes[episode.episode_id]) && !isSeasonFullyWatched(season);

  const toggleSeasonWatched = (season: Season) => {
    const fullyWatched = isSeasonFullyWatched(season);
    setWatchedEpisodes((prev) => {
      const updated = { ...prev };
      season.episodes.forEach((episode) => {
        updated[episode.episode_id] = !fullyWatched;
      });
      return updated;
    });
  };

  const toggleEpisodeWatched = (episodeId: number) => {
    setWatchedEpisodes((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId],
    }));
  };

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar>
          <Tooltip title="Back">
            <IconButton
              edge="start"
              aria-label="back"
              onClick={() => {
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
            <Typography variant="body1">Status: {toTitleCase(show?.watch_status)}</Typography>
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
                      toggleSeasonWatched(season);
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
                              onClick={() => toggleEpisodeWatched(episode.episode_id)}
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
