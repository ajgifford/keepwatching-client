import { Link } from 'react-router-dom';

import { Box, Chip, Divider, Stack, Typography } from '@mui/material';

import { useAppSelector } from '../../app/hooks';
import {
  selectActiveProfile,
  selectActiveProfileError,
  selectActiveProfileLoading,
  selectMovieWatchCounts,
  selectMoviesByIds,
  selectNextEpsiodes,
  selectRecentMovies,
  selectShowWatchCounts,
  selectUpcomingMovies,
} from '../../app/slices/activeProfileSlice';
import { ErrorComponent } from '../common/errorComponent';
import { LoadingComponent } from '../common/loadingComponent';
import { MovieCard } from '../common/movieCard';
import { NextEpisodeCard } from '../common/nextEpisodeCard';

const Home = () => {
  const activeProfileLoading = useAppSelector(selectActiveProfileLoading);
  const activeProfileError = useAppSelector(selectActiveProfileError);
  const profile = useAppSelector(selectActiveProfile)!;
  const nextEpisodes = useAppSelector(selectNextEpsiodes);
  const recentMovieIds = useAppSelector(selectRecentMovies);
  const recentMovies = useAppSelector((state) => selectMoviesByIds(state, recentMovieIds));
  const upcomingMovieIds = useAppSelector(selectUpcomingMovies);
  const upcomingMovies = useAppSelector((state) => selectMoviesByIds(state, upcomingMovieIds));
  const {
    watched: showWatched,
    watching: showWatching,
    notWatched: showNotWatched,
  } = useAppSelector(selectShowWatchCounts);
  const { watched: movieWatched, notWatched: movieNotWatched } = useAppSelector(selectMovieWatchCounts);

  if (activeProfileLoading) {
    return <LoadingComponent />;
  }
  if (activeProfileError) {
    return <ErrorComponent error={activeProfileError} />;
  }

  return (
    <Box
      sx={{
        textAlign: 'center',
        mt: 4,
        px: 2,
      }}
    >
      <Stack
        spacing={{ xs: 1, sm: 1 }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          crossOrigin="anonymous"
          component="img"
          src={profile.image}
          alt={profile.name}
          sx={{
            width: 96,
            height: 96,
            borderRadius: 2,
          }}
        />
        <Typography variant="h4" color="textPrimary" gutterBottom>
          {profile.name}
        </Typography>
      </Stack>
      <Box sx={{ p: 2, minWidth: '200px' }}>
        <Divider sx={{ p: '2px' }}>
          <Chip
            label="Shows"
            color="info"
            size="medium"
            component={Link}
            to={`/shows?watchStatus=WATCHING%252CNOT_WATCHED`}
            sx={{ cursor: 'pointer' }}
          />
        </Divider>
        <Stack
          spacing={{ xs: 1, sm: 2 }}
          direction="row"
          useFlexGap
          sx={{ flexWrap: 'wrap', p: 2, justifyContent: 'center' }}
        >
          <Typography variant="body1">
            <i>To Watch:</i>{' '}
            <Link style={{ textDecoration: 'none', color: 'black' }} to={`/shows?watchStatus=NOT_WATCHED`}>
              {showNotWatched}
            </Link>
          </Typography>
          <Typography variant="body1">
            <i>Watching:</i>{' '}
            <Link style={{ textDecoration: 'none', color: 'black' }} to={`/shows?watchStatus=WATCHING`}>
              {showWatching}
            </Link>
          </Typography>
          <Typography variant="body1">
            <i>Watched:</i>{' '}
            <Link style={{ textDecoration: 'none', color: 'black' }} to={`/shows?watchStatus=WATCHED`}>
              {showWatched}
            </Link>
          </Typography>
        </Stack>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="primary">
            Next Episodes To Watch
          </Typography>
          <Stack
            spacing={{ xs: 1, sm: 2 }}
            direction={{ xs: 'column', md: 'row' }}
            useFlexGap
            sx={{ flexWrap: 'wrap', pt: '4px', pb: 2, justifyContent: 'center' }}
          >
            {nextEpisodes.length > 0 ? (
              nextEpisodes.map((nextEpisode) => (
                <NextEpisodeCard
                  key={`nextEpisodeCard_${nextEpisode.show_id}_${nextEpisode.episode_title}`}
                  nextEpisode={nextEpisode}
                />
              ))
            ) : (
              <Typography variant="body1" color="primary">
                No Upcoming Episodes
              </Typography>
            )}
          </Stack>
        </Box>
        <Divider sx={{ p: '2px' }}>
          <Chip
            label="Movies"
            color="success"
            size="medium"
            component={Link}
            to={`/movies?watchStatus=WATCHING%252CNOT_WATCHED`}
            sx={{ cursor: 'pointer' }}
          />
        </Divider>
        <Stack
          spacing={{ xs: 1, sm: 2 }}
          direction="row"
          useFlexGap
          sx={{ flexWrap: 'wrap', p: 2, justifyContent: 'center' }}
        >
          <Typography variant="body1">
            <i>To Watch:</i>{' '}
            <Link style={{ textDecoration: 'none', color: 'black' }} to={`/movies?watchStatus=NOT_WATCHED`}>
              {movieNotWatched}
            </Link>
          </Typography>
          <Typography variant="body1">
            <i>Watched:</i>{' '}
            <Link style={{ textDecoration: 'none', color: 'black' }} to={`/movies?watchStatus=WATCHED`}>
              {movieWatched}
            </Link>
          </Typography>
        </Stack>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="success" component="span">
            Recent Releases{' '}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" component="span">
            (last 60 days)
          </Typography>
          <Stack
            spacing={{ xs: 1, sm: 2 }}
            direction={{ xs: 'column', md: 'row' }}
            useFlexGap
            sx={{ flexWrap: 'wrap', pt: '4px', pb: 2, justifyContent: 'center' }}
          >
            {recentMovies.length > 0 ? (
              recentMovies.map((recentMovie) => (
                <MovieCard key={`recentMovieCard_${recentMovie.movie_id}_${recentMovie.title}`} movie={recentMovie} />
              ))
            ) : (
              <Typography variant="body1" color="success">
                No Recent Releases
              </Typography>
            )}
          </Stack>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="success" component="span">
            Upcoming Releases{' '}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" component="span">
            (last 60 days)
          </Typography>
          <Stack
            spacing={{ xs: 1, sm: 2 }}
            direction={{ xs: 'column', md: 'row' }}
            useFlexGap
            sx={{ flexWrap: 'wrap', pt: '4px', pb: 2, justifyContent: 'center' }}
          >
            {upcomingMovies.length > 0 ? (
              upcomingMovies.map((upcomingMovie) => (
                <MovieCard
                  key={`upcomingMovieCard_${upcomingMovie.movie_id}_${upcomingMovie.title}`}
                  movie={upcomingMovie}
                />
              ))
            ) : (
              <Typography variant="body1" color="success">
                No Upcoming Releases
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
