import { useCallback, useEffect, useRef, useState } from 'react';

import ExploreIcon from '@mui/icons-material/Explore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Button, Card, CardContent, CircularProgress, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppDispatch } from '../../app/hooks';
import { ActivityNotificationType, showActivityNotification } from '../../app/slices/activityNotificationSlice';
import {
  DISCOVER_TYPE_OPTIONS,
  FILTER_OPTIONS,
  SERVICE_OPTIONS,
  SegmentedControl,
} from '../common/controls/segmentedControl';
import SearchResults from '../common/search/searchResults';
import { DiscoverAndSearchResponse, DiscoverAndSearchResult } from '@ajgifford/keepwatching-types';
import { AxiosError, AxiosResponse } from 'axios';

type DiscoverMode = 'byService' | 'trending';

interface DiscoverParams {
  showType: string;
  service?: string;
  changeType?: string;
  page: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`discover-tabpanel-${index}`}
      aria-labelledby={`discover-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `discover-tab-${index}`,
    'aria-controls': `discover-tabpanel-${index}`,
  };
}

function Discover() {
  const dispatch = useAppDispatch();
  const defaultService = 'netflix';
  const defaultType = 'series';
  const [results, setResults] = useState<DiscoverAndSearchResult[]>([]);
  const [selectedService, setSelectedService] = useState<string>(defaultService);
  const [selectedType, setSelectedType] = useState<string>(defaultType);
  const [selectedFilter, setSelectedFilter] = useState<string>('top');
  const [discoverMode, setDiscoverMode] = useState<DiscoverMode>('trending');
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setDiscoverMode(newValue === 0 ? 'trending' : 'byService');
    resetSearch();
  };

  const resetSearch = () => {
    setResults([]);
    setPage(1);
    setSearchPerformed(false);
    setSelectedService(defaultService);
    setSelectedType(defaultType);
    if (discoverMode !== 'trending') {
      setSelectedFilter('top');
    }
  };

  const handleServiceChanged = (value: string) => {
    setSelectedService(value);
    setResults([]);
    setPage(1);
    setSearchPerformed(false);
  };

  const handleTypeChanged = (value: string) => {
    setSelectedType(value);
    setResults([]);
    setPage(1);
    setSearchPerformed(false);
  };

  const handleFilterChanged = (value: string) => {
    setSelectedFilter(value);
    setResults([]);
    setPage(1);
    setSearchPerformed(false);
  };

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

  const findContent = useCallback(
    async (isNewSearch = false) => {
      setIsLoading(true);
      const currentPage = isNewSearch ? 1 : page;
      let endpoint = '';
      if (discoverMode === 'trending') {
        endpoint = '/discover/trending';
      } else {
        switch (selectedFilter) {
          case 'top':
            endpoint = '/discover/top';
            break;
          default:
            endpoint = '/discover/changes';
            break;
        }
      }

      const params: DiscoverParams = {
        showType: selectedType === 'movies' ? 'movie' : selectedType,
        page: currentPage,
      };
      if (discoverMode === 'byService') {
        params.service = selectedService;
        if (selectedFilter !== 'top') {
          params.changeType = selectedFilter;
        }
      }

      try {
        const response: AxiosResponse<DiscoverAndSearchResponse> = await axiosInstance.get(endpoint, { params });

        if (isNewSearch) {
          setResults(response.data.results);
          setTotalResults(response.data.totalResults || 0);
        } else {
          setResults((prev) => [...prev, ...response.data.results]);
        }

        setSearchPerformed(true);
        setHasMore(response.data.currentPage < response.data.totalPages);
      } catch (error: unknown) {
        let errorMessage = 'Failed to load content';
        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.message || errorMessage;
        }
        dispatch(
          showActivityNotification({
            message: errorMessage,
            type: ActivityNotificationType.Error,
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [discoverMode, dispatch, page, selectedFilter, selectedService, selectedType]
  );

  useEffect(() => {
    if (page > 1 && searchPerformed) {
      findContent(false);
    }
  }, [page, searchPerformed, findContent]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleSearch = () => {
    setPage(1);
    setResults([]);
    setTotalResults(0);
    findContent(true);
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Discover
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: '8px' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="discover content tabs" variant="fullWidth">
              <Tab label="Trending Content" icon={<TrendingUpIcon />} iconPosition="start" {...a11yProps(0)} />
              <Tab label="By Service" icon={<ExploreIcon />} iconPosition="start" {...a11yProps(1)} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent={{ md: 'space-between' }}
              alignItems={{ md: 'center' }}
              sx={{ p: '8px', m: '1px' }}
            >
              <Box
                sx={{
                  paddingLeft: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <SegmentedControl
                  options={DISCOVER_TYPE_OPTIONS}
                  value={selectedType}
                  onChange={handleTypeChanged}
                  fullWidth={false}
                  variant="outlined"
                  color="primary"
                  sx={{
                    '& .MuiButtonGroup-root': {
                      height: 56,
                    },
                  }}
                />
              </Box>

              <Button
                id="discoverTrendingGoButton"
                variant="contained"
                size="large"
                onClick={handleSearch}
                startIcon={isLoading && page === 1 ? <CircularProgress size={20} /> : <TrendingUpIcon />}
                disabled={selectedType === 'none' || (isLoading && page === 1)}
                sx={{
                  height: '56px',
                  alignSelf: { xs: 'flex-start', md: 'center' },
                }}
              >
                {isLoading && page === 1 ? 'Loading...' : 'Find Trending Content'}
              </Button>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: '8px', m: '1px' }}>
              <Stack
                direction={{ xs: 'row', md: 'row' }}
                spacing={2}
                sx={{
                  width: { xs: '100%', md: 'auto' },
                  flex: { md: 1 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <SegmentedControl
                    options={DISCOVER_TYPE_OPTIONS}
                    value={selectedType}
                    onChange={handleTypeChanged}
                    fullWidth={false}
                    variant="outlined"
                    color="primary"
                    sx={{
                      '& .MuiButtonGroup-root': {
                        height: 56,
                      },
                    }}
                  />
                </Box>

                <Divider orientation="vertical" flexItem sx={{ height: 56 }} />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <SegmentedControl
                    options={SERVICE_OPTIONS}
                    value={selectedService}
                    onChange={handleServiceChanged}
                    fullWidth={false}
                    variant="outlined"
                    color="success"
                    sx={{
                      '& .MuiButtonGroup-root': {
                        height: 56,
                      },
                    }}
                  />
                </Box>

                <Divider orientation="vertical" flexItem sx={{ height: 56 }} />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <SegmentedControl
                    options={FILTER_OPTIONS}
                    value={selectedFilter}
                    onChange={handleFilterChanged}
                    fullWidth={false}
                    variant="outlined"
                    color="warning"
                    sx={{
                      '& .MuiButtonGroup-root': {
                        height: 56,
                      },
                    }}
                  />
                </Box>
              </Stack>
              <Button
                id="discoverTopGoButton"
                variant="contained"
                size="large"
                onClick={handleSearch}
                startIcon={isLoading && page === 1 ? <CircularProgress size={20} /> : <ExploreIcon />}
                disabled={selectedService === 'none' || selectedType === 'none' || (isLoading && page === 1)}
                sx={{
                  height: '56px',
                  alignSelf: { xs: 'flex-start', md: 'center' },
                }}
              >
                {isLoading && page === 1
                  ? 'Loading...'
                  : `Find ${selectedFilter === 'top' ? 'Top' : selectedFilter === 'new' ? 'New' : selectedFilter === 'upcoming' ? 'Upcoming' : 'Expiring'} Content`}
              </Button>
            </Stack>
          </TabPanel>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {results.length} {totalResults > 0 ? `of ${totalResults}` : ''} results
        </Typography>
      )}

      <SearchResults
        results={results}
        searchType={selectedType === 'movies' ? 'movies' : 'shows'}
        source="discover"
        isLoading={isLoading}
        searchPerformed={searchPerformed}
        lastResultElementRef={lastResultElementRef}
      />

      {isLoading && page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress size={30} />
        </div>
      )}
    </>
  );
}

export default Discover;
