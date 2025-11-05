import React from 'react';
import { Link } from 'react-router-dom';

import { Avatar, Box, Card, CardContent, Chip, Typography, useTheme } from '@mui/material';

import { CastMember, ShowCastMember } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

// Type guard to check if the person is a ShowCastMember
const isShowCastMember = (person: CastMember | ShowCastMember): person is ShowCastMember => {
  return 'episodeCount' in person && 'active' in person;
};

interface PersonCardProps<T extends CastMember = CastMember> {
  person: T;
  returnPath: string;
}

export const PersonCard = <T extends CastMember = CastMember>({ person, returnPath }: PersonCardProps<T>) => {
  const theme = useTheme();
  const showCastMember = isShowCastMember(person);

  return (
    <Card
      component={Link}
      to={`/person/${person.personId}`}
      state={{ returnPath }}
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        overflow: 'hidden',
        textDecoration: 'none',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          '&::after': {
            transform: 'scaleX(1)',
          },
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          transform: 'scaleX(0)',
          transition: 'transform 0.3s ease',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            src={buildTMDBImagePath(person.profileImage, 'w185')}
            sx={{
              width: 64,
              height: 96,
              borderRadius: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            POSTER
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" fontWeight={600} noWrap sx={{ flexGrow: 1, mr: 1 }}>
                {person.name}
              </Typography>

              {showCastMember && (
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  <Chip
                    label={`${person.episodeCount} ep${person.episodeCount !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.75rem',
                      height: 20,
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                    }}
                  />
                  {!person.active && (
                    <Chip
                      label="Past"
                      size="small"
                      variant="filled"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        backgroundColor: theme.palette.grey[400],
                        color: 'white',
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {person.characterName}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
