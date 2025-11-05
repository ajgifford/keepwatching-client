import { useEffect, useRef, useState } from 'react';

import { Card, CardActions, CardContent, CardMedia, Tooltip, Typography } from '@mui/material';

import FavoritesButton from './favoriteButton';
import { SimilarOrRecommendedShow } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

interface MediaCardProps {
  item: SimilarOrRecommendedShow;
  searchType: 'shows' | 'movies';
}

export const MediaCard = ({ item, searchType }: MediaCardProps) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current) {
        const { offsetWidth, scrollWidth } = titleRef.current;
        setIsTitleTruncated(scrollWidth > offsetWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);

    return () => {
      window.removeEventListener('resize', checkTruncation);
    };
  }, [item.title]);

  const tooltipStyles = {
    tooltip: {
      fontSize: '1rem',
      padding: '8px 12px',
      maxWidth: '300px',
      lineHeight: 1.4,
    },
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: { xs: '180px', sm: '200px', md: '220px' },
        maxWidth: { xs: '180px', sm: '200px', md: '220px' },
        height: '100%',
      }}
    >
      <CardMedia
        component="img"
        sx={{
          aspectRatio: '2/3',
          objectFit: 'cover',
        }}
        image={buildTMDBImagePath(item.image)}
        alt={item.title}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Tooltip
          title={isTitleTruncated ? item.title : ''}
          placement="top"
          slotProps={{ tooltip: { sx: tooltipStyles.tooltip } }}
        >
          <Typography ref={titleRef} variant="h6" noWrap>
            {item.title}
          </Typography>
        </Tooltip>

        <Tooltip title={item.genres.join(', ')} placement="top" slotProps={{ tooltip: { sx: tooltipStyles.tooltip } }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {item.genres.join(', ')}
          </Typography>
        </Tooltip>

        <Typography variant="body2" color="text.secondary" noWrap>
          {item.premiered}
        </Typography>

        {item.summary && (
          <Tooltip title={item.summary} placement="top" slotProps={{ tooltip: { sx: tooltipStyles.tooltip } }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.2em',
                maxHeight: '3.6em',
              }}
            >
              {item.summary}
            </Typography>
          </Tooltip>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', p: 1 }}>
        <FavoritesButton id={item.id} searchType={searchType} />
      </CardActions>
    </Card>
  );
};
