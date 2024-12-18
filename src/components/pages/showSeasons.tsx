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

import { Season, Show } from '../../model/show';
import { useAccount } from '../context/accountContext';
import NotLoggedIn from '../login/notLoggedIn';

const ShowSeasons = () => {
  let { id } = useParams();
  const { account } = useAccount();
  const navigate = useNavigate();
  const [show, setShow] = useState<Show>();
  const [seasons, setSeasons] = useState<Season[] | undefined>([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState<Record<string, boolean>>({});

  async function fetchShow(show_id: string | undefined) {
    const response = await fetch(`/api/shows/${show_id}`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const show: Show = JSON.parse(data);
    const seasons = show.seasons;
    setShow(show);
    setSeasons(seasons);
  }

  useEffect(() => {
    fetchShow(id);
  }, [id]);

  const isSeasonFullyWatched = (season: Season) => season.episodes.every((episode) => watchedEpisodes[episode.id]);

  const isSeasonPartiallyWatched = (season: Season) =>
    season.episodes.some((episode) => watchedEpisodes[episode.id]) && !isSeasonFullyWatched(season);

  const toggleSeasonWatched = (season: Season) => {
    const fullyWatched = isSeasonFullyWatched(season);
    setWatchedEpisodes((prev) => {
      const updated = { ...prev };
      season.episodes.forEach((episode) => {
        updated[episode.id] = !fullyWatched;
      });
      return updated;
    });
  };

  const toggleEpisodeWatched = (episodeId: string) => {
    setWatchedEpisodes((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId],
    }));
  };

  return (
    <>
      {!account ? (
        <NotLoggedIn />
      ) : (
        <>
          <AppBar position="sticky" color="inherit" elevation={0}>
            <Toolbar>
              <Tooltip title="Back">
                <IconButton
                  edge="start"
                  aria-label="back"
                  onClick={() => {
                    navigate('/shows');
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
                <Typography variant="body1">{show?.genres}</Typography>
                <Typography variant="body1">{show?.streaming_service}</Typography>
              </Box>
            </Toolbar>
          </AppBar>
          <br></br>
          {seasons ? (
            <Box>
              {seasons.map((season) => (
                <Accordion key={season.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <ListItemAvatar>
                      <Avatar src={season.image} alt={season.title} variant="square" />
                    </ListItemAvatar>
                    <Box ml={2} flexGrow={1}>
                      <Typography variant="h6">{season.title}</Typography>
                      <Typography variant="body2">
                        {season.number_of_episodes} Episodes | First Aired: {season.release_date}
                      </Typography>
                    </Box>
                    <Tooltip title={isSeasonFullyWatched(season) ? 'Mark Unwatched' : 'Mark Watched'}>
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
                          <React.Fragment key={episode.id}>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar src={episode.image} alt={episode.title} variant="square" />
                              </ListItemAvatar>
                              <ListItemText
                                primary={episode.title}
                                secondary={`Summary: ${episode.summary} | Aired: ${episode.release_date} | Runtime: ${episode.duration}`}
                              />
                              <Tooltip title={watchedEpisodes[episode.id] ? 'Mark Unwatched' : 'Mark Watched'}>
                                <IconButton
                                  color={watchedEpisodes[episode.id] ? 'success' : 'default'}
                                  onClick={() => toggleEpisodeWatched(episode.id)}
                                >
                                  {watchedEpisodes[episode.id] ? <WatchLaterIcon /> : <WatchLaterOutlinedIcon />}
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
      )}
    </>
  );
};

export default ShowSeasons;
