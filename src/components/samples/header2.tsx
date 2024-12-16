import React, { useState } from 'react';
import { FaBars, FaCompass, FaFilm, FaHome, FaTv, FaUser } from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(14, 59, 80, 0.1)',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: '0 8px',
  //   color: active ? theme.palette.primary.main : theme.palette.text.primary,
  //   "&:hover": {
  //     backgroundColor: theme.palette.action.hover
  //   },
  '& .icon': {
    marginRight: theme.spacing(1),
  },
}));

const NavigationControl = () => {
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

  const handlePageChange = (page: string, to: string) => {
    setActivePage(page);
    navigate(to);
    handleMobileMenuClose();
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <FaHome className="icon" />, to: '/' },
    { id: 'shows', label: 'Shows', icon: <FaTv className="icon" />, to: '/shows' },
    { id: 'movies', label: 'Movies', icon: <FaFilm className="icon" />, to: '/movies' },
    { id: 'discover', label: 'Discover', icon: <FaCompass className="icon" />, to: '/discover' },
    { id: 'profile', label: 'Profile', icon: <FaUser className="icon" />, to: '/profile' },
  ];

  const renderNavigationButtons = () =>
    navigationItems.map((item) => (
      <StyledButton
        key={item.id}
        //active={activePage === item.id}
        onClick={() => handlePageChange(item.id, item.to)}
        aria-label={item.label}
        startIcon={item.icon}
      >
        {!isMobile && item.label}
      </StyledButton>
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
        <MenuItem key={item.id} onClick={() => handlePageChange(item.id, item.to)} selected={activePage === item.id}>
          {item.icon}
          <Box sx={{ ml: 2 }}>{item.label}</Box>
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        {isMobile ? (
          <>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMobileMenuOpen}>
              <FaBars />
            </IconButton>
            {renderMobileMenu()}
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{renderNavigationButtons()}</Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default NavigationControl;
