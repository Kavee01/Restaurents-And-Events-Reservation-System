import {
  Text,
  Button,
  Anchor,
  Title,
  Badge,
  Group,
  Container,
  Stack,
  SimpleGrid,
  Card,
  Box,
  Paper,
  Flex,
  Menu,
  UnstyledButton,
  Divider,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { 
  IconMapPin, 
  IconUsers, 
  IconChevronRight, 
  IconSwimming,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconHeart,
  IconStar,
  IconChevronDown,
  IconCalendarEvent,
  IconActivity,
  IconToolsKitchen2,
  IconBuildingCommunity,
  IconUser,
  IconCategory,
} from "@tabler/icons-react";
import Modal from "../../components/Parts/Modal";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useToast from "../../hooks/useToast";
import { colors } from "../../theme/colors";
import { getUser, logOut } from "../../service/users";
import { sharedStyles } from "../../components/Layout/SharedStyles";

function ActivityBookings() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activityBookings, setActivityBookings] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      // Redirect business owners away from this page
      if (currentUser.isOwner) {
        navigate("/owner/dashboard");
        return;
      }
    } else {
      navigate("/signin");
      return;
    }
    
    // Fetch activity bookings
    fetchActivityBookings();
  }, []);

  const fetchActivityBookings = async () => {
    setLoading(true);
    try {
      const data = await sendRequest(
        `${import.meta.env.VITE_API_URL}/activitybooking`,
        "GET"
      );
      console.log("Activity bookings:", data);
      setActivityBookings(data || []);
    } catch (err) {
      console.error("Error fetching activity bookings:", err);
      errorToast({
        title: "Error",
        message: "Failed to load activity bookings. Please try again."
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

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    toggle();
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) {
      close();
      return;
    }
    
    try {
      const endpoint = `${import.meta.env.VITE_API_URL}/activitybooking/${bookingToCancel._id}`;
      await sendRequest(endpoint, "DELETE");
      
      // Update the state to remove the canceled booking
      setActivityBookings(prev => prev.filter(b => b._id !== bookingToCancel._id));
      
      close();
      successToast({
        title: "Booking canceled!",
        message: "Your activity booking has been successfully canceled."
      });
    } catch (err) {
      console.log(err);
      close();
      errorToast({
        title: "Error",
        message: "Failed to cancel booking. Please try again."
      });
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return dayjs(date).format("MMMM D, YYYY [at] h:mm A");
  };

  const getStatusBadge = (status) => {
    let color = "gray";
    let label = status || "Pending";

    switch (status) {
      case "approved":
      case "confirmed":
        color = "green";
        break;
      case "rejected":
      case "cancelled":
        color = "red";
        label = "Cancelled";
        break;
      case "pending":
        color = "yellow";
        break;
      default:
        color = "gray";
    }

    return (
      <Badge color={color} variant="filled">
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Badge>
    );
  };
  
  // Check if booking can be canceled
  const canCancel = (booking) => {
    const status = booking.status || 'pending';
    return status !== 'cancelled' && status !== 'rejected';
  };

  // Render activity booking card
  const renderActivityBookingCard = (booking) => {
    const bookingDate = booking.date;
    const formattedDate = formatDateTime(bookingDate);
    const people = booking.participants || 0;
    const location = booking.activity?.location || 'N/A';
    const price = booking.totalPrice || 0;
    const title = booking.activity?.title || 'Activity Booking';
    const detailLink = `/activities/${booking.activity?._id}`;
    
    return (
      <Card 
        key={booking._id} 
        withBorder 
        shadow="sm" 
        radius="md" 
        p="lg"
        sx={{
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          },
          backgroundColor: 'rgba(30, 40, 60, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Group position="apart" mb="xs">
              <Group spacing="sm">
                <IconSwimming size={24} stroke={1.5} color="#d1ae36" />
                <Anchor 
                  component={Link} 
                  to={detailLink}
                  size="xl"
                  fw={600}
                  color="#d1ae36"
                  underline="hover"
                >
                  {title}
                </Anchor>
              </Group>
              {getStatusBadge(booking.status)}
            </Group>
            
            <Text size="md" mb="md" fw={500} color="white">
              {formattedDate}
            </Text>
            
            <Group spacing="lg">
              <Group spacing="xs">
                <IconUsers size={18} color="rgba(255, 255, 255, 0.7)" />
                <Text size="md" color="rgba(255, 255, 255, 0.7)">
                  {people} {people === 1 ? 'person' : 'people'}
                </Text>
              </Group>
              
              <Group spacing="xs">
                <IconMapPin size={18} color="rgba(255, 255, 255, 0.7)" />
                <Text size="md" color="rgba(255, 255, 255, 0.7)">
                  {location}
                </Text>
              </Group>
              
              <Group spacing="xs">
                <Text size="md" color="rgba(255, 255, 255, 0.7)" fw={500}>
                  ${price}
                </Text>
              </Group>
            </Group>
            
            {booking.specialRequests && (
              <Text size="sm" mt="md" color="rgba(255, 255, 255, 0.7)">
                <Text span fw={500}>Request:</Text> {booking.specialRequests}
              </Text>
            )}
            
            {booking.status === 'rejected' && booking.rejectionReason && (
              <Text size="sm" mt="xs" color="rgba(255, 100, 100, 0.8)">
                Reason: {booking.rejectionReason}
              </Text>
            )}
            
            {booking.status === 'cancelled' && booking.cancellationReason && (
              <Text size="sm" mt="xs" color="rgba(255, 100, 100, 0.8)">
                Reason: {booking.cancellationReason}
              </Text>
            )}
          </Box>
          
          <Stack spacing="xs">
            {canCancel(booking) && (
              <Button 
                variant="light" 
                color="red" 
                size="xs"
                onClick={() => handleCancelBooking(booking)}
              >
                Cancel
              </Button>
            )}
            
            <Button
              component={Link}
              to={detailLink}
              variant="subtle"
              color="gray"
              size="xs"
              rightIcon={<IconChevronRight size={14} />}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              View Activity
            </Button>
          </Stack>
        </Flex>
      </Card>
    );
  };

  const modalContent = () => {
    return (
      <Stack spacing="md">
        <Text size="md">
          Are you sure you want to cancel your booking for{" "}
          <Text span weight={600} color="#d1ae36">
            {bookingToCancel?.activity?.title || "this activity"}
          </Text>
          ?
        </Text>
        <Text size="sm" color="dimmed">
          This action cannot be undone. The cancellation policy may apply.
        </Text>
      </Stack>
    );
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
                <Menu.Item
                  component={Link}
                  to="/bookings"
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
                  My Bookings
                </Menu.Item>

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
        <Container size="xl">
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
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Box mb="xl">
                <Group position="apart" align="center">
                  <Title order={2} style={{ color: '#fff' }}>My Activity Bookings</Title>
                  <Button
                    component={Link}
                    to="/activities"
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
                    Browse Activities
                  </Button>
                </Group>
              </Box>

              {loading ? (
                <LoadingSpinner />
              ) : activityBookings.length > 0 ? (
                <SimpleGrid cols={1} spacing="lg">
                  {activityBookings.map((booking) => renderActivityBookingCard(booking))}
                </SimpleGrid>
              ) : (
                <Box
                  p="xl"
                  sx={{
                    textAlign: 'center',
                    backgroundColor: 'rgba(30, 40, 60, 0.5)',
                    borderRadius: 'md',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Text size="lg" mb="md" style={{ color: 'white' }}>
                    You don't have any activity bookings yet.
                  </Text>
                  <Button
                    component={Link}
                    to="/activities"
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
                    Explore Activities
                  </Button>
                </Box>
              )}
            </div>
          </Paper>
        </Container>

        <Modal
          opened={opened}
          title="Cancel Booking"
          modalContent={modalContent()}
          toggle={toggle}
          close={close}
          handleSubmit={confirmCancelBooking}
        />
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

export default ActivityBookings; 