/* eslint-disable react/prop-types */
import {
  Table,
  ScrollArea,
  Group,
  Text,
  Button,
  ActionIcon,
  rem,
  useMantineTheme,
  Title,
  Box,
  Select,
  Badge,
  Modal,
  Textarea,
  Tooltip,
  Tabs,
  Container,
  Menu,
  UnstyledButton,
  Paper,
  Divider
} from "@mantine/core";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useEffect, useRef, useState } from "react";
import { IconClock, IconCheck, IconX, IconFileDownload, IconBuildingStore, IconCalendarEvent, IconWalk, IconTool, IconLogin, IconUserPlus, IconLogout, IconHeart, IconStar, IconChevronDown, IconMapPin, IconActivity, IconToolsKitchen2, IconBuildingCommunity, IconUser, IconSwimming, IconCategory } from "@tabler/icons-react";
import dayjs from "dayjs";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { useForm } from "@mantine/form";
import { useNavigate, useOutletContext, useParams, useLocation, Link } from "react-router-dom";
import useToast from "../../hooks/useToast";
import { getUser, logOut } from "../../service/users";
import { sharedStyles } from "../../components/Layout/SharedStyles";

// Helper function to extract user name from various data structures
const getUserName = (user) => {
  if (!user) return "Unknown";
  
  // If user is just a string ID
  if (typeof user === 'string') return "Unknown";
  
  // If user has name property
  if (user.name) return user.name;
  
  // If user has firstName and lastName
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  
  // If user has only firstName 
  if (user.firstName) return user.firstName;
  
  // If user has only lastName
  if (user.lastName) return user.lastName;
  
  // If user has email but no name
  if (user.email) return user.email.split('@')[0];
  
  // Fallback
  return "Unknown";
};

// Define additional styles specific to the dashboard
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
  tabs: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    marginBottom: '2rem',
  },
  tab: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    borderRadius: '0.375rem',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    '&[data-active]': {
      backgroundColor: 'rgba(209, 174, 54, 0.2)',
      color: '#d1ae36',
    }
  },
  tableBox: {
    backgroundColor: 'rgba(30, 40, 60, 0.4)',
    backdropFilter: 'blur(10px)',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  filterButton: {
    backgroundColor: '#d1ae36',
    color: '#1a2a41',
    '&:hover': {
      backgroundColor: '#c9a930',
    }
  },
  clearButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.7)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    }
  },
  tableData: {
    color: 'white'
  }
};

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
  signInButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(209, 174, 54, 0.3)',
    color: '#d1ae36',
    fontWeight: '600',
    padding: '0.5rem 1.25rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  signUpButton: {
    backgroundColor: '#d1ae36',
    border: 'none',
    color: '#1a2a41',
    fontWeight: '600',
    padding: '0.5rem 1.25rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  contentContainer: {
    width: '100%',
    padding: '5rem 0 3rem 0',
    position: 'relative',
    zIndex: 2,
    flex: 1,
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
  },
  copyright: {
    fontSize: '0.9rem',
  },
};

