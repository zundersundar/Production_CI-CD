import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


const TopNavBar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleHomeButtonClick = () => {
    let UserRole = sessionStorage.getItem('userRole');
    if (UserRole === 'technician') {
      navigate('/tech-dashboard');
    } else if (UserRole === 'client') {
      navigate('/client-dashboard');
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    // Clear user details from sessionStorage
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');
    
    // Optionally, you can also clear all sessionStorage with sessionStorage.clear()
    // sessionStorage.clear();
    
    // Close the menu
    setAnchorEl(null);
    
    // Navigate to the login page
    navigate('/');
  };

  const username = sessionStorage.getItem('username') || 'User';

  return (
    <AppBar sx={{ background: '#1A1A1D', height: '60px', paddingLeft: '16%', paddingRight: '16%' }} position="static">
      <Toolbar>
        {/* Left side content */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: '25px', fontWeight: '700' }}>
          TowerWatch
        </Typography>

        {/* Right side content */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Notification icon */}
          <IconButton color="inherit" sx={{ marginRight: '10px' }}>
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Home button */}
          <Button
            sx={{
              fontSize: '0.875rem',
              textTransform: 'capitalize',
              marginRight: '10px',
              '&:hover': {
                backgroundColor: '#333',
              },
            }}
            color="inherit"
            onClick={handleHomeButtonClick}
          >
            Home
          </Button>

          {/* Avatar with dropdown */}
          <IconButton onClick={handleMenuOpen} sx={{ color: 'white' }}>
              <AccountCircleIcon />
            </IconButton>
            <Typography sx={{ color: 'white', marginLeft: '2px' }}>
              {username}
            </Typography>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
