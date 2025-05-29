import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Flex,
  Box,
  ActionIcon,
  Badge,
  Paper,
  TextInput,
  UnstyledButton,
  Menu,
  rem,
  Divider,
} from "@mantine/core";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconCalendarEvent,
  IconCurrencyDollar,
  IconMapPin,
  IconUsers,
  IconSearch,
  IconX,
  IconChevronDown,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconStar,
  IconToolsKitchen2,
  IconBuildingCommunity,
  IconUser,
  IconSwimming,
  IconActivity,
  IconCategory,
} from "@tabler/icons-react";
import useToast from "../../hooks/useToast";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";

function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { sendRequest } = useFetch();
  const navigate = useNavigate();
  const { successToast, errorToast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      if (!currentUser.isOwner) {
        navigate("/signin");
        return;
      }
    } else {
      navigate("/signin");
      return;
    }
    
    getAllActivities();
  }, []);

  useEffect(() => {
    // Filter activities based on location input
    if (locationFilter.trim() === '') {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(activity => 
        activity.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
      setFilteredActivities(filtered);
    }
  }, [locationFilter, activities]);

  const getAllActivities = async () => {
    setLoading(true);
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/activities/owner-activities`,
        "GET"
      );
      setActivities(resData);
      setFilteredActivities(resData);
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Failed to load activities. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await sendRequest(
          `${import.meta.env.VITE_API_URL}/activities/${id}`,
          "DELETE"
        );
        
        const updatedActivities = activities.filter(activity => activity._id !== id);
        setActivities(updatedActivities);
        setFilteredActivities(
          locationFilter.trim() === '' 
            ? updatedActivities 
            : updatedActivities.filter(activity => 
                activity.location?.toLowerCase().includes(locationFilter.toLowerCase())
              )
        );
        
        successToast({
          title: "Success",
          message: "Activity deleted successfully.",
        });
      } catch (err) {
        console.log(err);
        errorToast({
          title: "Error",
          message: "Failed to delete activity. Please try again.",
        });
      }
    }
  };

  const formatDateRange = (dates) => {
    if (!dates || dates.length === 0) return "No dates available";
    
    // Sort dates chronologically
    const sortedDates = [...dates].map(d => new Date(d)).sort((a, b) => a - b);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    if (sortedDates.length === 1) {
      return formatter.format(sortedDates[0]);
    }
    
    // If there are multiple dates, show the range
    return `${formatter.format(sortedDates[0])} - ${formatter.format(sortedDates[sortedDates.length - 1])}`;
  };

  const handleMouseEnter = (id) => {
    setHoveredItem(id);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const clearFilter = () => {
    setLocationFilter("");
  };

  const handleLogout = () => {
    try {
      sendRequest(
        `${import.meta.env.VITE_API_URL}/user/logout`,
        "POST",
        { email: user.email }
      );
      logOut();
      setUser(null);
      navigate("/");
      successToast({
        title: "See you again!",
        message: "You have successfully logged out.",
      });
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div style={sharedStyles.wrapper}>
      <div style={sharedStyles.starsBackground}></div>
      
      {/* Custom Header/Navigation */}
      <header style={sharedStyles.header}>
        <div style={sharedStyles.logoWrapper}>
          <Link to="/" style={sharedStyles.logo}>
            <div style={sharedStyles.logoIcon}>P</div>
            <span>PearlReserve</span>
          </Link>
        </div>
        
        <nav style={sharedStyles.nav}>
          <Link 
            to="/restaurants" 
            style={sharedStyles.navItem}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderBottom = '2px solid #d1ae36';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderBottom = '2px solid transparent';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            Restaurants
          </Link>
          <Link 
            to="/events" 
            style={sharedStyles.navItem}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderBottom = '2px solid #d1ae36';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderBottom = '2px solid transparent';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            Events
          </Link>
          <Link 
            to="/activities" 
            style={sharedStyles.navItem}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderBottom = '2px solid #d1ae36';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderBottom = '2px solid transparent';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            Activities
          </Link>
          <Link 
            to="/services" 
            style={sharedStyles.navItem}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderBottom = '2px solid #d1ae36';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderBottom = '2px solid transparent';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            Services
          </Link>
        </nav>
        
        <div>
          {user && (
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: "pop-top-right" }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
              styles={{
                dropdown: {
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: '#fffaed',
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(10px)'
                }
              }}
            >
              <Menu.Target>
                <UnstyledButton
                  style={{
                    borderRadius: '50px',
                    padding: '8px 16px',
                    backgroundColor: userMenuOpened ? 'rgba(214, 171, 31, 0.3)' : '#d1ae36',
                    color: '#1a2a41',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.9)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = userMenuOpened ? 'rgba(209, 174, 54, 0.3)' : '#d1ae36';
                  }}
                >
                  <Group gap={7}>
                    <IconUser size={16} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {user?.name}
                    </Text>
                    <IconChevronDown
                      style={{ width: rem(12), height: rem(12) }}
                      stroke={1.8}
                    />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {user?.isOwner && (
                  <>
                    <Menu.Item
                      component={Link}
                      to="/owner/dashboard"
                      leftSection={
                        <IconStar
                          style={{ width: rem(16), height: rem(16) }}
                          color="#d1ae36"
                          stroke={1.5}
                        />
                      }
                      sx={{
                        color: '#fff',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      }}
                    >
                      Your Guests
                    </Menu.Item>
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/restaurants"
                      leftSection={
                        <IconMapPin
                          style={{ width: rem(16), height: rem(16) }}
                          color="#d1ae36"
                          stroke={1.5}
                        />
                      }
                      sx={{
                        color: '#fff',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      }}
                    >
                      Your Restaurants
                    </Menu.Item>
                    
                    <Divider 
                      my="xs" 
                      color="rgba(255, 255, 255, 0.1)" 
                      label={
                        <Text size="xs" weight={500} color="white">
                          Booking Management
                        </Text>
                      } 
                      labelPosition="center"
                    />
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/restaurant-bookings"
                      leftSection={
                        <IconBuildingCommunity
                          style={{ width: rem(16), height: rem(16) }}
                          color="#d1ae36"
                          stroke={1.5}
                        />
                      }
                      sx={{
                        color: '#fff',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      }}
                    >
                      Restaurant Bookings
                    </Menu.Item>
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/activity-bookings"
                      leftSection={
                        <IconSwimming
                          style={{ width: rem(16), height: rem(16) }}
                          color="#d1ae36"
                          stroke={1.5}
                        />
                      }
                      sx={{
                        color: '#fff',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      }}
                    >
                      Activity Bookings
                    </Menu.Item>
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/event-bookings"
                      leftSection={
                        <IconCalendarEvent
                          style={{ width: rem(16), height: rem(16) }}
                          color="#d1ae36"
                          stroke={1.5}
                        />
                      }
                      sx={{
                        color: '#fff',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      }}
                    >
                      Event Bookings
                    </Menu.Item>
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/service-bookings"
                      leftSection={
                        <IconToolsKitchen2
                          style={{ width: rem(16), height: rem(16) }}
                          color="#d1ae36"
                          stroke={1.5}
                        />
                      }
                      sx={{
                        color: '#fff',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      }}
                    >
                      Service Bookings
                    </Menu.Item>
                  </>
                )}

                <Divider my="xs" color="rgba(255, 255, 255, 0.1)" />

                <Menu.Item
                  leftSection={
                    <IconLogout
                      style={{ width: rem(16), height: rem(16) }}
                      color="rgba(255, 255, 255, 0.7)"
                      stroke={1.5}
                    />
                  }
                  onClick={handleLogout}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }
                  }}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </div>
      </header>
      
      <div style={sharedStyles.contentContainer}>
        <Container size="xl">
          <Group position="apart" mb="xl">
            <Title order={2} style={{ color: 'white' }}>Manage Activities</Title>
            <Button 
              component={Link} 
              to="/owner/activities/new"
              leftSection={<IconPlus size={14} />}
              style={{
                backgroundColor: '#d1ae36',
                color: '#1a2a41',
                border: 'none',
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: 'rgba(209, 174, 54, 0.9)'
                  }
                }
              }}
            >
              Add New Activity
            </Button>
          </Group>

          <Box mb="xl">
            <TextInput
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              rightSection={
                locationFilter ? (
                  <IconX 
                    size={18} 
                    style={{ cursor: 'pointer' }} 
                    onClick={clearFilter}
                  />
                ) : (
                  <IconSearch size={18} />
                )
              }
              styles={{
                root: {
                  maxWidth: '500px',
                },
                input: {
                  borderColor: locationFilter ? '#d1ae36' : undefined,
                  '&:focus': {
                    borderColor: '#d1ae36',
                  },
                },
                label: {
                  color: 'white',
                },
              }}
            />
            {locationFilter && (
              <Text size="sm" mt="xs" c="dimmed">
                Showing {filteredActivities.length} of {activities.length} activities
              </Text>
            )}
          </Box>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {activities.length === 0 ? (
                <Box py="lg">
                  <Text c="white">No activities found. Add a new activity to get started.</Text>
                  <Button 
                    mt="md" 
                    component={Link} 
                    to="/owner/activities/new"
                    style={{
                      backgroundColor: '#d1ae36',
                      color: '#1a2a41',
                    }}
                  >
                    Create Activity
                  </Button>
                </Box>
              ) : (
                <Flex
                  gap="xl"
                  justify="flex-start"
                  align="stretch"
                  wrap="wrap"
                  mt="xl"
                >
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <Box
                        key={activity._id}
                        w="calc(33.3333% - var(--mantine-spacing-xl) * 2 / 3)"
                        onMouseEnter={() => handleMouseEnter(activity._id)}
                        onMouseLeave={handleMouseLeave}
                        style={{ marginBottom: '20px' }}
                      >
                        <Paper
                          shadow="md"
                          radius="md"
                          p="md"
                          style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            transform: hoveredItem === activity._id ? 'translateY(-5px)' : 'none',
                            boxShadow: hoveredItem === activity._id 
                              ? '0 15px 30px rgba(0, 0, 0, 0.15), 0 0 10px rgba(209, 174, 54, 0.2)' 
                              : '0 5px 15px rgba(0, 0, 0, 0.1)',
                            borderRadius: '12px',
                            backgroundImage: 'linear-gradient(135deg, rgba(40, 50, 70, 0.05) 0%, rgba(30, 40, 60, 0.05) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <Box style={{ position: 'relative' }}>
                            <Badge 
                              color="gold" 
                              variant="light" 
                              style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                backgroundColor: 'rgba(209, 174, 54, 0.9)',
                                color: '#fff',
                                fontWeight: 600,
                                backdropFilter: 'blur(5px)',
                              }}
                            >
                              {activity.date ? `${activity.date.length} dates` : "No dates"}
                            </Badge>
                            
                            <Title order={3} mb="md" lineClamp={1} style={{ color: '#2C3E50', fontSize: '1.3rem', paddingRight: '85px' }}>
                              {activity.title}
                            </Title>
                          </Box>

                          <Group gap="xs" mb="xs">
                            <Flex align="center" gap="5px">
                              <IconCalendarEvent size={16} color="#d1ae36" stroke={1.5} />
                              <Text size="sm" c="dimmed">{formatDateRange(activity.date)}</Text>
                            </Flex>
                          </Group>
                          
                          <Group gap="xs" mb="xs">
                            <Flex align="center" gap="5px">
                              <IconMapPin size={16} color="#d1ae36" stroke={1.5} />
                              <Text size="sm" c="dimmed">
                                {activity.location || "No location"}
                              </Text>
                            </Flex>
                          </Group>

                          <Group gap="xs" mb="xs">
                            <Flex align="center" gap="5px">
                              <IconCurrencyDollar size={16} color="#d1ae36" stroke={1.5} />
                              <Text size="sm" c="dimmed">
                                ${activity.price} per person
                              </Text>
                            </Flex>
                          </Group>

                          <Group gap="xs" mb="xs">
                            <Flex align="center" gap="5px">
                              <IconUsers size={16} color="#d1ae36" stroke={1.5} />
                              <Text size="sm" c="dimmed">
                                Max {activity.capacity} people
                              </Text>
                            </Flex>
                          </Group>

                          <Text size="sm" c="dimmed" lineClamp={2} mb="xs" mt="xs" style={{ flex: 1 }}>
                            {activity.description}
                          </Text>

                          <Flex 
                            mt="auto" 
                            align="center" 
                            justify="space-between"
                          >
                            <ActionIcon 
                              variant="subtle" 
                              color="red"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteActivity(activity._id);
                              }}
                              aria-label="Delete activity"
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                            
                            <Button 
                              variant="light" 
                              component={Link}
                              to={`/owner/activities/${activity._id}/edit`}
                              leftSection={<IconEdit size={14} />}
                              size="sm"
                              style={{
                                backgroundColor: 'rgba(33, 43, 54, 0.8)',
                                color: '#d1ae36',
                                border: '1px solid rgba(209, 174, 54, 0.3)'
                              }}
                            >
                              Edit
                            </Button>
                          </Flex>
                        </Paper>
                      </Box>
                    ))
                  ) : (
                    <Box py="xl" w="100%" ta="center">
                      <Text c="white">No activities found matching "{locationFilter}"</Text>
                      <Button 
                        variant="subtle" 
                        color="yellow" 
                        onClick={clearFilter} 
                        mt="md"
                        leftSection={<IconX size={14} />}
                      >
                        Clear filter
                      </Button>
                    </Box>
                  )}
                </Flex>
              )}
            </>
          )}
        </Container>
      </div>
      
      {/* Custom Footer */}
      <footer style={sharedStyles.footerContainer}>
        <div style={sharedStyles.footerContent}>
          <div style={sharedStyles.copyright}>
            &copy; {new Date().getFullYear()} PearlReserve — Premium Booking Experiences
          </div>
          <div style={sharedStyles.footerLinks}>
            <a 
              href="#" 
              style={sharedStyles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              About Us
            </a>
            <a 
              href="#" 
              style={sharedStyles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              style={sharedStyles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              style={sharedStyles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ActivityList; 