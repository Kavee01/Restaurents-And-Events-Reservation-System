/* eslint-disable react/prop-types */
import {
  Text,
  Button,
  Anchor,
  Title,
  Badge,
  Tooltip,
  Group,
  Container,
  Stack,
  Tabs,
  SimpleGrid,
  Card,
  Divider,
  Box,
  ActionIcon,
  Paper,
  Flex,
  Menu,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { 
  IconFileDownload, 
  IconCalendarEvent, 
  IconMapPin, 
  IconClock, 
  IconUsers, 
  IconBuildingCommunity, 
  IconChevronRight, 
  IconDownload,
  IconSwimming,
  IconToolsKitchen2,
  IconCategory,
  IconStar,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconBuildingStore,
  IconActivity,
  IconHeart,
  IconMap,
  IconPlus,
  IconX,
  IconCheck,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import Modal from "../../components/Parts/Modal";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useToast from "../../hooks/useToast";
import { generateReceipt, generateActivityReceipt, generateServiceReceipt, generateEventReceipt } from "../../util/generateReceipt";
import { colors } from "../../theme/colors";
import { getUser, logOut } from "../../service/users";

// Define luxury styles matching RestaurantList
const styles = {
  wrapper: {
    margin: 0,
    padding: 0,
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#080f17',
    backgroundImage: 'url("/bg2.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  starsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(10, 20, 30, 0.7) 0%, rgba(5, 15, 35, 0.8) 100%)',
    zIndex: 1,
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '1rem',
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
    textDecoration: 'none',
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
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '0 1rem'
  },
  navItem: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.25rem',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent',
    position: 'relative',
  },
  navItemHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white'
  },
  authButtons: {
    display: 'flex',
    gap: '1rem',
  },
  contentContainer: {
    width: '100%',
    padding: '3rem 0',
    position: 'relative',
    zIndex: 2,
    flex: 1,
  },
  headingSection: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '0 1rem',
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'white',
    marginBottom: '1rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.7)',
    maxWidth: '700px',
    margin: '0 auto 2rem auto',
    lineHeight: 1.6,
  },
  tabsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    borderRadius: '0.75rem',
    padding: '1.25rem 2rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  bookingCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    transform: 'none',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    backgroundImage: 'linear-gradient(135deg, rgba(40, 50, 70, 0.05) 0%, rgba(30, 40, 60, 0.05) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1.5rem',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15), 0 0 10px rgba(209, 174, 54, 0.2)',
    }
  },
  footerContainer: {
    position: 'relative',
    zIndex: 5,
    marginTop: 'auto',
    backgroundColor: 'rgba(15, 23, 35, 0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '2rem 0',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    padding: '0 2rem',
  },
  footerLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#d1ae36',
    }
  },
  copyright: {
    fontSize: '0.9rem',
  },
  modalStyles: {
    title: { 
      color: '#d1ae36', 
      fontWeight: 600,
      fontSize: '1.2rem'
    },
    body: { 
      backgroundColor: '#1c2a3a',
      padding: '1.5rem',
    },
    header: { 
      backgroundColor: '#1c2a3a',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 1.5rem'
    },
    content: {
      backgroundColor: '#1c2a3a',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '0.5rem',
    }
  },
  emptyBookingsContainer: {
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    padding: '3rem 2rem',
    borderRadius: '1rem',
    maxWidth: '600px',
    margin: '2rem auto',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }
};

