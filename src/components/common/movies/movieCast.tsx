import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { PersonCard } from '../person/personCard';
import { CastMember } from '@ajgifford/keepwatching-types';

interface MoviesSectionProps {
  castMembers: CastMember[];
  profileId: number | string;
}

interface MovieCastGridProps {
  castMembers: CastMember[];
  emptyMessage: string;
  profileId: number | string;
}

const MovieCastGrid: React.FC<MovieCastGridProps> = ({ castMembers, emptyMessage, profileId }) => {
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
          <PersonCard person={castMember} returnPath={`/movies/${castMember.contentId}/${profileId}`} />
        </Grid>
      ))}
    </>
  );
};

export const MovieCastSection: React.FC<MoviesSectionProps> = ({ castMembers, profileId }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={2.5}>
          <MovieCastGrid castMembers={castMembers} emptyMessage="No cast available" profileId={profileId} />
        </Grid>
      </Box>
    </Box>
  );
};
