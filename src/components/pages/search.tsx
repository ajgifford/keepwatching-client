import React, { useState } from 'react';

import MovieIcon from '@mui/icons-material/Movie';
import PersonIcon from '@mui/icons-material/Person';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';

import { useAppDispatch } from '../../app/hooks';
import { clearPersonSearch } from '../../app/slices/personSearchSlice';
import { ContentSearchTab } from '../common/search/contentSearchTab';
import { PersonSearchTab } from '../common/search/personSearchTab';
import { TabPanel, a11yProps } from '../common/tabs/tabPanel';

function Search() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchType, setSearchType] = useState<'movies' | 'shows' | 'people'>('shows');

  // Tab value mapping
  const getTabValue = () => {
    switch (searchType) {
      case 'shows':
        return 0;
      case 'movies':
        return 1;
      case 'people':
        return 2;
      default:
        return 0;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const newSearchType = newValue === 0 ? 'shows' : newValue === 1 ? 'movies' : 'people';
    setSearchType(newSearchType);
    dispatch(clearPersonSearch());
  };

  return (
    <div>
      <Typography variant="h4">Search</Typography>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={getTabValue()}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          aria-label="search type tabs"
        >
          <Tab icon={<TvIcon />} iconPosition="start" label="TV Shows" {...a11yProps(0)} />
          <Tab icon={<MovieIcon />} iconPosition="start" label="Movies" {...a11yProps(1)} />
          <Tab icon={<PersonIcon />} iconPosition="start" label="People" {...a11yProps(2)} />
        </Tabs>
      </Box>

      {/* TV Shows Tab */}
      <TabPanel value={getTabValue()} index={0}>
        <ContentSearchTab searchType="shows" />
      </TabPanel>

      {/* Movies Tab */}
      <TabPanel value={getTabValue()} index={1}>
        <ContentSearchTab searchType="movies" />
      </TabPanel>

      {/* People Tab */}
      <TabPanel value={getTabValue()} index={2}>
        <PersonSearchTab />
      </TabPanel>
    </div>
  );
}

export default Search;
