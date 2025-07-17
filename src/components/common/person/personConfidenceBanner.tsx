// src/components/common/person/PersonConfidenceBanner.tsx
import React from 'react';

import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Chip, IconButton, Typography, useTheme } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  dismissConfidenceBanner,
  selectAlternativePersons,
  selectAutoSelectedConfidence,
  selectSelectedPerson,
  toggleDisambiguation,
} from '../../../app/slices/personSearchSlice';

interface PersonConfidenceBannerProps {
  onDismiss?: () => void;
}

export const PersonConfidenceBanner: React.FC<PersonConfidenceBannerProps> = ({ onDismiss }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const selectedPerson = useAppSelector(selectSelectedPerson);
  const alternatives = useAppSelector(selectAlternativePersons);
  const confidence = useAppSelector(selectAutoSelectedConfidence);

  if (!selectedPerson || alternatives.length === 0) {
    return null;
  }

  const handleSeeOthers = () => {
    dispatch(toggleDisambiguation());
  };

  const handleDismiss = () => {
    dispatch(dismissConfidenceBanner());
    onDismiss?.();
  };

  const getSeverity = () => {
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'info';
      case 'low':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getBannerMessage = () => {
    const knownForText = selectedPerson.knownFor ? selectedPerson.knownFor.slice(0, 3).join(', ') : '';

    return {
      title: `Showing content for ${selectedPerson.name}`,
      subtitle: `${selectedPerson.department} • Known for: ${knownForText}`,
    };
  };

  const { title, subtitle } = getBannerMessage();

  return (
    <Alert
      severity={getSeverity()}
      sx={{
        mb: 3,
        '& .MuiAlert-message': {
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        },
      }}
      action={
        <IconButton aria-label="close" color="inherit" size="small" onClick={handleDismiss}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
    >
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <PersonIcon fontSize="small" />
        {title}
      </AlertTitle>

      <Typography variant="body2" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>

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
          Not who you're looking for? See other {selectedPerson.name.split(' ')[0]}s
        </Button>

        {alternatives.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {alternatives.length} other {alternatives.length === 1 ? 'person' : 'people'} found
          </Typography>
        )}

        {confidence === 'medium' && <Chip label="Uncertain match" size="small" variant="outlined" color="warning" />}
      </Box>
    </Alert>
  );
};
