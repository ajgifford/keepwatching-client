import { useCallback, useEffect, useRef, useState } from 'react';

import ExploreIcon from '@mui/icons-material/Explore';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppDispatch } from '../../app/hooks';
import { CommunityRecommendationsSection } from '../common/recommendations/communityRecommendationsSection';
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

type DiscoverMode = 'byService' | 'trending' | 'community';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    const newMode: DiscoverMode = newValue === 0 ? 'trending' : newValue === 1 ? 'byService' : 'community';
    setTabValue(newValue);
    setDiscoverMode(newMode);
    setSelectedService(defaultService);
    setSelectedType(defaultType);
    if (newMode === 'trending') {
      setSelectedFilter('top');
    }
  };

  const handleServiceChanged = (value: string) => setSelectedService(value);
  const handleTypeChanged = (value: string) => setSelectedType(value);
  const handleFilterChanged = (value: string) => setSelectedFilter(value);

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
    async (pageToLoad: number) => {
      if (discoverMode === 'community') return;
      if (pageToLoad === 1) {
        setSearchPerformed(false);
      }
      setIsLoading(true);

      let endpoint: string;
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
        page: pageToLoad,
      };
      if (discoverMode === 'byService') {
        params.service = selectedService;
        if (selectedFilter !== 'top') {
          params.changeType = selectedFilter;
        }
      }

      try {
        const response: AxiosResponse<DiscoverAndSearchResponse> = await axiosInstance.get(endpoint, { params });

        if (pageToLoad === 1) {
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
    [discoverMode, dispatch, selectedFilter, selectedService, selectedType]
  );

  // Fetch fresh results on mount and whenever any filter value changes.
  // findContent is recreated (via useCallback) when discoverMode, selectedType,
  // selectedService, or selectedFilter change, so this effect fires automatically.
  useEffect(() => {
    setPage(1);
    setResults([]);
    setTotalResults(0);
    setHasMore(true);
    findContent(1);
  }, [findContent]);

  // Load the next page when the infinite scroll observer increments the page counter.
  // findContent is intentionally omitted from deps: page only increments after a
  // successful load, so the closure always holds the correct filter values.
  useEffect(() => {
    if (page > 1) {
      findContent(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Discover
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: '8px' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="discover content tabs" variant="fullWidth">
              <Tab label="Trending Content" icon={<TrendingUpIcon />} iconPosition={isMobile ? 'top' : 'start'} {...a11yProps(0)} />
              <Tab label="By Service" icon={<ExploreIcon />} iconPosition={isMobile ? 'top' : 'start'} {...a11yProps(1)} />
              <Tab label="Community" icon={<GroupsIcon />} iconPosition={isMobile ? 'top' : 'start'} {...a11yProps(2)} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems={{ xs: 'stretch', md: 'center' }}
              sx={{ p: '8px', m: '1px' }}
            >
              <SegmentedControl
                options={DISCOVER_TYPE_OPTIONS}
                value={selectedType}
                onChange={handleTypeChanged}
                fullWidth={isMobile}
                variant="outlined"
                color="primary"
                sx={{
                  '& .MuiButtonGroup-root': {
                    height: 56,
                  },
                }}
              />
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems={{ xs: 'stretch', md: 'center' }}
              sx={{ p: '8px', m: '1px' }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ width: { xs: '100%', md: 'auto' } }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: { xs: '100%', md: 'auto' },
                  }}
                >
                  <SegmentedControl
                    options={DISCOVER_TYPE_OPTIONS}
                    value={selectedType}
                    onChange={handleTypeChanged}
                    fullWidth={isMobile}
                    variant="outlined"
                    color="primary"
                    sx={{
                      '& .MuiButtonGroup-root': {
                        height: 56,
                      },
                    }}
                  />
                </Box>

                {isMobile ? <Divider orientation="horizontal" flexItem /> : <Divider orientation="vertical" flexItem sx={{ height: 56 }} />}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: { xs: '100%', md: 'auto' },
                  }}
                >
                  <SegmentedControl
                    options={SERVICE_OPTIONS}
                    value={selectedService}
                    onChange={handleServiceChanged}
                    fullWidth={isMobile}
                    compact={isMobile}
                    size={isMobile ? 'small' : 'medium'}
                    variant="outlined"
                    color="success"
                    sx={{
                      '& .MuiButtonGroup-root': {
                        height: 56,
                      },
                    }}
                  />
                </Box>

                {isMobile ? <Divider orientation="horizontal" flexItem /> : <Divider orientation="vertical" flexItem sx={{ height: 56 }} />}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: { xs: '100%', md: 'auto' },
                  }}
                >
                  <SegmentedControl
                    options={FILTER_OPTIONS}
                    value={selectedFilter}
                    onChange={handleFilterChanged}
                    fullWidth={isMobile}
                    compact={isMobile}
                    size={isMobile ? 'small' : 'medium'}
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
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <CommunityRecommendationsSection returnPath="/discover" />
          </TabPanel>
        </CardContent>
      </Card>

      {discoverMode !== 'community' && results.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {results.length} {totalResults > 0 ? `of ${totalResults}` : ''} results
        </Typography>
      )}

      {discoverMode !== 'community' && (
        <SearchResults
          results={results}
          searchType={selectedType === 'movies' ? 'movies' : 'shows'}
          source="discover"
          isLoading={isLoading}
          searchPerformed={searchPerformed}
          lastResultElementRef={lastResultElementRef}
        />
      )}

      {discoverMode !== 'community' && isLoading && page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: '20px' }}>
          <CircularProgress size={30} />
        </Box>
      )}
    </>
  );
}

export default Discover;
