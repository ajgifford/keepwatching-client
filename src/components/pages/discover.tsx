import { useState } from 'react';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { SearchResult } from '../../app/model/search';
import SearchResults from '../common/searchResults';

function Discover() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedService, setSelectedService] = useState<string>('none');
  const [selectedType, setSelectedType] = useState<string>('none');

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

  const handleServiceChanged = (value: string) => {
    setSelectedService(value);
  };

  const handleTypeChanged = (value: string) => {
    setSelectedType(value);
  };

  const findTopContent = async () => {
    const topParams = {
      showType: selectedType === 'movies' ? 'movie' : selectedType,
      service: selectedService,
    };
    try {
      const topResponse = await axiosInstance.get('/api/discover/top', { params: topParams });
      setResults(topResponse.data.results);
    } catch (error) {
      console.error(error);
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
            onChange={(e) => handleServiceChanged(e.target.value)}
          >
            {sortedServices.map((service) => (
              <MenuItem id={`discoverServiceFilter_${service.id}`} key={service.id} value={service.id}>
                {service.display}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl id="discoverTypeControl">
          <Select id="discoverTypeSelect" value={selectedType} onChange={(e) => handleTypeChanged(e.target.value)}>
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
          startIcon={<PlayArrowIcon className="icon" />}
          disabled={selectedService === 'none' || selectedType === 'none'}
        >
          Go
        </Button>
      </Stack>
      <SearchResults results={results} searchType={selectedType} />
    </>
  );
}

export default Discover;
