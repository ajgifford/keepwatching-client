import { useEffect, useRef, useState } from 'react';

import LiveTvIcon from '@mui/icons-material/LiveTv';
import MovieIcon from '@mui/icons-material/Movie';
import { Badge, Box, Card, CardContent, CardMedia, Chip, Tooltip, Typography } from '@mui/material';

import { buildTMDBImagePath } from '../../utility/contentUtility';
import { ProfileMovie, ProfileShow } from '@ajgifford/keepwatching-types';
import { getWatchStatusColor } from '@ajgifford/keepwatching-ui';

interface ProfileContentCardProps {
  content: ProfileShow | ProfileMovie;
  contentType: 'show' | 'movie';
  onClick: () => void;
}

export const ProfileContentCard = ({ content, contentType, onClick }: ProfileContentCardProps) => {
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
  }, [content.title]);

  const tooltipStyles = {
    tooltip: {
      fontSize: '1rem',
      padding: '8px 12px',
      maxWidth: '300px',
      lineHeight: 1.4,
    },
  };

  const watchStatusColor = getWatchStatusColor(content.watchStatus);

  return (
    <Card
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: { xs: '180px', sm: '200px', md: '220px' },
        maxWidth: { xs: '180px', sm: '200px', md: '220px' },
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <Badge
        badgeContent={
          contentType === 'show' ? <LiveTvIcon sx={{ fontSize: 16 }} /> : <MovieIcon sx={{ fontSize: 16 }} />
        }
        color={contentType === 'show' ? 'primary' : 'secondary'}
        sx={{
          '& .MuiBadge-badge': {
            top: 10,
            right: 10,
            padding: '6px',
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            aspectRatio: '2/3',
            objectFit: 'cover',
            width: '100%',
          }}
          image={buildTMDBImagePath(content.posterImage)}
          alt={content.title}
        />
      </Badge>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Tooltip
          title={isTitleTruncated ? content.title : ''}
          placement="top"
          slotProps={{ tooltip: { sx: tooltipStyles.tooltip } }}
        >
          <Typography ref={titleRef} variant="h6" noWrap>
            {content.title}
          </Typography>
        </Tooltip>

        <Box sx={{ mt: 1 }}>
          <Chip
            label={content.watchStatus.replace(/_/g, ' ')}
            size="small"
            sx={{
              backgroundColor: watchStatusColor,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {content.userRating && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ⭐ {content.userRating.toFixed(1)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
