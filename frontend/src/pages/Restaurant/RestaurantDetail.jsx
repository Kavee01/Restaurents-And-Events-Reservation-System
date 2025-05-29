import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Image,
  Text,
  Title,
  Box,
  Anchor,
  useMantineTheme,
  Divider,
  Paper,
  Container,
  UnstyledButton,
  Menu,
  Group,
  Tabs,
  Badge,
  Modal,
  SimpleGrid,
  Transition,
  Card,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  IconChevronDown,
  IconLogout,
  IconMapPin,
  IconUser,
  IconCalendarEvent,
  IconSwimming,
  IconStar,
  IconToolsKitchen2,
  IconBuildingCommunity,
  IconFileText,
  IconDownload,
  IconPhoto,
  IconX,
  IconArrowRight,
  IconClock,
  IconPhone,
  IconWorld,
  IconCalendarOff,
} from "@tabler/icons-react";
import { rem } from "@mantine/core";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import RestaurantMap from "../../components/Maps/RestaurantMap";
import useCheckBooking from "../../hooks/useCheckBooking";
import { useMediaQuery } from "@mantine/hooks";
import ReviewsDisplay from "../../components/Parts/ReviewsDisplay";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";
import useToast from "../../hooks/useToast";
import AddReviewForm from "../../components/Parts/AddReviewForm";

