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
  Divider,
  Alert,
  Paper,
  Stack,
  Menu,
  UnstyledButton,
  useMantineTheme,
  Tabs,
  ActionIcon
} from "@mantine/core";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  IconAlertCircle, 
  IconClock, 
  IconCurrencyDollar, 
  IconStar, 
  IconCalendarEvent, 
  IconMapPin, 
  IconCategory,
  IconChevronDown,
  IconLogout,
  IconUser,
  IconSwimming,
  IconToolsKitchen2,
  IconBuildingCommunity,
  IconArrowLeft,
  IconPhone
} from "@tabler/icons-react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { colors } from '../../theme/colors';
import ReviewsDisplay from '../../components/Parts/ReviewsDisplay';
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";
import useToast from "../../hooks/useToast";
import { useMediaQuery } from "@mantine/hooks";
import AddReviewForm from "../../components/Parts/AddReviewForm";

function ServiceDetail() {
  const [service, setService] = useState(null);
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
    
    fetchService();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const data = await sendRequest(
        `${import.meta.env.VITE_API_URL}/services/${id}`,
        "GET"
      );
      setService(data);
    } catch (err) {
      console.error("Error fetching service:", err);
      // Sample data
      setService({
        _id: id,
        title: "Spa Treatment",
        location: "Wellness Center",
        price: 120,
        description: "Enjoy a relaxing spa treatment with our expert therapists. Includes a full body massage and facial."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      // First try the specific service endpoint
      try {
        const reviewsData = await sendRequest(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/services/${id}/reviews`,
          "GET"
        );
        console.log('Service reviews from API:', reviewsData);
        setReviews(reviewsData);
      } catch (apiError) {
        console.error("Error fetching from specific API, trying MongoDB directly:", apiError);
        
        // If the specific endpoint fails, query directly from MongoDB
        const allReviews = await sendRequest(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews?entityType=service&entityId=${id}`,
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
          rating: 5,
          review: "Exceptional service! Truly rejuvenating experience.",
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!service) {
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
                <Text style={{ color: 'white' }}>Service not found</Text>
                <Button 
                  component={Link} 
                  to="/services"
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
              Back to Services
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <IconUser size={18} />
                  <span>{user.name}</span>
                  <IconChevronDown size={16} stroke={2.5} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  component={Link}
                  to="/profile"
                  icon={<IconUser size={16} stroke={1.5} color="#d1ae36" />}
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.95rem',
                  }}
                >
                  Profile
                </Menu.Item>
                <Menu.Item
                  component={Link}
                  to="/bookings"
                  icon={<IconCalendarEvent size={16} stroke={1.5} color="#d1ae36" />}
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.95rem',
                  }}
                >
                  My Bookings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  onClick={handleLogout}
                  icon={<IconLogout size={16} stroke={1.5} color="#d1ae36" />}
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.95rem',
                  }}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group spacing={5}>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    borderColor: '#d1ae36',
                    color: '#d1ae36',
                    borderRadius: '4px',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: 'rgba(209, 174, 54, 0.1)',
                      }
                    }
                  }}
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  style={{
                    backgroundColor: '#d1ae36',
                    color: '#1a2a41',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: 'rgba(209, 174, 54, 0.9)',
                      }
                    }
                  }}
                >
                  Register
                </Button>
              </Link>
            </Group>
          )}
        </div>
      </header>

      <div style={sharedStyles.contentContainer}>
        <Container size="md">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Note" color="blue" mb="xl" 
              styles={{
                root: {
                  backgroundColor: 'rgba(30, 55, 95, 0.5)',
                  border: '1px solid rgba(100, 130, 200, 0.2)'
                },
                title: { color: 'white' },
                message: { color: 'rgba(255, 255, 255, 0.8)' }
              }}
            >
              Currently showing sample service. Backend API endpoints will be implemented soon.
            </Alert>
          )}

          <Paper 
            shadow="md" 
            p="xl" 
            style={{
              backgroundImage: 'url("/back1.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 25, 40, 0.8)',
              backdropFilter: 'blur(2px)',
              zIndex: 1
            }} />
            
            <Box style={{ position: 'relative', zIndex: 2 }}>
              <ActionIcon
                component={Link}
                to="/services"
                variant="transparent"
                color="gray"
                mb="md"
              >
                <IconArrowLeft size={24} stroke={1.5} color="#d1ae36" />
              </ActionIcon>

              <Title order={1} mb="xl" style={{ color: '#d1ae36', fontWeight: 700, fontSize: '2.5rem' }}>
          {service.title}
        </Title>
        
        {service.imageUrl && (
          <Image
            src={service.imageUrl}
            alt={service.title}
            radius="md"
            height={300}
                  mb="xl"
                  style={{ 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
                  }}
          />
        )}
        
              <Group position="apart" mb="lg">
          <Group>
                  <IconCategory size={20} color="#d1ae36" />
                  <Text style={{ color: 'white', fontSize: '1.1rem' }}>{service.category}</Text>
          </Group>
          
                <Badge size="lg" 
                  style={{ 
                    backgroundColor: '#d1ae36', 
                    color: '#1a2a41',
                    fontSize: '1rem',
                    padding: '0.5rem 1rem'
                  }}
                >
            ${service.price}
          </Badge>
        </Group>
        
              <Group spacing="lg" mb="xl">
          <Group spacing="xs">
                  <IconMapPin size={20} color="rgba(255, 255, 255, 0.7)" />
                  <Text color="rgba(255, 255, 255, 0.7)">
                    {service.location || 'Various locations'}
            </Text>
          </Group>
          
          <Group spacing="xs">
                  <IconCalendarEvent size={20} color="rgba(255, 255, 255, 0.7)" />
                  <Text color="rgba(255, 255, 255, 0.7)">
                    {service.availability || 'By appointment'}
            </Text>
          </Group>
          
          <Group spacing="xs">
                  <IconCurrencyDollar size={20} color="rgba(255, 255, 255, 0.7)" />
                  <Text color="rgba(255, 255, 255, 0.7)">
              ${service.price}
            </Text>
          </Group>
          
          {service.phoneNumber && (
            <Group spacing="xs">
              <IconPhone size={20} color="rgba(255, 255, 255, 0.7)" />
              <Text color="rgba(255, 255, 255, 0.7)">
                {service.phoneNumber}
              </Text>
            </Group>
          )}
        </Group>
        
              <Divider my="xl" color="rgba(255, 255, 255, 0.1)" />
        
              <Text size="xl" mb="md" fw={500} style={{ color: 'white' }}>Description</Text>
              <Text mb="xl" style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.7 }}>
                {service.description}
              </Text>
        
        {service.provider && (
          <>
                  <Text size="xl" fw={500} style={{ color: 'white' }}>Provider</Text>
                  <Text mb="xl" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {service.provider}
                  </Text>
          </>
        )}
        
        <Button 
          component={Link} 
          to={`/services/${service._id}/booking`}
          size="md"
          radius="md"
          fullWidth
                style={{
                  backgroundColor: '#d1ae36',
                  color: '#1a2a41',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  height: '3rem',
                  marginTop: '1.5rem'
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: 'rgba(209, 174, 54, 0.9)',
                    }
                  }
                }}
        >
          Book This Service
        </Button>
            </Box>
      </Paper>
      
      <Box mt="xl">
            <Paper
              p="xl"
              style={{
                backgroundImage: 'url("/back1.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                position: 'relative',
                marginTop: '2rem'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 25, 40, 0.8)',
                backdropFilter: 'blur(2px)',
                zIndex: 1
              }} />
              
              <Box style={{ position: 'relative', zIndex: 2 }}>
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
                    <Title order={2} mb="xl" style={{ 
                      color: '#d1ae36', 
                      borderBottom: '1px solid rgba(209, 174, 54, 0.3)',
                      paddingBottom: '0.75rem'
                    }}>
                      Customer Reviews
                    </Title>
                    
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
                        itemId={id} 
                        itemType="service" 
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
      </Box>
    </Container>
      </div>
      
      {/* Footer */}
      <footer style={sharedStyles.footerContainer}>
        <div style={sharedStyles.footerContent}>
          <div style={sharedStyles.copyright}>
            © 2023 PearlReserve. All rights reserved.
          </div>
          <div style={sharedStyles.footerLinks}>
            <Link to="/about" style={sharedStyles.footerLink}
              onMouseOver={(e) => {
                e.target.style.color = '#d1ae36';
              }}
              onMouseOut={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              About
            </Link>
            <Link to="/contact" style={sharedStyles.footerLink}
              onMouseOver={(e) => {
                e.target.style.color = '#d1ae36';
              }}
              onMouseOut={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              Contact
            </Link>
            <Link to="/privacy" style={sharedStyles.footerLink}
              onMouseOver={(e) => {
                e.target.style.color = '#d1ae36';
              }}
              onMouseOut={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              Privacy
            </Link>
            <Link to="/terms" style={sharedStyles.footerLink}
              onMouseOver={(e) => {
                e.target.style.color = '#d1ae36';
              }}
              onMouseOut={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ServiceDetail; 