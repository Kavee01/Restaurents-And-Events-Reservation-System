import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Flex,
  Box,
  Select,
  ActionIcon,
  Menu,
  UnstyledButton,
  rem,
  Divider,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconCalendarEvent,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconHeart,
  IconStar,
  IconChevronDown,
  IconMapPin,
  IconActivity,
  IconToolsKitchen2,
  IconSwimming,
  IconCategory,
  IconUser,
  IconBuildingCommunity,
  IconBuildingStore,
} from "@tabler/icons-react";
import useToast from "../../hooks/useToast";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
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
    
    getAllRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      getEventsByRestaurant(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const getAllRestaurants = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/owner`,
        "GET"
      );
      
      setRestaurants(resData);
      
      if (resData && resData.length > 0) {
        setSelectedRestaurantId(resData[0]._id);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const getEventsByRestaurant = async (restaurantId) => {
    setLoading(true);
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/events/restaurant/${restaurantId}`,
        "GET"
      );
      setEvents(resData);
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Failed to load events. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await sendRequest(
          `${import.meta.env.VITE_API_URL}/events/${id}`,
          "DELETE"
        );
        
        setEvents(events.filter(event => event._id !== id));
        
        successToast({
          title: "Success",
          message: "Event deleted successfully.",
        });
      } catch (err) {
        console.log(err);
        errorToast({
          title: "Error",
          message: "Failed to delete event. Please try again.",
        });
      }
    }
  };

  const handleRestaurantChange = (id) => {
    setSelectedRestaurantId(id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
            <Title order={2} style={{ color: 'white' }}>Manage Events</Title>
          <Button 
            component={Link} 
            to={`/owner/events/new${selectedRestaurantId ? `?restaurantId=${selectedRestaurantId}` : ''}`}
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
            Add New Event
          </Button>
        </Group>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {restaurants.length === 0 ? (
              <Box py="lg">
                  <Text c="white">You don't have any restaurants yet. Create one first to add events.</Text>
                  <Button 
                    mt="md" 
                    component={Link} 
                    to="/owner/restaurant/NewRestaurant"
                    style={{
                      backgroundColor: '#d1ae36',
                      color: '#1a2a41',
                    }}
                  >
                  Create Restaurant
                </Button>
              </Box>
            ) : (
              <>
                <Select
                  label="Select Restaurant"
                  placeholder="Choose a restaurant"
                  data={restaurants.map((restaurant) => ({
                    value: restaurant._id,
                    label: restaurant.name,
                  }))}
                  value={selectedRestaurantId}
                  onChange={handleRestaurantChange}
                  mb="xl"
                    styles={{
                      label: {
                        color: 'white',
                        marginBottom: '8px',
                      },
                      input: {
                        '&:focus': {
                          borderColor: '#d1ae36',
                        },
                      },
                    }}
                />

                {events.length === 0 ? (
                    <Box py="xl" ta="center">
                      <Text c="white">No events found for this restaurant. Add a new event.</Text>
                      <Button 
                        mt="md" 
                        component={Link} 
                        to={`/owner/events/new?restaurantId=${selectedRestaurantId}`}
                        style={{
                          backgroundColor: '#d1ae36',
                          color: '#1a2a41',
                        }}
                      >
                        Create Event
                      </Button>
                    </Box>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    {events.map((event) => (
                        <Card 
                          key={event._id} 
                          shadow="sm" 
                          padding="lg" 
                          radius="md" 
                          withBorder
                          style={{
                            backgroundImage: 'linear-gradient(135deg, rgba(40, 50, 70, 0.05) 0%, rgba(30, 40, 60, 0.05) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15), 0 0 10px rgba(209, 174, 54, 0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                          }}
                        >
                        {event.imageUrl && (
                          <Card.Section>
                            <Image
                              src={event.imageUrl}
                              height={160}
                              alt={event.title}
                            />
                          </Card.Section>
                        )}

                        <Group position="apart" mt="md" mb="xs">
                            <Title order={4} style={{ color: '#2C3E50' }}>{event.title}</Title>
                            <Badge 
                              color="pink"
                              style={{
                                backgroundColor: 'rgba(209, 174, 54, 0.9)',
                                color: '#fff',
                              }}
                            >
                              {event.eventType}
                            </Badge>
                        </Group>

                          <Text size="sm" c="dimmed" lineClamp={2}>
                          {event.description}
                        </Text>
                        
                        <Group mt="md">
                            <Flex align="center" gap="5px">
                              <IconCalendarEvent size={16} color="#d1ae36" stroke={1.5} />
                              <Text size="sm" c="dimmed">
                            <b>Date:</b> {formatDate(event.date)}
                          </Text>
                            </Flex>
                        </Group>
                        
                          <Group mt="md">
                            <Flex align="center" gap="5px">
                              <IconMapPin size={16} color="#d1ae36" stroke={1.5} />
                              <Text size="sm" c="dimmed">
                          <b>Venue:</b> {event.venue}
                        </Text>
                            </Flex>
                          </Group>
                        
                        <Group mt="xs">
                            <Text size="sm" c="dimmed">
                            <b>Price:</b> ${event.ticketPrice}
                          </Text>
                        </Group>

                        <Flex 
                          direction="row" 
                          gap="md" 
                          justify="flex-end" 
                          align="center" 
                          mt="md"
                        >
                          <ActionIcon 
                            variant="subtle" 
                            color="red"
                            onClick={() => handleDeleteEvent(event._id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                          <Button 
                            variant="light" 
                            component={Link}
                            to={`/owner/events/${event._id}/edit`}
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
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </>
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

export default EventList; 