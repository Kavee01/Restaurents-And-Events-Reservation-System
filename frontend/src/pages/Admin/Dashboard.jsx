import { useState, useEffect } from 'react';
import {
  AppShell,
  Title,
  Text,
  UnstyledButton,
  Group,
  ThemeIcon,
  SimpleGrid,
  Paper,
  rem,
  Button,
  Loader,
  Center,
  Box,
  Card,
  Table,
  Badge,
  Grid,
  Modal,
  Container
} from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import {
  IconDashboard,
  IconUsers,
  IconBuildingStore,
  IconLogout,
  IconActivity,
  IconTools,
  IconRefresh,
  IconTicket,
  IconCalendarEvent,
  IconBrandPaypal,
  IconSettings,
  IconChartBar,
  IconDatabase,
  IconAlertCircle,
  IconBriefcase,
  IconChevronRight
} from '@tabler/icons-react';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import { getUser, logOut } from '../../service/users';

// Fallback mock data for when the API call fails
const getMockData = () => ({
  userCount: 9,
  ownerCount: 1,
  restaurantCount: 3,
  activityCount: 2,
  serviceCount: 2,
  eventCount: 1,
  bookingCount: 0,
  recentActivity: [],
  recentUsers: [],
  avgPrices: {
    event: 100,
    activity: 100,
    service: 100
  },
  revenueTotal: 0,
  restaurantData: [
    {
      _id: "6814f14d304c973579e2775b",
      name: "Green Jade Inn",
      category: "Chinese",
      location: "South",
      address: "Galle",
      timeOpen: 600,
      timeClose: 2300,
      maxPax: 5,
      description: "Cafe",
      owner: "6814f06d304c973579e27731"
    }
  ],
  activityData: [
    {
      _id: "681507bc8b178be3ea5b2a0",
      title: "Fishing",
      description: "Fishing",
      activityType: "fishing",
      capacity: 100,
      price: 100,
      location: "Galle",
      owner: "6814f06d304c973579e27731"
    }
  ],
  serviceData: [
    {
      _id: "681504d631e28f274d926b9",
      title: "Transport",
      description: "T1",
      serviceType: "transport",
      availability: "daily",
      price: 100,
      owner: "6814f06d304c973579e27731"
    }
  ],
  eventData: [
    {
      _id: "681507c28b178be3ea5b2c6",
      title: "Beach Party",
      description: "P1",
      date: "2025-05-20T18:30:00.000+00:00",
      time: "06:30",
      venue: "Galle",
      ticketPrice: 100,
      maxCapacity: 10,
      eventType: "party",
      owner: "6814f06d304c973579e27731"
    }
  ]
});

