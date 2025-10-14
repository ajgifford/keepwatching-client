import React from 'react';
import { Link } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import { Box, Card, CardContent, Typography, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { getProfileImageUrl } from '../../utility/imageUtils';
import { Profile } from '@ajgifford/keepwatching-types';

interface DashboardProfileCardProps {
  profile: Profile;
  showWatched: number;
  showUpToDate: number;
  showWatching: number;
  showNotWatched: number;
  showUnaired: number;
  movieWatched: number;
  movieNotWatched: number;
  movieUnaired: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  to?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, to, color }) => {
  const cardContent = (
    <Box
      sx={{
        background: alpha('#ffffff', 0.15),
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        transition: 'all 0.3s ease',
        cursor: to ? 'pointer' : 'default',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha('#ffffff', 0.2)}`,
        '&:hover': to
          ? {
              background: alpha('#ffffff', 0.25),
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha('#000000', 0.15)}`,
            }
          : {},
      }}
    >
      <Box
        sx={{
          fontSize: '1.5rem',
          mb: 1,
          color: color || 'inherit',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          mb: 0.5,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          opacity: 0.9,
          fontSize: '0.85rem',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const DashboardProfileCard: React.FC<DashboardProfileCardProps> = ({
  profile,
  showWatched,
  showUpToDate,
  showWatching,
  showNotWatched,
  showUnaired,
  movieWatched,
  movieNotWatched,
  movieUnaired,
}) => {
  const buildTitle = (name: string) => {
    return `${name}'s Dashboard`;
  };

  return (
    <Card
      sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #0d47a1 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200px',
          height: '200px',
          background: alpha('#ffffff', 0.1),
          borderRadius: '50%',
          zIndex: 0,
        },
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        {/* Profile Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Box
            crossOrigin="anonymous"
            component="img"
            src={getProfileImageUrl(profile.image)}
            alt={profile.name}
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              objectFit: 'cover',
              border: `4px solid ${alpha('#ffffff', 0.3)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
              }}
            >
              {buildTitle(profile.name)}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.9,
                fontSize: '1rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              KeepWatching Your Favorites!
            </Typography>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<TvIcon />}
              value={showNotWatched + showWatching + showUnaired}
              label="Shows to Watch"
              to="/shows?watchStatus=UNAIRED%2CNOT_WATCHED%2CWATCHING"
              color="#FFE082"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<CheckCircleIcon />}
              value={showWatched + showUpToDate}
              label="Shows Watched"
              to="/shows?watchStatus=WATCHED%2CUP_TO_DATE"
              color="#A5D6A7"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<MovieIcon />}
              value={movieNotWatched + movieUnaired}
              label="Movies to Watch"
              to="/movies?watchStatus=UNAIRED%2CNOT_WATCHED"
              color="#FFAB91"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<EmojiEventsIcon />}
              value={movieWatched}
              label="Movies Watched"
              to="/movies?watchStatus=WATCHED"
              color="#CE93D8"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DashboardProfileCard;
