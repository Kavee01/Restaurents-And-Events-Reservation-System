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
  UnstyledButton,
  Menu,
  rem,
  ActionIcon,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useToast from "../../hooks/useToast";
import { 
  IconCalendarEvent, 
  IconUpload, 
  IconArrowLeft,
  IconChevronDown,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconStar,
  IconMapPin,
  IconToolsKitchen2,
  IconBuildingCommunity,
  IconUser,
  IconSwimming,
  IconActivity,
  IconX,
  IconClock,
} from "@tabler/icons-react";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";

function ActivityForm() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activityType: "",
    date: [],
    time: "09:00",
    capacity: 1,
    price: 0,
    location: "",
    imageUrl: "",
    phoneNumber: "",
  });
  const [image, setImage] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [timePickerOpened, setTimePickerOpened] = useState(false);
  const timeInputRef = useRef(null);
  const [timeError, setTimeError] = useState("");

  const { sendRequest } = useFetch();
  const navigate = useNavigate();
  const { id } = useParams();
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
    
    if (isEditMode) {
      getActivityDetails();
    } else {
      setInitialLoading(false);
    }
  }, []);

  const getActivityDetails = async () => {
    try {
      const activity = await sendRequest(
        `${import.meta.env.VITE_API_URL}/activities/${id}`,
        "GET"
      );
      
      setFormData({
        title: activity.title || "",
        description: activity.description || "",
        activityType: activity.activityType || "",
        capacity: activity.capacity || 1,
        price: activity.price || 0,
        location: activity.location || "",
        imageUrl: activity.imageUrl || "",
        time: activity.time || "09:00",
        phoneNumber: activity.phoneNumber || "",
      });

      if (activity.date && activity.date.length > 0) {
        setSelectedDates(activity.date.map(date => new Date(date)));
      }
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Failed to load activity details. Please try again.",
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
    if (!date) return;
    
    // If a date already exists in the array, remove it (toggle)
    const dateExists = selectedDates.some(
      existingDate => existingDate.toDateString() === date.toDateString()
    );
    
    let updatedDates;
    if (dateExists) {
      updatedDates = selectedDates.filter(
        existingDate => existingDate.toDateString() !== date.toDateString()
      );
    } else {
      updatedDates = [...selectedDates, date];
    }
    
    setSelectedDates(updatedDates);
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

      const activityData = {
        ...formData,
        imageUrl,
        date: selectedDates,
      };

      if (isEditMode) {
        await sendRequest(
          `${import.meta.env.VITE_API_URL}/activities/${id}`,
          "PUT",
          activityData
        );
        successToast({
          title: "Success",
          message: "Activity updated successfully.",
        });
      } else {
        const result = await sendRequest(
          `${import.meta.env.VITE_API_URL}/activities`,
          "POST",
          activityData
        );
        successToast({
          title: "Success",
          message: "Activity created successfully.",
        });
      }

      navigate("/owner/activities");
    } catch (err) {
      console.error("Error details:", err);
      errorToast({
        title: "Error",
        message: `Failed to ${isEditMode ? 'update' : 'create'} activity: ${err.message}`,
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

  const activityTypes = [
    { value: "hiking", label: "Hiking" },
    { value: "boating", label: "Boat Riding" },
    { value: "whale-watching", label: "Whale Watching" },
    { value: "fishing", label: "Fishing" },
    { value: "diving", label: "Diving" },
    { value: "safari", label: "Safari" },
    { value: "tour", label: "Guided Tour" },
    { value: "workshop", label: "Workshop" },
    { value: "other", label: "Other" },
  ];

  const timePickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => timeInputRef.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );

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
              to="/owner/activities" 
              variant="subtle" 
              color="white" 
              leftSection={<IconArrowLeft size={14} />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Activities
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
                {isEditMode ? "Edit Activity" : "Create New Activity"}
              </Title>
              
              <Divider 
                my="lg" 
                label={<Text size="sm" fw={500} c="white">Activity Details</Text>} 
                labelPosition="center" 
                color="gray.3" 
              />

              <form onSubmit={handleSubmit}>
                <Stack spacing="md">
                  <TextInput
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Activity title"
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
                    placeholder="Describe the activity"
                    minRows={4}
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
                    label="Activity Type"
                    placeholder="Select activity type"
                    data={activityTypes}
                    value={formData.activityType}
                    onChange={(value) => handleSelectChange("activityType", value)}
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
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Activity location"
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
                        label="Capacity"
                        value={formData.capacity}
                        onChange={(value) => handleNumberChange("capacity", value)}
                        min={1}
                        placeholder="Maximum number of participants"
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
                        label="Price"
                        value={formData.price}
                        onChange={(value) => handleNumberChange("price", value)}
                        min={0}
                        precision={2}
                        prefix="$"
                        placeholder="Activity price"
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
                  
                  <Divider 
                    my="md" 
                    label={<Text size="sm" fw={500} c="white">Available Dates</Text>} 
                    labelPosition="center" 
                    color="gray.3" 
                  />

                  <Grid>
                    <Grid.Col span={6}>
                      <DateInput
                        label="Select Date"
                        placeholder="Pick a date"
                        value={null}
                        onChange={handleDateChange}
                        minDate={new Date()}
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
                        ref={timeInputRef}
                        value={formData.time}
                        onChange={(event) => handleTimeChange(event.currentTarget.value)}
                        rightSection={timePickerControl}
                        required
                        placeholder="HH:mm"
                        error={timeError}
                        styles={{
                          label: {
                            fontWeight: 500,
                            color: 'white',
                            marginBottom: '0.5rem'
                          },
                          input: {
                            backgroundColor: 'rgb(255, 255, 255)',
                            color: 'black',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            '&:focus': {
                              borderColor: '#d1ae36',
                            },
                          },
                          error: {
                            color: '#ff4d4f',
                            marginTop: 4,
                            fontSize: 13,
                          },
                        }}
                      />
                    </Grid.Col>
                  </Grid>
                  
                  {selectedDates.length > 0 && (
                    <Box mt="md">
                      <Text size="sm" weight={500} mb="xs">Selected Dates:</Text>
                      <Group spacing="xs">
                        {selectedDates.map((date, index) => (
                          <Button
                            key={index}
                            variant="light"
                            size="xs"
                            rightIcon={<IconX size={14} />}
                            onClick={() => {
                              const updatedDates = selectedDates.filter((_, i) => i !== index);
                              setSelectedDates(updatedDates);
                            }}
                          >
                            {date.toLocaleDateString()} at {formData.time}
                          </Button>
                        ))}
                      </Group>
                    </Box>
                  )}
                  
                  <Group position="right" mt="xl">
                    <Button
                      variant="outline"
                      component={Link}
                      to="/owner/activities"
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
                      {isEditMode ? "Update Activity" : "Create Activity"}
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

export default ActivityForm; 