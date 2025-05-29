import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Image,
  Flex,
  Badge,
  Box,
  Alert,
  Divider,
  Paper,
  Stack,
  Menu,
  UnstyledButton,
  rem,
  Tabs,
} from "@mantine/core";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  IconAlertCircle, 
  IconCalendarEvent, 
  IconClock, 
  IconMapPin, 
  IconTicket, 
  IconUsers,
  IconChevronDown,
  IconLogout,
  IconUser,
  IconSwimming,
  IconStar,
  IconToolsKitchen2,
  IconBuildingCommunity,
} from "@tabler/icons-react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import dayjs from 'dayjs';
import { colors } from '../../theme/colors';
import ReviewsDisplay from '../../components/Parts/ReviewsDisplay';
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";
import useToast from "../../hooks/useToast";
import { useMediaQuery } from "@mantine/hooks";
import { useMantineTheme } from "@mantine/core";
import AddReviewForm from "../../components/Parts/AddReviewForm";

function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { sendRequest } = useFetch();
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const navigate = useNavigate();
  const { successToast, errorToast } = useToast();
  const theme = useMantineTheme();
  const isPc = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    getEventDetails();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getEventDetails = async () => {
    try {
      const eventData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/events/${id}`,
        "GET"
      );
      setEvent(eventData);
    } catch (err) {
      console.error(err);
      setError(true);
      
      // Sample data for when API fails
      const sampleEvents = {
        'sample1': {
          _id: 'sample1',
          title: 'Summer Jazz Night',
          date: new Date('2023-07-15'),
          time: '8:00 PM',
          venue: 'Riverside Terrace',
          ticketPrice: 45,
          maxCapacity: 120,
          description: 'An evening of smooth jazz under the stars with renowned musicians. Enjoy a variety of jazz styles from classic to contemporary, performed by a lineup of talented artists. Light refreshments will be available for purchase.',
        },
        'sample2': {
          _id: 'sample2',
          title: 'Wine & Food Festival',
          date: new Date('2023-08-05'),
          time: '2:00 PM',
          venue: 'Central Plaza',
          ticketPrice: 75,
          maxCapacity: 300,
          description: 'Sample gourmet food and premium wines from local and international vendors. This annual festival brings together the best chefs, wineries, and food artisans for an unforgettable culinary experience. Your ticket includes 10 tasting tokens.',
        },
        'sample3': {
          _id: 'sample3',
          title: 'Classical Symphony',
          date: new Date('2023-07-28'),
          time: '7:30 PM',
          venue: 'Grand Concert Hall',
          ticketPrice: 60,
          maxCapacity: 150,
          description: 'A breathtaking performance of classic masterpieces by the city orchestra. The program includes works by Mozart, Beethoven, and Tchaikovsky, conducted by the internationally acclaimed Maestro Richard Thornton.',
        },
      };
      
      setEvent(sampleEvents[id] || sampleEvents['sample1']);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const reviewsData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/events/${id}/reviews`,
        'GET'
      );
      setReviews(reviewsData || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Handle when a new review is added
  const handleReviewAdded = (newReview) => {
    // Refresh the reviews
    fetchReviews();
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMMM D, YYYY');
  };

  const formatTime = (timeString) => {
    return timeString;
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div style={sharedStyles.wrapper}>
        <div style={sharedStyles.starsBackground}></div>
        
        <div style={sharedStyles.contentContainer}>
          <Container size="md">
            <Paper 
              p="xl" 
              shadow="md"
              style={{
                backgroundColor: 'rgba(30, 40, 60, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
          <Stack align="center">
                <Text style={{ color: 'white' }}>Event not found</Text>
                <Button 
                  component={Link} 
                  to="/events"
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
              Back to Events
            </Button>
          </Stack>
        </Paper>
      </Container>
        </div>
      </div>
    );
  }

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
            <Box w={isPc ? "80%" : "100%"} mx="auto" style={{ position: 'relative', zIndex: 1 }}>
              <Title order={2} ta="center" style={{ color: '#fff', marginBottom: '1.5rem' }}>
                {event.title}
              </Title>
              
              {event.image && (
                <Image
                  src={event.image}
                  alt={event.title}
                  w="100%"
                  h="auto"
                  mt="lg"
          radius="md"
                  style={{ 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
                  }}
                />
              )}

              <Box mt="xl" mx="auto" ta="center">
                <Button
                  component={Link}
                  to={`/events/${event._id}/booking`}
                  style={{
                    backgroundColor: '#d1ae36',
                    color: '#1a2a41',
                    border: 'none',
                    padding: '10px 20px',
                    fontWeight: 600,
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(209, 174, 54, 0.9)'
                    }
                  }}
          disabled={event.maxCapacity <= 0}
        >
          {event.maxCapacity > 0 ? 'Buy Tickets' : 'Sold Out'}
        </Button>
              </Box>

              <Divider 
                my="xl" 
                label={
                  <Text size="sm" weight={500} color="white">
                    Event Information
                  </Text>
                } 
                labelPosition="center" 
                color="gray.3" 
              />
      
              <Box mt="md" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <Text mt="md" style={{ fontSize: '1rem' }}>
                  <strong style={{ color: '#d1ae36' }}>Date:</strong> {formatDate(event.date)}
                </Text>
                <Text mt="md" style={{ fontSize: '1rem' }}>
                  <strong style={{ color: '#d1ae36' }}>Time:</strong> {formatTime(event.time)}
                </Text>
                <Text mt="md" style={{ fontSize: '1rem' }}>
                  <strong style={{ color: '#d1ae36' }}>Venue:</strong> {event.venue}
                </Text>
                <Text mt="md" style={{ fontSize: '1rem' }}>
                  <strong style={{ color: '#d1ae36' }}>Ticket Price:</strong> ${event.ticketPrice}
                </Text>
                <Text mt="md" style={{ fontSize: '1rem' }}>
                  <strong style={{ color: '#d1ae36' }}>Available Tickets:</strong> {event.maxCapacity}
                </Text>
                {event.eventType && (
                  <Text mt="md" style={{ fontSize: '1rem' }}>
                    <strong style={{ color: '#d1ae36' }}>Event Type:</strong> {event.eventType}
                  </Text>
                )}
                {event.organizer && (
                  <Text mt="md" style={{ fontSize: '1rem' }}>
                    <strong style={{ color: '#d1ae36' }}>Organizer:</strong> {event.organizer}
                  </Text>
                )}
                {event.phoneNumber && (
                  <Text mt="md" style={{ fontSize: '1rem' }}>
                    <strong style={{ color: '#d1ae36' }}>Contact Phone:</strong> {event.phoneNumber}
                  </Text>
                )}
              </Box>

              {event.description && (
                <>
                  <Divider 
                    my="xl" 
                    label={
                      <Text size="sm" weight={500} color="white">
                        About the Event
                      </Text>
                    } 
                    labelPosition="center" 
                    color="gray.3" 
                  />
                  <Text 
                    style={{ 
                      lineHeight: 1.6, 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontStyle: 'italic',
                      padding: '0 1rem'
                    }}
                  >
                    {event.description}
                  </Text>
                </>
              )}
              
              <Divider 
                my="xl" 
                label={
                  <Text size="sm" weight={500} color="white">
                    Customer Reviews
                  </Text>
                } 
                labelPosition="center" 
                color="gray.3" 
              />
              
              <Tabs 
                defaultValue="read" 
                variant="pills"
                styles={{
                  tab: {
                    color: 'white',
                    '&[data-active]': {
                      backgroundColor: 'rgba(209, 174, 54, 0.2)',
                      color: '#d1ae36',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                    <Box 
                      style={{ 
                        padding: '1rem',
                        backgroundColor: 'rgba(30, 40, 60, 0.7)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
          <ReviewsDisplay 
            reviews={reviews} 
            averageRating={calculateAverageRating()} 
          />
                    </Box>
        )}
                </Tabs.Panel>

                <Tabs.Panel value="write">
                  {user ? (
                    <Box 
                      style={{ 
                        padding: '1rem',
                        backgroundColor: 'rgba(30, 40, 60, 0.7)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <AddReviewForm 
                        itemId={id} 
                        itemType="event" 
                        onReviewAdded={handleReviewAdded} 
                      />
                    </Box>
                  ) : (
                    <Box 
                      style={{ 
                        padding: '1.5rem',
                        backgroundColor: 'rgba(30, 40, 60, 0.7)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                      }}
                    >
                      <Text style={{ color: 'white', marginBottom: '15px' }}>
                        Please sign in to leave a review
                      </Text>
                      <Button 
                        component={Link} 
                        to="/signin" 
                        style={{
                          backgroundColor: '#d1ae36',
                          color: '#1a2a41',
                        }}
                        styles={{
                          root: {
                            '&:hover': {
                              backgroundColor: 'rgba(209, 174, 54, 0.9)',
                            }
                          }
                        }}
                      >
                        Sign In
                      </Button>
                    </Box>
                  )}
                </Tabs.Panel>
              </Tabs>
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

export default EventDetail; 