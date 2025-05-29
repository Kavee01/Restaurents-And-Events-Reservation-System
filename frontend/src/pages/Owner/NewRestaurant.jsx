import {
  ActionIcon,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Box,
  Title,
  rem,
  Group,
  Button,
  MultiSelect,
  Text,
  Divider,
  Container,
  Paper,
  Menu,
  UnstyledButton,
  FileInput,
  Image,
  SimpleGrid,
  Radio,
  Card,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { 
  IconClock,
  IconArrowLeft,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconStar,
  IconChevronDown,
  IconMapPin,
  IconActivity,
  IconToolsKitchen2,
  IconBuildingCommunity,
  IconUser,
  IconSwimming,
  IconCalendarEvent,
  IconFileText,
  IconX,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import Modal from "../../components/Parts/Modal";
import GoogleMapPicker from "../../components/Maps/GoogleMapPicker";
import useFetch from "../../hooks/useFetch";
import useToast from "../../hooks/useToast";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";

function NewRestaurant() {
  // manage the state of whether a component (such as a modal) is open or closed.
  const [opened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState(null);
  const [mapAddress, setMapAddress] = useState("");
  const [images, setImages] = useState([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [menuPdfFile, setMenuPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const fileInputRef = useRef(null);

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

    const fetchRestaurantData = async () => {
      try {
        // No longer redirecting if user already has a restaurant
        // Just set loading to false
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchRestaurantData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm({
    initialValues: {
      name: '',
      category: '',
      location: '',
      timeOpen: '',
      timeClose: '',
      address: '',
      phone: '',
      websiteUrl: '',
      maxPax: '',
      description: '',
      daysClose: [],
    },
    validate: {
      name: (value) => !value ? 'Restaurant name is required' : null,
      category: (value) => !value ? 'Please choose a category which best represents your restaurant cuisine' : null,
      location: (value) => !value ? 'Please choose an area which best represents your restaurant\'s location' : null,
      address: (value) => !value ? 'Please provide your restaurant address' : null,
      maxPax: (value) => !value ? 'Please enter a number for the max no. of people' : null,
      timeOpen: (value) => !value ? 'Please enter opening time' : null,
      timeClose: (value, values) =>
        !value ? 'Please enter closing time' :
        value < values.timeOpen ? 'Closing time must be later than opening time' : null,
      description: (value) =>
        value?.length > 500 ? 'Please enter less than 500 characters' : null,
    },
  });

  const handleLocationSelect = (position, address) => {
    setCoordinates(position);
    setMapAddress(address);
    form.setFieldValue("address", address);
  };

  const handleImageChange = (files) => {
    if (files && files.length > 0) {
      const newImages = [...images];
      const newUrls = [...imageUrls];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes

      Array.from(files).forEach((file) => {
        if (newImages.length < 5) {
          if (!file.type.startsWith('image/')) {
            errorToast({
              title: "Invalid File Type",
              message: `${file.name} is not an image file`
            });
            return;
          }
          
          if (file.size > maxSize) {
            errorToast({
              title: "File Too Large",
              message: `${file.name} exceeds 5MB limit`
            });
            return;
          }

          // Create a new File object with the correct field name
          const renamedFile = new File([file], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          });
          
          newImages.push(renamedFile);
          newUrls.push(URL.createObjectURL(file));
        }
      });

      setImages(newImages);
      setImageUrls(newUrls);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    
    if (previewImageIndex === index) {
      setPreviewImageIndex(0);
    } else if (previewImageIndex > index) {
      setPreviewImageIndex(previewImageIndex - 1);
    }

    setImages(newImages);
    setImageUrls(newUrls);
  };

  const handlePdfUpload = (file) => {
    if (!file) {
      setMenuPdfFile(null);
      setPdfError("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setPdfError("PDF file size must be less than 5MB");
      setMenuPdfFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setPdfError("Please upload a PDF file");
      setMenuPdfFile(null);
      return;
    }

    setPdfError("");
    setMenuPdfFile(file);
  };

  const handleSubmit = async () => {
    try {
      if (!form.isValid()) {
        form.validate();
        return;
      }

      if (!coordinates) {
        errorToast({
          title: "Map Location Required",
          message: "Please select a location on the map for your restaurant",
        });
        return;
      }

      if (images.length === 0) {
        errorToast({
          title: "Images Required",
          message: "Please upload at least one image of your restaurant",
        });
        return;
      }

      const formData = new FormData();
      
      // Convert time format from HH:MM to HHMM
      const convertTimeFormat = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.replace(':', '');
      };

      // Add form fields
      Object.keys(form.values).forEach(key => {
        if (key === 'daysClose' && form.values[key]) {
          formData.append(key, JSON.stringify(form.values[key]));
        } else if (key === 'timeOpen' || key === 'timeClose') {
          formData.append(key, convertTimeFormat(form.values[key]));
        } else {
          formData.append(key, form.values[key]);
        }
      });

      // Add coordinates
      formData.append('coordinates', JSON.stringify(coordinates));
      
      // Add images
      images.forEach(image => {
        formData.append('images', image);
      });
      
      // Add preview image index
      formData.append('previewImageIndex', previewImageIndex);

      // Add menu PDF if exists
      if (menuPdfFile) {
        formData.append('menuPdf', menuPdfFile);
      }

      const response = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/create`,
        "POST",
        formData
      );

      if (response) {
        successToast({
          title: "Success",
          message: "Restaurant created successfully",
        });
        navigate("/owner/restaurants");
      }
    } catch (err) {
      console.error("Error details:", err);
      errorToast({
        title: "Error",
        message: `Failed to create restaurant: ${err.message}`,
      });
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

  const refOpen = useRef(null);
  const refClose = useRef(null);

  const pickerControlOpen = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => refOpen.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );

  const pickerControlClose = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => refClose.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );

  const modalContent = (form) => {
    const restDetails = {
      // add user info in req body
      Name: form.values.name,
      Category: form.values.category,
      Address: form.values.address,
      Location: form.values.location,
      OpeningHours:
        form.values.timeClose && form.values.timeOpen
          ? `${form.values.timeOpen} - ${form.values.timeClose}`
          : "No opening hours specified",
      DaysClosed: Array.isArray(form.values.daysClose) && form.values.daysClose.length > 0
        ? form.values.daysClose
        : "No rest days specified",
      Phone: form.values.phone ? form.values.phone : "No phone number provided",
      MaximumPax: form.values.maxPax,
    };

    return (
      <ul>
        {Object.entries(restDetails).map(([key, value]) => (
          <li key={key}>
            {key === "DaysClosed"
              ? `Days Closed: ${Array.isArray(value) ? value.join(", ") : value}`
              : key === "MaximumPax"
              ? `Maximum Pax: ${value}`
              : key === "OpeningHours"
              ? `Opening Hours: ${value}`
              : `${key}: ${value}`}
          </li>
        ))}
      </ul>
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
          )}
        </div>
      </header>
      
      <div style={sharedStyles.contentContainer}>
        <Container size="md">
          <Box mb="xl">
            <Button 
              component={Link} 
              to="/owner/restaurants" 
              variant="subtle" 
              color="white" 
              leftSection={<IconArrowLeft size={14} />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Restaurants
            </Button>
          </Box>
          
      {loading ? (
        <LoadingSpinner />
      ) : (
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
                <Title order={2} mb="md" style={{ color: '#fff' }}>
            Create Your Restaurant
          </Title>
                
                <Divider 
                  my="lg" 
                  label={<Text size="sm" fw={500} c="white">Restaurant Details</Text>} 
                  labelPosition="center" 
                  color="gray.3" 
                />

            <form
              onSubmit={form.onSubmit((values) => {
                if (form.isValid()) {
                  toggle();
                }
              })}
              encType="multipart/form-data"
            >
              <TextInput
                label="Name"
                withAsterisk
                placeholder="GA Cafe"
                {...form.getInputProps("name")}
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
                label="Category"
                withAsterisk
                placeholder="Pick one"
                data={["Asian", "Chinese", "Japanese", "Western"]}
                mt="md"
                {...form.getInputProps("category")}
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
                label="Location"
                withAsterisk
                placeholder="Pick one"
                    data={[
                      "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
                      "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
                      "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
                      "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
                      "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
                    ]}                mt="md"
                {...form.getInputProps("location")}
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
                label="Address"
                withAsterisk
                placeholder="79 Anson Rd, Level 20, Singapore 079906"
                mt="md"
                {...form.getInputProps("address")}
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
                      label={<Text size="sm" fw={500} c="white">Contact & Capacity</Text>} 
                      labelPosition="center" 
                      color="gray.3" 
                    />
                    
              <TextInput
                label="Phone"
                type="number"
                placeholder="01234567 (Exclude +65 country code)"
                mt="md"
                {...form.getInputProps("phone")}
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
                label="Website URL"
                placeholder="https://gacafe.com"
                mt="md"
                {...form.getInputProps("websiteUrl")}
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
                label="Maximum Pax"
                placeholder="10"
                min={1}
                required={true}
                mt="md"
                {...form.getInputProps("maxPax")}
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
                      label={<Text size="sm" fw={500} c="white">Operating Hours</Text>} 
                      labelPosition="center" 
                      color="gray.3" 
                    />
                    
              <TimeInput
                label="Opening Time"
                withAsterisk
                mt="md"
                ref={refOpen}
                required={true}
                rightSection={pickerControlOpen}
                {...form.getInputProps("timeOpen")}
                      styles={{
                        label: { fontWeight: 500, color: 'white' },
                        input: {
                          '&:focus': {
                            borderColor: '#d1ae36',
                          },
                        },
                      }}
              />
              <TimeInput
                label="Closing Time"
                withAsterisk
                mt="md"
                ref={refClose}
                required={true}
                rightSection={pickerControlClose}
                {...form.getInputProps("timeClose")}
                      styles={{
                        label: { fontWeight: 500, color: 'white' },
                        input: {
                          '&:focus': {
                            borderColor: '#d1ae36',
                          },
                        },
                      }}
              />
              <MultiSelect
                label="Days Closed"
                placeholder="Pick one or more"
                data={[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ]}
                clearable
                searchable
                mt="md"
                {...form.getInputProps("daysClose")}
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
                      label={<Text size="sm" fw={500} c="white">Restaurant Images</Text>} 
                      labelPosition="center" 
                      color="gray.3" 
                    />
                    
              <Box mb="lg">
                <Text size="sm" weight={500} style={{ color: 'white', marginBottom: '0.5rem' }}>
                  Upload Images (Max 5)
                </Text>
                <FileInput
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  placeholder={images.length >= 5 ? "Maximum images reached" : "Choose images"}
                  disabled={images.length >= 5}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#d1ae36',
                      },
                    },
                  }}
                />
                
                {imageUrls.length > 0 && (
                  <>
                    <Text size="sm" weight={500} style={{ color: 'white', margin: '1rem 0' }}>
                      Select Preview Image
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                      {imageUrls.map((url, index) => (
                        <Card 
                          key={index} 
                          p="xs"
                          style={{ 
                            backgroundColor: 'rgba(20, 30, 50, 0.5)',
                            border: index === previewImageIndex ? '2px solid #d1ae36' : '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <Image
                            src={url}
                            alt={`Restaurant image ${index + 1}`}
                            height={150}
                            fit="cover"
                          />
                          <Group position="apart" mt="xs">
                            <Radio
                              checked={index === previewImageIndex}
                              onChange={() => setPreviewImageIndex(index)}
                              label="Preview"
                              styles={{
                                radio: { cursor: 'pointer' },
                                label: { color: 'white', cursor: 'pointer' }
                              }}
                            />
                            <Button
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => handleRemoveImage(index)}
                            >
                              Remove
                            </Button>
                          </Group>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </>
                )}
              </Box>

              <Divider 
                my="md" 
                label={<Text size="sm" fw={500} c="white">Restaurant Menu</Text>} 
                labelPosition="center" 
                color="gray.3" 
              />
              
              <Box mb="xl">
                <Title order={2} mb="md" style={{ color: '#fff' }}>Restaurant Menu</Title>
                <FileInput
                  label="Upload Menu (PDF)"
                  placeholder={menuPdfFile ? menuPdfFile.name : "Upload menu PDF"}
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  icon={<IconFileText size={rem(14)} />}
                  error={pdfError}
                  description="Upload your restaurant menu as a PDF file (max 5MB)"
                  rightSection={
                    menuPdfFile && (
                      <ActionIcon 
                        onClick={() => setMenuPdfFile(null)} 
                        variant="subtle" 
                        color="red"
                      >
                        <IconX size={rem(14)} />
                      </ActionIcon>
                    )
                  }
                  styles={{
                    label: { fontWeight: 500, color: 'white' },
                    input: {
                      '&:focus': {
                        borderColor: '#d1ae36',
                      },
                    },
                  }}
                />
              </Box>

              <Divider 
                my="md" 
                label={<Text size="sm" fw={500} c="white">Additional Information</Text>} 
                labelPosition="center" 
                color="gray.3" 
              />
              
              <Textarea
                label="Description"
                placeholder="Tell us about your restaurant"
                autosize
                minRows={3}
                maxRows={8}
                mt="md"
                {...form.getInputProps("description")}
                      styles={{
                        label: { fontWeight: 500, color: 'white' },
                        input: {
                          '&:focus': {
                            borderColor: '#d1ae36',
                          },
                        },
                      }}
              />
            

                    <Divider my="md" label={<Text size="sm" fw={500} c="white">Restaurant Location on Map</Text>} labelPosition="center" color="gray.3" />
                    
                    <Box mb="xl">
                      <Text fw={500} mb="xs" style={{ color: 'white' }}>
                        Restaurant Location
                      </Text>
                      <GoogleMapPicker
                        onLocationSelect={handleLocationSelect}
                        initialCoordinates={coordinates}
                      />
                    </Box>
              
              <Group position="right" mt="xl">
                <Button 
                  variant="outline"
                  component={Link} 
                  to="/owner/restaurants"
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
                  loading={form.isSubmitting}
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
                  Create
                </Button>
              </Group>
            </form>

            <Modal
              opened={opened}
              title="Create Your Restaurant"
              modalContent={modalContent(form)}
              toggle={toggle}
              close={close}
              onSubmit={handleSubmit}
            />
          </Box>
            </Paper>
          )}
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

export default NewRestaurant;
