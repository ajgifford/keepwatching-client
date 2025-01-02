import { Stack } from '@mui/material';

import { useAppSelector } from '../../app/hooks';
import { Profile } from '../../app/model/profile';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import { ProfileCard } from './profileCard';

interface PropTypes {
  editable: boolean;
  handleEdit?: (profile: Profile) => void;
  handleDelete?: (profile: Profile) => void;
}

export function ProfilesStack({ editable, handleEdit, handleDelete }: PropTypes) {
  const profiles = useAppSelector(selectAllProfiles);
  return (
    <Stack
      spacing={{ xs: 1, sm: 2 }}
      direction="row"
      useFlexGap
      sx={{ flexWrap: 'wrap', p: 2, justifyContent: 'center' }}
    >
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          editable={editable}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ))}
    </Stack>
  );
}
