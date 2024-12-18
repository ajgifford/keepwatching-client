import { useState } from 'react';
import { FaBars, FaCompass, FaFilm, FaHome, FaTv, FaUser } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

function Navigation() {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(null);
  const [activePage, setActivePage] = useState<string>('home');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleMenuPageChange = (page: string, to: string) => {
    navigate(to);
    setActivePage(page);
    handleMobileMenuClose();
  };

  const handleToolbarPageChange = (page: string) => {
    setActivePage(page);
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <FaHome className="icon" />, to: '/' },
    { id: 'shows', label: 'Shows', icon: <FaTv className="icon" />, to: '/shows' },
    { id: 'movies', label: 'Movies', icon: <FaFilm className="icon" />, to: '/movies' },
    { id: 'discover', label: 'Discover', icon: <FaCompass className="icon" />, to: '/discover' },
    { id: 'manageAccount', label: 'Manage Account', icon: <FaUser className="icon" />, to: '/manageAccount' },
  ];

  const renderNavigationButtons = () =>
    navigationItems.map((item) => (
      <Button
        color={activePage === item.id ? 'warning' : 'inherit'}
        key={item.id}
        component={NavLink}
        to={item.to}
        onClick={() => handleToolbarPageChange(item.id)}
        aria-label={item.label}
        startIcon={item.icon}
      >
        {item.label}
      </Button>
    ));

  const renderMobileMenu = () => (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
        },
      }}
    >
      {navigationItems.map((item) => (
        <MenuItem
          key={item.id}
          onClick={() => handleMenuPageChange(item.id, item.to)}
          selected={activePage === item.id}
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
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMobileMenuOpen}>
                  <FaBars />
                </IconButton>
                {renderMobileMenu()}
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
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
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </header>
  );
}

export default Navigation;
