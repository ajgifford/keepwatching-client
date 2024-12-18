import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';

import { DiscoverShow } from '../../model/shows';

const ShowsCards: React.FC<{ shows: DiscoverShow[] }> = ({ shows }) => (
  <Grid container spacing={3}>
    {shows.map((show) => (
      <Grid item xs={12} sm={6} md={4} key={show.id}>
        <Card>
          <CardMedia component="img" height="140" image={show.image} alt={show.title} />
          <CardContent>
            <Typography variant="h5" component="div">
              {show.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {show.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Genre:</strong> {show.genres}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Release Date:</strong> {show.release_date}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>User Rating:</strong> {show.user_rating || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>TV Guidelines:</strong> {show.tv_parental_guidelines}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Seasons:</strong> {show.number_of_seasons}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Episodes:</strong> {show.total_episodes}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default ShowsCards;
