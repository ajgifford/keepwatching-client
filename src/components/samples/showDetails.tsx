import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

import { Season, ShowWithSeasons } from '../../model/shows';

const ShowDetails = () => {
  let { id } = useParams();
  const [show, setShow] = useState<ShowWithSeasons>();
  const [seasons, setSeasons] = useState<Season[] | undefined>([]);

  async function fetchShow(show_id: string | undefined) {
    const response = await fetch(`/api/shows/${show_id}`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const show: ShowWithSeasons = JSON.parse(data);
    const seasons = show.seasons;
    setShow(show);
    setSeasons(seasons);
  }

  useEffect(() => {
    fetchShow(id);
  }, []);

  return (
    <div>
      <h2>{show?.title}</h2>
      {seasons ? (
        <List>
          {seasons.map((season) => (
            <Fragment key={season.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt={season.title} src={season.image} />
                </ListItemAvatar>
                <ListItemText
                  primary={season.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Release Date: {season.release_date}
                        <br />
                        Episode Count: {season.number_of_episodes}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </Fragment>
          ))}
        </List>
      ) : null}
    </div>
  );
};

export default ShowDetails;
