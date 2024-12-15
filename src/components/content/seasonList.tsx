import { Card, CardContent, Grid, Typography } from '@mui/material';

import { Episode, Season } from '../../model/show';

type PropTypes = {
  seasons: Season[];
  episodes: Episode[];
};

function SeasonList(props: PropTypes) {
  const seasons: Season[] = props.seasons;
  const episodes: Episode[] = props.episodes;

  return (
    <Grid container spacing={3}>
      {seasons.map((season) => (
        <Grid item xs={12} sm={6} md={4} key={season.id}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {season.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Number of Episodes:</strong> {season.number_of_episodes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Episodes:</strong>
              </Typography>
              <ul>
                {episodes
                  .filter((episode) => episode.season_id === season.id)
                  .map((episode) => (
                    <li key={episode.id}>
                      {episode.episode_number}. {episode.title} ({episode.duration} min)
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default SeasonList;
