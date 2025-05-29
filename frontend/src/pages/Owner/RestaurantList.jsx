import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Text,
  Title,
  Card,
  Group,
  Image,
  SimpleGrid,
  Box,
  Flex,
  Menu,
  UnstyledButton,
  rem,
  Divider,
  Paper,
} from "@mantine/core";
import { 
  IconPlus,
  IconBuildingStore,
  IconMap,
  IconClock,
  IconChevronRight,
  IconUsers,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconHeart,
  IconStar,
  IconChevronDown,
  IconMapPin,
  IconCalendarEvent,
  IconActivity,
  IconToolsKitchen2,
  IconSwimming,
  IconCategory,
  IconUser,
  IconBuildingCommunity,
  IconTool,
} from "@tabler/icons-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { getUser, logOut } from "../../service/users";
import useFetch from "../../hooks/useFetch";
import useToast from "../../hooks/useToast";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useCheckBooking from "../../hooks/useCheckBooking";
import { sharedStyles } from "../../components/Layout/SharedStyles";

// Define additional styles specific to restaurant list
const dashboardStyles = {
  filterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  dashboardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '1rem',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  restaurantCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '1rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(209, 174, 54, 0.3)',
    }
  },
  cardImage: {
    height: '200px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '1.5rem',
  },
  restaurantName: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '0.5rem',
  },
  restaurantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    marginBottom: '0.5rem',
  },
  actionButton: {
    padding: '0.6rem 1.2rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  viewButton: {
    backgroundColor: '#d1ae36',
    color: '#1a2a41',
    '&:hover': {
      backgroundColor: '#c9a930',
    }
  },
  addButton: {
    backgroundColor: '#d1ae36',
    color: '#1a2a41',
    fontWeight: 600,
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: 'none',
    boxShadow: '0 4px 10px rgba(209, 174, 54, 0.3)',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:hover': {
      backgroundColor: '#e5c24d',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 15px rgba(209, 174, 54, 0.4)',
    }
  },
};

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { sendRequest } = useFetch();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [navHover, setNavHover] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { successToast, errorToast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      if (!currentUser.isOwner) {
        navigate("/");
        return;
      }
    } else {
      navigate("/signin");
      return;
    }
    
    // Fetch owned restaurants
    getRestaurants();
  }, []);

  const getRestaurants = async () => {
    setLoading(true);
    try {
      const response = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/owner`,
        "GET"
      );
      console.log("Restaurants data:", response);
      setRestaurants(response);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      errorToast({
        title: "Error",
        message: "Failed to load restaurants. Please try again."
      });
    } finally {
      setLoading(false);
    }
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
          {user ? (
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
                  backgroundColor: '#1a2a41',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  borderRadius: '0.5rem',
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
          ) : (
            <Group spacing={5}>
              <Button 
                component={Link} 
                to="/signin" 
                variant="subtle"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.2s ease',
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }
                }}
              >
                Login
              </Button>
              <Button 
                component={Link} 
                to="/register" 
                style={{
                  backgroundColor: '#d1ae36',
                  color: '#1a2a41',
                  transition: 'all 0.2s ease',
                  border: 'none',
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(209, 174, 54, 0.9)'
                  }
                }}
              >
                Register
              </Button>
            </Group>
          )}
        </div>
      </header>
      
      <div style={sharedStyles.contentContainer}>
        <Container size="lg">
          <Paper 
            shadow="md" 
            radius="md" 
            p="xl" 
            mb="xl"
            style={{
              backgroundImage: 'url("/back1.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(10, 20, 30, 0.8) 0%, rgba(5, 15, 35, 0.85) 100%)',
              borderRadius: 'inherit',
              zIndex: 0,
            }}></div>
            
            <Box style={{ position: 'relative', zIndex: 2 }}>
              <Title order={2} ta="center" style={{ color: '#fff', marginBottom: '1.5rem' }}>
                My Restaurants
              </Title>
              
              <Flex justify="center" mb="xl">
                <Button
                  component={Link}
                  to="/owner/restaurant/NewRestaurant"
                  style={{
                    backgroundColor: '#d1ae36',
                    color: '#1a2a41',
                  }}
                  leftSection={<IconPlus size={20} />}
                >
                  Add New Restaurant
                </Button>
              </Flex>
              
              {loading ? (
                <LoadingSpinner />
              ) : restaurants.length > 0 ? (
                <SimpleGrid
                  cols={{ base: 1, sm: 2, md: 3 }}
                  spacing="xl"
                  verticalSpacing="xl"
                >
                  {restaurants.map((restaurant) => (
                    <Card
                      key={restaurant._id}
                      p={0}
                      shadow="sm"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                      }}
                      sx={{
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(209, 174, 54, 0.3)',
                        }
                      }}
                    >
                      <Card.Section>
                        <Image
                          src={restaurant.image || "/default-restaurant.jpg"}
                          height={200}
                          alt={restaurant.name}
                          style={{ objectFit: 'cover' }}
                        />
                      </Card.Section>

                      <Box p="md">
                        <Title order={3} style={{ color: 'white', marginBottom: '0.5rem' }}>
                          {restaurant.name}
                        </Title>

                        <Group>
                          <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconMap size={16} style={{ color: 'rgba(209, 174, 54, 0.8)' }} />
                            {restaurant.location}
                          </Text>
                        </Group>

                        <Group>
                          <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconClock size={16} style={{ color: 'rgba(209, 174, 54, 0.8)' }} />
                            {restaurant.timeOpen && restaurant.timeClose
                              ? `${String(restaurant.timeOpen).padStart(4, "0").replace(
                                /(\d{2})(\d{2})/,
                                "$1:$2"
                              )} - ${String(restaurant.timeClose)
                                .padStart(4, "0")
                                .replace(/(\d{2})(\d{2})/, "$1:$2")}`
                              : "Hours not specified"}
                          </Text>
                        </Group>

                        <Group>
                          <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconUsers size={16} style={{ color: 'rgba(209, 174, 54, 0.8)' }} />
                            Max Pax: {restaurant.maxPax || "Not specified"}
                          </Text>
                        </Group>

                        <Group position="apart" mt="lg">
                          <Button
                            component={Link}
                            to={`/owner/restaurant/${restaurant._id}`}
                            style={{
                              backgroundColor: '#d1ae36',
                              color: '#1a2a41',
                              '&:hover': {
                                backgroundColor: '#c9a930',
                              }
                            }}
                            rightSection={<IconChevronRight size={16} />}
                          >
                            View Details
                          </Button>
                        </Group>
                      </Box>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Box
                  p="xl"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    border: '1px dashed rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Text size="lg" weight={500} style={{ color: 'white', marginBottom: '1rem' }}>
                    You don't have any restaurants yet.
                  </Text>
                  <Text size="sm" color="dimmed" mb="md">
                    Add your first restaurant to start managing bookings.
                  </Text>
                  <Button
                    component={Link}
                    to="/owner/restaurant/NewRestaurant"
                    style={{
                      backgroundColor: '#d1ae36',
                      color: '#1a2a41',
                    }}
                    leftSection={<IconPlus size={20} />}
                  >
                    Add New Restaurant
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
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

export default RestaurantList; 