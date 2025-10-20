import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import ExploreIcon from '@mui/icons-material/Explore';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MovieIcon from '@mui/icons-material/Movie';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import TvIcon from '@mui/icons-material/Tv';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
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
import NotificationIconDropdown from '../notification/notificationIconDropdown';
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
    navigate('/home');
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
    handleProfileMenuClose();
  };

  const handleManageAccount = () => {
    navigate('/manageAccount');
    handleProfileMenuClose();
  };

  const buildLoginLogoutButton = () => {
    if (account) {
      return <></>; // Removed since logout is now in profile menu
    }
    return <></>;
  };

  const renderNotificationControl = () => {
    if (profile) {
      return <NotificationIconDropdown />;
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
                  minWidth: 200,
                },
              },
            }}
          >
            {/* Profile switching section */}
            <Typography variant="subtitle2" sx={{ px: 2, pt: 1, pb: 0.5, color: 'text.secondary' }}>
              Switch Profile
            </Typography>
            {profiles.map((p) => (
              <MenuItem
                key={p.id}
                selected={p.id === profile.id}
                onClick={() => handleProfileSwitch(p.accountId, p.id)}
                sx={{ pl: 2 }}
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

            <Divider sx={{ my: 1 }} />

            {/* Account management section */}
            <MenuItem onClick={handleManageAccount}>
              <PersonIcon style={{ marginRight: 8, fontSize: '16px' }} />
              Manage Account
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <LogoutIcon style={{ marginRight: 8, fontSize: '16px' }} />
              Logout
            </MenuItem>
          </Menu>
        </>
      );
    }
    return <></>;
  };

  // Updated navigation items - removed 'manageAccount' since it's now in profile menu
  const navigationItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon className="icon" />, to: '/home' },
    {
      id: 'shows',
      label: 'Shows',
      icon: <TvIcon className="icon" />,
      to: '/shows?watchStatus=UNAIRED%2CNOT_WATCHED%2CWATCHING%2CUP_TO_DATE',
    },
    {
      id: 'movies',
      label: 'Movies',
      icon: <MovieIcon className="icon" />,
      to: '/movies?watchStatus=UNAIRED%2CNOT_WATCHED',
    },
    { id: 'discover', label: 'Discover', icon: <ExploreIcon className="icon" />, to: '/discover' },
    { id: 'search', label: 'Search', icon: <SearchIcon className="icon" />, to: '/search' },
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

  const renderMobileMenu = () => (
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
    </Menu>
  );

  return (
    <header className="header">
      <AppBar position="static">
        <Container>
          <Toolbar>
            {isMobile ? (
              <>
                <IconButton
                  disabled={!account}
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMobileMenuOpen}
                >
                  <MenuIcon />
                </IconButton>

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
                {renderNotificationControl()}
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
                {renderNotificationControl()}
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
