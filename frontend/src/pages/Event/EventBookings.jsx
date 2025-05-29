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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { 
  IconMapPin, 
  IconUsers, 
  IconChevronRight, 
  IconCalendarEvent,
  IconTicket, 
} from "@tabler/icons-react";
import Modal from "../../components/Parts/Modal";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useToast from "../../hooks/useToast";
import { colors } from "../../theme/colors";

function EventBookings() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [eventBookings, setEventBookings] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    
    // Redirect business owners away from this page
    if (user.isOwner) {
      navigate("/owner/dashboard");
      return;
    }
    
    // Fetch event bookings
    fetchEventBookings();
  }, [user]);

  const fetchEventBookings = async () => {
    setLoading(true);
    try {
      const data = await sendRequest(
        `${import.meta.env.VITE_API_URL}/eventbooking`,
        "GET"
      );
      console.log("Event bookings:", data);
      setEventBookings(data || []);
    } catch (err) {
      console.error("Error fetching event bookings:", err);
      errorToast({
        title: "Error",
        message: "Failed to load event bookings. Please try again."
      });
    } finally {
      setLoading(false);
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
      const endpoint = `${import.meta.env.VITE_API_URL}/eventbooking/${bookingToCancel._id}`;
      await sendRequest(endpoint, "DELETE");
      
      // Update the state to remove the canceled booking
      setEventBookings(prev => prev.filter(b => b._id !== bookingToCancel._id));
      
      close();
      successToast({
        title: "Booking canceled!",
        message: "Your event booking has been successfully canceled."
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

  // Render event booking card
  const renderEventBookingCard = (booking) => {
    const bookingDate = booking.date || (booking.event && booking.event.date ? new Date(booking.event.date) : new Date());
    const formattedDate = formatDateTime(bookingDate);
    const tickets = booking.numberOfTickets || 0;
    const location = booking.event?.location || 'N/A';
    const price = booking.totalPrice || 0;
    const title = booking.event?.title || 'Event Booking';
    const detailLink = `/events/${booking.event?._id}`;
    
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
          }
        }}
      >
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Group position="apart" mb="xs">
              <Group spacing="sm">
                <IconCalendarEvent size={24} stroke={1.5} color={colors.primary.main} />
                <Anchor 
                  component={Link} 
                  to={detailLink}
                  size="xl"
                  fw={600}
                  color={colors.primary.main}
                  underline="hover"
                >
                  {title}
                </Anchor>
              </Group>
              {getStatusBadge(booking.status)}
            </Group>
            
            <Text size="md" mb="md" fw={500} color={colors.text.primary}>
              {formattedDate}
            </Text>
            
            <Group spacing="lg">
              <Group spacing="xs">
                <IconTicket size={18} color={colors.text.secondary} />
                <Text size="md" color={colors.text.secondary}>
                  {tickets} {tickets === 1 ? 'ticket' : 'tickets'}
                </Text>
              </Group>
              
              <Group spacing="xs">
                <IconMapPin size={18} color={colors.text.secondary} />
                <Text size="md" color={colors.text.secondary}>
                  {location}
                </Text>
              </Group>
              
              <Group spacing="xs">
                <Text size="md" color={colors.text.secondary} fw={500}>
                  ${price}
                </Text>
              </Group>
            </Group>
            
            {booking.specialRequests && (
              <Text size="sm" mt="md" color={colors.text.secondary}>
                <Text span fw={500}>Request:</Text> {booking.specialRequests}
              </Text>
            )}
            
            {booking.status === 'rejected' && booking.rejectionReason && (
              <Text size="sm" mt="xs" color={colors.accent.coral}>
                Reason: {booking.rejectionReason}
              </Text>
            )}
            
            {booking.status === 'cancelled' && booking.cancellationReason && (
              <Text size="sm" mt="xs" color={colors.accent.coral}>
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
              variant="subtle"
              component={Link}
              to={detailLink}
              size="xs"
              rightSection={<IconChevronRight size={14} />}
            >
              View Details
            </Button>
          </Stack>
        </Flex>
      </Card>
    );
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="lg" color={colors.primary.main}>My Event Bookings</Title>
      
      <Modal
        opened={opened}
        onClose={close}
        title="Cancel Event Booking"
        centered
      >
        <Text mb="md">Are you sure you want to cancel this event booking?</Text>
        <Group position="right">
          <Button variant="light" onClick={close}>No, keep it</Button>
          <Button color="red" onClick={confirmCancelBooking}>
            Yes, cancel booking
          </Button>
        </Group>
      </Modal>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {eventBookings.length === 0 ? (
            <Paper p="xl" radius="md" withBorder>
              <Stack align="center" spacing="md">
                <Text size="lg">You don't have any event bookings yet.</Text>
                <Button component={Link} to="/events" radius="md">
                  Explore Events
                </Button>
              </Stack>
            </Paper>
          ) : (
            <SimpleGrid cols={1} spacing="md">
              {eventBookings.map(booking => renderEventBookingCard(booking))}
            </SimpleGrid>
          )}
        </>
      )}
    </Container>
  );
}

export default EventBookings; 