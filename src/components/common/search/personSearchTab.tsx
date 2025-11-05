import React, { useCallback, useEffect, useState } from 'react';

import { Alert, Box, Button, TextField } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ActivityNotificationType, showActivityNotification } from '../../../app/slices/activityNotificationSlice';
import {
  clearPersonSearch,
  fetchPersonDetails,
  searchPeople,
  selectPersonSearchError,
  selectPersonSearchLoading,
  selectPersonSearchResults,
  selectSelectedPerson,
  selectShowDisambiguation,
} from '../../../app/slices/personSearchSlice';
import { PersonConfidenceBanner } from '../person/personConfidenceBanner';
import { PersonDisambiguationModal } from '../person/personDisambiguationModal';
import { PersonFilmographyDisplay } from '../person/personFilmographyDisplay';
import { SearchEmptyState } from './searchEmptyState';
import { LoadingComponent } from '@ajgifford/keepwatching-ui';

export const PersonSearchTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Redux selectors
  const personResults = useAppSelector(selectPersonSearchResults);
  const selectedPerson = useAppSelector(selectSelectedPerson);
  const showDisambiguation = useAppSelector(selectShowDisambiguation);
  const personLoading = useAppSelector(selectPersonSearchLoading);
  const personError = useAppSelector(selectPersonSearchError);

  // Setup infinite scroll for person results
  useEffect(() => {
    if (selectedPerson && selectedPerson.id) {
      // Check if this is a PersonSearchResult (missing credits) or incomplete PersonDetails
      const needsDetails =
        !selectedPerson.movieCredits || !selectedPerson.tvCredits || selectedPerson.totalCredits === undefined;

      if (needsDetails) {
        dispatch(fetchPersonDetails(selectedPerson.id));
      }
    }
  }, [selectedPerson, dispatch]);

  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;

    dispatch(clearPersonSearch());
    setSearchPerformed(true);

    dispatch(searchPeople({ searchString: searchText, page: 1 })).catch(() => {
      dispatch(
        showActivityNotification({
          message: 'Failed to search people. Please try again.',
          type: ActivityNotificationType.Error,
        })
      );
    });
  }, [dispatch, searchText]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const renderSearchResults = () => {
    // Show loading for initial search
    if (personLoading && !selectedPerson && personResults.length === 0) {
      return <LoadingComponent />;
    }

    if (selectedPerson) {
      return (
        <>
          <PersonConfidenceBanner />
          <PersonFilmographyDisplay person={selectedPerson} />
          <PersonDisambiguationModal />
        </>
      );
    }

    // Show disambiguation modal if we have results but no selected person
    if (showDisambiguation || (personResults.length > 0 && searchPerformed && !selectedPerson)) {
      return <PersonDisambiguationModal />;
    }

    // Show empty state for no results or initial state
    return (
      <SearchEmptyState
        searchType="people"
        isNoResults={searchPerformed && searchText.trim() !== '' && !personLoading && personResults.length === 0}
        searchQuery={searchText}
      />
    );
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center">
          <TextField
            id="personSearchTextField"
            label="Search for actors, directors, writers..."
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={handleSearch} disabled={personLoading}>
            Search
          </Button>
        </Box>
      </Box>

      {personError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {personError}
        </Alert>
      )}

      {renderSearchResults()}
    </>
  );
};
