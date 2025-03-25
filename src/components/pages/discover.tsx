import { useCallback, useEffect, useRef, useState } from 'react';

import ExploreIcon from '@mui/icons-material/Explore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppDispatch } from '../../app/hooks';
import { SearchResult } from '../../app/model/search';
import { ActivityNotificationType, showActivityNotification } from '../../app/slices/activityNotificationSlice';
import SearchResults from '../common/search/searchResults';
import { AxiosError } from 'axios';

type ServiceType = 'none' | 'netflix' | 'disney' | 'hbo' | 'apple' | 'prime';
type ContentType = 'none' | 'movies' | 'series';
type DiscoverMode = 'byService' | 'trending';
type ContentFilterType = 'top' | 'new' | 'upcoming' | 'expiring';

interface DiscoverParams {
  showType: 'none' | 'movie' | 'series';
  service?: ServiceType;
  changeType?: ContentFilterType;
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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceType>('none');
  const [selectedType, setSelectedType] = useState<ContentType>('none');
  const [selectedFilter, setSelectedFilter] = useState<ContentFilterType>('top');
  const [discoverMode, setDiscoverMode] = useState<DiscoverMode>('trending');
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const services = [
    { id: 'none', display: '---' },
    { id: 'netflix', display: 'Netflix' },
    { id: 'disney', display: 'Disney+' },
    { id: 'hbo', display: 'Max' },
    { id: 'apple', display: 'Apple TV+' },
    { id: 'prime', display: 'Prime Video' },
  ];

  const type = [
    { id: 'none', display: '---' },
    { id: 'movies', display: 'Movies' },
    { id: 'series', display: 'Shows' },
  ];

  const filters = [
    { id: 'top', display: 'Top Rated' },
    { id: 'new', display: 'New Releases' },
    { id: 'upcoming', display: 'Upcoming' },
    { id: 'expiring', display: 'Expiring Soon' },
  ];

  const sortedServices = services.sort((a, b) => a.display.localeCompare(b.display, 'en', { sensitivity: 'base' }));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setDiscoverMode(newValue === 0 ? 'trending' : 'byService');
    resetSearch();
  };

  const resetSearch = () => {
    setResults([]);
    setPage(1);
    setSearchPerformed(false);
    setSelectedService('none');
    setSelectedType('none');
    if (discoverMode !== 'trending') {
      setSelectedFilter('top');
    }
  };

  const handleServiceChanged = (value: ServiceType) => {
    setSelectedService(value);
    setResults([]);
    setPage(1);
    setSearchPerformed(false);
  };

  const handleTypeChanged = (value: ContentType) => {
    setSelectedType(value);
    setResults([]);
    setPage(1);
    setSearchPerformed(false);
  };

  const handleFilterChanged = (value: ContentFilterType) => {
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
        const response = await axiosInstance.get(endpoint, { params });

        if (isNewSearch) {
          setResults(response.data.results);
          setTotalResults(response.data.total_results || 0);
        } else {
          setResults((prev) => [...prev, ...response.data.results]);
        }

        setSearchPerformed(true);
        setHasMore(response.data.current_page < response.data.total_pages);
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
              <FormControl
                sx={{
                  width: { xs: '100%', md: 'auto' },
                  minWidth: { md: '300px' },
                }}
                id="discoverTypeControl"
              >
                <InputLabel>Content Type</InputLabel>
                <Select
                  id="discoverTypeSelect"
                  value={selectedType}
                  label="Content Type"
                  onChange={(e) => handleTypeChanged(e.target.value as ContentType)}
                >
                  {type.map((type) => (
                    <MenuItem id={`discoverTypeFilter_${type.id}`} key={type.id} value={type.id}>
                      {type.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                <FormControl
                  sx={{
                    width: { xs: '50%', md: 'auto' },
                    minWidth: { md: '300px' },
                  }}
                  id="discoverServiceControl"
                >
                  <InputLabel>Streaming Service</InputLabel>
                  <Select
                    id="discoverServiceSelect"
                    value={selectedService}
                    label="Streaming Service"
                    onChange={(e) => handleServiceChanged(e.target.value as ServiceType)}
                  >
                    {sortedServices.map((service) => (
                      <MenuItem id={`discoverServiceFilter_${service.id}`} key={service.id} value={service.id}>
                        {service.display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  sx={{
                    width: { xs: '50%', md: 'auto' },
                    minWidth: { md: '300px' },
                  }}
                  id="discoverTypeControlTop"
                >
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    id="discoverTypeSelectTop"
                    value={selectedType}
                    label="Content Type"
                    onChange={(e) => handleTypeChanged(e.target.value as ContentType)}
                  >
                    {type.map((type) => (
                      <MenuItem id={`discoverTypeFilterTop_${type.id}`} key={type.id} value={type.id}>
                        {type.display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  sx={{
                    width: { xs: '100%', md: 'auto' },
                    minWidth: { md: '200px' },
                  }}
                  id="discoverFilterControl"
                >
                  <InputLabel>Filter</InputLabel>
                  <Select
                    id="discoverFilterSelect"
                    value={selectedFilter}
                    label="Filter"
                    onChange={(e) => handleFilterChanged(e.target.value as ContentFilterType)}
                  >
                    {filters.map((filter) => (
                      <MenuItem id={`discoverFilterOption_${filter.id}`} key={filter.id} value={filter.id}>
                        {filter.display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
