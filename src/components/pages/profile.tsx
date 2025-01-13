import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppSelector } from '../../app/hooks';
import { NextWatchEpisode } from '../../app/model/shows';
import { makeSelectMovieWatchStatusCountsByProfile } from '../../app/slices/moviesSlice';
import { selectProfileById } from '../../app/slices/profilesSlice';
import { makeSelectShowWatchStatusCountsByProfile } from '../../app/slices/showsSlice';
import { NextEpisodeCard } from '../common/nextEpisodeCard';

function Profile() {
  const { profileId } = useParams();
  const [nextEpisodes, setNextEpisodes] = useState<NextWatchEpisode[]>([]);
  const profile = useAppSelector((state) => selectProfileById(state, profileId!));

  const movieWatchStatusSelector = useMemo(() => makeSelectMovieWatchStatusCountsByProfile(), []);
  const { watched: movieWatched, notWatched: movieNotWatched } = useAppSelector((state) =>
    movieWatchStatusSelector(state, Number(profile.id)),
  );
  const showWatchStatusSelector = useMemo(() => makeSelectShowWatchStatusCountsByProfile(), []);
  const {
    watched: showWatched,
    watching: showWatching,
    notWatched: showNotWatched,
  } = useAppSelector((state) => showWatchStatusSelector(state, Number(profile.id)));

  useEffect(() => {
    async function fetchNextWatch() {
      try {
        const response = await axiosInstance.get(`api/profiles/${profileId}/shows/nextWatch`);
        const results: NextWatchEpisode[] = response.data.results;
        setNextEpisodes(results);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchNextWatch();
  }, [profileId]);

  return (
    <Box>
      <Typography variant="h4" color="primary">
        {profile.name}
      </Typography>
      <Box sx={{ p: 2, minWidth: '200px' }}>
        <Divider sx={{ p: '2px' }}>
          <Chip
            label="Shows"
            color="info"
            size="medium"
            component={Link}
            to={`/shows?profileId=${profile.id}`}
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
            <Link
              style={{ textDecoration: 'none', color: 'black' }}
              to={`/shows?profileId=${profile.id}&watchStatus=NOT_WATCHED`}
            >
              {showNotWatched}
            </Link>
          </Typography>
          <Typography variant="body1">
            <i>Watching:</i>{' '}
            <Link
              style={{ textDecoration: 'none', color: 'black' }}
              to={`/shows?profileId=${profile.id}&watchStatus=WATCHING`}
            >
              {showWatching}
            </Link>
          </Typography>
          <Typography variant="body1">
            <i>Watched:</i>{' '}
            <Link
              style={{ textDecoration: 'none', color: 'black' }}
              to={`/shows?profileId=${profile.id}&watchStatus=WATCHED`}
            >
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
            direction="row"
            useFlexGap
            sx={{ flexWrap: 'wrap', pt: '4px', pb: 2, justifyContent: 'center' }}
          >
            {nextEpisodes.length > 0 ? (
              nextEpisodes.map((nextEpisode) => (
                <NextEpisodeCard key={nextEpisode.episode_title} nextEpisode={nextEpisode} />
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
            to={`/movies?profileId=${profile.id}`}
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
            <Link
              style={{ textDecoration: 'none', color: 'black' }}
              to={`/movies?profileId=${profile.id}&watchStatus=NOT_WATCHED`}
            >
              {movieNotWatched}
            </Link>
          </Typography>
          <Typography variant="body1">
            <i>Watched:</i>{' '}
            <Link
              style={{ textDecoration: 'none', color: 'black' }}
              to={`/movies?profileId=${profile.id}&watchStatus=WATCHED`}
            >
              {movieWatched}
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default Profile;
