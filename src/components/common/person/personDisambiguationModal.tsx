import React from 'react';

import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchPersonDetails,
  selectPersonSearchResults,
  selectSelectedPerson,
  selectShowDisambiguation,
  toggleDisambiguation,
} from '../../../app/slices/personSearchSlice';
import { PersonSearchResult } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

export const PersonDisambiguationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const results = useAppSelector(selectPersonSearchResults);
  const selectedPerson = useAppSelector(selectSelectedPerson);
  const open = useAppSelector(selectShowDisambiguation);

  const handleClose = () => {
    dispatch(toggleDisambiguation());
  };

  const handleSelectPerson = async (person: PersonSearchResult) => {
    // Close the modal first
    handleClose();
    // Fetch the person details directly - this will set the selectedPerson when complete
    dispatch(fetchPersonDetails(person.id));
  };

  const formatKnownFor = (knownFor: string[]) => {
    if (knownFor.length === 0) return 'No known works';
    return knownFor.slice(0, 3).join(', ');
  };

  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case 'acting':
        return 'primary';
      case 'directing':
        return 'secondary';
      case 'production':
        return 'success';
      case 'writing':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          <Typography variant="h6">Who did you mean?</Typography>
        </Box>
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <List sx={{ width: '100%' }}>
          {results.map((person: PersonSearchResult, index: number) => (
            <ListItem
              key={person.id}
              disablePadding
              sx={{
                borderBottom: index < results.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
              }}
            >
              <ListItemButton
                onClick={() => handleSelectPerson(person)}
                selected={selectedPerson?.id === person.id}
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '12',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '20',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={buildTMDBImagePath(person.profileImage, 'w185')}
                    sx={{
                      width: 64,
                      height: 96,
                      borderRadius: 1,
                      mr: 2,
                      backgroundColor: theme.palette.grey[200],
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" component="span">
                        {person.name}
                      </Typography>
                      {selectedPerson?.id === person.id && (
                        <Chip label="Selected" size="small" color="primary" variant="filled" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={person.department}
                          size="small"
                          color={getDepartmentColor(person.department)}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Popularity: {person.popularity.toFixed(1)}
                        </Typography>
                      </Box>

                      {person.knownFor.length > 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            fontStyle: 'italic',
                          }}
                        >
                          Known for: {formatKnownFor(person.knownFor)}
                        </Typography>
                      )}
                    </Box>
                  }
                  slotProps={{
                    secondary: {
                      component: 'div',
                      variant: 'body2',
                      color: 'text.secondary',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {results.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              px: 3,
            }}
          >
            <PersonIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No people found
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Try adjusting your search terms or check the spelling.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