function RestaurantDetail() {
  const { sendRequest } = useFetch();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const location = useLocation();
  const pathId = location.pathname.split("/")[2];
  const { formatTime } = useCheckBooking();
  const theme = useMantineTheme();
  const isPc = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const navigate = useNavigate();
  const { successToast, errorToast } = useToast();
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImages, setShowImages] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [activeSection, setActiveSection] = useState('info');

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    getData();
    getReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/${pathId}`,
        "GET"
      );
      const formattedTimeOpen = resData.timeOpen
        ? formatTime(resData.timeOpen)
        : null;
      const formattedTimeClose = resData.timeClose
        ? formatTime(resData.timeClose)
        : null;
      
      // Default coordinates for Galle, Sri Lanka if not specified
      const defaultCoordinates = {
        lat: 6.0535,
        lng: 80.2210
      };
      
      setData({
        ...resData,
        timeOpen: formattedTimeOpen,
        timeClose: formattedTimeClose,
        coordinates: resData.coordinates || defaultCoordinates
      });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const getReviews = async () => {
    setReviewsLoading(true);
    try {
      // First try the specific restaurant endpoint
    try {
      const reviewsData = await sendRequest(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/restaurant/${pathId}/reviews`,
        "GET"
      );
        console.log('Restaurant reviews from API:', reviewsData);
      setReviews(reviewsData);
      } catch (apiError) {
        console.error("Error fetching from specific API, trying MongoDB directly:", apiError);
        
        // If the specific endpoint fails, query directly from MongoDB
        const allReviews = await sendRequest(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews?entityType=restaurant&entityId=${pathId}`,
          "GET"
        );
        console.log('Fetched reviews from MongoDB:', allReviews);
        setReviews(allReviews);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      // Provide some sample review data for testing
      const mockReviews = [
        {
          _id: "sample1",
          rating: 4,
          review: "Great food and atmosphere! Highly recommended.",
          user: { name: "Sample User" },
          createdAt: new Date().toISOString()
        }
      ];
      console.log("Using mock review data:", mockReviews);
      setReviews(mockReviews);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Handle when a new review is added
  const handleReviewAdded = (newReview) => {
    console.log('New review added:', newReview);
    // Add the new review to the existing ones
    setReviews(currentReviews => [newReview, ...currentReviews]);
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
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
      {loading ? (
        <LoadingSpinner />
      ) : (
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
              <Box w={isPc ? "80%" : "100%"} mx="auto" style={{ position: 'relative', zIndex: 1 }}>
                <Title order={2} ta="center" style={{ color: '#fff', marginBottom: '1.5rem' }}>
                  {data.name}
                </Title>
                
                {/* Interactive Navigation Tabs */}
                <Tabs 
                  value={activeSection} 
                  onChange={setActiveSection}
                  variant="pills"
                  radius="md"
                  mb="xl"
                  styles={{
                    root: {
                      backgroundColor: 'rgba(20, 30, 50, 0.5)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                    },
                    tab: {
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '&[data-active]': {
                        backgroundColor: 'rgba(209, 174, 54, 0.2)',
                        color: '#d1ae36',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      }
                    }
                  }}
                >
                  <Tabs.List position="center">
                    <Tabs.Tab 
                      value="about" 
                      icon={<IconFileText size={16} />}
                    >
                      About
                    </Tabs.Tab>
                    <Tabs.Tab 
                      value="info" 
                      icon={<IconUser size={16} />}
                    >
                      Information
                    </Tabs.Tab>
                    <Tabs.Tab 
                      value="gallery" 
                      icon={<IconPhoto size={16} />}
                    >
                      Gallery & Menu
                    </Tabs.Tab>
                    <Tabs.Tab 
                      value="location" 
                      icon={<IconMapPin size={16} />}
                    >
                      Location
                    </Tabs.Tab>
                    <Tabs.Tab 
                      value="reviews" 
                      icon={<IconStar size={16} />}
                    >
                      Reviews
                    </Tabs.Tab>
                  </Tabs.List>

                  {/* About Section */}
                  <Tabs.Panel value="about" pt="xl">
                    <Card 
                      p="xl"
                      radius="md"
                      style={{
                        backgroundColor: 'rgba(20, 30, 50, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Title order={3} style={{ color: 'white', marginBottom: '1.5rem' }}>
                        About {data.name}
                      </Title>
                      <Text 
                        style={{ 
                          lineHeight: 1.8,
                          color: 'white',
                          fontSize: '1.1rem',
                          fontStyle: 'italic',
                          textAlign: 'justify'
                        }}
                      >
                        {data.description || "Welcome to " + data.name + ", where culinary excellence meets exceptional service."}
                      </Text>
                      
                      <Box mt="xl">
                        <Group position="apart" mb="md">
                          <Badge size="lg" color="yellow" variant="light">
                            {data.category}
                          </Badge>
                          
                        </Group>
                      </Box>
                    </Card>
                  </Tabs.Panel>

                  {/* Information Section */}
                  <Tabs.Panel value="info" pt="xl">
                    <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="xl">
                      <Card 
                        p="lg"
                        radius="md"
                        style={{
                          backgroundColor: 'rgba(20, 30, 50, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Group spacing="sm" mb="md">
                          <IconClock size={24} color="#d1ae36" />
                          <Text size="lg" weight={500} color="white">Hours & Availability</Text>
                        </Group>
                        
                        <Group spacing="xs" mb="xs">
                          <Text color="white" weight={500}>Opening Hours:</Text>
                          <Text color="white">{data.timeOpen} - {data.timeClose}</Text>
                        </Group>

                        <Group spacing="xs">
                          <Text color="white" weight={500}>Days Closed:</Text>
                          <Text color="white">
                            {data.daysClose && data.daysClose.length > 0 
                              ? data.daysClose.map(day => day.replace(/[,]/g, '')).join(", ")
                              : "Open Every Day"}
                          </Text>
                        </Group>
                      </Card>

                      <Card 
                        p="lg"
                        radius="md"
                        style={{
                          backgroundColor: 'rgba(20, 30, 50, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Group spacing="sm" mb="md">
                          <IconPhone size={24} color="#d1ae36" />
                          <Text size="lg" weight={500} color="white">Contact Details</Text>
                        </Group>
                        <Text color="white" mb="xs">Phone: {data.phone || "Not available"}</Text>
                        {data.websiteUrl && (
                          <Anchor 
                            href={data.websiteUrl} 
                            target="_blank"
                            style={{ color: '#d1ae36' }}
                          >
                            Visit Website
                          </Anchor>
                        )}
                      </Card>
                    </SimpleGrid>
                  </Tabs.Panel>

                  {/* Gallery and Menu Section */}
                  <Tabs.Panel value="gallery" pt="xl">
                    <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="xl">
                      {/* Gallery Section */}
                      <Box>
                        {data.images && data.images.length > 0 && (
                          <Card
                            p="xl"
                            radius="md"
                            style={{
                              backgroundColor: 'rgba(20, 30, 50, 0.7)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <Group position="apart" mb="xl">
                              <Text size="xl" weight={500} color="white">Photo Gallery</Text>
                              <Badge color="yellow" variant="light">
                                {data.images.length} Photos
                              </Badge>
                            </Group>

                            <Box>
                              <Image
                                src={`${import.meta.env.VITE_API_URL}${data.images[selectedImageIndex]}`}
                                alt={`${data.name} preview`}
                                height={300}
                                fit="cover"
                                style={{ 
                                  borderRadius: '0.5rem',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  cursor: 'pointer',
                                  transition: 'transform 0.3s ease',
                                  transform: hoveredImage === 'main' ? 'scale(1.02)' : 'scale(1)',
                                }}
                                onClick={() => setImagePopupOpen(true)}
                                onMouseEnter={() => setHoveredImage('main')}
                                onMouseLeave={() => setHoveredImage(null)}
                              />

                              <SimpleGrid 
                                cols={4} 
                                breakpoints={[{ maxWidth: 'sm', cols: 2 }]} 
                                spacing="sm"
                                mt="md"
                                style={{
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}
                              >
                                {data.images.map((image, index) => (
                                  <Box
                                    key={index}
                                    style={{
                                      position: 'relative',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s ease',
                                      transform: hoveredImage === index ? 'scale(1.05)' : 'scale(1)',
                                      borderRadius: '0.25rem',
                                      overflow: 'hidden',
                                    }}
                                    onMouseEnter={() => setHoveredImage(index)}
                                    onMouseLeave={() => setHoveredImage(null)}
                                    onClick={() => setSelectedImageIndex(index)}
                                  >
                                    <Image
                                      src={`${import.meta.env.VITE_API_URL}${image}`}
                                      alt={`${data.name} ${index + 1}`}
                                      height={80}
                                      fit="cover"
                                      style={{ 
                                        borderRadius: '0.25rem',
                                        border: index === selectedImageIndex 
                                          ? '2px solid #d1ae36' 
                                          : '1px solid rgba(255, 255, 255, 0.1)',
                                      }}
                                    />
                                    {hoveredImage === index && (
                                      <Box
                                        style={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          backgroundColor: 'rgba(209, 174, 54, 0.3)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          backdropFilter: 'blur(2px)',
                                        }}
                                      >
                                        <Text size="sm" color="white" weight={500}>
                                          View
                                        </Text>
                                      </Box>
                                    )}
                                  </Box>
                                ))}
                              </SimpleGrid>
                            </Box>
                          </Card>
                        )}
                      </Box>

                      {/* Menu Section */}
                      <Card 
                        p="xl"
                        radius="md"
                        style={{
                          backgroundColor: 'rgba(20, 30, 50, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Group spacing="sm" mb="xl">
                          <IconFileText size={24} color="#d1ae36" />
                          <Text size="xl" weight={500} color="white">Restaurant Menu</Text>
                        </Group>
                        
                        {data.menuPdf ? (
                          <Box style={{ textAlign: 'center' }}>
                            <Text color="white" mb="xl">
                              Download our menu to explore our delicious offerings
                            </Text>
                            <Button
                              component="a"
                              href={`${import.meta.env.VITE_API_URL}${data.menuPdf}`}
                              target="_blank"
                              leftSection={<IconDownload size={16} />}
                              style={{
                                backgroundColor: 'rgba(209, 174, 54, 0.2)',
                                color: '#d1ae36',
                                border: '1px solid rgba(209, 174, 54, 0.3)',
                              }}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(209, 174, 54, 0.3)',
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              Download Menu PDF
                            </Button>
                          </Box>
                        ) : (
                          <Text color="white" ta="center">Menu not available</Text>
                        )}
                      </Card>
                    </SimpleGrid>

                    {/* Image Modal */}
                    <Modal
                      opened={imagePopupOpen}
                      onClose={() => setImagePopupOpen(false)}
                      size="xl"
                      centered
                      styles={{
                        content: {
                          backgroundColor: '#1a2a41',
                        },
                        header: {
                          backgroundColor: '#1a2a41',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                        close: {
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        },
                      }}
                    >
                      <Image
                        src={`${import.meta.env.VITE_API_URL}${data.images[selectedImageIndex]}`}
                        alt={`${data.name} large preview`}
                        fit="contain"
                        height={500}
                      />
                      <SimpleGrid cols={6} mt="md" spacing="xs">
                        {data.images.map((image, index) => (
                          <Box
                            key={index}
                            style={{
                              cursor: 'pointer',
                              position: 'relative',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <Image
                              src={`${import.meta.env.VITE_API_URL}${image}`}
                              alt={`${data.name} ${index + 1}`}
                              height={60}
                              fit="cover"
                            />
                            {index === selectedImageIndex && (
                              <Box
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(209, 174, 54, 0.3)',
                                  border: '2px solid #d1ae36',
                                }}
                              />
                            )}
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Modal>
                  </Tabs.Panel>

                  {/* Location Section */}
                  <Tabs.Panel value="location" pt="xl">
                    <Card
                      p="xl"
                      radius="md"
                      style={{
                        backgroundColor: 'rgba(20, 30, 50, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Group position="apart" mb="xl">
                        <Text size="xl" weight={500} color="white">
                          Find Us Here
                        </Text>
                        <Badge 
                          color="yellow"
                          variant="light"
                          size="lg"
                        >
                          {data.location}
                        </Badge>
                      </Group>
                      
                      <Text color="white" mb="xl" size="lg" style={{ opacity: 0.9 }}>
                        {data.address}
                      </Text>

                      <Box style={{ height: '400px', overflow: 'hidden', borderRadius: '8px' }}>
                        <RestaurantMap 
                          coordinates={data.coordinates}
                          name={data.name}
                          address={data.address}
                        />
                      </Box>
                    </Card>
                  </Tabs.Panel>

                  {/* Reviews Section */}
                  <Tabs.Panel value="reviews" pt="xl">
                    <Card
                      p="xl"
                      radius="md"
                      style={{
                        backgroundColor: 'rgba(20, 30, 50, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Tabs 
                        defaultValue="read" 
                        variant="pills"
                        styles={{
                          tab: {
                            color: 'white',
                            transition: 'all 0.3s ease',
                            '&[data-active]': {
                              backgroundColor: 'rgba(209, 174, 54, 0.2)',
                              color: '#d1ae36',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              transform: 'translateY(-2px)',
                            }
                          }
                        }}
                      >
                        <Tabs.List position="center" mb="lg">
                          <Tabs.Tab value="read" icon={<IconStar size={16} />}>Read Reviews</Tabs.Tab>
                          <Tabs.Tab value="write" icon={<IconUser size={16} />}>Write a Review</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="read">
                          {reviewsLoading ? (
                            <LoadingSpinner />
                          ) : (
                            <ReviewsDisplay 
                              reviews={reviews} 
                              averageRating={calculateAverageRating()} 
                            />
                          )}
                        </Tabs.Panel>

                        <Tabs.Panel value="write">
                          {user ? (
                            <AddReviewForm 
                              itemId={pathId} 
                              itemType="restaurant" 
                              onReviewAdded={handleReviewAdded} 
                            />
                          ) : (
                            <Box style={{ textAlign: 'center', padding: '20px' }}>
                              <Text style={{ color: 'white', marginBottom: '15px' }}>
                                Please sign in to leave a review
                              </Text>
                              <Button 
                                component={Link} 
                                to="/login" 
                                style={{
                                  backgroundColor: '#d1ae36',
                                  color: '#1a2a41',
                                }}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'rgba(209, 174, 54, 0.9)',
                                    transform: 'translateY(-2px)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                Sign In
                              </Button>
                            </Box>
                          )}
                        </Tabs.Panel>
                      </Tabs>
                    </Card>
                  </Tabs.Panel>
                </Tabs>

                {/* Main Reservation Button */}
                <Box mt="xl" mx="auto" ta="center">
                  <Button
                    component={Link}
                    to={`/restaurant/${data._id}/new-booking`}
                    size="md"
                    style={{
                      backgroundColor: '#d1ae36',
                      color: '#1a2a41',
                      border: 'none',
                      padding: '12px 24px',
                      fontWeight: 600,
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(209, 174, 54, 0.9)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Reserve a Table
                  </Button>
                </Box>
              </Box>
            </Paper>
        </Container>
      )}
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

export default RestaurantDetail;