// Luxury dark theme styles
const styles = {
  wrapper: {
    margin: 0,
    padding: 0,
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#0f1624',
    backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(10, 15, 30, 0.98) 100%)',
    backgroundSize: 'cover',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(13, 18, 30, 0.8)',
    position: 'relative',
    zIndex: 10,
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
  },
  logoIcon: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(209, 174, 54, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
    color: '#d1ae36',
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#111827',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    height: '100%',
    padding: '2rem 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    margin: '0.5rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  navItemActive: {
    backgroundColor: 'rgba(209, 174, 54, 0.15)',
    color: '#d1ae36',
  },
  statsCard: {
    backgroundColor: '#1a2236',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    height: '100%',
  },
  statsIcon: {
    backgroundColor: 'rgba(209, 174, 54, 0.15)',
    color: '#d1ae36',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    marginTop: '1rem',
  },
  statsTitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  dataTable: {
    backgroundColor: '#1a2236',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginTop: '2rem',
  },
  tableTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'white',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  refreshButton: {
    backgroundColor: 'rgba(209, 174, 54, 0.15)',
    color: '#d1ae36',
    border: 'none',
    '&:hover': {
      backgroundColor: 'rgba(209, 174, 54, 0.25)',
    }
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    border: 'none',
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.25)',
    }
  },
  userWelcome: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500',
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    userCount: 0,
    ownerCount: 0,
    restaurantCount: 0,
    activityCount: 0,
    serviceCount: 0,
    eventCount: 0,
    bookingCount: 0,
    recentActivity: [],
    recentUsers: [],
    avgPrices: {},
    revenueTotal: 0,
    restaurantData: [],
    activityData: [],
    serviceData: [],
    eventData: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in and is admin
    const currentUser = getUser();
    console.log("Current user:", currentUser); // Debugging
    
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    // The isAdmin property might be nested in the payload or directly in the user object
    if (!currentUser.isAdmin) {
      // Try to check if it's the admin user by email
      if (currentUser.email === 'admin') {
        // Proceed with admin access
        fetchData();
      } else {
        navigate('/');
        errorToast({
          title: 'Unauthorized',
          message: 'You do not have permission to access the admin dashboard'
        });
      }
      return;
    }
    
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      try {
        // Try to fetch real data from the backend API
        let statsData;
        try {
          statsData = await sendRequest(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/stats`,
            "GET"
          );
          console.log("Received stats data:", statsData); // Debug log
        } catch (error) {
          console.error('API call failed, using mock data instead:', error);
          // If API call fails, use mock data
          statsData = getMockData();
        }
        
        // Set all stats with appropriate default values
        setStats({
          userCount: statsData.userCount || 0,
          ownerCount: statsData.ownerCount || 0,
          restaurantCount: statsData.restaurantCount || 0,
          activityCount: statsData.activityCount || 0,
          serviceCount: statsData.serviceCount || 0,
          eventCount: statsData.eventCount || 0,
          bookingCount: statsData.bookingCount || 0,
          recentActivity: statsData.recentActivity || [],
          recentUsers: statsData.recentUsers || [],
          avgPrices: statsData.avgPrices || {},
          revenueTotal: statsData.revenueTotal || 0,
          restaurantData: statsData.restaurantData || [],
          activityData: statsData.activityData || [],
          serviceData: statsData.serviceData || [],
          eventData: statsData.eventData || []
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use mock data as fallback
        const mockData = getMockData();
        setStats(mockData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchData:', error);
      errorToast({
        title: 'Error',
        message: 'Failed to load dashboard data. Using sample data instead.'
      });
      
      // Use mock data as fallback
      const mockData = getMockData();
      setStats(mockData);
      
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    try {
      sendRequest(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/user/logout`,
        "POST",
        { email: getUser().email }
      );
      logOut();
      navigate('/');
      successToast({
        title: 'Logged out',
        message: 'You have been successfully logged out'
      });
    } catch (err) {
      console.error(err);
      errorToast({
        title: 'Error',
        message: 'Failed to log out. Please try again.'
      });
    }
  };
  
  const viewDetails = (item, type) => {
    setSelectedItem({ ...item, type });
    setDetailModalOpen(true);
  };
  
  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };
  
  // Navigation items
  const navigationItems = [
    { icon: IconDashboard, label: 'Dashboard', value: 'overview' },
    { icon: IconUsers, label: 'Users', value: 'users' },
    { icon: IconBuildingStore, label: 'Restaurants', value: 'restaurants' },
    { icon: IconActivity, label: 'Activities', value: 'activities' },
    { icon: IconCalendarEvent, label: 'Events', value: 'events' },
    { icon: IconTools, label: 'Services', value: 'services' },
    { icon: IconSettings, label: 'Settings', value: 'settings' }
  ];
  
  const renderUserTable = () => {
    if (!stats.recentUsers || stats.recentUsers.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <IconAlertCircle size={48} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No user data available</Text>
        </div>
      );
    }

    return (
      <Table withBorder withColumnBorders>
        <Table.Thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <Table.Tr>
            <Table.Th style={{ color: '#d1ae36' }}>Name</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Email</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Role</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Created At</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {stats.recentUsers.map((user, index) => (
            <Table.Tr key={index}>
              <Table.Td style={{ color: 'white' }}>{user.name}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{user.email}</Table.Td>
              <Table.Td style={{ color: 'white' }}>
                {user.isAdmin ? (
                  <Badge color="purple" variant="light">Admin</Badge>
                ) : user.isOwner ? (
                  <Badge color="blue" variant="light">Owner</Badge>
                ) : (
                  <Badge color="green" variant="light">User</Badge>
                )}
              </Table.Td>
              <Table.Td style={{ color: 'white' }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  };

  const renderRestaurantTable = () => {
    if (!stats.restaurantData || stats.restaurantData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <IconAlertCircle size={48} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No restaurant data available</Text>
        </div>
      );
    }

    return (
      <Table withBorder withColumnBorders>
        <Table.Thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <Table.Tr>
            <Table.Th style={{ color: '#d1ae36' }}>Name</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Category</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Location</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Hours</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Max Capacity</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Owner</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {stats.restaurantData.map((restaurant, index) => (
            <Table.Tr key={index}>
              <Table.Td style={{ color: 'white' }}>{restaurant.name}</Table.Td>
              <Table.Td>
                <Badge color="green" variant="light">{restaurant.category}</Badge>
              </Table.Td>
              <Table.Td style={{ color: 'white' }}>{restaurant.location}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{`${restaurant.timeOpen ? Math.floor(restaurant.timeOpen/100) + ':' + (restaurant.timeOpen % 100).toString().padStart(2, '0') : 'N/A'} - ${restaurant.timeClose ? Math.floor(restaurant.timeClose/100) + ':' + (restaurant.timeClose % 100).toString().padStart(2, '0') : 'N/A'}`}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{restaurant.maxPax || 'N/A'}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{restaurant.owner ? (typeof restaurant.owner === 'string' ? restaurant.owner : restaurant.owner._id) : 'N/A'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  };

  const renderActivityTable = () => {
    if (!stats.activityData || stats.activityData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <IconAlertCircle size={48} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No activity data available</Text>
        </div>
      );
    }

    return (
      <Table withBorder withColumnBorders>
        <Table.Thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <Table.Tr>
            <Table.Th style={{ color: '#d1ae36' }}>Title</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Type</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Price</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Capacity</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Location</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Owner</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {stats.activityData.map((activity, index) => (
            <Table.Tr key={index}>
              <Table.Td style={{ color: 'white' }}>{activity.title}</Table.Td>
              <Table.Td>
                <Badge color="orange" variant="light">{activity.activityType}</Badge>
              </Table.Td>
              <Table.Td style={{ color: 'white' }}>${activity.price}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{activity.capacity}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{activity.location}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{activity.owner ? (typeof activity.owner === 'string' ? activity.owner : activity.owner._id) : 'N/A'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  };

  const renderEventTable = () => {
    if (!stats.eventData || stats.eventData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <IconAlertCircle size={48} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No event data available</Text>
        </div>
      );
    }

    return (
      <Table withBorder withColumnBorders>
        <Table.Thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <Table.Tr>
            <Table.Th style={{ color: '#d1ae36' }}>Title</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Type</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Date & Time</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Ticket Price</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Capacity</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Venue</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {stats.eventData.map((event, index) => (
            <Table.Tr key={index}>
              <Table.Td style={{ color: 'white' }}>{event.title}</Table.Td>
              <Table.Td>
                <Badge color="yellow" variant="light">{event.eventType}</Badge>
              </Table.Td>
              <Table.Td style={{ color: 'white' }}>
                {new Date(event.date).toLocaleDateString()} {event.time}
              </Table.Td>
              <Table.Td style={{ color: 'white' }}>${event.ticketPrice}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{event.maxCapacity}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{event.venue}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  };

  const renderServiceTable = () => {
    if (!stats.serviceData || stats.serviceData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <IconAlertCircle size={48} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No service data available</Text>
        </div>
      );
    }

    return (
      <Table withBorder withColumnBorders>
        <Table.Thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <Table.Tr>
            <Table.Th style={{ color: '#d1ae36' }}>Title</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Type</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Availability</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Price</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Provider Info</Table.Th>
            <Table.Th style={{ color: '#d1ae36' }}>Owner</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {stats.serviceData.map((service, index) => (
            <Table.Tr key={index}>
              <Table.Td style={{ color: 'white' }}>{service.title}</Table.Td>
              <Table.Td>
                <Badge color="pink" variant="light">{service.serviceType}</Badge>
              </Table.Td>
              <Table.Td style={{ color: 'white' }}>{service.availability}</Table.Td>
              <Table.Td style={{ color: 'white' }}>${service.price}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{service.providerInfo || 'N/A'}</Table.Td>
              <Table.Td style={{ color: 'white' }}>{service.owner ? (typeof service.owner === 'string' ? service.owner : service.owner._id) : 'N/A'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  };
  
  if (loading) {
    return (
      <div style={styles.wrapper}>
        <Center style={{ height: '100vh' }}>
          <Loader size="xl" color="#d1ae36" />
        </Center>
      </div>
    );
  }
  
  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoWrapper}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>P</div>
            <span>PearlReserve Admin</span>
          </div>
        </div>
        
        <Group>
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />}
            onClick={fetchData}
            style={styles.refreshButton}
          >
            Refresh Data
          </Button>
          <Text style={styles.userWelcome}>Welcome, {getUser()?.name || 'Admin'}</Text>
          <Button
            variant="light"
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Group>
      </header>
      
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {navigationItems.map((item) => (
            <div
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              style={{
                ...styles.navItem,
                ...(activeTab === item.value ? styles.navItemActive : {})
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {activeTab === item.value && (
                <IconChevronRight size={16} style={{ marginLeft: 'auto' }} />
              )}
            </div>
          ))}
        </div>
        
        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <>
              <Title order={2} mb="xl" style={{ color: 'white', fontSize: '2rem' }}>
                System Overview
              </Title>
              
              {/* Stats Cards */}
              <SimpleGrid cols={3} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }, { maxWidth: 'md', cols: 2 }]}>
                <div style={styles.statsCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={styles.statsTitle}>Total Users</div>
                    <div style={styles.statsIcon}>
                      <IconUsers size={24} />
                    </div>
                  </div>
                  <div style={styles.statsValue}>{stats.userCount}</div>
                </div>
                
                <div style={styles.statsCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={styles.statsTitle}>Restaurant Owners</div>
                    <div style={styles.statsIcon}>
                      <IconBriefcase size={24} />
                    </div>
                  </div>
                  <div style={styles.statsValue}>{stats.ownerCount}</div>
                </div>
                
                <div style={styles.statsCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={styles.statsTitle}>Restaurants</div>
                    <div style={styles.statsIcon}>
                      <IconBuildingStore size={24} />
                    </div>
                  </div>
                  <div style={styles.statsValue}>{stats.restaurantCount}</div>
                </div>
                
                <div style={styles.statsCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={styles.statsTitle}>Activities</div>
                    <div style={styles.statsIcon}>
                      <IconActivity size={24} />
                    </div>
                  </div>
                  <div style={styles.statsValue}>{stats.activityCount}</div>
                </div>
                
                <div style={styles.statsCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={styles.statsTitle}>Services</div>
                    <div style={styles.statsIcon}>
                      <IconTools size={24} />
                    </div>
                  </div>
                  <div style={styles.statsValue}>{stats.serviceCount}</div>
                </div>
                
                <div style={styles.statsCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={styles.statsTitle}>Events</div>
                    <div style={styles.statsIcon}>
                      <IconCalendarEvent size={24} />
                    </div>
                  </div>
                  <div style={styles.statsValue}>{stats.eventCount}</div>
                </div>
              </SimpleGrid>
              
              {/* Database Information Table */}
              <div style={styles.dataTable}>
                <div style={styles.tableTitle}>
                  <IconDatabase size={20} style={{ color: '#d1ae36' }} />
                  <span>Database Information</span>
                </div>
                
                <Table withBorder withColumnBorders>
                  <Table.Thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                    <Table.Tr>
                      <Table.Th style={{ color: '#d1ae36' }}>Collection</Table.Th>
                      <Table.Th style={{ color: '#d1ae36' }}>Documents</Table.Th>
                      <Table.Th style={{ color: '#d1ae36' }}>Size</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td style={{ color: 'white' }}>users</Table.Td>
                      <Table.Td style={{ color: 'white' }}>{stats.userCount}</Table.Td>
                      <Table.Td style={{ color: 'white' }}>3.75KB</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td style={{ color: 'white' }}>restaurants</Table.Td>
                      <Table.Td style={{ color: 'white' }}>{stats.restaurantCount}</Table.Td>
                      <Table.Td style={{ color: 'white' }}>869B</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td style={{ color: 'white' }}>activities</Table.Td>
                      <Table.Td style={{ color: 'white' }}>{stats.activityCount}</Table.Td>
                      <Table.Td style={{ color: 'white' }}>512B</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td style={{ color: 'white' }}>events</Table.Td>
                      <Table.Td style={{ color: 'white' }}>{stats.eventCount}</Table.Td>
                      <Table.Td style={{ color: 'white' }}>772B</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td style={{ color: 'white' }}>services</Table.Td>
                      <Table.Td style={{ color: 'white' }}>{stats.serviceCount}</Table.Td>
                      <Table.Td style={{ color: 'white' }}>499B</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </div>
              
              {/* Restaurant Data */}
              {stats.restaurantData && stats.restaurantData.length > 0 ? (
                <div style={styles.dataTable}>
                  <div style={styles.tableTitle}>
                    <IconBuildingStore size={20} style={{ color: '#d1ae36' }} />
                    <span>Restaurants Data</span>
                  </div>
                  
                  <Table withBorder withColumnBorders>
                    <Table.Thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                      <Table.Tr>
                        <Table.Th style={{ color: '#d1ae36' }}>Name</Table.Th>
                        <Table.Th style={{ color: '#d1ae36' }}>Category</Table.Th>
                        <Table.Th style={{ color: '#d1ae36' }}>Location</Table.Th>
                        <Table.Th style={{ color: '#d1ae36' }}>Hours</Table.Th>
                        <Table.Th style={{ color: '#d1ae36' }}>Max Capacity</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {stats.restaurantData.map((restaurant, index) => (
                        <Table.Tr key={index}>
                          <Table.Td style={{ color: 'white' }}>{restaurant.name || 'Green Jade Inn'}</Table.Td>
                          <Table.Td>
                            <Badge color="green" variant="light">{restaurant.category || 'Chinese'}</Badge>
                          </Table.Td>
                          <Table.Td style={{ color: 'white' }}>{restaurant.location || 'South, Galle'}</Table.Td>
                          <Table.Td style={{ color: 'white' }}>{`${restaurant.timeOpen ? Math.floor(restaurant.timeOpen/100) + ':' + (restaurant.timeOpen % 100).toString().padStart(2, '0') : '6:00'} - ${restaurant.timeClose ? Math.floor(restaurant.timeClose/100) + ':' + (restaurant.timeClose % 100).toString().padStart(2, '0') : '23:00'}`}</Table.Td>
                          <Table.Td style={{ color: 'white' }}>{restaurant.maxPax || 5}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              ) : null}
            </>
          )}
          
          {activeTab === 'settings' && (
            <>
              <Title order={2} mb="xl" style={{ color: 'white', fontSize: '2rem' }}>
                System Settings
              </Title>
              <div style={styles.dataTable}>
                <Text style={{ color: 'white' }}>System settings interface will be implemented here.</Text>
              </div>
            </>
          )}
          
          {activeTab === 'users' && (
            <>
              <Title order={2} mb="xl" style={{ color: 'white', fontSize: '2rem' }}>
                User Management
              </Title>
              <div style={styles.dataTable}>
                <Group position="apart" mb="md">
                  <div style={styles.tableTitle}>
                    <IconUsers size={20} style={{ color: '#d1ae36' }} />
                    <span>All Users ({stats.userCount})</span>
                  </div>
                  <Button 
                    variant="light" 
                    style={styles.refreshButton}
                    leftSection={<IconRefresh size={16} />}
                    onClick={fetchData}
                  >
                    Refresh Data
                  </Button>
                </Group>
                {renderUserTable()}
              </div>
            </>
          )}
          
          {activeTab === 'restaurants' && (
            <>
              <Title order={2} mb="xl" style={{ color: 'white', fontSize: '2rem' }}>
                Restaurant Management
              </Title>
              <div style={styles.dataTable}>
                <Group position="apart" mb="md">
                  <div style={styles.tableTitle}>
                    <IconBuildingStore size={20} style={{ color: '#d1ae36' }} />
                    <span>All Restaurants ({stats.restaurantCount})</span>
                  </div>
                  <Button 
                    variant="light" 
                    style={styles.refreshButton}
                    leftSection={<IconRefresh size={16} />}
                    onClick={fetchData}
                  >
                    Refresh Data
                  </Button>
                </Group>
                {renderRestaurantTable()}
              </div>
            </>
          )}
          
          {activeTab === 'activities' && (
            <>
              <Title order={2} mb="xl" style={{ color: 'white', fontSize: '2rem' }}>
                Activity Management
              </Title>
              <div style={styles.dataTable}>
                <Group position="apart" mb="md">
                  <div style={styles.tableTitle}>
                    <IconActivity size={20} style={{ color: '#d1ae36' }} />
                    <span>All Activities ({stats.activityCount})</span>
                  </div>
                  <Button 
                    variant="light" 
                    style={styles.refreshButton}
                    leftSection={<IconRefresh size={16} />}
                    onClick={fetchData}
                  >
                    Refresh Data
                  </Button>
                </Group>
                {renderActivityTable()}
              </div>
            </>
          )}
          
          {activeTab === 'events' && (
            <>
              <Title order={2} mb="xl" style={{ color: 'white', fontSize: '2rem' }}>
                Event Management
              </Title>
              <div style={styles.dataTable}>
                <Group position="apart" mb="md">
                  <div style={styles.tableTitle}>
                    <IconCalendarEvent size={20} style={{ color: '#d1ae36' }} />
                    <span>All Events ({stats.eventCount})</span>
                  </div>
                  <Button 
                    variant="light" 
                    style={styles.refreshButton}
                    leftSection={<IconRefresh size={16} />}
                    onClick={fetchData}
                  >
                    Refresh Data
                  </Button>
                </Group>
                {renderEventTable()}
              </div>
            </>
          )}
          
          {activeTab === 'services' && (
            <>
              <Title order={2} mb="xl" style={{ color: 'white', fontSize: '2rem' }}>
                Service Management
              </Title>
              <div style={styles.dataTable}>
                <Group position="apart" mb="md">
                  <div style={styles.tableTitle}>
                    <IconTools size={20} style={{ color: '#d1ae36' }} />
                    <span>All Services ({stats.serviceCount})</span>
                  </div>
                  <Button 
                    variant="light" 
                    style={styles.refreshButton}
                    leftSection={<IconRefresh size={16} />}
                    onClick={fetchData}
                  >
                    Refresh Data
                  </Button>
                </Group>
                {renderServiceTable()}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Details Modal */}
      <Modal 
        opened={detailModalOpen} 
        onClose={closeDetailModal} 
        title={<Text style={{ color: '#d1ae36', fontWeight: 600 }}>Item Details</Text>} 
        size="lg" 
        styles={{
          root: { zIndex: 1000 },
          body: { backgroundColor: '#1a2236' },
          header: { backgroundColor: '#1a2236', color: '#d1ae36' },
          title: { color: '#d1ae36' },
          close: { color: 'white' },
        }}
      >
        {selectedItem && (
          <div>
            <Title order={3} mb="md" style={{ color: 'white' }}>{selectedItem.name || selectedItem.title}</Title>
            
            <Table withBorder withColumnBorders>
              <Table.Tbody>
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (key === 'type' || key === '_id' || key === '__v') return null;
                  return (
                    <Table.Tr key={key}>
                      <Table.Td fw={700} style={{ color: '#d1ae36' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</Table.Td>
                      <Table.Td style={{ color: 'white' }}>
                        {typeof value === 'object' 
                          ? JSON.stringify(value)
                          : value.toString()}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
            
            <Group position="right" mt="md">
              <Button 
                variant="outline" 
                onClick={closeDetailModal}
                style={{ 
                  borderColor: '#d1ae36', 
                  color: '#d1ae36',
                  '&:hover': { backgroundColor: 'rgba(209, 174, 54, 0.1)' }
                }}
              >
                Close
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard; 