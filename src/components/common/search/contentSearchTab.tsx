import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material';

import axiosInstance from '../../../app/api/axiosInstance';
import { useAppDispatch } from '../../../app/hooks';
import { ActivityNotificationType, showActivityNotification } from '../../../app/slices/activityNotificationSlice';
import { LoadingComponent } from '../loadingComponent';
import SearchResults from './searchResults';
import { DiscoverAndSearchResponse, DiscoverAndSearchResult } from '@ajgifford/keepwatching-types';
import { AxiosError, AxiosResponse } from 'axios';

interface ContentSearchTabProps {
  searchType: 'movies' | 'shows';
}

export const ContentSearchTab: React.FC<ContentSearchTabProps> = ({ searchType }) => {
  const dispatch = useAppDispatch();

  const [searchText, setSearchText] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [results, setResults] = useState<DiscoverAndSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 46 }, (_, i) => currentYear - i);

  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getSearchLabel = () => {
    return searchType === 'movies' ? 'Search for movies...' : 'Search for TV shows...';
  };

  const getFieldIds = () => {
    const prefix = searchType === 'movies' ? 'movie' : 'show';
    return {
      searchField: `${prefix}SearchTextField`,
      yearField: `${prefix}YearFilter`,
    };
  };

  const sortResults = useCallback((results: DiscoverAndSearchResult[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return results.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'popularity.desc':
          comparison = (b.popularity || 0) - (a.popularity || 0);
          break;
        case 'title.asc':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'release_date.desc':
          comparison = new Date(b.premiered || '').getTime() - new Date(a.premiered || '').getTime();
          break;
        default:
          comparison = (b.popularity || 0) - (a.popularity || 0);
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }, []);

  const replaceSpacesWithPlus = (input: string): string => {
    return input.replace(/ /g, '+');
  };

  const performSearch = useCallback(
    async (isNewSearch: boolean = false) => {
      if (!searchText.trim()) return;

      setIsLoading(true);
      try {
        const searchString = replaceSpacesWithPlus(searchText);
        const searchOptions = {
          searchString,
          page: isNewSearch ? '1' : page.toString(),
          ...(year && { year }),
        };
        const response: AxiosResponse<DiscoverAndSearchResponse> = await axiosInstance.get(`/search/${searchType}`, {
          params: searchOptions,
        });

        const newResults = response.data.results.map((result) => ({
          ...result,
          popularity: result.popularity || 0,
        }));

        const sortedResults = sortResults(newResults, sortBy, sortOrder);

        if (isNewSearch) {
          setResults(sortedResults);
          setPage(2);
        } else {
          setResults((prev) => [...prev, ...sortedResults]);
          setPage((prev) => prev + 1);
        }

        setTotalResults(response.data.totalResults);
        setSearchPerformed(true);
      } catch (error) {
        let message = 'Search failed. Please try again.';
        if (error instanceof AxiosError) {
          message = error.response?.data || error.message;
        }
        dispatch(
          showActivityNotification({
            message,
            type: ActivityNotificationType.Error,
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [searchText, page, year, searchType, sortResults, sortBy, sortOrder, dispatch]
  );

  // Infinite scroll setup
  useEffect(() => {
    if (searchPerformed && !isLoading) {
      const lastResultElement = document.querySelector('.search-result-item:last-child');
      if (lastResultElement && results.length < totalResults) {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && !isLoading) {
              performSearch();
            }
          },
          { threshold: 1.0 }
        );

        observerRef.current.observe(lastResultElement);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [searchPerformed, isLoading, results.length, totalResults, performSearch]);

  // Reset search when search type changes (component remounts)
  useEffect(() => {
    setSearchText('');
    setYear('');
    setSortBy('popularity.desc');
    setSortOrder('desc');
    setResults([]);
    setPage(1);
    setTotalResults(0);
    setSearchPerformed(false);
  }, [searchType]);

  const handleSearch = () => {
    setPage(1);
    setResults([]);
    setTotalResults(0);
    setSearchPerformed(true);
    performSearch(true);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSortChange = (newSortBy?: string, newSortOrder?: 'asc' | 'desc') => {
    const updatedSortBy = newSortBy || sortBy;
    const updatedSortOrder = newSortOrder || sortOrder;

    setSortBy(updatedSortBy);
    setSortOrder(updatedSortOrder);
    setResults((prev) => sortResults([...prev], updatedSortBy, updatedSortOrder));
  };

  const handleFilterChange = () => {
    setPage(1);
    setTotalResults(0);
    setSearchPerformed(false);
    setResults([]);
  };

  const getYearLabel = (): string => {
    switch (searchType) {
      case 'shows':
        return 'First Air Date Year';
      case 'movies':
        return 'Release Year';
      default:
        return 'Year';
    }
  };

  const { searchField, yearField } = getFieldIds();

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" marginBottom="16px">
          <TextField
            id={searchField}
            label={getSearchLabel()}
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id={yearField}>{getYearLabel()}</InputLabel>
            <Select
              labelId="year-select-label"
              value={year}
              label={getYearLabel()}
              onChange={(e) => {
                setYear(e.target.value);
                handleFilterChange();
              }}
            >
              <MenuItem value="">All Years</MenuItem>
              {yearOptions.map((yearOption) => (
                <MenuItem key={yearOption} value={yearOption.toString()}>
                  {yearOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {results.length > 0 && (
            <>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="first_air_date">{searchType === 'shows' ? 'Air Date' : 'Release Date'}</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="popularity">Popularity</MenuItem>
                </Select>
              </FormControl>

              {sortBy !== 'none' && (
                <Tooltip title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}>
                  <IconButton
                    onClick={() => handleSortChange(undefined, sortOrder === 'asc' ? 'desc' : 'asc')}
                    color="primary"
                  >
                    {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      </Box>

      {isLoading && page === 1 ? (
        <LoadingComponent />
      ) : (
        <SearchResults
          results={results}
          searchType={searchType}
          source="search"
          isLoading={isLoading}
          searchPerformed={searchPerformed}
          searchQuery={searchText}
        />
      )}
    </>
  );
};
