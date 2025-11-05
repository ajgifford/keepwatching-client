import React from 'react';

import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Box, Button, Chip, Paper, Typography, useTheme } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  selectAlternativePersons,
  selectAutoSelectedConfidence,
  selectPersonSearchQuery,
  selectSelectedPerson,
  toggleDisambiguation,
} from '../../../app/slices/personSearchSlice';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

export const PersonConfidenceBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const query = useAppSelector(selectPersonSearchQuery);
  const selectedPerson = useAppSelector(selectSelectedPerson);
  const alternatives = useAppSelector(selectAlternativePersons);
  const confidence = useAppSelector(selectAutoSelectedConfidence);

  if (!selectedPerson) {
    return null;
  }

  const handleSeeOthers = () => {
    dispatch(toggleDisambiguation());
  };

  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high':
        return theme.palette.success.main;
      case 'medium':
        return theme.palette.info.main;
      case 'low':
        return theme.palette.warning.main;
      default:
        return theme.palette.success.main;
    }
  };

  const getConfidenceChip = () => {
    switch (confidence) {
      case 'high':
        return <Chip label="High confidence" size="small" color="success" variant="outlined" />;
      case 'medium':
        return <Chip label="Medium confidence" size="small" color="info" variant="outlined" />;
      case 'low':
        return <Chip label="Low confidence" size="small" color="warning" variant="outlined" />;
      default:
        return null;
    }
  };

  const knownForText = selectedPerson.knownFor ? selectedPerson.knownFor.slice(0, 3).join(', ') : '';

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 3,
        p: 3,
        borderLeft: 4,
        borderLeftColor: getConfidenceColor(),
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* Profile Image */}
        <Avatar
          src={buildTMDBImagePath(selectedPerson.profileImage)}
          sx={{
            width: 64,
            height: 64,
            bgcolor: theme.palette.grey[300],
          }}
        >
          <PersonIcon fontSize="large" />
        </Avatar>

        {/* Person Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {selectedPerson.name}
            </Typography>
            {getConfidenceChip()}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={selectedPerson.department}
              size="small"
              variant="outlined"
              sx={{ borderColor: theme.palette.divider }}
            />
            <Typography variant="body2" color="text.secondary">
              Popularity: {selectedPerson.popularity ? selectedPerson.popularity.toFixed(1) : 0}
            </Typography>
          </Box>

          {knownForText && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontStyle: 'italic' }}>
              Known for: {knownForText}
            </Typography>
          )}

          {selectedPerson.biography && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {selectedPerson.biography}
            </Typography>
          )}

          {/* Personal Details */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {selectedPerson.birthday && (
              <Typography variant="caption" color="text.secondary">
                Born: {new Date(selectedPerson.birthday).toLocaleDateString()}
              </Typography>
            )}
            {selectedPerson.birthplace && (
              <Typography variant="caption" color="text.secondary">
                Birthplace: {selectedPerson.birthplace}
              </Typography>
            )}
            {selectedPerson.deathday && (
              <Typography variant="caption" color="text.secondary">
                Died: {new Date(selectedPerson.deathday).toLocaleDateString()}
              </Typography>
            )}
          </Box>

          {/* Actions - Only show if there are alternatives */}
          {alternatives.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSeeOthers}
                sx={{
                  textTransform: 'none',
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {`Not who you're looking for? See other ${query}s`}
              </Button>

              <Typography variant="caption" color="text.secondary">
                {alternatives.length} other {alternatives.length === 1 ? 'person' : 'people'} found
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
