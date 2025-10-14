import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { PersonCard } from '../person/personCard';
import { ShowCast, ShowCastMember } from '@ajgifford/keepwatching-types';

interface ShowSectionProps {
  cast: ShowCast;
  profileId: number | string;
}

interface ShowCastGridProps {
  castMembers: ShowCastMember[];
  emptyMessage: string;
  profileId: number | string;
}

const ShowCastGrid: React.FC<ShowCastGridProps> = ({ castMembers, emptyMessage, profileId }) => {
  if (!castMembers || castMembers.length === 0) {
    return (
      <Grid size={12}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      </Grid>
    );
  }

  return (
    <>
      {castMembers.map((castMember) => (
        <Grid size={{ xs: 12, md: 6 }} key={castMember.personId}>
          <PersonCard person={castMember} returnPath={`/shows/${castMember.contentId}/${profileId}`} />
        </Grid>
      ))}
    </>
  );
};

export const ShowCastSection: React.FC<ShowSectionProps> = ({ cast, profileId }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={2.5}>
          <ShowCastGrid castMembers={cast.activeCast} emptyMessage="No cast available" profileId={profileId} />
        </Grid>
      </Box>
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={2.5}>
          <ShowCastGrid castMembers={cast.priorCast} emptyMessage="No prior cast available" profileId={profileId} />
        </Grid>
      </Box>
    </Box>
  );
};
