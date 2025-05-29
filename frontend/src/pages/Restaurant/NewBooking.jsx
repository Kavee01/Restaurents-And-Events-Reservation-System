import { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Box,
  Button,
  Group,
  NumberInput,
  Textarea,
  Title,
  Text,
  Card,
  Stack,
  Grid,
  Badge,
  Menu,
  UnstyledButton,
  Divider,
  rem,
  Paper,
  ActionIcon,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { 
  IconClock, 
  IconCalendarEvent, 
  IconMapPin, 
  IconUsers, 
  IconUser,
  IconChevronDown,
  IconLogout,
  IconArrowLeft,
} from "@tabler/icons-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import Modal from "../../components/Parts/Modal";
import useFetch from "../../hooks/useFetch";
import useToast from "../../hooks/useToast";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import customParseFormat from "dayjs/plugin/customParseFormat";
import useCheckBooking from "../../hooks/useCheckBooking";
import { getUser, logOut } from "../../service/users";
import { sharedStyles } from "../../components/Layout/SharedStyles";

function NewBooking() {
  const [restaurant, setRestaurant] = useState(null);
  const [opened, { toggle, close }] = useDisclosure(false);
  const { sendRequest } = useFetch();
  const location = useLocation();
  const pathId = location.pathname.split("/")[2];
  const { successToast, errorToast } = useToast();
  const ref = useRef(null);
  dayjs.extend(customParseFormat);
  const { isInputDayClosed, formatTime } = useCheckBooking();
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [operationHours, setOperationHours] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const navigate = useNavigate();

  const formatTimeCallback = useCallback((time) => {
    return formatTime(time);
  }, [formatTime]);

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
    
    getRestaurantData();
  }, []);

  useEffect(() => {
    if (restaurant?.timeOpen && restaurant?.timeClose) {
      setOperationHours({
        timeOpen: formatTimeCallback(restaurant.timeOpen),
        timeClose: formatTimeCallback(restaurant.timeClose),
      });
    }
  }, [restaurant?.timeOpen, restaurant?.timeClose, formatTimeCallback]);

  const getRestaurantData = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/${pathId}`,
        "GET"
      );
      setRestaurant(resData);
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Could not load restaurant information"
      });
    } finally {
      setLoading(false);
    }
  };

  const form = useForm({
    initialValues: {
      time: "",
      date: new Date(dayjs().add(1, "day")),
      pax: 2,
      request: "",
    },
    validate: {
      pax: (value) =>
        value === undefined
          ? "Please enter a number"
          : value < 1
          ? "Minimum 1 pax"
          : value > restaurant?.maxPax
          ? "Maximum " + restaurant?.maxPax + " pax"
          : value > 10 &&
            "For large group, please contact the restaurant directly",
      date: (value) =>
        value === undefined
          ? "Please enter a date"
          : value < new Date()
          ? "Date must be in the future"
          : value > new Date().setDate(new Date().getDate() + 14)
          ? "Date must be within 14 days"
          : isDayClosed && "Restaurant is closed on this day",
      time: (value) =>
        value === ""
          ? "Please enter a time"
          : value < operationHours.timeOpen || value > operationHours.timeClose
          ? "Please enter a time within opening hours"
          : null,
      request: (value) =>
        value?.length > 100 && "Please enter less than 100 characters",
    },
  });

  useEffect(() => {
    if (restaurant?.daysClose) {
      setIsDayClosed(isInputDayClosed(restaurant?.daysClose, form.values.date));
    }
  }, [restaurant?.daysClose, form.values.date, isInputDayClosed]);

  const handleSubmit = async () => {
    try {
      const timeToAdd = form.values.time;
      const bookingDate = new Date(form.values.date);
      
      // Ensure the date is correctly set
      bookingDate.setHours(parseInt(timeToAdd.split(":")[0]));
      bookingDate.setMinutes(parseInt(timeToAdd.split(":")[1]));
      bookingDate.setSeconds(0);
      
      // ISO string format for the backend
      const formattedDateTime = bookingDate.toISOString();

      await sendRequest(
        `${import.meta.env.VITE_API_URL}/booking/create`,
        "POST",
        {
          dateTime: formattedDateTime,
          pax: parseInt(form.values.pax),
          request: form.values.request,
          restaurant: restaurant._id,
        }
      );
      navigate("/account/bookings");
      close();
      successToast({
        title: "Table Reserved!",
        message: "Your booking is pending approval. You will be notified once it's approved.",
      });
    } catch (err) {
      console.log(err);
      close();
      
      // Show specific error message if available
      if (err.message) {
        errorToast({
          title: "Booking Error",
          message: err.message
        });
      } else {
        errorToast();
      }
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

  const pickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => ref.current?.showPicker()}
    >
      <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
    </ActionIcon>
  );

  const modalContent = (
    <Stack spacing="md">
      <Text weight={500} size="lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Booking Summary</Text>
      <Card 
        withBorder 
        p="md" 
        radius="md" 
        style={{ 
          background: 'rgba(25, 35, 55, 0.5)', 
          border: '1px solid rgba(255, 255, 255, 0.1)' 
        }}
      >
        <Stack spacing="xs">
          <Group position="apart">
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Date:</Text>
            <Text style={{ color: 'white' }}>{dayjs(form.values.date).format("dddd, MMMM D, YYYY")}</Text>
          </Group>
          <Group position="apart">
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Time:</Text>
            <Text style={{ color: 'white' }}>{dayjs(form.values.time, "HH:mm").format("h:mm A")}</Text>
          </Group>
          <Group position="apart">
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Number of guests:</Text>
            <Text style={{ color: 'white' }}>{form.values.pax} {form.values.pax === 1 ? 'person' : 'people'}</Text>
          </Group>
          {form.values.request && (
            <>
              <Divider my="xs" color="rgba(255, 255, 255, 0.1)" />
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Special Request:</Text>
              <Text style={{ color: 'white' }}>{form.values.request}</Text>
            </>
          )}
        </Stack>
      </Card>
    </Stack>
  );

  if (loading) {
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
              to={`/restaurant/${pathId}`} 
              variant="subtle" 
              color="white" 
              leftSection={<IconArrowLeft size={14} />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Restaurant
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
              <Title order={2} mb="xl" style={{ color: '#fff' }}>Reserve a Table</Title>

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
                      <Title order={3} style={{ color: '#d1ae36' }}>{restaurant?.name}</Title>
                      
                      {restaurant?.cuisineType && (
                        <Badge color="blue" variant="filled" size="sm" mt="xs">
                          {restaurant.cuisineType}
                        </Badge>
                      )}
                      
                      <Group spacing="xs" mt="md">
                        <IconMapPin size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{restaurant?.address}</Text>
                      </Group>
                      
                      <Group spacing="xs">
                        <IconClock size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          Open {restaurant?.timeOpen} - {restaurant?.timeClose}
                        </Text>
                      </Group>
                      
                      <Group spacing="xs">
                        <IconUsers size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          Maximum {restaurant?.maxPax} people per table
                        </Text>
                      </Group>
                      
                      {isDayClosed && (
                        <Badge 
                          color="red" 
                          variant="filled" 
                          size="lg" 
                          mt="md"
                        >
                          Restaurant is closed on the selected day
                        </Badge>
                      )}
                      
                      {restaurant?.description && (
                        <Text mt="md" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          {restaurant.description}
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
            <form
              onSubmit={form.onSubmit(() => {
                        if (form.isValid()) {
                  toggle();
                }
              })}
            >
                      <Stack spacing="md">
              <DateInput
                valueFormat="DD/MM/YYYY"
                label="Date"
                          placeholder="Select a date"
                          required
                          clearable={false}
                          minDate={new Date()}
                          maxDate={new Date(new Date().setDate(new Date().getDate() + 14))}
                {...form.getInputProps("date")}
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

              <TimeInput
                label="Time"
                ref={ref}
                rightSection={pickerControl}
                          required
                {...form.getInputProps("time")}
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

              <NumberInput
                          label="Number of Guests"
                placeholder="2"
                min={1}
                          max={restaurant?.maxPax || 10}
                          required
                {...form.getInputProps("pax")}
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
                          placeholder="Child seat, wheelchair access, etc."
                minRows={3}
                          maxLength={100}
                {...form.getInputProps("request")}
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

                <Button
                          type="submit"
                          fullWidth
                          disabled={isDayClosed}
                          style={{
                            backgroundColor: '#d1ae36',
                            color: '#1a2a41',
                            border: 'none',
                            marginTop: '1rem',
                          }}
                          styles={{
                            root: {
                              '&:hover': {
                                backgroundColor: 'rgba(209, 174, 54, 0.9)'
                              }
                            }
                          }}
                        >
                          {isDayClosed ? "Restaurant Closed on Selected Day" : "Reserve Table"}
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

            {/* Modal */}
            <Modal
              opened={opened}
              close={close}
              toggle={toggle}
              onSubmit={handleSubmit}
              title="Confirm Booking"
              modalContent={
                <Stack>
                  <Text>Restaurant: {restaurant?.name}</Text>
                  <Text>Date: {form.values.date.toLocaleDateString()}</Text>
                  <Text>Time: {form.values.time}</Text>
                  <Text>Number of People: {form.values.pax}</Text>
                  {form.values.request && (
                    <Text>Special Request: {form.values.request}</Text>
                  )}
                </Stack>
              }
            />
    </div>
  );
}

export default NewBooking;
