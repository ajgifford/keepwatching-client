import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Breadcrumbs, Chip, Link, Tooltip, Typography, useTheme } from '@mui/material';

import { getServiceConfig } from '../../../app/constants/streamingServices';
import { useAppSelector } from '../../../app/hooks';
import { StreamingServiceContent, selectContentByStreamingService } from '../../../app/slices/activeProfileSlice';
import { stripArticle } from '../../utility/contentUtility';
import { ProfileContentCard } from './profileContentCard';
import { ScrollableMediaRow } from './scrollableMediaRow';
import { ProfileMovie, ProfileShow } from '@ajgifford/keepwatching-types';

interface CombinedContent {
  type: 'show' | 'movie';
  data: ProfileShow | ProfileMovie;
}

const StreamingServiceSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const serviceContent = useAppSelector(selectContentByStreamingService);
  const [loadedLogos, setLoadedLogos] = React.useState<Set<string>>(new Set());

  const getServiceColor = (serviceConfig: ReturnType<typeof getServiceConfig>): string => {
    return isDarkMode && serviceConfig.colorDark ? serviceConfig.colorDark : serviceConfig.color;
  };

  const getServiceLogo = (serviceConfig: ReturnType<typeof getServiceConfig>): string => {
    return isDarkMode && serviceConfig.logoDark ? serviceConfig.logoDark : serviceConfig.logo;
  };

  const handleLogoLoad = (serviceName: string) => {
    setLoadedLogos((prev) => new Set(prev).add(serviceName));
  };

  const handleLogoError = (serviceName: string) => {
    setLoadedLogos((prev) => {
      const newSet = new Set(prev);
      newSet.delete(serviceName);
      return newSet;
    });
  };

  if (serviceContent.length === 0) {
    return (
      <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No content available. Add shows or movies to your favorites to see them organized by streaming service.
        </Typography>
      </Box>
    );
  }

  const getCombinedContent = (service: StreamingServiceContent): CombinedContent[] => {
    const combined: CombinedContent[] = [];

    // Add shows
    service.shows.forEach((show) => {
      combined.push({ type: 'show', data: show });
    });

    // Add movies
    service.movies.forEach((movie) => {
      combined.push({ type: 'movie', data: movie });
    });

    // Sort alphabetically by title
    return combined.sort((a, b) => stripArticle(a.data.title).localeCompare(stripArticle(b.data.title)));
  };

  const handleContentClick = (content: CombinedContent, profileId: number) => {
    const navigationState = {
      returnPath: '/home',
      genre: '',
      streamingService: '',
      watchStatus: '',
    };

    if (content.type === 'show') {
      navigate(`/shows/${content.data.id}/${profileId}`, { state: navigationState });
    } else {
      navigate(`/movies/${content.data.id}/${profileId}`, { state: navigationState });
    }
  };

  const scrollToService = (serviceName: string) => {
    const element = document.getElementById(`service-${serviceName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
      {/* Quick Jump Navigation */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Quick Jump:
        </Typography>
        <Breadcrumbs
          separator="•"
          aria-label="streaming service navigation"
          maxItems={999}
          sx={{
            flexWrap: 'wrap',
            '& .MuiBreadcrumbs-separator': {
              mx: 0.5,
            },
          }}
        >
          {serviceContent.map((service) => {
            const serviceConfig = getServiceConfig(service.service);
            const serviceColor = getServiceColor(serviceConfig);
            const serviceLogo = getServiceLogo(serviceConfig);
            return (
              <Tooltip
                key={`jump-${service.service}`}
                title={`${serviceConfig.name}: ${service.shows.length} shows, ${service.movies.length} movies`}
                arrow
              >
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => scrollToService(service.service)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: serviceColor,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                      opacity: 0.8,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={serviceLogo}
                    alt={`${serviceConfig.name} logo`}
                    sx={{
                      height: 20,
                      width: 'auto',
                      objectFit: 'contain',
                    }}
                    onLoad={() => handleLogoLoad(service.service)}
                    onError={() => handleLogoError(service.service)}
                  />
                  {!loadedLogos.has(service.service) && serviceConfig.name}
                  <Chip
                    label={service.totalCount}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      backgroundColor: `${serviceColor}15`,
                      color: serviceColor,
                      fontWeight: 'bold',
                    }}
                  />
                </Link>
              </Tooltip>
            );
          })}
        </Breadcrumbs>
      </Box>

      {/* Service Sections */}
      {serviceContent.map((service) => {
        const serviceConfig = getServiceConfig(service.service);
        const serviceColor = getServiceColor(serviceConfig);
        const serviceLogo = getServiceLogo(serviceConfig);
        const combinedContent = getCombinedContent(service);
        const profileId = service.shows[0]?.profileId || service.movies[0]?.profileId;

        return (
          <Box key={service.service} id={`service-${service.service}`} sx={{ scrollMarginTop: '80px' }}>
            <ScrollableMediaRow
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    component="img"
                    src={serviceLogo}
                    alt={`${serviceConfig.name} logo`}
                    sx={{
                      height: 32,
                      width: 'auto',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <Typography variant="h5" sx={{ color: serviceColor, fontWeight: 'bold' }}>
                    {serviceConfig.name}
                  </Typography>
                  <Chip
                    label={`${service.shows.length} ${service.shows.length === 1 ? 'show' : 'shows'}, ${service.movies.length} ${service.movies.length === 1 ? 'movie' : 'movies'}`}
                    size="small"
                    sx={{
                      backgroundColor: `${serviceColor}20`,
                      color: serviceColor,
                      borderColor: serviceColor,
                      fontWeight: 'bold',
                    }}
                    variant="outlined"
                  />
                </Box>
              }
              items={combinedContent}
              isLoading={false}
              renderItem={(item) => (
                <ProfileContentCard
                  content={item.data}
                  contentType={item.type}
                  onClick={() => handleContentClick(item, profileId)}
                />
              )}
              emptyMessage={`No content for ${service.service}`}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default StreamingServiceSection;
