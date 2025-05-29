import { useState, useEffect, useRef } from "react";
import {
  Container,
  Title,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Group,
  Select,
  Box,
  FileInput,
  Grid,
  Stack,
  Paper,
  Divider,
  Text,
  Menu,
  UnstyledButton,
  rem,
  ActionIcon,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { 
  IconClock, 
  IconUpload, 
  IconArrowLeft,
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
  IconBuildingCommunity,
  IconUser,
  IconSwimming,
  IconCategory 
} from '@tabler/icons-react';
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useToast from "../../hooks/useToast";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";

function EventForm() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: null,
    time: "12:00",
    venue: "",
    ticketPrice: 0,
    maxCapacity: 1,
    eventType: "",
    imageUrl: "",
    restaurant: "",
    phoneNumber: "",
  });
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const timeInputRef = useRef(null);
  const [timeError, setTimeError] = useState("");

  const { sendRequest } = useFetch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const restaurantIdParam = searchParams.get("restaurantId");
  const { successToast, errorToast } = useToast();
  
  const isEditMode = !!id;

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
    
    if (isEditMode) {
      getEventDetails();
    } else {
      setInitialLoading(false);
      if (restaurantIdParam) {
        setFormData(prev => ({ ...prev, restaurant: restaurantIdParam }));
      }
    }
  }, []);

  const getAllRestaurants = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/owner`,
        "GET"
      );
      
      setRestaurants(resData);
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Failed to load restaurants. Please try again.",
      });
    }
  };

  const getEventDetails = async () => {
    try {
      const event = await sendRequest(
        `${import.meta.env.VITE_API_URL}/events/${id}`,
        "GET"
      );
      
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? new Date(event.date) : null,
        time: event.time || "12:00",
        venue: event.venue || "",
        ticketPrice: event.ticketPrice || 0,
        maxCapacity: event.maxCapacity || 1,
        eventType: event.eventType || "",
        imageUrl: event.imageUrl || "",
        restaurant: event.restaurant._id || "",
        phoneNumber: event.phoneNumber || "",
      });
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Failed to load event details. Please try again.",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date,
    });
  };

  const handleTimeChange = (value) => {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(value)) {
      setTimeError("Please enter time in HH:MM format (e.g., 14:30)");
      return;
    }

    // Validate hours and minutes
    const [hours, minutes] = value.split(':').map(Number);
    if (hours > 23 || minutes > 59) {
      setTimeError("Invalid time. Hours must be 0-23 and minutes must be 0-59");
      return;
    }

    setTimeError("");
    setFormData({
      ...formData,
      time: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      // Handle image upload if a new image is selected
      if (image) {
        // Here you would implement the image upload logic
        // For now, we'll just use a placeholder URL
        imageUrl = "https://example.com/placeholder.jpg";
      }

      const eventData = {
        ...formData,
        imageUrl,
      };

      console.log("Sending event data:", eventData);

      if (isEditMode) {
        await sendRequest(
          `${import.meta.env.VITE_API_URL}/events/${id}`,
          "PUT",
          eventData
        );
        successToast({
          title: "Success",
          message: "Event updated successfully.",
        });
      } else {
        const result = await sendRequest(
          `${import.meta.env.VITE_API_URL}/events`,
          "POST",
          eventData
        );
        console.log("Response:", result);
        successToast({
          title: "Success",
          message: "Event created successfully.",
        });
      }

      navigate("/owner/events");
    } catch (err) {
      console.error("Error details:", err);
      errorToast({
        title: "Error",
        message: `Failed to ${isEditMode ? 'update' : 'create'} event: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { value: "party", label: "Party" },
    { value: "concert", label: "Concert" },
    { value: "exhibition", label: "Exhibition" },
    { value: "workshop", label: "Workshop" },
    { value: "ceremony", label: "Ceremony" },
    { value: "festival", label: "Festival" },
    { value: "tasting", label: "Food/Wine Tasting" },
    { value: "other", label: "Other" },
  ];

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

  if (initialLoading) {
    return <LoadingSpinner />;
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
        <Container size="md">
          <Box mb="xl">
            <Button 
              component={Link} 
              to="/owner/events" 
              variant="subtle" 
              color="white" 
              leftSection={<IconArrowLeft size={14} />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Events
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
              <Title order={2} mb="md" style={{ color: '#fff' }}>
                {isEditMode ? "Edit Event" : "Create New Event"}
              </Title>
              
              <Divider 
                my="lg" 
                label={<Text size="sm" fw={500} c="white">Event Details</Text>} 
                labelPosition="center" 
                color="gray.3" 
              />

              <form onSubmit={handleSubmit}>
                <Stack spacing="md">
                  <Select
                    label="Restaurant"
                    placeholder="Select a restaurant"
                    data={restaurants.map((restaurant) => ({
                      value: restaurant._id,
                      label: restaurant.name,
                    }))}
                    value={formData.restaurant}
                    onChange={(value) => handleSelectChange("restaurant", value)}
                    required
                    searchable
                    styles={{
                      label: { fontWeight: 500, color: 'white' },
                      input: {
                        '&:focus': {
                          borderColor: '#d1ae36',
                        },
                      },
                    }}
                  />

                  <TextInput
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Event title"
                    required
                    styles={{
                      label: { fontWeight: 500, color: 'white' },
                      input: {
                        '&:focus': {
                          borderColor: '#d1ae36',
                        },
                      },
                    }}
                  />

                  <TextInput
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter contact phone number"
                    required
                    styles={{
                      label: { fontWeight: 500, color: 'white' },
                      input: {
                        '&:focus': {
                          borderColor: '#d1ae36',
                        },
                      },
                    }}
                  />

                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the event"
                    minRows={3}
                    styles={{
                      label: { fontWeight: 500, color: 'white' },
                      input: {
                        '&:focus': {
                          borderColor: '#d1ae36',
                        },
                      },
                    }}
                  />

                  <Select
                    label="Event Type"
                    placeholder="Select event type"
                    data={eventTypes}
                    value={formData.eventType}
                    onChange={(value) => handleSelectChange("eventType", value)}
                    required
                    searchable
                    styles={{
                      label: { fontWeight: 500, color: 'white' },
                      input: {
                        '&:focus': {
                          borderColor: '#d1ae36',
                        },
                      },
                    }}
                  />
                  
                  <Divider 
                    my="md" 
                    label={<Text size="sm" fw={500} c="white">Date & Location</Text>} 
                    labelPosition="center" 
                    color="gray.3" 
                  />

                  <Grid>
                    <Grid.Col span={6}>
                      <DateInput
                        label="Event Date"
                        placeholder="Pick event date"
                        value={formData.date}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        required
                        clearable
                        valueFormat="DD MMM YYYY"
                        icon={<IconCalendarEvent size={16} />}
                        styles={{
                          label: { fontWeight: 500, color: 'white' },
                          input: {
                            '&:focus': {
                              borderColor: '#d1ae36',
                            },
                          },
                        }}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TimeInput
                        label="Time"
                        placeholder="Enter time (HH:MM)"
                        value={formData.time}
                        onChange={(event) => handleTimeChange(event.currentTarget.value)}
                        ref={timeInputRef}
                        rightSection={
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => timeInputRef.current?.showPicker()}
                          >
                            <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                          </ActionIcon>
                        }
                        error={timeError}
                        styles={{
                          label: { fontWeight: 500, color: 'white' },
                          input: {
                            '&:focus': {
                              borderColor: '#d1ae36',
                            },
                          },
                        }}
                      />
                    </Grid.Col>
                  </Grid>

                  <TextInput
                    label="Venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="Event venue or location"
                    required
                    styles={{
                      label: { fontWeight: 500, color: 'white' },
                      input: {
                        '&:focus': {
                          borderColor: '#d1ae36',
                        },
                      },
                    }}
                  />
                  
                  <Divider 
                    my="md" 
                    label={<Text size="sm" fw={500} c="white">Capacity & Pricing</Text>} 
                    labelPosition="center" 
                    color="gray.3" 
                  />

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        label="Maximum Capacity"
                        value={formData.maxCapacity}
                        onChange={(value) => handleNumberChange("maxCapacity", value)}
                        min={1}
                        placeholder="Maximum number of guests"
                        required
                        styles={{
                          label: { fontWeight: 500, color: 'white' },
                          input: {
                            '&:focus': {
                              borderColor: '#d1ae36',
                            },
                          },
                        }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        label="Ticket Price"
                        value={formData.ticketPrice}
                        onChange={(value) => handleNumberChange("ticketPrice", value)}
                        min={0}
                        precision={2}
                        prefix="$"
                        placeholder="Ticket price"
                        styles={{
                          label: { fontWeight: 500, color: 'white' },
                          input: {
                            '&:focus': {
                              borderColor: '#d1ae36',
                            },
                          },
                        }}
                      />
                    </Grid.Col>
                  </Grid>
                  
                 

                  <Group position="right" mt="xl">
                    <Button
                      variant="outline"
                      component={Link}
                      to="/owner/events"
                      color="gray"
                      styles={{
                        root: {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.5)'
                          }
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      loading={loading}
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
                      {isEditMode ? "Update Event" : "Create Event"}
                    </Button>
                  </Group>
                </Stack>
              </form>
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

export default EventForm; 