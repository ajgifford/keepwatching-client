import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';

import { Season, Show } from '../../model/show';

const ShowSeasons = () => {
  let { id } = useParams();
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
  }, []);

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
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Typography variant="h4">{show?.title}</Typography>
      <Typography variant="subtitle1" fontStyle="italic">
        {show?.description}
      </Typography>
      <Typography variant="body1">{show?.genre}</Typography>
      <Typography variant="body1">{show?.streaming_service}</Typography>
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
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSeasonWatched(season);
                  }}
                >
                  {isSeasonFullyWatched(season) ? (
                    <CheckCircleIcon color="success" />
                  ) : isSeasonPartiallyWatched(season) ? (
                    <IndeterminateCheckBoxIcon color="warning" />
                  ) : (
                    <RadioButtonUncheckedIcon />
                  )}
                </IconButton>
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
                            secondary={`Aired: ${episode.release_date} | Runtime: ${episode.duration}`}
                          />
                          <IconButton
                            color={watchedEpisodes[episode.id] ? 'success' : 'default'}
                            onClick={() => toggleEpisodeWatched(episode.id)}
                          >
                            {watchedEpisodes[episode.id] ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                          </IconButton>
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
    </Container>
  );
};

export default ShowSeasons;
