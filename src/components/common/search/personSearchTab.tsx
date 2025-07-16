import React, { useEffect, useRef, useState } from 'react';

import { Alert, Box, Button, TextField } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ActivityNotificationType, showActivityNotification } from '../../../app/slices/activityNotificationSlice';
import {
  clearPersonSearch,
  fetchPersonDetails,
  searchPeople,
  selectPersonSearchError,
  selectPersonSearchHasMore,
  selectPersonSearchLoading,
  selectPersonSearchPage,
  selectSelectedPerson,
} from '../../../app/slices/personSearchSlice';
import { LoadingComponent } from '../loadingComponent';
import { PersonConfidenceBanner } from '../person/personConfidenceBanner';
import { PersonDisambiguationModal } from '../person/personDisambiguationModal';
import { PersonFilmographyDisplay } from '../person/personFilmographyDisplay';
import { SearchEmptyState } from './searchEmptyState';

export const PersonSearchTab: React.FC = () => {
  const dispatch = useAppDispatch();

  // Component's own state
  const [searchText, setSearchText] = useState<string>('');
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // Redux state
  const selectedPerson = useAppSelector(selectSelectedPerson);
  const personLoading = useAppSelector(selectPersonSearchLoading);
  const personError = useAppSelector(selectPersonSearchError);
  const personHasMore = useAppSelector(selectPersonSearchHasMore);
  const personPage = useAppSelector(selectPersonSearchPage);

  // Ref for infinite scroll
  const personObserverRef = useRef<IntersectionObserver | null>(null);

  // Reset state when component mounts
  useEffect(() => {
    setSearchText('');
    setSearchPerformed(false);
    dispatch(clearPersonSearch());
  }, [dispatch]);

  // Auto-fetch person details when a person is selected (from auto-selection or manual selection)
  useEffect(() => {
    console.log('useEffect - selectedPerson');
    if (selectedPerson && selectedPerson.id && !selectedPerson.movieCredits) {
      console.log('useEffect - selectedPerson - conditions met, dispatching', selectedPerson);
      dispatch(fetchPersonDetails(selectedPerson.id));
    }
  }, [selectedPerson, dispatch]);

  // Infinite scroll for person search
  useEffect(() => {
    if (personHasMore && !personLoading && searchText.trim()) {
      const lastPersonElement = document.querySelector('.person-credit-item:last-child');
      if (lastPersonElement) {
        if (personObserverRef.current) personObserverRef.current.disconnect();

        personObserverRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && !personLoading) {
              dispatch(searchPeople({ searchString: searchText, page: personPage + 1 }));
            }
          },
          { threshold: 1.0 }
        );

        personObserverRef.current.observe(lastPersonElement);
      }
    }

    return () => {
      if (personObserverRef.current) {
        personObserverRef.current.disconnect();
      }
    };
  }, [personHasMore, personLoading, dispatch, searchText, personPage]);

  const handleSearch = () => {
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
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
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

      {personLoading && !selectedPerson ? (
        <LoadingComponent />
      ) : selectedPerson ? (
        <>
          <PersonConfidenceBanner />
          <PersonFilmographyDisplay person={selectedPerson} />
          <PersonDisambiguationModal />
        </>
      ) : (
        <SearchEmptyState
          searchType="people"
          isNoResults={searchPerformed && searchText.trim() !== '' && !personLoading}
          searchQuery={searchText}
        />
      )}
    </>
  );
};
