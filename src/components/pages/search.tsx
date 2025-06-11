import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import axiosInstance from '../../app/api/axiosInstance';
import { SEARCH_TYPE_OPTIONS, SegmentedControl } from '../common/controls/segmentedControl';
import SearchResults from '../common/search/searchResults';
import { DiscoverAndSearchResponse, DiscoverAndSearchResult } from '@ajgifford/keepwatching-types';
import { AxiosResponse } from 'axios';

function Search() {
  const [results, setResults] = useState<DiscoverAndSearchResult[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('shows');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [totalResults, setTotalResults] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [year, setYear] = useState<string>('');
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 46 }, (_, i) => currentYear - i);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastResultElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && results.length < totalResults) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, results.length, totalResults]
  );

  const sortResults = useCallback(
    (
      results: DiscoverAndSearchResult[],
      localSortBy = sortBy,
      localSortOrder = sortOrder
    ): DiscoverAndSearchResult[] => {
      if (sortBy === 'none') {
        return results;
      }
      return [...results].sort((a, b) => {
        switch (localSortBy) {
          case 'first_air_date':
            return localSortOrder === 'asc'
              ? new Date(b.premiered || 0).getTime() - new Date(a.premiered || 0).getTime()
              : new Date(a.premiered || 0).getTime() - new Date(b.premiered || 0).getTime();
          case 'popularity':
            return localSortOrder === 'asc'
              ? (b.popularity || 0) - (a.popularity || 0)
              : (a.popularity || 0) - (b.popularity || 0);
          case 'rating':
            return localSortOrder === 'asc' ? (b.rating || 0) - (a.rating || 0) : (a.rating || 0) - (b.rating || 0);
          case 'title':
          default:
            return localSortOrder === 'asc'
              ? (a.title || '').localeCompare(b.title || '')
              : (b.title || '').localeCompare(a.title || '');
        }
      });
    },
    [sortBy, sortOrder]
  );

  const performSearch = useCallback(
    async (isNewSearch = false) => {
      if (!searchText.trim()) return;

      setIsLoading(true);
      setError('');

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
        if (response.status !== 200) throw new Error('Search failed');

        const newResults = response.data.results;
        if (isNewSearch) {
          setTotalResults(response.data.totalResults || 0);
          setResults(sortResults(newResults));
        } else {
          setResults((prev) => sortResults([...prev, ...newResults]));
        }

        setHasMore(newResults.length > 0);
        setSearchPerformed(true);
      } catch (error) {
        setError('Failed to perform search. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [searchText, page, year, searchType, sortResults]
  );

  useEffect(() => {
    if (page > 1) {
      performSearch();
    }
  }, [page, performSearch]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  function replaceSpacesWithPlus(input: string): string {
    return input.replace(/ /g, '+');
  }

  const handleSearch = (e: React.UIEvent) => {
    e.preventDefault();
    setPage(1);
    setResults([]);
    setTotalResults(0);
    performSearch(true);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch(event);
    }
  };

  const handleSearchTypeChange = (newValue: string) => {
    setSearchType(newValue);
    handleSearchClear();
  };

  const handleFilterChange = () => {
    setPage(1);
    setTotalResults(0);
    setSearchPerformed(false);
    setResults([]);
  };

  const handleSearchClear = () => {
    setSearchText('');
    setResults([]);
    setPage(1);
    setTotalResults(0);
    setSearchPerformed(false);
  };

  const handleSortChange = (newSortBy?: string, newSortOrder?: 'asc' | 'desc') => {
    const updatedSortBy = newSortBy || sortBy;
    const updatedSortOrder = newSortOrder || sortOrder;

    setSortBy(updatedSortBy);
    setSortOrder(updatedSortOrder);
    setResults((prev) => sortResults([...prev], updatedSortBy, updatedSortOrder));
  };

  return (
    <div>
      <Typography variant="h4">Search</Typography>
      <Box display="flex" alignItems="center" marginY="8px">
        <TextField
          id="searchTextField"
          label={searchType === 'shows' ? 'Show Name' : 'Movie Name'}
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyPress}
          fullWidth
          slotProps={{
            input: {
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <Tooltip title="Clear Search">
                    <IconButton aria-label="clear search" onClick={handleSearchClear} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              padding: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center', // Vertical center
              height: '100%',
            }}
          >
            <SegmentedControl
              options={SEARCH_TYPE_OPTIONS}
              value={searchType}
              onChange={handleSearchTypeChange}
              fullWidth={false}
              variant="outlined"
              color="primary"
              sx={{
                '& .MuiButtonGroup-root': {
                  height: 56, // Match the height of other form controls
                },
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Premier Year</InputLabel>
            <Select
              value={year}
              label="Year"
              onChange={(e) => {
                setYear(e.target.value);
                handleFilterChange();
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem value="">Any Year</MenuItem>
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year.toString()}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => handleSortChange(e.target.value)}>
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="first_air_date">First Air Date</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="popularity">Popularity</MenuItem>
              </Select>
            </FormControl>
            {sortBy === 'none' ? (
              <IconButton color="primary" disabled sx={{ alignSelf: 'center' }}>
                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </IconButton>
            ) : (
              <Tooltip title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}>
                <IconButton
                  color="primary"
                  onClick={() => handleSortChange(undefined, sortOrder === 'asc' ? 'desc' : 'asc')}
                  sx={{ alignSelf: 'center' }}
                >
                  {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
            disabled={isLoading}
            onClick={handleSearch}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </Grid>
      </Grid>
      {totalResults > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {results.length} of {totalResults} results
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <SearchResults
        results={results}
        searchType={searchType}
        source="search"
        isLoading={isLoading}
        searchPerformed={searchPerformed}
        lastResultElementRef={lastResultElementRef}
      />
    </div>
  );
}

export default Search;