function BookingList() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [bookingTypeToCancel, setBookingTypeToCancel] = useState(null);
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const navigate = useNavigate();
  
  // State for different booking types
  const [restaurantBookings, setRestaurantBookings] = useState([]);
  const [activityBookings, setActivityBookings] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  
  // Get user from local storage directly
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    // Check if user exists 
    const currentUser = getUser();
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    
    // Redirect business owners away from this page
    if (currentUser.isOwner) {
      navigate("/owner/dashboard");
      return;
    }
    
    setUser(currentUser);
    // Fetch all types of bookings
    fetchAllBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRestaurantBookings(),
        fetchActivityBookings(),
        fetchServiceBookings(),
        fetchEventBookings()
      ]);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      errorToast({
        title: "Error",
        message: "Failed to load some bookings. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantBookings = async () => {
    try {
      const data = await sendRequest(
      `${import.meta.env.VITE_API_URL}/booking`,
      "GET"
    );
      console.log("Restaurant bookings:", data);
      setRestaurantBookings(data || []);
      return data;
    } catch (err) {
      console.error("Error fetching restaurant bookings:", err);
      return [];
    }
  };

  const fetchActivityBookings = async () => {
    try {
      const data = await sendRequest(
        `${import.meta.env.VITE_API_URL}/activitybooking`,
        "GET"
      );
      console.log("Activity bookings:", data);
      // Filter bookings for current user
      const userBookings = data ? data.filter(booking => booking.user === user._id) : [];
      setActivityBookings(userBookings);
      return userBookings;
    } catch (err) {
      console.error("Error fetching activity bookings:", err);
      return [];
    }
  };

  const fetchServiceBookings = async () => {
    try {
      const data = await sendRequest(
        `${import.meta.env.VITE_API_URL}/servicebooking`,
        "GET"
      );
      console.log("Service bookings:", data);
      setServiceBookings(data || []);
      return data;
    } catch (err) {
      console.error("Error fetching service bookings:", err);
      return [];
    }
  };

  const fetchEventBookings = async () => {
    try {
      const data = await sendRequest(
        `${import.meta.env.VITE_API_URL}/eventbooking`,
        "GET"
      );
      console.log("Event bookings:", data);
      setEventBookings(data || []);
      return data;
    } catch (err) {
      console.error("Error fetching event bookings:", err);
      return [];
    }
  };

  // Check if booking can be canceled
  const canCancel = (booking, type) => {
    const status = booking.status || 'pending';
    // Don't allow cancellation for event bookings or if status is cancelled/rejected
    if (type === 'event' || status === 'cancelled' || status === 'rejected') {
      return false;
    }
    return true;
  };

  const handleCancelBooking = (booking, type) => {
    // Prevent cancellation for event bookings
    if (type === 'event') {
      errorToast({
        title: "Cannot Cancel",
        message: "Event bookings cannot be cancelled as they are already paid for."
      });
      return;
    }

    setBookingToCancel(booking);
    setBookingTypeToCancel(type);
    toggle();
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel || !bookingTypeToCancel) {
      close();
      return;
    }
    
    try {
      let endpoint = "";
      let method = "DELETE";
      
      switch (bookingTypeToCancel) {
        case "restaurant":
          endpoint = `${import.meta.env.VITE_API_URL}/booking/${bookingToCancel._id}`;
          break;
        case "activity":
          endpoint = `${import.meta.env.VITE_API_URL}/activitybooking/${bookingToCancel._id}`;
          break;
        case "service":
          endpoint = `${import.meta.env.VITE_API_URL}/servicebooking/${bookingToCancel._id}`;
          break;
        case "event":
          // This case should not be reached due to the check in handleCancelBooking
          errorToast({
            title: "Error",
            message: "Event bookings cannot be cancelled."
          });
          close();
          return;
        default:
          throw new Error("Unknown booking type");
      }
      
      const response = await sendRequest(endpoint, method);
      
      if (response) {
        // Update the relevant state to remove the canceled booking
        switch (bookingTypeToCancel) {
          case "restaurant":
            setRestaurantBookings(prev => prev.filter(b => b._id !== bookingToCancel._id));
            break;
          case "activity":
            setActivityBookings(prev => prev.filter(b => b._id !== bookingToCancel._id));
            break;
          case "service":
            setServiceBookings(prev => prev.filter(b => b._id !== bookingToCancel._id));
            break;
        }
        
        close();
        successToast({
          title: "Booking canceled!",
          message: "Your booking has been successfully canceled."
        });
      }
    } catch (err) {
      console.error("Error canceling booking:", err);
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
    let color, backgroundColor, borderColor, icon;
    switch (status) {
      case "approved":
      case "confirmed":
        color = '#25c173';
        backgroundColor = 'rgba(25, 135, 84, 0.15)';
        borderColor = 'rgba(25, 135, 84, 0.3)';
        icon = <IconCheck size={14} />;
        break;
      case "rejected":
      case "cancelled":
        color = '#ff6b6b';
        backgroundColor = 'rgba(220, 53, 69, 0.15)';
        borderColor = 'rgba(220, 53, 69, 0.3)';
        icon = <IconX size={14} />;
        break;
      case "pending":
        color = '#ffc107';
        backgroundColor = 'rgba(255, 193, 7, 0.15)';
        borderColor = 'rgba(255, 193, 7, 0.3)';
        icon = <IconClock size={14} />;
        break;
      default:
        color = 'rgba(255, 255, 255, 0.8)';
        backgroundColor = 'rgba(255, 255, 255, 0.05)';
        borderColor = 'rgba(255, 255, 255, 0.2)';
        icon = <IconClock size={14} />;
    }

    return (
      <Badge 
        leftSection={icon}
        styles={{
          root: {
            backgroundColor,
            color,
            border: `1px solid ${borderColor}`,
            padding: '0.5rem 0.8rem',
            textTransform: 'capitalize',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }
        }}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </Badge>
    );
  };

  // Get all bookings for the current tab or return all bookings
  const getCurrentBookings = () => {
    switch (activeTab) {
      case "restaurant":
        return restaurantBookings;
      case "activity":
        return activityBookings;
      case "service":
        return serviceBookings;
      case "event":
        return eventBookings;
      case "all":
      default:
        // Create "all" view with all bookings combined and sorted by date
        const allBookings = [
          ...restaurantBookings.map(booking => ({ ...booking, type: 'restaurant' })),
          ...activityBookings.map(booking => ({ ...booking, type: 'activity' })),
          ...serviceBookings.map(booking => ({ ...booking, type: 'service' })),
          ...eventBookings.map(booking => ({ ...booking, type: 'event' }))
        ].sort((a, b) => {
          const dateA = new Date(a.dateTime || a.date || new Date());
          const dateB = new Date(b.dateTime || b.date || new Date());
          return dateB - dateA; // Sort by date, newest first
        });
        
        return allBookings;
    }
  };
  
  // Get appropriate icon based on booking type
  const getBookingIcon = (type) => {
    switch (type) {
      case 'restaurant':
        return <IconToolsKitchen2 size={24} stroke={1.5} color={colors.primary.main} />;
      case 'activity':
        return <IconSwimming size={24} stroke={1.5} color={colors.primary.main} />;
      case 'service':
        return <IconCategory size={24} stroke={1.5} color={colors.primary.main} />;
      case 'event':
        return <IconCalendarEvent size={24} stroke={1.5} color={colors.primary.main} />;
      default:
        return <IconCalendarEvent size={24} stroke={1.5} color={colors.primary.main} />;
    }
  };
  
  // Get appropriate title based on booking type and data
  const getBookingTitle = (booking, type) => {
    switch (type) {
      case 'restaurant':
        return booking.restaurant?.name || 'Restaurant Booking';
      case 'activity':
        // First try to get the activity title from the populated activity object
        if (booking.activity && booking.activity.title) {
          return booking.activity.title;
        }
        // Then try the activityName field
        if (booking.activityName) {
          return booking.activityName;
        }
        // Finally, try the title field directly
        if (booking.title) {
          return booking.title;
        }
        return 'Activity Booking';
      case 'service':
        return booking.service?.title || 'Service Booking';
      case 'event':
        return booking.event?.title || 'Event Booking';
      default:
        return 'Booking';
    }
  };
  
  // Get date from booking based on its type
  const getBookingDate = (booking, type) => {
    switch (type) {
      case 'restaurant':
        return booking.dateTime;
      case 'activity':
        return booking.date || booking.bookingDate;
      case 'service':
      case 'event':
        return booking.date;
      default:
        return new Date();
    }
  };
  
  // Get participants/people info based on booking type
  const getBookingPeople = (booking, type) => {
    switch (type) {
      case 'restaurant':
        return booking.pax || 0;
      case 'activity':
        return booking.participants || booking.numberOfParticipants || 0;
      case 'event':
        return booking.numberOfTickets || 0;
      case 'service':
        return booking.guests || 0;
      default:
        return 0;
    }
  };
  
  // Get location based on booking type
  const getBookingLocation = (booking, type) => {
    switch (type) {
      case 'restaurant':
        return booking.restaurant?.location || 'N/A';
      case 'activity':
        return booking.activity?.location || booking.location || 'N/A';
      case 'service':
        return booking.service?.location || 'N/A';
      case 'event':
        return booking.event?.location || 'N/A';
      default:
        return 'N/A';
    }
  };
  
  // Get price based on booking type
  const getBookingPrice = (booking, type) => {
    switch (type) {
      case 'activity':
        return booking.totalPrice || booking.price || 0;
      case 'service':
        return booking.totalPrice || 0;
      case 'event':
        return booking.totalPrice || 0;
      default:
        return null;
    }
  };
  
  // Handle download receipt for different booking types
  const handleDownloadReceipt = (booking, type) => {
    const status = booking.status || 'pending';
    if (status !== 'confirmed' && status !== 'approved') {
      errorToast({
        title: "Cannot Download Receipt",
        message: "Receipts are only available for confirmed or approved bookings."
      });
      return;
    }

    try {
      switch (type) {
        case 'restaurant':
          generateReceipt(booking);
          break;
        case 'activity':
          generateActivityReceipt(booking);
          break;
        case 'service':
          generateServiceReceipt(booking);
          break;
        case 'event':
          generateEventReceipt(booking);
          break;
        default:
          errorToast({
            title: "Error",
            message: "Unknown booking type."
          });
      }
    } catch (err) {
      console.error("Error generating receipt:", err);
      errorToast({
        title: "Error",
        message: "Failed to generate receipt. Please try again."
      });
    }
  };
  
  // Get link to detail page based on booking type
  const getDetailLink = (booking, type) => {
    switch (type) {
      case 'restaurant':
        return `/restaurant/${booking.restaurant?._id}`;
      case 'activity':
        return `/activities/${booking.activity?._id}`;
      case 'service':
        return `/services/${booking.service?._id}`;
      case 'event':
        return `/events/${booking.event?._id}`;
      default:
        return '/';
    }
  };

  // Render booking card
  const renderBookingCard = (booking, type) => {
    const bookingDate = getBookingDate(booking, type);
    const formattedDate = formatDateTime(bookingDate);
    const people = getBookingPeople(booking, type);
    const location = getBookingLocation(booking, type);
    const price = getBookingPrice(booking, type);
    const title = getBookingTitle(booking, type);
    const icon = getBookingIcon(type);
    const detailLink = getDetailLink(booking, type);
    
    return (
      <Card 
        key={`${type}-${booking._id}`} 
        sx={styles.bookingCard}
      >
        <Box style={{ position: 'relative' }}>
          <Group position="apart" mb="md">
            <Badge 
              color="gold" 
              variant="light" 
              style={{
                backgroundColor: 'rgba(209, 174, 54, 0.9)',
                color: '#fff',
                fontWeight: 600,
                backdropFilter: 'blur(5px)',
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
            {getStatusBadge(booking.status)}
          </Group>

          <Group spacing="md" mb="md">
            <Box
              sx={{
                backgroundColor: 'rgba(209, 174, 54, 0.1)',
                padding: '0.75rem',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
            <Box>
              <Title order={3} mb={4} lineClamp={1} style={{ color: '#2C3E50', fontSize: '1.3rem' }}>
                {title}
              </Title>
              {type === 'activity' && booking.activity?.description && (
                <Text size="sm" color="dimmed" lineClamp={2} mb={4}>
                  {booking.activity.description}
                </Text>
              )}
              <Text size="sm" color="dimmed">
                {formattedDate}
              </Text>
            </Box>
          </Group>
        </Box>

        <Group gap="xs" mb="xs">
          <Flex align="center" gap="5px">
            <IconUsers size={16} color="#d1ae36" stroke={1.5} />
            <Text size="sm" c="dimmed">
              {people} {people === 1 ? 'person' : 'people'}
            </Text>
          </Flex>
        </Group>

        <Group gap="xs" mb="xs">
          <Flex align="center" gap="5px">
            <IconMapPin size={16} color="#d1ae36" stroke={1.5} />
            <Text size="sm" c="dimmed">
              {location}
            </Text>
          </Flex>
        </Group>

        {price !== null && (
          <Group gap="xs" mb="xs">
            <Flex align="center" gap="5px">
              <IconCurrencyDollar size={16} color="#d1ae36" stroke={1.5} />
              <Text size="sm" c="dimmed">
                ${price}
              </Text>
            </Flex>
          </Group>
        )}

        {(booking.specialRequests || booking.request) && (
          <Text size="sm" c="dimmed" lineClamp={2} mb="xs" mt="xs">
            <Text span fw={500} c="dark">Request:</Text> {booking.specialRequests || booking.request}
          </Text>
        )}

        {(booking.status === 'rejected' || booking.status === 'cancelled') && (
          <Text size="sm" c="red" mt="xs">
            <Text span fw={500}>Reason:</Text> {booking.rejectionReason || booking.cancellationReason}
          </Text>
        )}

        <Flex mt="auto" gap="xs" pt="md">
          {type === 'event' ? (
            <>
              {(booking.status === 'confirmed' || booking.status === 'approved') && (
                <Button
                  variant="light"
                  styles={{
                    root: {
                      backgroundColor: 'rgba(13, 110, 253, 0.15)',
                      color: '#5c9bff',
                      border: '1px solid rgba(13, 110, 253, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(13, 110, 253, 0.25)',
                      }
                    }
                  }}
                  size="xs"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleDownloadReceipt(booking, type)}
                >
                  Download Receipt
                </Button>
              )}
              <Text size="sm" color="dimmed" italic>
                Event bookings cannot be cancelled as they are already paid for
              </Text>
            </>
          ) : (
            <>
              {canCancel(booking, type) && (
                <Button
                  variant="light" 
                  styles={{
                    root: {
                      backgroundColor: 'rgba(220, 53, 69, 0.15)',
                      color: '#ff6b6b',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(220, 53, 69, 0.25)',
                      }
                    }
                  }}
                  size="xs"
                  onClick={() => handleCancelBooking(booking, type)}
                >
                  Cancel
                </Button>
              )}
              
              {(booking.status === 'confirmed' || booking.status === 'approved') && (
                <Button
                  variant="light"
                  styles={{
                    root: {
                      backgroundColor: 'rgba(13, 110, 253, 0.15)',
                      color: '#5c9bff',
                      border: '1px solid rgba(13, 110, 253, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(13, 110, 253, 0.25)',
                      }
                    }
                  }}
                  size="xs"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleDownloadReceipt(booking, type)}
                >
                  Download Receipt
                </Button>
              )}
            </>
          )}
        </Flex>
      </Card>
    );
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

  // If we're still checking user or loading data, show loader
  if (!user) {
    return (
      <div style={{...styles.wrapper, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={styles.starsBackground}></div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.starsBackground}></div>
      
      {/* Custom Header/Navigation */}
      <header style={styles.header}>
        <div style={styles.logoWrapper}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>P</div>
            <span>PearlReserve</span>
          </Link>
        </div>
        
        <nav style={styles.nav}>
          <Link 
            to="/restaurants" 
            style={styles.navItem}
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
            style={styles.navItem}
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
            style={styles.navItem}
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
            style={styles.navItem}
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
          <Link 
            to="/account/bookings" 
            style={{
              ...styles.navItem,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '2px solid #d1ae36',
              color: '#fff'
            }}
          >
            My Bookings
          </Link>
        </nav>
        
        <div style={styles.authButtons}>
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
                      {user?.name || 'User'}
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
                  to="/account"
                  leftSection={<IconUser size={16} color="#d1ae36" stroke={1.5} />}
                >
                  My Account
                </Menu.Item>
                
                <Menu.Item
                  component={Link}
                  to="/account/bookings"
                  leftSection={<IconCalendarEvent size={16} color="#d1ae36" stroke={1.5} />}
                >
                  My Bookings
                </Menu.Item>
                

                <Divider my="xs" />

                <Menu.Item
                  leftSection={<IconLogout size={16} color="#d1ae36" stroke={1.5} />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </div>
      </header>
      
      <div style={styles.contentContainer}>
        <Container size="lg">
          {loading ? (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
              <LoadingSpinner />
            </Box>
          ) : (
            <>
              <div style={styles.headingSection}>
                <h1 style={styles.mainTitle}>My Bookings</h1>
                <p style={styles.subtitle}>
                  View and manage all your reservations, activities, events, and services in one place.
                </p>
              </div>
              
              <Modal
                opened={opened}
                close={close}
                title="Cancel Booking"
                modalContent={
                  <Text mb="md" c="rgba(255, 255, 255, 0.85)">
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </Text>
                }
                onSubmit={confirmCancelBooking}
                confirmText="Yes, cancel booking"
                cancelText="No, keep it"
                styles={styles.modalStyles}
              />
              
              <Box style={styles.tabsContainer}>
                <Tabs 
                  value={activeTab} 
                  onChange={setActiveTab} 
                  styles={{
                    tabLabel: {
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    },
                    tab: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&[data-active]': {
                        color: '#d1ae36',
                        borderColor: '#d1ae36',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                      },
                    },
                  }}
                >
                  <Tabs.List position="center">
                    <Tabs.Tab 
                      value="all"
                      leftSection={<IconCategory size={16} color="#d1ae36" />}
                    >
                      All Bookings
                    </Tabs.Tab>
                    <Tabs.Tab 
                      value="restaurant" 
                      leftSection={<IconBuildingStore size={16} color="#d1ae36" />}
                      rightSection={
                        <Badge 
                          size="sm" 
                          styles={{
                            root: {
                              backgroundColor: 'rgba(209, 174, 54, 0.15)',
                              color: '#d1ae36',
                              border: '1px solid rgba(209, 174, 54, 0.3)',
                            }
                          }}
                        >
                          {restaurantBookings.length}
                        </Badge>
                      }
                    >
                      Restaurants
                    </Tabs.Tab>
                    <Tabs.Tab 
                      value="activity"
                      leftSection={<IconSwimming size={16} color="#d1ae36" />}
                      rightSection={
                        <Badge 
                          size="sm" 
                          styles={{
                            root: {
                              backgroundColor: 'rgba(209, 174, 54, 0.15)',
                              color: '#d1ae36',
                              border: '1px solid rgba(209, 174, 54, 0.3)',
                            }
                          }}
                        >
                          {activityBookings.length}
                        </Badge>
                      }
                    >
                      Activities
                    </Tabs.Tab>
                    <Tabs.Tab 
                      value="service"
                      leftSection={<IconToolsKitchen2 size={16} color="#d1ae36" />}
                      rightSection={
                        <Badge 
                          size="sm" 
                          styles={{
                            root: {
                              backgroundColor: 'rgba(209, 174, 54, 0.15)',
                              color: '#d1ae36',
                              border: '1px solid rgba(209, 174, 54, 0.3)',
                            }
                          }}
                        >
                          {serviceBookings.length}
                        </Badge>
                      }
                    >
                      Services
                    </Tabs.Tab>
                    <Tabs.Tab 
                      value="event"
                      leftSection={<IconCalendarEvent size={16} color="#d1ae36" />}
                      rightSection={
                        <Badge 
                          size="sm" 
                          styles={{
                            root: {
                              backgroundColor: 'rgba(209, 174, 54, 0.15)',
                              color: '#d1ae36',
                              border: '1px solid rgba(209, 174, 54, 0.3)',
                            }
                          }}
                        >
                          {eventBookings.length}
                        </Badge>
                      }
                    >
                      Events
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>
              </Box>

              {getCurrentBookings().length === 0 ? (
                <div style={styles.emptyBookingsContainer}>
                  <Title order={2} style={{ color: 'white', marginBottom: '1rem' }}>
                    No {activeTab !== 'all' ? activeTab : ''} Bookings Yet
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    You don't have any {activeTab !== 'all' ? activeTab : ''} bookings yet. Explore our experiences and make a reservation.
                  </Text>
                  <Button 
                    component={Link} 
                    to="/"
                    style={{
                      backgroundColor: '#d1ae36',
                      color: '#1a2a41',
                      fontWeight: 600,
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 10px rgba(209, 174, 54, 0.3)',
                    }}
                  >
                    Explore Experiences
                  </Button>
                </div>
              ) : (
                <SimpleGrid 
                  cols={{ base: 1, sm: 2, md: 3 }} 
                  spacing="xl"
                  verticalSpacing="xl"
                  style={{ 
                    width: '100%',
                    margin: '0 auto',
                  }}
                >
                  {activeTab === 'all' ? (
                    // All bookings tab shows mixed content
                    getCurrentBookings().map(booking => renderBookingCard(booking, booking.type))
                  ) : (
                    // Type-specific tabs
                    getCurrentBookings().map(booking => renderBookingCard(booking, activeTab))
                  )}
                </SimpleGrid>
              )}
            </>
          )}
        </Container>
      </div>
      
      {/* Custom Footer */}
      <footer style={styles.footerContainer}>
        <div style={styles.footerContent}>
          <div style={styles.copyright}>
            &copy; {new Date().getFullYear()} PearlReserve — Premium Booking Experiences
          </div>
          <div style={styles.footerLinks}>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              About Us
            </a>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              style={styles.footerLink}
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

export default BookingList;
