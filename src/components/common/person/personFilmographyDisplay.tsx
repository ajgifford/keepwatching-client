import React, { useState } from 'react';

import { Movie as MovieIcon, Tv as TvIcon } from '@mui/icons-material';
import {
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { PersonSearchDetails } from '../../../app/model/personSearchTypes';
import { MediaCard } from '../media/mediaCard';
import { TabPanel, a11yProps } from '../tabs/tabPanel';
import { SearchPersonCredit } from '@ajgifford/keepwatching-types';
import { LoadingComponent } from '@ajgifford/keepwatching-ui';

interface PersonFilmographyDisplayProps {
  person: PersonSearchDetails;
}

type SortOption = 'release_date_desc' | 'release_date_asc' | 'popularity' | 'title';

export const PersonFilmographyDisplay: React.FC<PersonFilmographyDisplayProps> = ({ person }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tabValue, setTabValue] = useState(0);
  const [movieSort, setMovieSort] = useState<SortOption>('release_date_desc');
  const [tvSort, setTvSort] = useState<SortOption>('release_date_desc');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMovieSortChange = (event: SelectChangeEvent) => {
    setMovieSort(event.target.value as SortOption);
  };

  const handleTvSortChange = (event: SelectChangeEvent) => {
    setTvSort(event.target.value as SortOption);
  };

  const sortCredits = (credits: SearchPersonCredit[], sortOption: SortOption): SearchPersonCredit[] => {
    const sorted = [...credits];

    switch (sortOption) {
      case 'release_date_desc':
        return sorted.sort((a, b) => {
          const aDate = new Date(a.releaseDate || '1900-01-01');
          const bDate = new Date(b.releaseDate || '1900-01-01');
          return bDate.getTime() - aDate.getTime();
        });
      case 'release_date_asc':
        return sorted.sort((a, b) => {
          const aDate = new Date(a.releaseDate || '1900-01-01');
          const bDate = new Date(b.releaseDate || '1900-01-01');
          return aDate.getTime() - bDate.getTime();
        });
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'popularity':
      default:
        // For popularity, we'll use release date as proxy since TMDB credits don't include popularity
        return sorted.sort((a, b) => {
          const aDate = new Date(a.releaseDate || '1900-01-01');
          const bDate = new Date(b.releaseDate || '1900-01-01');
          return bDate.getTime() - aDate.getTime();
        });
    }
  };

  const convertCreditToMediaItem = (credit: SearchPersonCredit) => {
    return {
      id: credit.tmdbId,
      title: credit.title,
      tmdbId: credit.tmdbId,
      image: credit.posterImage,
      premiered: credit.releaseDate,
      summary: credit.job || '',
      genres: [],
      country: '',
      rating: 0,
      popularity: 0,
      language: '',
      inFavorites: false,
    };
  };

  if (!person.movieCredits || !person.tvCredits) {
    return <LoadingComponent />;
  }

  const sortedMovieCredits = sortCredits(person.movieCredits, movieSort);
  const sortedTvCredits = sortCredits(person.tvCredits, tvSort);

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          aria-label="filmography tabs"
        >
          <Tab
            icon={<MovieIcon />}
            iconPosition="start"
            label={`Movies (${person.movieCredits.length})`}
            {...a11yProps(0)}
          />
          <Tab
            icon={<TvIcon />}
            iconPosition="start"
            label={`TV Shows (${person.tvCredits.length})`}
            {...a11yProps(1)}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MovieIcon />
            Movie Credits ({person.movieCredits.length})
          </Typography>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={movieSort} onChange={handleMovieSortChange} label="Sort by">
              <MenuItem value="release_date_desc">Newest First</MenuItem>
              <MenuItem value="release_date_asc">Oldest First</MenuItem>
              <MenuItem value="title">Title A-Z</MenuItem>
              <MenuItem value="popularity">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {sortedMovieCredits.length > 0 ? (
          <Grid container spacing={2}>
            {sortedMovieCredits.map((credit) => (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={`movie-${credit.tmdbId}-${credit.character}`}>
                <Box sx={{ position: 'relative' }}>
                  <MediaCard item={convertCreditToMediaItem(credit)} searchType="movies" />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <MovieIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              No movie credits found
            </Typography>
            <Typography variant="body2">{`This person doesn't have any movie credits in our database.`}</Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TvIcon />
            TV Credits ({person.tvCredits.length})
          </Typography>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={tvSort} onChange={handleTvSortChange} label="Sort by">
              <MenuItem value="release_date_desc">Newest First</MenuItem>
              <MenuItem value="release_date_asc">Oldest First</MenuItem>
              <MenuItem value="title">Title A-Z</MenuItem>
              <MenuItem value="popularity">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {sortedTvCredits.length > 0 ? (
          <Grid container spacing={2}>
            {sortedTvCredits.map((credit) => (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={`tv-${credit.tmdbId}-${credit.character}`}>
                <Box sx={{ position: 'relative' }}>
                  <MediaCard item={convertCreditToMediaItem(credit)} searchType="shows" />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <TvIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              No TV credits found
            </Typography>
            <Typography variant="body2">{`This person doesn't have any TV show credits in our database.`}</Typography>
          </Box>
        )}
      </TabPanel>

      <Box
        sx={{
          mt: 4,
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Career Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<MovieIcon />}
            label={`${person.movieCredits.length} Movies`}
            variant="outlined"
            color="primary"
          />
          <Chip icon={<TvIcon />} label={`${person.tvCredits.length} TV Shows`} variant="outlined" color="secondary" />
          <Chip label={`${person.totalCredits} Total Credits`} variant="outlined" />
        </Box>
      </Box>
    </Box>
  );
};
