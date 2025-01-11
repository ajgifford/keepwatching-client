import { useState } from 'react';
import React from 'react';

import { Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { SearchResult } from '../../app/model/search';
import SearchResults from '../common/searchResults';

function Search() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('shows');

  const handleSearch = async () => {
    const searchString = replaceSpacesWithPlus(searchText);
    const searchOptions = {
      searchString: searchString,
    };
    try {
      const response = await axiosInstance.get(`/api/search/${searchType}`, { params: searchOptions });
      setResults(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  function replaceSpacesWithPlus(input: string): string {
    return input.replace(/ /g, '+');
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchType((event.target as HTMLInputElement).value);
    setSearchText('');
    setResults([]);
  };

  return (
    <div>
      <Typography variant="h4">Search</Typography>
      <Box display="flex" alignItems="center" marginY="8px">
        <TextField
          id="searchTextField"
          label="Search"
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyPress}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginLeft: '8px' }}>
          Search
        </Button>
      </Box>
      <Box display="flex" alignItems="center">
        <FormControl id="searchFilterContentTypeControl">
          <RadioGroup
            id="searchFilterContentTypeRadioGroup"
            row
            name="search-type-radio-buttons-group"
            value={searchType}
            onChange={handleSearchTypeChange}
          >
            <FormControlLabel
              id="searchFilterContentTypeShowsRadio"
              value="shows"
              control={<Radio />}
              label="TV Shows"
            />
            <FormControlLabel
              id="searchFilterContentTypeMoviesRadio"
              value="movies"
              control={<Radio />}
              label="Movies"
            />
          </RadioGroup>
        </FormControl>
      </Box>
      <SearchResults results={results} searchType={searchType} />
    </div>
  );
}

export default Search;
