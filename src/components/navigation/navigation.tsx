import { useState } from 'react';
import { FaBars, FaCompass, FaFilm, FaHome, FaSearch, FaTv, FaUser } from 'react-icons/fa';
import { LuLogIn, LuLogOut } from 'react-icons/lu';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentAccount } from '../../app/slices/accountSlice';
import { selectActiveProfile, setActiveProfile } from '../../app/slices/activeProfileSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import { getProfileImageUrl } from '../utility/imageUtils';

function Navigation() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const account = useAppSelector(selectCurrentAccount);
  const profile = useAppSelector(selectActiveProfile);
  const profiles = useAppSelector(selectAllProfiles);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileSwitch = (accountId: number, profileId: number) => {
    dispatch(setActiveProfile({ accountId, profileId }));
    handleProfileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleMenuPageChange = (page: string, to: string) => {
    navigate(to);
    handleMobileMenuClose();
  };

  const handleLogout = async () => {
    if (account) {
      try {
        await dispatch(logout()).unwrap();
        navigate('/login');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLogin = async () => {
    if (!account) {
      navigate('/login');
    }
  };

  const buildLoginLogoutMenu = () => {
    if (account) {
      return (
        <MenuItem key="navigationLogoutMenuItem" onClick={() => handleLogout()}>
          {<LuLogOut />}
          <Box sx={{ ml: 2 }}>Logout</Box>
        </MenuItem>
      );
    }
    return (
      <MenuItem key="navigationLogoutMenuItem" onClick={() => handleLogin()}>
        {<LuLogIn />}
        <Box sx={{ ml: 2 }}>Login</Box>
      </MenuItem>
    );
  };

  const buildLoginLogoutButton = () => {
    if (account) {
      return (
        <Button
          color={'inherit'}
          key="navigationLogoutButton"
          startIcon={<LuLogOut />}
          onClick={() => handleLogout()}
          aria-label="Logout"
        >
          Logout
        </Button>
      );
    }
    return <></>;
  };

  const renderActiveProfileControl = () => {
    if (profile) {
      return (
        <>
          <Tooltip title={`Active Profile: ${profile.name}`} arrow>
            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 2 }}>
              <Avatar
                src={getProfileImageUrl(profile.image)}
                alt={profile.name}
                slotProps={{
                  img: {
                    crossOrigin: 'anonymous',
                  },
                }}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleProfileMenuClose}
            slotProps={{
              paper: {
                elevation: 3,
                sx: {
                  mt: 1.5,
                },
              },
            }}
          >
            {profiles.map((p) => (
              <MenuItem
                key={p.id}
                selected={p.id === profile.id}
                onClick={() => handleProfileSwitch(p.accountId, p.id)}
              >
                <Avatar
                  src={getProfileImageUrl(p.image)}
                  alt={p.name}
                  slotProps={{
                    img: {
                      crossOrigin: 'anonymous',
                    },
                  }}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                {p.name}
              </MenuItem>
            ))}
          </Menu>
        </>
      );
    }
    return <></>;
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <FaHome className="icon" />, to: '/home' },
    {
      id: 'shows',
      label: 'Shows',
      icon: <FaTv className="icon" />,
      to: '/shows?watchStatus=UNAIRED%2CNOT_WATCHED%2CWATCHING',
    },
    {
      id: 'movies',
      label: 'Movies',
      icon: <FaFilm className="icon" />,
      to: '/movies?watchStatus=UNAIRED%2CNOT_WATCHED',
    },
    { id: 'discover', label: 'Discover', icon: <FaCompass className="icon" />, to: '/discover' },
    { id: 'search', label: 'Search', icon: <FaSearch className="icon" />, to: '/search' },
    { id: 'manageAccount', label: 'Manage Account', icon: <FaUser className="icon" />, to: '/manageAccount' },
  ];

  const renderNavigationButtons = () => {
    if (account) {
      return navigationItems.map((item) => (
        <Button
          color="inherit"
          key={item.id}
          component={NavLink}
          to={item.to}
          aria-label={item.label}
          startIcon={item.icon}
          sx={{
            '&.active': {
              color: theme.palette.warning.main,
            },
          }}
        >
          {item.label}
        </Button>
      ));
    }
    return <></>;
  };

  const renderMobileMenu = () => {
    if (account) {
      return (
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
              },
            },
          }}
        >
          {navigationItems.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleMenuPageChange(item.id, item.to)}
              selected={location.pathname === item.to}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                },
              }}
            >
              {item.icon}
              <Box sx={{ ml: 2 }}>{item.label}</Box>
            </MenuItem>
          ))}
          {buildLoginLogoutMenu()}
        </Menu>
      );
    }
    return <></>;
  };

  return (
    <header className="header">
      <AppBar position="static">
        <Container>
          <Toolbar>
            {isMobile ? (
              <>
                {account && (
                  <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMobileMenuOpen}>
                    <FaBars />
                  </IconButton>
                )}
                {renderMobileMenu()}
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  KeepWatching
                </Typography>
                {renderActiveProfileControl()}
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  KeepWatching
                </Typography>
                {renderNavigationButtons()}
                {buildLoginLogoutButton()}
                {renderActiveProfileControl()}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </header>
  );
}

export default Navigation;
