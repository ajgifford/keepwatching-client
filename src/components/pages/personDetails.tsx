import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  CalendarToday,
  ExpandLess,
  ExpandMore,
  Female,
  Male,
  Movie as MovieIcon,
  Person as PersonIcon,
  Place,
  Tv as TvIcon,
} from '@mui/icons-material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppSelector } from '../../app/hooks';
import { selectActiveProfile } from '../../app/slices/activeProfileSlice';
import { ErrorComponent } from '../common/errorComponent';
import { LoadingComponent } from '../common/loadingComponent';
import { CreditCard } from '../common/person/creditCard';
import { buildTMDBImagePath } from '../utility/contentUtility';
import { PersonDetails as PersonDetailsType } from '@ajgifford/keepwatching-types';

const getGenderIcon = (gender: number) => {
  return gender === 1 ? <Female /> : gender === 2 ? <Male /> : <PersonIcon />;
};

const getAge = (birthdate: string, deathdate: string | null): number => {
  const birth = new Date(birthdate);
  const end = deathdate ? new Date(deathdate) : new Date();
  const age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
};

interface ExpandableBiographyProps {
  biography: string;
  maxLength?: number;
}

const ExpandableBiography: React.FC<ExpandableBiographyProps> = ({ biography, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = biography.length > maxLength;

  const displayText = shouldTruncate && !isExpanded ? `${biography.substring(0, maxLength)}...` : biography;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box>
      <Typography
        variant="body1"
        fontStyle="italic"
        sx={{
          maxWidth: '100%',
          color: 'white',
          opacity: 0.95,
          lineHeight: 1.6,
          mb: shouldTruncate ? 2 : 0,
        }}
      >
        {displayText}
      </Typography>
      {shouldTruncate && (
        <Button
          onClick={handleToggle}
          sx={{
            color: 'white',
            textTransform: 'none',
            p: 0,
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </Box>
  );
};

export default function PersonDetails() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { personId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const returnPath = location.state?.returnPath || '/movies';

  const profile = useAppSelector(selectActiveProfile);

  const [person, setPerson] = useState<PersonDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadPerson = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/accounts/${profile?.accountId}/profiles/${profile?.id}/person/${personId}`
        );
        if (response.status !== 200) throw new Error('Person Details failed');
        setPerson(response.data.person);
      } catch (error) {
        setError('Person details failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    if (profile) {
      loadPerson();
    }
  }, [personId, profile]);

  if (isLoading) {
    return <LoadingComponent />;
  }
  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    person && (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
        {/* Back button */}
        <Box
          sx={{
            px: 2,
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            mb={2}
            mt={1}
            sx={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Tooltip title={'Back'}>
              <IconButton
                aria-label="back"
                onClick={() => {
                  navigate(returnPath);
                }}
                sx={{ color: 'text.primary' }}
              >
                <ArrowBackIosIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Card elevation={2} sx={{ overflow: 'visible', borderRadius: { xs: 1, md: 2 } }}>
            <Box sx={{ position: 'relative', minHeight: isMobile ? 250 : 350 }}>
              <CardMedia
                component="div"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=350&fit=crop)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.3)',
                  zIndex: 1,
                }}
              />

              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: isMobile ? 250 : 350,
                  p: { xs: 1, sm: 2, md: 4 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    gap: { xs: 2, md: 3 },
                  }}
                >
                  <Avatar
                    src={buildTMDBImagePath(person.profileImage)}
                    alt={person.name}
                    sx={{
                      width: isMobile ? 100 : 150,
                      height: isMobile ? 100 : 150,
                      border: '4px solid white',
                      flexShrink: 0,
                    }}
                  />
                  <Box
                    sx={{
                      color: 'white',
                      textAlign: isMobile ? 'center' : 'left',
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    <Typography
                      variant={isMobile ? 'h5' : 'h3'}
                      component="h1"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                      }}
                    >
                      {person.name}
                    </Typography>
                    <Stack
                      direction={isMobile ? 'column' : 'row'}
                      spacing={isMobile ? 1 : 2}
                      alignItems={isMobile ? 'center' : 'flex-start'}
                      sx={{ mb: 2 }}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Chip
                        icon={getGenderIcon(person.gender)}
                        label={person.gender === 1 ? 'Female' : 'Male'}
                        variant="outlined"
                        size="small"
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.7)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        }}
                      />
                      <Chip
                        icon={<CalendarToday />}
                        label={`Age ${getAge(person.birthdate, person.deathdate)}`}
                        variant="outlined"
                        size="small"
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.7)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        }}
                      />
                      <Chip
                        icon={<Place />}
                        label={person.placeOfBirth}
                        variant="outlined"
                        size="small"
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.7)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          maxWidth: '100%',
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                        }}
                      />
                    </Stack>
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: isMobile ? 3 : 4,
                    maxWidth: '100%',
                    pb: 1,
                  }}
                >
                  <ExpandableBiography biography={person.biography} maxLength={isMobile ? 200 : 400} />
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              <Grid container spacing={4}>
                <Grid item xs={12} lg={6}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      mb: 3,
                    }}
                  >
                    <MovieIcon sx={{ mr: 1.5, fontSize: 28 }} />
                    Movie Credits ({person.movieCredits.length})
                  </Typography>
                  <Stack spacing={2}>
                    {person.movieCredits.map((credit) => (
                      <CreditCard key={`movieCredit_${credit.name}_${credit.character}`} credit={credit} />
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12} lg={6}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      mb: 3,
                    }}
                  >
                    <TvIcon sx={{ mr: 1.5, fontSize: 28 }} />
                    TV Credits ({person.showCredits.length})
                  </Typography>
                  <Stack spacing={2}>
                    {person.showCredits.map((credit) => (
                      <CreditCard key={`showCredit_${credit.name}_${credit.character}`} credit={credit} />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>
    )
  );
}
