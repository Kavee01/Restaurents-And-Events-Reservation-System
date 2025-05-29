import { useState, useEffect, useRef } from "react";
import {
  Container,
  Title,
  Text,
  NumberInput,
  Textarea,
  Button,
  Group,
  Card,
  Stack,
  Grid,
  Alert,
  Badge,
  Select,
  Box,
  Paper,
  ActionIcon,
  rem,
  Menu,
  UnstyledButton,
  Divider,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { Link, useParams, useNavigate, useOutletContext } from "react-router-dom";
import { 
  IconAlertCircle, 
  IconCalendarEvent, 
  IconClock, 
  IconMapPin, 
  IconCurrencyDollar,
  IconUser,
  IconChevronDown,
  IconLogout,
  IconArrowLeft,
} from '@tabler/icons-react';
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useToast from "../../hooks/useToast";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";

function ServiceBookingForm() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({
    date: null,
    time: "",
    duration: 1,
    specialRequests: "",
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [busyTimeSlots, setBusyTimeSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const timeRef = useRef(null);

  const { sendRequest } = useFetch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { successToast, errorToast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.isOwner) {
        navigate("/owner/dashboard");
        return;
      }
    } else {
      navigate("/signin");
      return;
    }
    
    getServiceDetails();
  }, []);

  // Generate time slots from 9 AM to 5 PM
  useEffect(() => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push(`${formattedHour}:00`);
      if (hour < 17) {
        slots.push(`${formattedHour}:30`);
      }
    }
    setTimeSlots(slots);
  }, []);

  // Check for busy time slots when date changes
  useEffect(() => {
    if (formData.date) {
      checkBookedTimeSlots();
    }
  }, [formData.date]);

  const getServiceDetails = async () => {
    try {
      const serviceData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/services/${id}`,
        "GET"
      );
      
      setService(serviceData);
    } catch (err) {
      console.error(err);
      errorToast({
        title: "Error",
        message: "Failed to load service details. Please try again.",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const checkBookedTimeSlots = async () => {
    try {
      // Format date to YYYY-MM-DD
      const dateString = formData.date.toISOString().split('T')[0];
      
      // Get all bookings for this service on the selected date
      const bookings = await sendRequest(
        `${import.meta.env.VITE_API_URL}/servicebooking/service/${id}`,
        "GET"
      );
      
      // Filter bookings for the selected date
      const dateBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        return bookingDate === dateString && booking.status !== 'cancelled';
      });
      
      // Collect busy time slots
      const busySlots = [];
      dateBookings.forEach(booking => {
        const startTime = booking.time;
        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const duration = booking.duration;
        
        // Add all 30-minute slots covered by this booking
        for (let i = 0; i < duration * 2; i++) {
          const hour = Math.floor(startHour + (startMinute + i * 30) / 60);
          const minute = (startMinute + i * 30) % 60;
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          busySlots.push(timeSlot);
        }
      });
      
      setBusyTimeSlots(busySlots);
    } catch (err) {
      console.error("Error checking booked time slots:", err);
    }
  };

  const handleNumberChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date,
      time: "", // Reset time when date changes
    });
  };

  const handleTimeChange = (time) => {
    setFormData({
      ...formData,
      time,
    });
  };

  const calculateTotal = () => {
    if (!service) return 0;
    return service.price * formData.duration;
  };

  const isTimeSlotAvailable = (timeSlot) => {
    if (!formData.date || !timeSlot) return false;
    
    // Check if the time slot itself is busy
    if (busyTimeSlots.includes(timeSlot)) return false;
    
    // Check if there's enough time for the requested duration
    const [startHour, startMinute] = timeSlot.split(':').map(Number);
    const endHour = startHour + formData.duration;
    
    // Check if booking extends past business hours (5 PM)
    if (endHour > 17 || (endHour === 17 && startMinute > 0)) {
      return false;
    }
    
    // Check each 30-minute slot within the duration
    for (let i = 1; i < formData.duration * 2; i++) {
      const hour = Math.floor(startHour + (startMinute + i * 30) / 60);
      const minute = (startMinute + i * 30) % 60;
      const checkTimeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (busyTimeSlots.includes(checkTimeSlot)) {
        return false;
      }
    }
    
    return true;
  };

  const getAvailableTimeSlots = () => {
    return timeSlots.filter(slot => isTimeSlotAvailable(slot));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/signin");
      return;
    }
    
    if (!formData.date) {
      errorToast({
        title: "Error",
        message: "Please select a date.",
      });
      return;
    }
    
    if (!formData.time) {
      errorToast({
        title: "Error",
        message: "Please select a time slot.",
      });
      return;
    }
    
    if (formData.duration <= 0) {
      errorToast({
        title: "Error",
        message: "Please select a duration of at least 1 hour.",
      });
      return;
    }
    
    if (!isTimeSlotAvailable(formData.time)) {
      errorToast({
        title: "Error",
        message: "The selected time slot is not available.",
      });
      return;
    }
    
    setLoading(true);

    try {
      const bookingData = {
        service: id,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        specialRequests: formData.specialRequests,
      };

      await sendRequest(
        `${import.meta.env.VITE_API_URL}/servicebooking`,
        "POST",
        bookingData
      );
      
      successToast({
        title: "Success",
        message: "Service booked successfully.",
      });
      
      navigate("/bookings");
    } catch (err) {
      console.error("Error details:", err);
      errorToast({
        title: "Error",
        message: `Failed to book service: ${err.message}`,
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

  const timePickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => timeRef.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  if (!service) {
    return (
      <div style={sharedStyles.wrapper}>
        <div style={sharedStyles.starsBackground}></div>
        <Container size="md">
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error" 
            color="red"
            style={{
              backgroundColor: 'rgba(20, 30, 50, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            Service not found or has been removed.
          </Alert>
          <Button 
            component={Link} 
            to="/services" 
            mt="md"
            style={{
              backgroundColor: '#d1ae36',
              color: '#1a2a41',
            }}
          >
            Back to Services
          </Button>
        </Container>
      </div>
    );
  }

  const availableTimeSlots = getAvailableTimeSlots();

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
                  to="/account/bookings"
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
        <Container size="md">
          <Box mb="xl">
            <Button 
              component={Link} 
              to={`/services/${id}`} 
              variant="subtle" 
              color="white" 
              leftSection={<IconArrowLeft size={14} />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Service
            </Button>
          </Box>
          
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
              <Title order={2} mb="xl" style={{ color: '#fff' }}>Book Service</Title>

              <Grid>
                <Grid.Col md={7}>
                  <Card 
                    withBorder 
                    shadow="sm" 
                    p="lg" 
                    radius="md"
                    style={{ 
                      background: 'rgba(30, 40, 60, 0.5)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)' 
                    }}
                  >
                    <Stack spacing="xs">
                      <Title order={3} style={{ color: '#d1ae36' }}>{service.title}</Title>
                      
                      <Group spacing="xs">
                        <IconCurrencyDollar size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }} weight={500}>
                          ${service.price} per hour
                        </Text>
                      </Group>
                      
                      <Badge 
                        color="blue"
                        variant="filled"
                        size="lg"
                        mt="xs"
                      >
                        Available daily from 9 AM to 5 PM
                      </Badge>
                      
                      {service.description && (
                        <Text mt="md" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          {service.description}
                        </Text>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>

                <Grid.Col md={5}>
                  <Card 
                    withBorder 
                    shadow="sm" 
                    p="lg" 
                    radius="md"
                    style={{ 
                      background: 'rgba(30, 40, 60, 0.5)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)' 
                    }}
                  >
                    <form onSubmit={handleSubmit}>
                      <Stack spacing="md">
                        <DateInput
                          label="Select Date"
                          placeholder="Pick a date"
                          value={formData.date}
                          onChange={handleDateChange}
                          minDate={new Date()}
                          required
                          styles={{
                            label: { fontWeight: 500, color: 'white' },
                            input: {
                              backgroundColor: 'rgba(20, 30, 50, 0.5)',
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              '&:focus': {
                                borderColor: '#d1ae36',
                              },
                            },
                          }}
                        />

                        <Select
                          label="Select Time"
                          placeholder="Choose a time slot"
                          data={availableTimeSlots.map(slot => ({ value: slot, label: slot }))}
                          value={formData.time}
                          onChange={handleTimeChange}
                          searchable
                          required
                          disabled={!formData.date || availableTimeSlots.length === 0}
                          styles={{
                            label: { fontWeight: 500, color: 'white' },
                            input: {
                              backgroundColor: 'rgba(20, 30, 50, 0.5)',
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              '&:focus': {
                                borderColor: '#d1ae36',
                              },
                            },
                            dropdown: {
                              backgroundColor: '#1a2a41',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            },
                            item: {
                              color: 'white',
                              '&[data-selected]': {
                                backgroundColor: '#d1ae36',
                                color: '#1a2a41',
                              },
                              '&[data-hovered]': {
                                backgroundColor: 'rgba(209, 174, 54, 0.2)',
                              },
                            },
                          }}
                        />

                        <NumberInput
                          label="Duration (hours)"
                          value={formData.duration}
                          onChange={(value) => handleNumberChange("duration", value)}
                          min={1}
                          max={4}
                          required
                          styles={{
                            label: { fontWeight: 500, color: 'white' },
                            input: {
                              backgroundColor: 'rgba(20, 30, 50, 0.5)',
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              '&:focus': {
                                borderColor: '#d1ae36',
                              },
                            },
                          }}
                        />

                        <Textarea
                          label="Special Requests (Optional)"
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          placeholder="Any special requests or notes"
                          minRows={3}
                          styles={{
                            label: { fontWeight: 500, color: 'white' },
                            input: {
                              backgroundColor: 'rgba(20, 30, 50, 0.5)',
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              '&:focus': {
                                borderColor: '#d1ae36',
                              },
                            },
                          }}
                        />

                        {formData.date && formData.time && (
                          <Card 
                            withBorder 
                            p="md" 
                            radius="md" 
                            style={{
                              backgroundColor: 'rgba(20, 30, 50, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <Stack spacing="xs">
                              <Group position="apart">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} weight={500}>Date:</Text>
                                <Text style={{ color: 'white' }}>
                                  {formData.date.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </Text>
                              </Group>
                              <Group position="apart">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} weight={500}>Time:</Text>
                                <Text style={{ color: 'white' }}>{formData.time}</Text>
                              </Group>
                              <Group position="apart">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} weight={500}>Duration:</Text>
                                <Text style={{ color: 'white' }}>{formData.duration} hour{formData.duration > 1 ? 's' : ''}</Text>
                              </Group>
                              <Group position="apart">
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} weight={500}>Price per hour:</Text>
                                <Text style={{ color: 'white' }}>${service.price}</Text>
                              </Group>
                              <Divider my="xs" color="rgba(255, 255, 255, 0.1)" />
                              <Group position="apart">
                                <Text style={{ color: '#d1ae36' }} weight={700} size="lg">Total:</Text>
                                <Text style={{ color: '#d1ae36' }} weight={700} size="lg">${calculateTotal()}</Text>
                              </Group>
                            </Stack>
                          </Card>
                        )}

                        <Button 
                          type="submit" 
                          loading={loading}
                          disabled={!formData.date || !formData.time || availableTimeSlots.length === 0}
                          fullWidth
                          style={{
                            backgroundColor: '#d1ae36',
                            color: '#1a2a41',
                            border: 'none',
                            marginTop: '1rem',
                          }}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(209, 174, 54, 0.9)'
                            }
                          }}
                        >
                          Book Now
                        </Button>
                      </Stack>
                    </form>
                  </Card>
                </Grid.Col>
              </Grid>
            </div>
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

export default ServiceBookingForm; 