function Th({ children }) {
  return (
    <Table.Th style={{ color: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <Text fw={700} fz="sm">
        {children}
      </Text>
    </Table.Th>
  );
}

// Restaurant Bookings Tab Component
function RestaurantBookingsTab({ data, handleApproveBooking, handleRejectBookingModal, processingBookingId, getStatusBadge }) {
  if (data.length === 0) {
    return (
      <Text fw={500} ta="center" style={{ color: 'white' }}>
        You have no restaurant bookings yet.
      </Text>
    );
  }

  const rows = data.map((row) => (
    <Table.Tr key={row._id}>
      <Table.Td style={{ color: 'white' }}>{row.user.name || row.user.firstName + " " + row.user.lastName || ""}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{dayjs(row.dateTime).format("DD/MM/YYYY")}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{dayjs(row.dateTime).format("hh:mmA")}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.pax}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.request || "—"}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.user.email || ""}</Table.Td>
      <Table.Td>{getStatusBadge(row.status || 'pending')}</Table.Td>
      <Table.Td>
        {(!row.status || row.status === 'pending') && (
          <Group>
            <Button 
              size="xs"
              color="green" 
              onClick={() => handleApproveBooking(row._id)}
              loading={processingBookingId === row._id}
              disabled={processingBookingId !== null}
              leftSection={<IconCheck style={{ width: rem(16), height: rem(16) }} />}
            >
              Approve
            </Button>
            <Button 
              size="xs"
              color="red" 
              onClick={() => handleRejectBookingModal(row)}
              disabled={processingBookingId !== null}
              leftSection={<IconX style={{ width: rem(16), height: rem(16) }} />}
            >
              Reject
            </Button>
          </Group>
        )}
        {row.status === 'rejected' && row.rejectionReason && (
          <Text size="xs" c="dimmed">
            Reason: {row.rejectionReason}
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Table verticalSpacing="md" miw={1000} styles={{
        td: { 
          color: 'white', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        },
        th: { 
          color: 'rgba(255, 255, 255, 0.8)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        }
      }}>
        <Table.Tbody>
          <Table.Tr>
            <Th>Name</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Pax</Th>
            <Th>Request</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th w={180}>Actions</Th>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

// Activity Bookings Tab Component
function ActivityBookingsTab({ data, processingBookingId, getStatusBadge }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();

  const handleConfirmBooking = async (id) => {
    setConfirmingId(id);
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/activitybooking/${id}/confirm`,
        "PUT"
      );
      successToast({
        title: "Booking Confirmed",
        message: "The activity booking has been confirmed."
      });
      // Refresh bookings - you might want to implement a refresh function
      window.location.reload();
    } catch (err) {
      console.error("Error confirming booking:", err);
      errorToast({
        title: "Error",
        message: "Could not confirm booking. Please try again."
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelBooking = async (id) => {
    setCancellingId(id);
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/activitybooking/${id}/cancel`,
        "PUT",
        { cancellationReason: "Cancelled by business owner" }
      );
      successToast({
        title: "Booking Cancelled",
        message: "The activity booking has been cancelled."
      });
      // Refresh bookings
      window.location.reload();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      errorToast({
        title: "Error",
        message: "Could not cancel booking. Please try again."
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (data.length === 0) {
    return (
      <Text fw={500} ta="center" style={{ color: 'white' }}>
        You have no activity bookings yet.
      </Text>
    );
  }

  const rows = data.map((row) => (
    <Table.Tr key={row._id}>
      <Table.Td style={{ color: 'white' }}>
        {getUserName(row.user)}
      </Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.activity?.title || "Unknown Activity"}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{dayjs(row.date).format("DD/MM/YYYY")}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.participants}</Table.Td>
      <Table.Td style={{ color: 'white' }}>${row.totalPrice}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.specialRequests || "—"}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.user?.email || ""}</Table.Td>
      <Table.Td>{getStatusBadge(row.status || 'pending')}</Table.Td>
      <Table.Td>
        {row.status === 'pending' && (
          <Group>
            <Button 
              size="xs"
              color="green" 
              onClick={() => handleConfirmBooking(row._id)}
              loading={confirmingId === row._id}
              disabled={confirmingId !== null || cancellingId !== null}
              leftSection={<IconCheck style={{ width: rem(16), height: rem(16) }} />}
            >
              Confirm
            </Button>
            <Button 
              size="xs"
              color="red" 
              onClick={() => handleCancelBooking(row._id)}
              loading={cancellingId === row._id}
              disabled={confirmingId !== null || cancellingId !== null}
              leftSection={<IconX style={{ width: rem(16), height: rem(16) }} />}
            >
              Cancel
            </Button>
          </Group>
        )}
        {row.status === 'cancelled' && row.cancellationReason && (
          <Text size="xs" c="dimmed">
            Reason: {row.cancellationReason}
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Table verticalSpacing="md" miw={1000} styles={{
        td: { 
          color: 'white', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        },
        th: { 
          color: 'rgba(255, 255, 255, 0.8)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        }
      }}>
        <Table.Tbody>
          <Table.Tr>
            <Th>Name</Th>
            <Th>Activity</Th>
            <Th>Date</Th>
            <Th>Participants</Th>
            <Th>Price</Th>
            <Th>Special Requests</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th w={180}>Actions</Th>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

// Event Bookings Tab Component
function EventBookingsTab({ data, processingBookingId, getStatusBadge }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();

  const handleConfirmBooking = async (id) => {
    setConfirmingId(id);
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/eventbooking/${id}/confirm`,
        "PUT"
      );
      successToast({
        title: "Booking Confirmed",
        message: "The event booking has been confirmed."
      });
      // Refresh bookings
      window.location.reload();
    } catch (err) {
      console.error("Error confirming booking:", err);
      errorToast({
        title: "Error",
        message: "Could not confirm booking. Please try again."
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelBooking = async (id) => {
    setCancellingId(id);
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/eventbooking/${id}/cancel`,
        "PUT",
        { cancellationReason: "Cancelled by business owner" }
      );
      successToast({
        title: "Booking Cancelled",
        message: "The event booking has been cancelled."
      });
      // Refresh bookings
      window.location.reload();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      errorToast({
        title: "Error",
        message: "Could not cancel booking. Please try again."
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (data.length === 0) {
    return (
      <Text fw={500} ta="center">
        You have no event bookings yet.
      </Text>
    );
  }

  const rows = data.map((row) => (
    <Table.Tr key={row._id}>
      <Table.Td style={{ color: 'white' }}>
        {getUserName(row.user)}
      </Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.event?.title || "Unknown Event"}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{dayjs(row.event?.date).format("DD/MM/YYYY")} {row.event?.time}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.numberOfTickets}</Table.Td>
      <Table.Td style={{ color: 'white' }}>${row.totalPrice}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.specialRequests || "—"}</Table.Td>
      <Table.Td style={{ color: 'white' }}>{row.user?.email || ""}</Table.Td>
      <Table.Td>{getStatusBadge(row.status || 'pending')}</Table.Td>
      <Table.Td>
        {row.status === 'pending' && (
          <Group>
            <Button 
              size="xs"
              color="green" 
              onClick={() => handleConfirmBooking(row._id)}
              loading={confirmingId === row._id}
              disabled={confirmingId !== null || cancellingId !== null}
              leftSection={<IconCheck style={{ width: rem(16), height: rem(16) }} />}
            >
              Confirm
            </Button>
            <Button 
              size="xs"
              color="red" 
              onClick={() => handleCancelBooking(row._id)}
              loading={cancellingId === row._id}
              disabled={confirmingId !== null || cancellingId !== null}
              leftSection={<IconX style={{ width: rem(16), height: rem(16) }} />}
            >
              Cancel
            </Button>
          </Group>
        )}
        {row.status === 'cancelled' && row.cancellationReason && (
          <Text size="xs" c="dimmed">
            Reason: {row.cancellationReason}
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Table verticalSpacing="md" miw={1000} styles={{
        td: { 
          color: 'white', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        },
        th: { 
          color: 'rgba(255, 255, 255, 0.8)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        }
      }}>
        <Table.Tbody>
          <Table.Tr>
            <Th>Name</Th>
            <Th>Event</Th>
            <Th>Date & Time</Th>
            <Th>Tickets</Th>
            <Th>Price</Th>
            <Th>Special Requests</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th w={180}>Actions</Th>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

// Service Bookings Tab Component
function ServiceBookingsTab({ data, processingBookingId, getStatusBadge }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const { user } = useOutletContext();

  const handleConfirmBooking = async (id) => {
    setConfirmingId(id);
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/servicebooking/${id}/confirm`,
        "PUT"
      );
      successToast({
        title: "Booking Confirmed",
        message: "The service booking has been confirmed."
      });
      // Refresh bookings
      window.location.reload();
    } catch (err) {
      console.error("Error confirming booking:", err);
      errorToast({
        title: "Error",
        message: "Could not confirm booking. Please try again."
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelBooking = async (id) => {
    setCancellingId(id);
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/servicebooking/${id}/cancel`,
        "PUT",
        { cancellationReason: "Cancelled by business owner" }
      );
      successToast({
        title: "Booking Cancelled",
        message: "The service booking has been cancelled."
      });
      // Refresh bookings
      window.location.reload();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      errorToast({
        title: "Error",
        message: "Could not cancel booking. Please try again."
      });
    } finally {
      setCancellingId(null);
    }
  };

  // Ensure we have data to display
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Text fw={500} ta="center">
        You have no service bookings yet.
      </Text>
    );
  }

  console.log("Rendering service bookings data:", data);

  // If we have user information, use it to filter bookings that belong to services owned by this user
  const filteredData = data.filter(row => {
    // If the service has an owner property that matches the current user ID, show it
    if (row.service && typeof row.service === 'object' && row.service.owner === user.id) {
      return true;
    }
    
    // Include this booking while we're debugging 
    return true;
  });

  console.log("Filtered service bookings:", filteredData.length);

  const rows = filteredData.map((row) => {
    // Handle MongoDB-style document based on the data format in the screenshot
    return (
      <Table.Tr key={row._id}>
        <Table.Td style={{ color: 'white' }}>
          {getUserName(row.user)}
        </Table.Td>
        <Table.Td style={{ color: 'white' }}>{row.service ? (typeof row.service === 'string' ? row.service : row.service.title || "Unknown Service") : "Unknown Service"}</Table.Td>
        <Table.Td style={{ color: 'white' }}>{row.date ? dayjs(row.date).format("DD/MM/YYYY") : "—"}</Table.Td>
        <Table.Td style={{ color: 'white' }}>{row.time || "—"}</Table.Td>
        <Table.Td style={{ color: 'white' }}>{row.duration ? `${row.duration} hour${row.duration !== 1 ? 's' : ''}` : "—"}</Table.Td>
        <Table.Td style={{ color: 'white' }}>${row.totalPrice || 0}</Table.Td>
        <Table.Td style={{ color: 'white' }}>{row.specialRequests || "—"}</Table.Td>
        <Table.Td style={{ color: 'white' }}>{row.user && row.user.email ? row.user.email : "—"}</Table.Td>
        <Table.Td>{getStatusBadge(row.status || 'pending')}</Table.Td>
        <Table.Td>
          {(!row.status || row.status === 'pending') && (
            <Group>
              <Button 
                size="xs"
                color="green" 
                onClick={() => handleConfirmBooking(row._id)}
                loading={confirmingId === row._id}
                disabled={confirmingId !== null || cancellingId !== null}
                leftSection={<IconCheck style={{ width: rem(16), height: rem(16) }} />}
              >
                Confirm
              </Button>
              <Button 
                size="xs"
                color="red" 
                onClick={() => handleCancelBooking(row._id)}
                loading={cancellingId === row._id}
                disabled={confirmingId !== null || cancellingId !== null}
                leftSection={<IconX style={{ width: rem(16), height: rem(16) }} />}
              >
                Cancel
              </Button>
            </Group>
          )}
          {row.status === 'cancelled' && row.cancellationReason && (
            <Text size="xs" c="dimmed">
              Reason: {row.cancellationReason}
            </Text>
          )}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ScrollArea>
      <Table verticalSpacing="md" miw={1000} styles={{
        td: { 
          color: 'white', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        },
        th: { 
          color: 'rgba(255, 255, 255, 0.8)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        }
      }}>
        <Table.Tbody>
          <Table.Tr>
            <Th>Name</Th>
            <Th>Service</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Duration</Th>
            <Th>Price</Th>
            <Th>Special Requests</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th w={180}>Actions</Th>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

function OwnerDashboard() {
  const [restaurantBookings, setRestaurantBookings] = useState([]);
  const [activityBookings, setActivityBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const { sendRequest } = useFetch();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { successToast, errorToast } = useToast();
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("restaurant");
  const [navHover, setNavHover] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [restaurantOptions, setRestaurantOptions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [activityOptions, setActivityOptions] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [serviceOptions, setServiceOptions] = useState([]);

  const theme = useMantineTheme();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      date: null,
      timeFrom: "",
      timeTo: "",
    },
    initialErrors: { timeFrom: null, timeTo: null },
    validate: {
      date: (value) => !value && "Please enter a date",
      timeFrom: (value) =>
        value === ""
          ? null
          : value > form.values.timeTo
          ? "Invalid time range"
          : value && !form.values.timeTo
          ? "Invalid time range"
          : !value && form.values.timeTo && "Invalid time range",

      timeTo: (value) =>
        value === ""
          ? null
          : value < form.values.timeFrom
          ? "Invalid time range"
          : value && !form.values.timeFrom
          ? "Invalid time range"
          : !value && form.values.timeFrom && "Invalid time range",
    },
  });

  useEffect(() => {
    // Redirect non-owner users away from this page
    if (user && !user.isOwner) {
      navigate("/");
      return;
    }
    
    // First get all restaurants owned by the user
    getAllRestaurants();
    
    // Fetch all booking types for the owner
    fetchAllOwnerBookings();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When restaurantId changes (either from URL or from dropdown selection)
    console.log("selectedRestaurantId changed:", selectedRestaurantId);
    if (selectedRestaurantId) {
      // Get restaurant details
      getRestaurantDetails(selectedRestaurantId);
      
      // Update restaurant bookings (for restaurant tab)
      fetchRestaurantBookings();
      
      // Update URL if we're on the base dashboard route
      if (location.pathname === "/owner/dashboard") {
        navigate(`/owner/dashboard/${selectedRestaurantId}`);
      }
      
      // Also refresh event bookings since they are linked to restaurants
      fetchEventBookings();
    }
  }, [selectedRestaurantId]);

  const fetchAllOwnerBookings = async () => {
    setLoading(true);
    
    try {
      // Fetch restaurant bookings if we have a selected restaurant
      if (selectedRestaurantId) {
        try {
          await fetchRestaurantBookings();
        } catch (err) {
          console.error("Error fetching restaurant bookings:", err);
        }
      }
      
      // Fetch activity bookings
      try {
        await fetchActivityBookings();
      } catch (err) {
        console.error("Error fetching activity bookings:", err);
      }
      
      // Fetch event bookings
      try {
        await fetchEventBookings();
      } catch (err) {
        console.error("Error fetching event bookings:", err);
      }
      
      // Fetch service bookings
      try {
        await fetchServiceBookings();
      } catch (err) {
        console.error("Error fetching service bookings:", err);
        errorToast({
          title: "Service Bookings Error",
          message: "Could not fetch service bookings. Please try again or contact support."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantBookings = async () => {
    setLoading(true);
    try {
      let endpoint = `${import.meta.env.VITE_API_URL}/booking/restaurant`;
      if (selectedRestaurantId) {
        endpoint += `/${selectedRestaurantId}`;
      }
      
      const bookingsData = await sendRequest(endpoint, "GET");
      
      // Ensure we have user information for each booking
      if (!bookingsData.some(booking => booking.user?._id)) {
        console.warn("Some bookings are missing user information");
      }
      
      setRestaurantBookings(bookingsData);
    } catch (err) {
      console.error("Error fetching restaurant bookings:", err);
      errorToast({
        title: "Error",
        message: "Could not load restaurant bookings. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityBookings = async () => {
    try {
      // Show loading only for activity tab
      if (activeTab === "activity") {
        setLoading(true);
      }
      
      console.log("Fetching activity bookings from:", `${import.meta.env.VITE_API_URL}/activitybooking/owner-bookings`);
      
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/activitybooking/owner-bookings`,
        "GET"
      );
      console.log("Activity bookings retrieved:", resData);
      setActivityBookings(resData);
      
      if (activeTab === "activity") {
        setLoading(false);
      }
      
      return resData;
    } catch (err) {
      console.error("Error fetching activity bookings:", err.message || err);
      console.error("Full error:", err);
      if (activeTab === "activity") {
        setLoading(false);
      }
      return [];
    }
  };

  const fetchEventBookings = async () => {
    try {
      // Show loading only for event tab
      if (activeTab === "event") {
        setLoading(true);
      }
      
      console.log("Fetching event bookings from:", `${import.meta.env.VITE_API_URL}/eventbooking/owner-bookings`);
      
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/eventbooking/owner-bookings`,
        "GET"
      );
      console.log("Event bookings retrieved:", resData);
      setEventBookings(resData);
      
      if (activeTab === "event") {
        setLoading(false);
      }
      
      return resData;
    } catch (err) {
      console.error("Error fetching event bookings:", err.message || err);
      console.error("Full error:", err);
      if (activeTab === "event") {
        setLoading(false);
      }
      return [];
    }
  };

  const fetchServiceBookings = async () => {
    try {
      // Show loading only for service tab
      if (activeTab === "service") {
        setLoading(true);
      }
      
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found for service bookings");
        throw new Error("Authentication required. Please sign in again.");
      }
      
      // Use a query parameter approach instead of path parameter to avoid MongoDB ObjectId parsing
      const endpoint = `${import.meta.env.VITE_API_URL}/servicebooking?owner=true`;
      console.log("Fetching service bookings from:", endpoint);
      
      const resData = await sendRequest(
        endpoint,
        "GET"
      );
      
      console.log("Service bookings raw response:", resData);
      
      // Handle empty array or null response
      if (Array.isArray(resData)) {
        console.log(`Successfully retrieved ${resData.length} service bookings`);
        setServiceBookings(resData);
      } else {
        console.warn("Service bookings response is not an array:", typeof resData, resData);
        setServiceBookings([]);
      }
      
      if (activeTab === "service") {
        setLoading(false);
      }
      
      return resData;
    } catch (err) {
      console.error("Error fetching service bookings:", err.message || err);
      console.error("Full error:", err);
      if (activeTab === "service") {
        setLoading(false);
      }
      return [];
    }
  };

  const getAllRestaurants = async () => {
    try {
    const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/owner`,
      "GET"
    );
      
      setRestaurants(resData);
      
      // If we don't have a restaurantId from the URL but have restaurants, select the first one
      if (!selectedRestaurantId && resData && resData.length > 0) {
        setSelectedRestaurantId(resData[0]._id);
        // Immediately load restaurant details and bookings when setting initial selection
        getRestaurantDetails(resData[0]._id);
        fetchRestaurantBookings();
      }
    } catch (err) {
      console.log(err);
    setLoading(false);
    }
  };

  const getRestaurantDetails = async (id) => {
    try {
      const restaurantData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/${id}`,
        "GET"
      );
      setRestaurant(restaurantData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRestaurantChange = (id) => {
    setSelectedRestaurant(id);
    setSelectedRestaurantId(id);
    if (id) {
      getRestaurantDetails(id);
    }
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    
    // Only clear restaurant selection for restaurant and event tabs
    if (activeTab === "restaurant" || activeTab === "event") {
      setSelectedRestaurant("");
      setSelectedRestaurantId(null);
    }

    // Clear activity selection for activity tab
    if (activeTab === "activity") {
      setSelectedActivity("");
    }

    // Clear service selection for service tab
    if (activeTab === "service") {
      setSelectedService("");
    }
    
    // Reload data
    switch (activeTab) {
      case "restaurant":
    fetchRestaurantBookings();
        break;
      case "activity":
        fetchActivityBookings();
        break;
      case "event":
        fetchEventBookings();
        break;
      case "service":
        fetchServiceBookings();
        break;
      default:
        break;
    }
  };

  const filterList = async () => {
    setLoading(true);
    
    // Determine which API endpoint to call based on the active tab
    let endpoint = "";
    switch (activeTab) {
      case "restaurant":
        endpoint = `${import.meta.env.VITE_API_URL}/restaurant/${selectedRestaurantId}/bookings/filter`;
        break;
      case "activity":
        endpoint = `${import.meta.env.VITE_API_URL}/activitybooking/filter`;
        break;
      case "event":
        endpoint = `${import.meta.env.VITE_API_URL}/eventbooking/filter`;
        break;
      case "service":
        endpoint = `${import.meta.env.VITE_API_URL}/servicebooking/filter`;
        break;
      default:
        setLoading(false);
        return;
    }
    
    try {
      // Prepare filter parameters
      const params = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      
      // Only include restaurantId for restaurant and event bookings
      if ((activeTab === "restaurant" || activeTab === "event") && selectedRestaurantId) {
        params.restaurantId = selectedRestaurantId;
    }

      // Include activityId for activity bookings
      if (activeTab === "activity" && selectedActivity) {
        params.activityId = selectedActivity;
      }

      // Include serviceId for service bookings
      if (activeTab === "service" && selectedService) {
        params.serviceId = selectedService;
      }
      
      const data = await sendRequest(endpoint, "POST", params);
      
      // Update the appropriate state based on the active tab
      switch (activeTab) {
        case "restaurant":
          setRestaurantBookings(data);
          break;
        case "activity":
          setActivityBookings(data);
          break;
        case "event":
          setEventBookings(data);
          break;
        case "service":
          setServiceBookings(data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error filtering bookings:", error);
      errorToast({
        title: "Error",
        message: "Failed to filter bookings. Please try again."
      });
    } finally {
    setLoading(false);
    }
  };

  const handleApproveBooking = async (id) => {
    setProcessingBookingId(id);
    try {
      // Find the booking in the current bookings list
      const booking = restaurantBookings.find(b => b._id === id);
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Send the approval request
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/booking/${id}/approve`,
        "POST"
      );

      // Refresh booking list
      await fetchRestaurantBookings();
      
      successToast({
        title: "Booking Approved",
        message: "The booking has been approved successfully."
      });
    } catch (err) {
      console.error("Error approving booking:", err);
      errorToast({
        title: "Error",
        message: err.message || "Could not approve booking. Please try again."
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleRejectBookingModal = (booking) => {
    setSelectedBooking(booking);
    setRejectionReason('');
    open();
  };

  const handleRejectBooking = async () => {
    setProcessingBookingId(selectedBooking._id);
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/booking/${selectedBooking._id}/reject`,
        "POST",
        { rejectionReason }
      );
      close();
      // Refresh booking list
      fetchRestaurantBookings();
      successToast({
        title: "Booking Rejected",
        message: "The booking has been rejected."
      });
    } catch (err) {
      console.error("Error rejecting booking:", err);
      errorToast({
        title: "Error",
        message: "Could not reject booking. Please try again."
      });
    } finally {
      setProcessingBookingId(null);
      setSelectedBooking(null);
    }
  };

  const getStatusBadge = (status) => {
    let color, icon = null;
    
    switch (status.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        color = "green";
        icon = <IconFileDownload size={14} />;
        break;
      case 'rejected':
      case 'cancelled':
        color = "red";
        break;
      case 'pending':
      default:
        color = "yellow";
        break;
    }
    
    return (
      <Tooltip label={status === 'approved' || status === 'confirmed' ? "Customers can download a receipt for approved bookings" : null}>
        <Badge color={color} rightSection={icon}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </Tooltip>
    );
  };

  const refFrom = useRef(null);
  const refTo = useRef(null);

  const pickerControlFrom = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => refFrom.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );
  const pickerControlTo = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => refTo.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );

  const handleTabChange = (value) => {
    setActiveTab(value);
    
    // Reset restaurant filtering when switching to activity or service tabs
    if (value === "activity" || value === "service") {
      setSelectedRestaurant("");
      // Don't set selectedRestaurantId to null here, as it's needed for restaurant and event views
    }

    // Reset activity filtering when not on activity tab
    if (value !== "activity") {
      setSelectedActivity("");
    }

    // Reset service filtering when not on service tab
    if (value !== "service") {
      setSelectedService("");
    }
  };

  // Get current user from localStorage on component mount
  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    try {
      const res = sendRequest(
        `${import.meta.env.VITE_API_URL}/user/logout`,
        "POST",
        { email: user.email }
      );
      logOut();
      setUser(null);
      navigate("/");
      successToast({
        title: "See you again!",
        message: "You have been successfully logged out."
      });
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Could not log out. Please try again."
      });
    }
  };

  useEffect(() => {
    // When restaurants are loaded, create options for the select dropdown
    if (restaurants && restaurants.length > 0) {
      const options = restaurants.map(r => ({ 
        value: r._id, 
        label: r.name 
      }));
      setRestaurantOptions(options);
    }
  }, [restaurants]);

  // Fetch activities and services for filtering
  useEffect(() => {
    fetchActivities();
    fetchServices();
  }, []);

  // When activities are loaded, create options for the dropdown
  useEffect(() => {
    if (activities && activities.length > 0) {
      const options = activities.map(a => ({
        value: a._id,
        label: a.title
      }));
      setActivityOptions(options);
    }
  }, [activities]);

  // When services are loaded, create options for the dropdown
  useEffect(() => {
    if (services && services.length > 0) {
      const options = services.map(s => ({
        value: s._id,
        label: s.title
      }));
      setServiceOptions(options);
    }
  }, [services]);

  // Fetch activities for the activity filter
  const fetchActivities = async () => {
    try {
      const data = await sendRequest(
        `${import.meta.env.VITE_API_URL}/activity`,
        "GET"
      );
      setActivities(data);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  // Fetch services for the service filter
  const fetchServices = async () => {
    try {
      const data = await sendRequest(
        `${import.meta.env.VITE_API_URL}/service`,
        "GET"
      );
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const handleActivityChange = (id) => {
    setSelectedActivity(id);
  };

  const handleServiceChange = (id) => {
    setSelectedService(id);
  };

  return (
    <div style={sharedStyles.wrapper}>
      <div style={sharedStyles.starsBackground}></div>
      
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
            to="/explore" 
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
            Explore
          </Link>
          <Link 
            to="/gallery" 
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
            Gallery
          </Link>
          <Link 
            to="/about" 
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
            About
          </Link>
          <Link 
            to="/contact" 
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
            Contact
          </Link>
        </nav>
        
        <div style={styles.authButtons}>
          {!user ? (
            <>
              <Link 
                to="/signin" 
                style={styles.signInButton}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <IconLogin size={16} />
                Sign in
              </Link>
              <Link 
                to="/signup" 
                style={styles.signUpButton}
                onMouseOver={(e) => {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <IconUserPlus size={16} />
                Sign up
              </Link>
            </>
          ) : (
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
                {!user?.isOwner && (
                  <>
          
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
                

                    
                    
                  </>
                )}

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
                      to="/owner/dashboard"
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
                      to="/owner/dashboard"
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
                      to="/owner/dashboard"
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
                      to="/owner/dashboard"
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
                    
                    <Divider 
                      my="xs" 
                      color="rgba(255, 255, 255, 0.1)" 
                      label={
                        <Text size="xs" weight={500} color="white">
                          Additional Services
                        </Text>
                      } 
                      labelPosition="center"
                    />
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/activities"
                      leftSection={
                        <IconActivity
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
                      Activities
                    </Menu.Item>
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/events"
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
                      Events
                    </Menu.Item>
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/services"
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
                      Services
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
                Owner Dashboard
              </Title>
              
              {/* Filter section */}
              <Box style={dashboardStyles.filterContainer}>
                <Group position="apart" mb="md">
                  <Text fw={600} size="lg" style={{ color: 'white' }}>Filter Bookings</Text>
                </Group>
                
                <Group>
                  {/* Only show restaurant selection for restaurant and event bookings */}
                  {(activeTab === "restaurant" || activeTab === "event") && (
                      <Select
                      placeholder="Select Restaurant"
                      value={selectedRestaurant || ""}
                        onChange={handleRestaurantChange}
                      data={
                        restaurantOptions.length > 0
                          ? restaurantOptions
                          : [{ value: "", label: "No restaurants found" }]
                      }
                      style={{ flex: 1 }}
                      searchable
                      clearable
                      styles={{
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.07)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                        }
                      }}
                    />
                  )}

                  {/* Only show activity selection for activity bookings */}
                  {activeTab === "activity" && (
                    <Select
                      placeholder="Select Activity"
                      value={selectedActivity || ""}
                      onChange={handleActivityChange}
                      data={
                        activityOptions.length > 0
                          ? activityOptions
                          : [{ value: "", label: "No activities found" }]
                      }
                      style={{ flex: 1 }}
                      searchable
                      clearable
                      styles={{
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.07)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                        }
                      }}
                    />
                  )}

                  {/* Only show service selection for service bookings */}
                  {activeTab === "service" && (
                    <Select
                      placeholder="Select Service"
                      value={selectedService || ""}
                      onChange={handleServiceChange}
                      data={
                        serviceOptions.length > 0
                          ? serviceOptions
                          : [{ value: "", label: "No services found" }]
                      }
                      style={{ flex: 1 }}
                      searchable
                      clearable
                      styles={{
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.07)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                        }
                      }}
                    />
                  )}
                  
                  <DatePickerInput
                    placeholder="Start date"
                    value={startDate}
                    onChange={setStartDate}
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        backgroundColor: 'rgba(255, 255, 255, 0.07)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                      },
                      day: {
                        '&[data-selected]': {
                          backgroundColor: '#d1ae36',
                          color: '#1a2a41',
                        }
                      }
                    }}
                  />
                    
                  <DatePickerInput
                    placeholder="End date"
                    value={endDate}
                    onChange={setEndDate}
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        backgroundColor: 'rgba(255, 255, 255, 0.07)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                      },
                      day: {
                        '&[data-selected]': {
                          backgroundColor: '#d1ae36',
                          color: '#1a2a41',
                        }
                      }
                    }}
                  />
                  
                  <Group>
                    <Button 
                      style={dashboardStyles.filterButton}
                      onClick={filterList}
                      loading={loading}
                    >
                      Filter
                    </Button>
                    <Button 
                      variant="outline" 
                      style={dashboardStyles.clearButton}
                      onClick={handleClearFilter}
                    >
                      Clear
                    </Button>
                  </Group>
                </Group>
              </Box>
              
              {/* Tabs for different booking types */}
              <Tabs value={activeTab} onChange={handleTabChange} style={dashboardStyles.tabs} styles={{
                tab: dashboardStyles.tab
              }}>
                <Tabs.List>
                  <Tabs.Tab value="restaurant" leftSection={<IconBuildingStore size={16} />}>
                    Restaurant Bookings
                  </Tabs.Tab>
                  <Tabs.Tab value="activity" leftSection={<IconActivity size={16} />}>
                    Activity Bookings
                  </Tabs.Tab>
                  <Tabs.Tab value="event" leftSection={<IconCalendarEvent size={16} />}>
                    Event Bookings
                  </Tabs.Tab>
                  <Tabs.Tab value="service" leftSection={<IconTool size={16} />}>
                    Service Bookings
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
              
              {/* Content section for bookings */}
              <Box style={dashboardStyles.tableBox} mt="md">
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {activeTab === "restaurant" && (
                  <RestaurantBookingsTab 
                    data={restaurantBookings}
                    handleApproveBooking={handleApproveBooking}
                    handleRejectBookingModal={handleRejectBookingModal}
                    processingBookingId={processingBookingId}
                    getStatusBadge={getStatusBadge}
                  />
              )}

              {activeTab === "activity" && (
                <ActivityBookingsTab 
                  data={activityBookings}
                  processingBookingId={processingBookingId}
                  getStatusBadge={getStatusBadge}
                />
              )}

              {activeTab === "event" && (
                  <EventBookingsTab 
                    data={eventBookings}
                    processingBookingId={processingBookingId}
                    getStatusBadge={getStatusBadge}
                  />
              )}

              {activeTab === "service" && (
                <ServiceBookingsTab 
                  data={serviceBookings}
                  processingBookingId={processingBookingId}
                  getStatusBadge={getStatusBadge}
                />
              )}
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </div>
      
      {/* Modal for rejecting bookings */}
      <Modal
        opened={opened}
        onClose={close}
        title="Rejection Reason"
        centered
        styles={{
          root: {
            zIndex: 100,
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          content: {
            backgroundColor: '#1a2a41',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          header: {
            backgroundColor: '#1a2a41',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          title: {
            color: 'white',
            fontWeight: 600,
          },
          close: {
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }
        }}
      >
              <Textarea
          placeholder="Please provide a reason for rejection"
                value={rejectionReason}
          onChange={(event) => setRejectionReason(event.currentTarget.value)}
                minRows={3}
          required
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:focus': {
                borderColor: 'rgba(209, 174, 54, 0.5)',
              }
            }
          }}
              />
        <Group position="right" mt="md">
              <Button
            variant="filled" 
                  color="red" 
                  onClick={handleRejectBooking}
            loading={processingBookingId !== null}
            style={{
              backgroundColor: '#e53935',
              '&:hover': {
                backgroundColor: '#d32f2f',
              }
            }}
                >
                  Reject Booking
              </Button>
            </Group>
          </Modal>
      
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

export default OwnerDashboard;
