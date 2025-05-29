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
  Alert,
  Image,
  SimpleGrid,
  Card,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { 
  IconClock,
  IconArrowLeft,
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
  IconUpload,
  IconFileText,
  IconX,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useDisclosure } from "@mantine/hooks";
import Modal from "../../components/Parts/Modal";
import useFetch from "../../hooks/useFetch";
import useToast from "../../hooks/useToast";
import useCheckBooking from "../../hooks/useCheckBooking";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";
import GoogleMapPicker from "../../components/Maps/GoogleMapPicker";

function EditRestaurant() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const [data, setData] = useState([]);
  const [payload, setPayload] = useState({});
  const [loading, setLoading] = useState(true);
  const { formatTime } = useCheckBooking();
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [menuPdfFile, setMenuPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [mapAddress, setMapAddress] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const fileInputRef = useRef(null);
  dayjs.extend(customParseFormat);
  const { restaurantId } = useParams();

  const form = useForm({
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

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      if (!currentUser.isOwner) {
        navigate("/");
        return;
      }
    } else {
      navigate("/signin");
      return;
    }
    
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const getData = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/${restaurantId}`,
        "GET"
      );
      if (!resData) {
        navigate("/owner/restaurants");
        return;
      }
      
      setData(resData);
      
      // Set form values
      form.setValues({
        name: resData.name || '',
        category: resData.category || '',
        location: resData.location || '',
        timeOpen: formatTime(resData.timeOpen) || '',
        timeClose: formatTime(resData.timeClose) || '',
        address: resData.address || '',
        daysClose: resData.daysClose || [],
        phone: resData.phone || '',
        websiteUrl: resData.websiteUrl || '',
        maxPax: resData.maxPax || '',
        description: resData.description || '',
        image: resData.image || '',
      });

      // Set coordinates if they exist
      if (resData.coordinates) {
        setCoordinates(resData.coordinates);
      }

      // Set existing images if they exist
      if (resData.images && resData.images.length > 0) {
        const imageUrls = resData.images.map(img => `${import.meta.env.VITE_API_URL}${img}`);
        setImageUrls(imageUrls);
        setExistingImages(resData.images);
      }
      
      // Set menu PDF if exists
      if (resData.menuPdf) {
        setMenuPdfFile({ name: 'Current Menu' });
      }
    } catch (err) {
      console.log(err);
      navigate("/owner/restaurants");
    } finally {
      setLoading(false);
    }
  };

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
        if (newImages.length + existingImages.length - removedImages.length < 5) {
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
    // Check if we're removing an existing image or a newly uploaded one
    if (index < existingImages.length) {
      // Removing an existing image
      setRemovedImages([...removedImages, existingImages[index]]);
      const newExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExistingImages);
    } else {
      // Removing a newly uploaded image
      const adjustedIndex = index - existingImages.length;
      const newImages = images.filter((_, i) => i !== adjustedIndex);
      setImages(newImages);
    }

    // Update image URLs
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    
    if (previewImageIndex === index) {
      setPreviewImageIndex(0);
    } else if (previewImageIndex > index) {
      setPreviewImageIndex(previewImageIndex - 1);
    }
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

      // Only require coordinates if they're not already set
      if (!coordinates && !data.coordinates) {
        errorToast({
          title: "Map Location Required",
          message: "Please select a location on the map for your restaurant",
        });
        return;
      }

      // Only require images if there are no existing images and no new images
      if (images.length === 0 && existingImages.length === 0) {
        errorToast({
          title: "Images Required",
          message: "Please upload at least one image of your restaurant",
        });
        return;
      }

      const formData = new FormData();
      
      // Add form fields
      Object.keys(form.values).forEach(key => {
        if (key === 'daysClose' && form.values[key]) {
          formData.append(key, JSON.stringify(form.values[key]));
        } else if (key === 'timeOpen' || key === 'timeClose') {
          // Convert time string to number (e.g., "11:00" -> 1100)
          const timeValue = form.values[key].replace(':', '');
          formData.append(key, parseInt(timeValue));
        } else if (form.values[key] !== undefined && form.values[key] !== '') {
          formData.append(key, form.values[key]);
        }
      });

      // Add coordinates if they've been updated
      if (coordinates) {
        formData.append('coordinates', JSON.stringify(coordinates));
      }

      // Add new images
      if (images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`image${index}`, image);
        });
      }

      // Add removed images information
      if (removedImages.length > 0) {
        formData.append('removedImages', JSON.stringify(removedImages));
      }

      // Add menu PDF if changed
      if (menuPdfFile && menuPdfFile instanceof File) {
        formData.append('menuPdf', menuPdfFile);
      }

      const res = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/${restaurantId}/edit`,
        "POST",
        formData,
        { 'Content-Type': 'multipart/form-data' }
      );

      navigate(`/owner/restaurant/${restaurantId}`);
      close();
      successToast({
        title: "Restaurant Info Successfully Updated!",
        message: "Your restaurant information has been updated",
      });
    } catch (err) {
      console.log(err);
      close();
      errorToast();
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

  const confirmInput = (input) => {
    const formSubmit = {
      name: input.name,
      image: input.image,
      category: input.category,
      location: input.location,
      timeOpen: parseInt(input.timeOpen.split(":").join("")),
      timeClose: parseInt(input.timeClose.split(":").join("")),
      address: input.address,
      daysClose: input.daysClose,
      phone: input.phone,
      websiteUrl: input.websiteUrl,
      maxPax: input.maxPax,
      description: input.description,
    };
    setPayload(formSubmit);
  };

  // get user edited info
  const compareData = (var1, var2) => {
    const displayData = {};

    Object.keys(var1).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(var2, key)) {
        // need separate comparison for daysClose as it is stored as an array in the backend db
        // unlike the rest
        if (key === "daysClose") {
          if (var1.daysClose) {
            const isDaysCloseEqual =
              var1.daysClose.length === var2.daysClose.length &&
              var1.daysClose.every((day) => var2.daysClose.includes(day));

            if (!isDaysCloseEqual) {
              displayData[key] = var1[key];
            }
          } else {
            return; //if the field is not edited, var1.daysClose would be undefined (from console.logs)
          }
        } else if (var1[key] !== var2[key]) {
          // Check if the value is different
          displayData[key] = var1[key];
        }
      }
    });

    if (Object.keys(displayData).length === 0) {
      return "No differing values. Please update the relevant fields.";
    } else {
      return (
        <ul>
          {Object.entries(displayData).map(([key, value]) => (
            <li key={key}>
              {key === "daysClose"
                ? `Days Closed: ${value.join(", ")}`
                : key === "maxPax"
                ? `Maximum Pax: ${value}`
                : key === "timeOpen"
                ? `Opening Time: ${formatTime(value)}`
                : key === "timeClose"
                ? `Closing Time: ${formatTime(value)}`
                : key === "websiteURL"
                ? `Website: ${value}`
                : `${key}: ${value}`}
            </li>
          ))}
        </ul>
      );
    }
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
          ) : null}
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
                Edit Restaurant
              </Title>

              <form onSubmit={form.onSubmit(handleSubmit)}>
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
                      ]}
                  mt="md"
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
                  required
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
                  required
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
                  required
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
                      label={<Text size="sm" fw={500} c="white">Additional Information</Text>} 
                      labelPosition="center" 
                      color="gray.3" 
                    />
                    
                <Textarea
                  label="Description"
                  mt="md"
                  placeholder="A cozy cafe offering a wide range of coffee, tea, and pastries."
                      autosize
                  minRows={3}
                      maxRows={8}
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
                <TextInput
                  label="Image"
                  mt="md"
                  placeholder="https://gacafe.com/image.jpg"
                  {...form.getInputProps("image")}
                      styles={{
                        label: { fontWeight: 500, color: 'white' },
                        input: {
                          '&:focus': {
                            borderColor: '#d1ae36',
                          },
                        },
                      }}
                    />

                {/* Add Map Picker */}
                <Box mb="xl">
                  <Text fw={500} mb="xs" style={{ color: 'white' }}>
                    Restaurant Location
                  </Text>
                  <GoogleMapPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={coordinates}
                  />
                </Box>

                {/* Add Image Upload Section */}
                <Box mb="xl">
                  <Text fw={500} mb="xs" style={{ color: 'white' }}>
                    Restaurant Images
                  </Text>
                  <SimpleGrid cols={3} spacing="md">
                    {imageUrls.map((url, index) => (
                      <Card key={index} p="xs" style={{ position: 'relative' }}>
                        <Image
                          src={url}
                          height={200}
                          alt={`Restaurant image ${index + 1}`}
                        />
                        <ActionIcon
                          variant="filled"
                          color="red"
                          size="sm"
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Card>
                    ))}
                    {imageUrls.length < 5 && (
                      <Card p="xs" style={{ border: '2px dashed rgba(255, 255, 255, 0.2)' }}>
                        <FileInput
                          ref={fileInputRef}
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          placeholder="Upload images"
                          icon={<IconUpload size={16} />}
                          style={{ height: '100%' }}
                        />
                      </Card>
                    )}
                  </SimpleGrid>
                </Box>

                <Box mb="xl">
                  <Title 
                    order={2} 
                    mb="md" 
                    style={{ 
                      color: '#fff',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      marginBottom: '1.5rem',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60px',
                        height: '2px',
                        backgroundColor: '#d1ae36'
                      }
                    }}
                  >
                    Restaurant Menu
                  </Title>
                  <Paper
                    p="md"
                    radius="md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <FileInput
                      placeholder={menuPdfFile ? menuPdfFile.name : "Upload menu PDF"}
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      icon={<IconFileText size={rem(16)} color="#d1ae36" />}
                      error={pdfError}
                      description={
                        <Text size="sm" c="dimmed" mt={4}>
                          Upload your restaurant menu as a PDF file (max 5MB)
                        </Text>
                      }
                      styles={{
                        root: {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          },
                        },
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          '&:focus': {
                            borderColor: '#d1ae36',
                          },
                          '&::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                        },
                        description: {
                          color: 'rgba(255, 255, 255, 0.6)',
                        },
                        error: {
                          color: '#ff6b6b',
                        },
                      }}
                      rightSection={
                        menuPdfFile && (
                          <ActionIcon 
                            onClick={() => setMenuPdfFile(null)} 
                            variant="subtle" 
                            color="red"
                            style={{
                              '&:hover': {
                                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                              },
                            }}
                          >
                            <IconX size={rem(14)} />
                          </ActionIcon>
                        )
                      }
                    />
                    
                    {data.menuPdf && (
                      <Group mt="md" spacing="xs">
                        <Text size="sm" c="dimmed" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Current menu:
                        </Text>
                        <Button 
                          variant="light" 
                          size="xs"
                          component="a"
                          href={`${import.meta.env.VITE_API_URL}${data.menuPdf}`}
                          target="_blank"
                          leftSection={<IconFileText size={rem(14)} color="#d1ae36" />}
                          styles={{
                            root: {
                              backgroundColor: 'rgba(209, 174, 54, 0.1)',
                              color: '#d1ae36',
                              '&:hover': {
                                backgroundColor: 'rgba(209, 174, 54, 0.2)',
                              },
                            },
                          }}
                        >
                          View Current Menu
                        </Button>
                      </Group>
                    )}
                  </Paper>
                </Box>

                <Group position="right" mt="xl">
                  <Button
                        variant="outline"
                    component={Link}
                    to={`/owner/restaurant/${restaurantId}`}
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
                    Update
                  </Button>
                </Group>
              </form>
            </Box>
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

            <Modal
              opened={opened}
              title="Update Restaurant"
              modalContent={compareData(payload, data)}
              toggle={toggle}
              close={close}
              handleSubmit={handleSubmit}
            />
    </div>
  );
}

export default EditRestaurant;
