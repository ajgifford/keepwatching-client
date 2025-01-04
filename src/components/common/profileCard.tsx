import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';

import { useAppSelector } from '../../app/hooks';
import { Profile } from '../../app/model/profile';
import { makeSelectMovieWatchStatusCountsByProfile } from '../../app/slices/moviesSlice';
import { makeSelectShowWatchStatusCountsByProfile } from '../../app/slices/showsSlice';

interface PropTypes {
  profile: Profile;
  editable: boolean;
  handleEdit?: (profile: Profile) => void;
  handleDelete?: (profile: Profile) => void;
}

export function ProfileCard({ profile, editable, handleEdit, handleDelete }: PropTypes) {
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

  return (
    <Box id={profile.id} key={profile.id} sx={{ p: 2, border: '1px solid black', minWidth: '200px' }}>
      <Box>
        <Typography variant="h5" color="primary">
          {profile.name}
        </Typography>
      </Box>
      <Divider sx={{ p: '2px' }}>
        <Chip label="Shows" color="info" size="small" component={Link} to={`/shows?profileId=${profile.id}`} />
      </Divider>
      <Box sx={{ py: '1px' }}>
        <Typography variant="body1">
          <i>To Watch:</i>{' '}
          <Link
            style={{ textDecoration: 'none', color: 'black' }}
            to={`/shows?profileId=${profile.id}&watchStatus=NOT_WATCHED`}
          >
            {showNotWatched}
          </Link>
        </Typography>
      </Box>
      <Box sx={{ py: '1px' }}>
        <Typography variant="body1">
          <i>Watching:</i>{' '}
          <Link
            style={{ textDecoration: 'none', color: 'black' }}
            to={`/shows?profileId=${profile.id}&watchStatus=WATCHING`}
          >
            {showWatching}
          </Link>
        </Typography>
      </Box>
      <Box sx={{ py: '2px' }}>
        <Typography variant="body1">
          <i>Watched:</i>{' '}
          <Link
            style={{ textDecoration: 'none', color: 'black' }}
            to={`/shows?profileId=${profile.id}&watchStatus=WATCHED`}
          >
            {showWatched}
          </Link>
        </Typography>
      </Box>
      <Divider sx={{ p: '2px' }}>
        <Chip label="Movies" color="success" size="small" component={Link} to={`/movies?profileId=${profile.id}`} />
      </Divider>
      <Box sx={{ py: '2px' }}>
        <Typography variant="body1">
          <i>To Watch:</i>{' '}
          <Link
            style={{ textDecoration: 'none', color: 'black' }}
            to={`/movies?profileId=${profile.id}&watchStatus=NOT_WATCHED`}
          >
            {movieNotWatched}
          </Link>
        </Typography>
      </Box>
      <Box sx={{ py: '2px' }}>
        <Typography variant="body1">
          <i>Watched:</i>{' '}
          <Link
            style={{ textDecoration: 'none', color: 'black' }}
            to={`/movies?profileId=${profile.id}&watchStatus=WATCHED`}
          >
            {movieWatched}
          </Link>
        </Typography>
      </Box>
      {editable ? (
        <Stack direction="row" spacing={2} sx={{ pt: '8px' }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              if (handleEdit) handleEdit(profile);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (handleDelete) handleDelete(profile);
            }}
          >
            Delete
          </Button>
        </Stack>
      ) : (
        <></>
      )}
    </Box>
  );
}
