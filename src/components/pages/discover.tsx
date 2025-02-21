import { useState } from 'react';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button, CircularProgress, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppDispatch } from '../../app/hooks';
import { SearchResult } from '../../app/model/search';
import { ActivityNotificationType, showActivityNotification } from '../../app/slices/activityNotificationSlice';
import SearchResults from '../common/searchResults';
import { AxiosError } from 'axios';

type ServiceType = 'none' | 'netflix' | 'disney' | 'hbo' | 'apple' | 'prime';
type ContentType = 'none' | 'movies' | 'series';

function Discover() {
  const dispatch = useAppDispatch();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceType>('none');
  const [selectedType, setSelectedType] = useState<ContentType>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

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

  const sortedServices = services.sort((a, b) => a.display.localeCompare(b.display, 'en', { sensitivity: 'base' }));

  const handleServiceChanged = (value: ServiceType) => {
    setSelectedService(value);
  };

  const handleTypeChanged = (value: ContentType) => {
    setSelectedType(value);
  };

  const findTopContent = async () => {
    setIsLoading(true);
    const topParams = {
      showType: selectedType === 'movies' ? 'movie' : selectedType,
      service: selectedService,
    };
    try {
      const topResponse = await axiosInstance.get('/discover/top', { params: topParams });
      setSearchPerformed(true);
      setResults(topResponse.data.results);
    } catch (error: unknown) {
      let errorMessage = 'Failed to load content';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message;
      }
      dispatch(
        showActivityNotification({
          message: errorMessage,
          type: ActivityNotificationType.Error,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h4">Discover</Typography>
      <Stack spacing={{ xs: 1, sm: 2 }} direction="row" alignItems="center" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
        <Typography variant="subtitle1" align="justify">
          Service:
        </Typography>
        <FormControl id="discoverServiceControl">
          <Select
            id="discoverServiceSelect"
            value={selectedService}
            onChange={(e) => handleServiceChanged(e.target.value as ServiceType)}
          >
            {sortedServices.map((service) => (
              <MenuItem id={`discoverServiceFilter_${service.id}`} key={service.id} value={service.id}>
                {service.display}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl id="discoverTypeControl">
          <Select
            id="discoverTypeSelect"
            value={selectedType}
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
          id="discoverGoButton"
          variant="outlined"
          onClick={findTopContent}
          startIcon={isLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          disabled={selectedService === 'none' || selectedType === 'none' || isLoading}
        >
          {isLoading ? 'Loading...' : 'Go'}
        </Button>
      </Stack>
      {results.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {results.length} results
        </Typography>
      )}
      <SearchResults
        results={results}
        searchType={selectedType}
        source="discover"
        isLoading={isLoading}
        searchPerformed={searchPerformed}
      />
    </>
  );
}

export default Discover;
