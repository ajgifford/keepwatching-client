import React from 'react';

import { Explore as ExploreIcon, Movie as MovieIcon, Person as PersonIcon, Tv as TvIcon } from '@mui/icons-material';
import { Box, SvgIconProps, Typography } from '@mui/material';

interface SearchEmptyStateProps {
  searchType: 'movies' | 'shows' | 'people';
  isNoResults?: boolean;
  searchQuery?: string;
  source?: 'search' | 'discover';
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  searchType,
  isNoResults = false,
  searchQuery = '',
  source = 'search',
}) => {
  const getIconComponent = () => {
    const iconProps: SvgIconProps = {
      sx: { fontSize: 64, mb: 2, opacity: 0.5 },
    };

    // For discover page, use explore icon, otherwise use content-specific icons
    if (source === 'discover') {
      return <ExploreIcon {...iconProps} />;
    }

    switch (searchType) {
      case 'movies':
        return <MovieIcon {...iconProps} />;
      case 'shows':
        return <TvIcon {...iconProps} />;
      case 'people':
        return <PersonIcon {...iconProps} />;
      default:
        return <MovieIcon {...iconProps} />;
    }
  };

  const getContent = () => {
    if (isNoResults) {
      // No results found state
      return {
        title: getNoResultsTitle(),
        description: getNoResultsDescription(),
      };
    } else {
      // Initial empty state
      return {
        title: getInitialTitle(),
        description: getInitialDescription(),
      };
    }
  };

  const getNoResultsTitle = () => {
    if (source === 'discover') {
      return 'No content found';
    }

    switch (searchType) {
      case 'movies':
        return 'No movies found';
      case 'shows':
        return 'No TV shows found';
      case 'people':
        return 'No people found';
      default:
        return 'No results found';
    }
  };

  const getNoResultsDescription = () => {
    if (source === 'discover') {
      return 'Try adjusting your filters or selecting a different service to discover more content.';
    }

    const baseMessage = 'Try adjusting your search terms or check the spelling.';

    if (searchQuery) {
      return `No results found for "${searchQuery}". ${baseMessage}`;
    }

    return baseMessage;
  };

  const getInitialTitle = () => {
    if (source === 'discover') {
      return 'Discover Content';
    }

    switch (searchType) {
      case 'movies':
        return 'Search for Movies';
      case 'shows':
        return 'Search for TV Shows';
      case 'people':
        return 'Search for People';
      default:
        return 'Start Searching';
    }
  };

  const getInitialDescription = () => {
    if (source === 'discover') {
      return 'Select a streaming service and content type above to discover trending shows and movies available to watch.';
    }

    switch (searchType) {
      case 'movies':
        return 'Discover movies to add to your watchlist. Search by title (and year) find your next favorite film.';
      case 'shows':
        return 'Find TV shows to track and follow. Search by title (and year) to discover your next binge-worthy series.';
      case 'people':
        return 'Find movies and TV shows by searching for actors, directors, writers, and other crew members.';
      default:
        return 'Enter a search term to get started.';
    }
  };

  const { title, description } = getContent();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 8,
        px: 3,
        color: 'text.secondary',
        textAlign: 'center',
      }}
    >
      {getIconComponent()}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};
