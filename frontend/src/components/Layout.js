import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Button,
  Tooltip,
  Paper,
  alpha,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  BookOnline as BookingIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  KeyboardArrowRight as ArrowIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const Layout = ({ children, toggleThemeMode, themeMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Close drawer when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getMenuItems = () => {
    if (!user) return [];
    
    const commonItems = [
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Logout', icon: <LogoutIcon />, path: '/logout' }
    ];
    
    switch (user.role) {
      case 'restaurant_owner':
        return [
          { text: 'Manage Restaurants', icon: <RestaurantMenuIcon />, path: '/restaurant/restaurants' },
          { text: 'Manage Events', icon: <EventIcon />, path: '/restaurant/events' },
          { text: 'Reservations', icon: <BookingIcon />, path: '/restaurant/reservations' },
          { text: 'Calendar', icon: <CalendarIcon />, path: '/restaurant/Calendar' },
          ...commonItems
        ];
      case 'customer':
        return [
          { text: 'Browse', icon: <SearchIcon />, path: '/browse' },
          { text: 'My Reservations', icon: <CalendarIcon />, path: '/customer/reservations' },
          { text: 'My Events', icon: <EventIcon />, path: '/customer/events' },
          ...commonItems
        ];
      default:
        return commonItems;
    }
  };

  const utilityItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/help' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          p: 3, 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
        }}
      >
        <Box 
          component="img" 
          src="/logo.png" 
          alt="Logo" 
          sx={{ 
            width: 45, 
            height: 45, 
            mr: 1,
            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
          }} 
        />
        <Typography 
          variant="h5" 
          component="div"
          sx={{ 
            fontWeight: 700,
            letterSpacing: '-0.5px',
            textShadow: '0px 2px 3px rgba(0,0,0,0.1)'
          }}
        >
          {user?.role === 'restaurant_owner' ? 'Restaurant Portal' : 'Dine & Book'}
        </Typography>
      </Box>
      
      <Box sx={{ p: 2.5, flexGrow: 1, overflowY: 'auto' }}>
        <Typography 
          variant="overline" 
          sx={{ 
            px: 1, 
            color: 'text.secondary', 
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.1em'
          }}
        >
          MAIN MENU
        </Typography>
        
        <List sx={{ mt: 1 }}>
          {getMenuItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  my: 0.7,
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateX(5px)',
                  },
                  overflow: 'hidden',
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'primary.main' : 'text.secondary',
                  minWidth: 42,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: 15,
                    fontWeight: isActive ? 600 : 500,
                  }} 
                />
                {isActive && (
                  <ArrowIcon sx={{ color: 'primary.main' }} />
                )}
                {isActive && (
                  <Box sx={{ 
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: 'primary.main',
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
              </ListItem>
            );
          })}
        </List>
        
        <Divider sx={{ my: 3, opacity: 0.6 }} />
        
        <Typography 
          variant="overline" 
          sx={{ 
            px: 1, 
            color: 'text.secondary', 
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.1em'
          }}
        >
          UTILITIES
        </Typography>
        
        <List sx={{ mt: 1 }}>
          {utilityItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  my: 0.7,
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateX(5px)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'primary.main' : 'text.secondary',
                  minWidth: 42,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: 15,
                    fontWeight: isActive ? 600 : 500,
                  }} 
                />
                {isActive && (
                  <ArrowIcon sx={{ color: 'primary.main' }} />
                )}
              </ListItem>
            );
          })}
          
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              my: 0.7,
              color: 'error.main',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                transform: 'translateX(5px)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: 'error.main',
              minWidth: 42,
            }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                fontSize: 15,
                fontWeight: 500,
              }} 
            />
          </ListItem>
        </List>
      </Box>
      
      {user && (
        <Paper
          elevation={0}
          sx={{ 
            p: 2.5,
            mx: 2,
            mb: 2,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.light, 0.1),
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.light, 0.2),
          }}
        >
          <Avatar sx={{ 
            width: 48, 
            height: 48, 
            bgcolor: 'primary.main',
            boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2)'
          }}>
            {user.name.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                '&::before': {
                  content: '""',
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  marginRight: '6px'
                }
              }}
            >
              {user.role === 'restaurant_owner' ? 'Owner' : 'Customer'}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );

  const currentPageTitle = getMenuItems().find(item => item.path === location.pathname)?.text || 'Welcome';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.05),
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar sx={{ height: 70 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              borderRadius: 2,
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>
              {currentPageTitle}
            </Typography>
            
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                ml: 2,
                borderRadius: 10,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Box>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Theme Toggle Button */}
              <Tooltip title={themeMode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <IconButton
                  onClick={toggleThemeMode}
                  color="inherit"
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                    mr: 1,
                  }}
                >
                  {themeMode === 'dark' ? (
                    <LightModeIcon sx={{ color: theme.palette.warning.light }} />
                  ) : (
                    <DarkModeIcon />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Search">
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              
              <IconButton
                color="inherit"
                onClick={handleNotificationsOpen}
                sx={{ 
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                <Badge 
                  badgeContent={3} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      boxShadow: '0 0 0 2px #fff'
                    }
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              <Menu
                anchorEl={notificationsAnchorEl}
                open={Boolean(notificationsAnchorEl)}
                onClose={handleNotificationsClose}
                PaperProps={{
                  elevation: 5,
                  sx: { 
                    width: 340,
                    maxHeight: 450,
                    overflow: 'auto',
                    mt: 1.5,
                    borderRadius: 2,
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: alpha(theme.palette.divider, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon color="action" />
                  </Badge>
                </Box>
                
                <MenuItem 
                  onClick={handleNotificationsClose} 
                  sx={{ 
                    p: 0,
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.08),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <Box sx={{ p: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>Reservation Confirmed</Typography>
                      <Typography variant="caption" color="text.secondary">2h ago</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Your reservation at Italian Bistro has been confirmed for tomorrow at 7:00 PM
                    </Typography>
                  </Box>
                </MenuItem>
                
                <MenuItem 
                  onClick={handleNotificationsClose} 
                  sx={{ 
                    p: 0,
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.08),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <Box sx={{ p: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>New Event Available</Typography>
                      <Typography variant="caption" color="text.secondary">5h ago</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Wine Tasting event is now available for booking at Vineyard Restaurant
                    </Typography>
                  </Box>
                </MenuItem>
                
                <MenuItem 
                  onClick={handleNotificationsClose} 
                  sx={{ 
                    p: 0,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <Box sx={{ p: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>Upcoming Reservation</Typography>
                      <Typography variant="caption" color="text.secondary">1d ago</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Don't forget your reservation tomorrow at Seafood House at 6:30 PM
                    </Typography>
                  </Box>
                </MenuItem>
                
                <Box sx={{ 
                  p: 1.5, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  borderTop: '1px solid', 
                  borderColor: alpha(theme.palette.divider, 0.1),
                  backgroundColor: alpha(theme.palette.primary.main, 0.02)
                }}>
                  <Button 
                    size="small" 
                    color="primary"
                    variant="text"
                    sx={{ 
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 1.5
                    }}
                  >
                    View All Notifications
                  </Button>
                </Box>
              </Menu>
              
              <Box 
                sx={{ 
                  display: { xs: 'none', md: 'flex' }, 
                  alignItems: 'center', 
                  ml: 2 
                }}
              >
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{
                    p: 0,
                    border: '2px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'primary.main'
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Box>
              
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ 
                  display: { xs: 'flex', md: 'none' },
                  p: 0,
                  border: '2px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }}
              >
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 5,
                  sx: { 
                    width: 240,
                    mt: 1.5,
                    borderRadius: 2,
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 20,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ 
                  py: 2, 
                  px: 2.5, 
                  borderBottom: '1px solid', 
                  borderColor: alpha(theme.palette.divider, 0.1),
                  textAlign: 'center'
                }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: 'primary.main',
                      mx: 'auto',
                      mb: 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {user.email}
                  </Typography>
                </Box>
                
                <MenuItem 
                  onClick={() => navigate('/profile')} 
                  sx={{ 
                    py: 1.5,
                    px: 2.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2" fontWeight={500}>Profile</Typography>
                </MenuItem>
                
                <MenuItem 
                  onClick={() => navigate('/settings')} 
                  sx={{ 
                    py: 1.5,
                    px: 2.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2" fontWeight={500}>Settings</Typography>
                </MenuItem>
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    py: 1.5,
                    px: 2.5,
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.08)
                    },
                    mb: 1
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <Typography variant="body2" fontWeight={500}>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.05),
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '70px',
          bgcolor: 'grey.50',
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #f5f7fa, #f9fafb)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;