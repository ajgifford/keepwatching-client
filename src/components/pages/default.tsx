import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, Button, IconButton, Typography, alpha, useTheme } from '@mui/material';

function EnhancedDefault() {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      title: 'Track Every Episode',
      subtitle: 'Never lose your place in a series again',
      description: 'Mark episodes as watched, see your progress, and get back to binge-watching faster',
      visual: '🎬',
      color: { primary: theme.palette.primary.main, secondary: '#00bcd4' },
    },
    {
      title: 'Manage Movies',
      subtitle: "Build your movie watchlist and track what you've seen",
      description: 'Perfect for movie nights and recommendations. Never forget which movies you loved or want to watch',
      visual: '🍿',
      color: { primary: '#f44336', secondary: '#ff9800' },
    },
    {
      title: 'Discover New Content',
      subtitle: 'Find your next favorite show',
      description: 'Find new shows and movies to watch with our powerful search and discovery features.',
      visual: '🔍',
      color: { primary: '#9c27b0', secondary: '#e91e63' },
    },
    {
      title: 'Multiple Profiles',
      subtitle: 'Entertainment for the whole family',
      description: 'Create separate profiles for each family member with their own watchlist and progress',
      visual: '👨‍👩‍👧‍👦',
      color: { primary: '#4caf50', secondary: '#00bcd4' },
    },
    {
      title: 'View Your Stats',
      subtitle: 'Insights into your viewing habits',
      description: 'Get insights into your viewing habits with detailed statistics and progress tracking',
      visual: '📊',
      color: { primary: '#ff9800', secondary: '#f44336' },
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const currentSlideData = slides[currentSlide];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        color: 'white',
        overflow: 'hidden',
        zIndex: 9999, // Ensure it's above everything
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${alpha(currentSlideData.color.primary, 0.2)}, ${alpha(currentSlideData.color.secondary, 0.2)})`,
          transition: 'background 1s ease-in-out',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {[...Array(15)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 4,
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              animation: `pulse 3s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          py: 3,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Keep<span style={{ color: '#00bcd4' }}>Watching</span>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Login
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            sx={{
              backgroundColor: '#00bcd4',
              '&:hover': { backgroundColor: '#00acc1' },
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          key={currentSlide}
          sx={{
            mb: 6,
            animation: 'slideIn 1s ease-out',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              mb: 3,
              animation: 'bounce 3s ease-in-out infinite',
            }}
          >
            {currentSlideData.visual}
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              background: `linear-gradient(45deg, #ffffff, ${currentSlideData.color.secondary})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              wordBreak: 'break-word',
            }}
          >
            {currentSlideData.title}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: currentSlideData.color.secondary,
              mb: 3,
              fontWeight: 300,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            {currentSlideData.subtitle}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            {currentSlideData.description}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', mb: 6 }}>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            startIcon={<span>🚀</span>}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              background: `linear-gradient(45deg, ${currentSlideData.color.primary}, ${currentSlideData.color.secondary})`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(currentSlideData.color.primary, 0.4)}`,
              },
              transition: 'all 0.3s ease',
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Slide Indicators */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {slides.map((_, index) => (
            <Button
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                minWidth: 'auto',
                width: index === currentSlide ? 32 : 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: index === currentSlide ? currentSlideData.color.secondary : 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor:
                    index === currentSlide ? currentSlideData.color.secondary : 'rgba(255, 255, 255, 0.5)',
                },
                transition: 'all 0.3s ease',
                p: 0,
              }}
            />
          ))}
        </Box>
        <Box sx={{ mt: 4 }}>
          <IconButton
            onClick={() => setIsPlaying(!isPlaying)}
            sx={{
              width: 64,
              height: 64,
              backgroundColor: alpha('#ffffff', 0.2),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.3),
              },
            }}
          >
            {isPlaying ? <PauseIcon sx={{ fontSize: 30 }} /> : <PlayArrowIcon sx={{ fontSize: 30 }} />}
          </IconButton>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        <Box
          sx={{
            height: '100%',
            background: `linear-gradient(90deg, ${currentSlideData.color.primary}, ${currentSlideData.color.secondary})`,
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}

export default EnhancedDefault;
