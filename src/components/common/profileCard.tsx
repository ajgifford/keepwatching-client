import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';

import { useAppSelector } from '../../app/hooks';
import { Profile } from '../../app/model/profile';
import { makeSelectWatchedAndNotWatchedCountByProfile } from '../../app/slices/moviesSlice';

interface PropTypes {
  profile: Profile;
  editable: boolean;
  handleEdit?: (profile: Profile) => void;
  handleDelete?: (profile: Profile) => void;
}

export function ProfileCard({ profile, editable, handleEdit, handleDelete }: PropTypes) {
  const watchedAndNotWatchedSelector = useMemo(() => makeSelectWatchedAndNotWatchedCountByProfile(), []);
  const { watched, notWatched } = useAppSelector((state) => watchedAndNotWatchedSelector(state, Number(profile.id)));
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
          <Link to={`/shows?profileId=${profile.id}&watchStatus=NOT_WATCHED`}>{profile.showsToWatch}</Link>
        </Typography>
      </Box>
      <Box sx={{ py: '1px' }}>
        <Typography variant="body1">
          <i>Watching:</i>{' '}
          <Link to={`/shows?profileId=${profile.id}&watchStatus=NOT_WATCHED`}>{profile.showsWatching}</Link>
        </Typography>
      </Box>
      <Box sx={{ py: '2px' }}>
        <Typography variant="body1">
          <i>Watched:</i>{' '}
          <Link to={`/shows?profileId=${profile.id}&watchStatus=NOT_WATCHED`}>{profile.showsWatched}</Link>
        </Typography>
      </Box>
      <Divider sx={{ p: '2px' }}>
        <Chip label="Movies" color="success" size="small" component={Link} to={`/movies?profileId=${profile.id}`} />
      </Divider>
      <Box sx={{ py: '2px' }}>
        <Typography variant="body1">
          <i>To Watch:</i> <Link to={`/movies?profileId=${profile.id}&watchStatus=NOT_WATCHED`}>{notWatched}</Link>
        </Typography>
      </Box>
      <Box sx={{ py: '2px' }}>
        <Typography variant="body1">
          <i>Watched:</i> <Link to={`/movies?profileId=${profile.id}&watchStatus=NOT_WATCHED`}>{watched}</Link>
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
