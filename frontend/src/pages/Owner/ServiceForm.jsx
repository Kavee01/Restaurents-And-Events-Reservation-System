import { useState, useEffect } from "react";
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
  Stack,
  Paper,
  Divider,
  Text,
  Menu,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useToast from "../../hooks/useToast";
import { 
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
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";

function ServiceForm() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceType: "",
    availability: "",
    price: 0,
    providerInfo: "",
    imageUrl: "",
    phoneNumber: "",
  });
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

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
      getServiceDetails();
    } else {
      setInitialLoading(false);
    }
  }, []);

  const getServiceDetails = async () => {
    try {
      const service = await sendRequest(
        `${import.meta.env.VITE_API_URL}/services/${id}`,
        "GET"
      );
      
      setFormData({
        title: service.title || "",
        description: service.description || "",
        serviceType: service.serviceType || "",
        availability: service.availability || "",
        price: service.price || 0,
        providerInfo: service.providerInfo || "",
        imageUrl: service.imageUrl || "",
        phoneNumber: service.phoneNumber || "",
      });
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Failed to load service details. Please try again.",
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

      const serviceData = {
        ...formData,
        imageUrl,
      };

      if (isEditMode) {
        await sendRequest(
          `${import.meta.env.VITE_API_URL}/services/${id}`,
          "PUT",
          serviceData
        );
        successToast({
          title: "Success",
          message: "Service updated successfully.",
        });
      } else {
        await sendRequest(
          `${import.meta.env.VITE_API_URL}/services`,
          "POST",
          serviceData
        );
        successToast({
          title: "Success",
          message: "Service created successfully.",
        });
      }

      navigate("/owner/services");
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: `Failed to ${isEditMode ? 'update' : 'create'} service. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = [
    { value: "transport", label: "Transportation" },
    { value: "guide", label: "Guided Tour" },
    { value: "equipment", label: "Equipment Rental" },
    { value: "catering", label: "Catering" },
    { value: "photography", label: "Photography" },
    { value: "entertainment", label: "Entertainment" },
    { value: "decoration", label: "Decoration" },
    { value: "other", label: "Other" },
  ];

  const availabilityOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekdays", label: "Weekdays Only" },
    { value: "weekends", label: "Weekends Only" },
    { value: "custom", label: "Custom Schedule" },
    { value: "on-demand", label: "On Demand" },
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
              to="/owner/services" 
              variant="subtle" 
              color="white" 
              leftSection={<IconArrowLeft size={14} />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Services
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
                {isEditMode ? "Edit Service" : "Create New Service"}
              </Title>
              
              <Divider 
                my="lg" 
                label={<Text size="sm" fw={500} c="white">Service Details</Text>} 
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
                    placeholder="Service title"
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
                    placeholder="Describe the service"
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
                    label="Service Type"
                    placeholder="Select service type"
                    data={serviceTypes}
                    value={formData.serviceType}
                    onChange={(value) => handleSelectChange("serviceType", value)}
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
                    label={<Text size="sm" fw={500} c="white">Availability & Pricing</Text>} 
                    labelPosition="center" 
                    color="gray.3" 
                  />

                  <Select
                    label="Availability"
                    placeholder="Select availability"
                    data={availabilityOptions}
                    value={formData.availability}
                    onChange={(value) => handleSelectChange("availability", value)}
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

                  <NumberInput
                    label="Price"
                    value={formData.price}
                    onChange={(value) => handleNumberChange("price", value)}
                    min={0}
                    precision={2}
                    prefix="$"
                    placeholder="Service price"
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
                    label={<Text size="sm" fw={500} c="white">Additional Information</Text>} 
                    labelPosition="center" 
                    color="gray.3" 
                  />

                  <Textarea
                    label="Provider Information"
                    name="providerInfo"
                    value={formData.providerInfo}
                    onChange={handleInputChange}
                    placeholder="Information about the service provider"
                    minRows={2}
                    styles={{
                      label: { fontWeight: 500, color: 'white' },
                      input: {
                        '&:focus': {
                          borderColor: '#d1ae36',
                        },
                      },
                    }}
                  />

                  <Group position="right" mt="xl">
                    <Button
                      variant="outline"
                      component={Link}
                      to="/owner/services"
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
                      {isEditMode ? "Update Service" : "Create Service"}
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

export default ServiceForm; 