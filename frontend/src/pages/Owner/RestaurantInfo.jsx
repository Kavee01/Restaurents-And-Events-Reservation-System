import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  Flex,
  Button,
  Box,
  Text,
  Anchor,
  Title,
  Image,
  useMantineTheme,
  Paper,
  Divider,
  Container,
  Group,
  Menu,
  UnstyledButton,
  rem
} from "@mantine/core";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import Modal from "../../components/Parts/Modal";
import RestaurantMap from "../../components/Maps/RestaurantMap";
import useCheckBooking from "../../hooks/useCheckBooking";
import useToast from "../../hooks/useToast";
import { getUser, logOut } from "../../service/users";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { IconUser, IconChevronDown, IconStar, IconMapPin, IconCalendarEvent, IconSwimming, IconToolsKitchen2, IconBuildingCommunity, IconBuildingStore, IconActivity, IconTool, IconLogout } from "@tabler/icons-react";

// Define additional styles specific to restaurant info
const detailStyles = {
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '1rem',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  infoField: {
    marginBottom: '1rem',
    color: 'white',
  },
  label: {
    fontWeight: 600,
    color: 'rgba(209, 174, 54, 0.9)',
  },
  value: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#d1ae36',
    color: '#1a2a41',
    '&:hover': {
      backgroundColor: '#c9a930',
    }
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    }
  },
  dangerButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    color: '#dc3545',
    border: '1px solid rgba(220, 53, 69, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(220, 53, 69, 0.2)',
    }
  }
};

function RestaurantInfo() {
  const { sendRequest } = useFetch();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, { toggle, close }] = useDisclosure(false);
  const { successToast, errorToast } = useToast();
  const { formatTime } = useCheckBooking();
  const theme = useMantineTheme();
  const isPc = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [user, setUser] = useState(null);
  const [navHover, setNavHover] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

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
      const formattedTimeOpen = resData.timeOpen
        ? formatTime(resData.timeOpen)
        : null;
      const formattedTimeClose = resData.timeClose
        ? formatTime(resData.timeClose)
        : null;
      setData({
        ...resData,
        timeOpen: formattedTimeOpen,
        timeClose: formattedTimeClose,
      });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleDelData = async () => {
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant/${data._id}/delete`,
        "DELETE",
        null  // Explicitly set body to null for DELETE request
      );
      navigate("/owner/restaurants");
      close();
      successToast({
        title: "Restaurant Info Successfully Deleted",
        message: "The restaurant will be delisted for reservations.",
      });
    } catch (err) {
      console.log(err);
      close();
      errorToast({
        title: "Error",
        message: "Failed to delete restaurant. Please try again.",
      });
    } finally {
      close();
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
        <Container size="lg">
      {loading ? (
        <LoadingSpinner />
      ) : !data || data.length === 0 ? (
        <Box w="100%" h="100%" mt="xl">
              <Text ta="center" color="white">Restaurant not found!</Text>
          <Box mt="xl" ta="center">
            <Button component={Link} to="/owner/restaurants">
              Back to My Restaurants
            </Button>
          </Box>
        </Box>
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
                <Title order={2} ta="center" style={{ color: '#fff', marginBottom: '1.5rem' }}>
              {data.name}
            </Title>
                
            {data.image && (
                  <Box style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '2rem' }}>
              <Image
                src={data.image}
                alt={data.name}
                radius="md"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Box>
                )}
                
                <Box style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '2rem' }}>
                  <Paper p="xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Box mb="md">
                      <Text fw={600} size="sm" style={{ color: 'rgba(209, 174, 54, 0.9)' }}>Category</Text>
                      <Text style={{ color: 'white' }}>{data.category}</Text>
                    </Box>
                    
                    <Box mb="md">
                      <Text fw={600} size="sm" style={{ color: 'rgba(209, 174, 54, 0.9)' }}>Location</Text>
                      <Text style={{ color: 'white' }}>{data.location}</Text>
                    </Box>
                    
                    <Box mb="md">
                      <Text fw={600} size="sm" style={{ color: 'rgba(209, 174, 54, 0.9)' }}>Address</Text>
                      <Text style={{ color: 'white' }}>{data.address}</Text>
                    </Box>
                    
                    <Box mb="md">
                      <Text fw={600} size="sm" style={{ color: 'rgba(209, 174, 54, 0.9)' }}>Opening Hours</Text>
                      <Text style={{ color: 'white' }}>{data.timeOpen} - {data.timeClose}</Text>
                    </Box>
                    
                    <Box mb="md">
                      <Text fw={600} size="sm" style={{ color: 'rgba(209, 174, 54, 0.9)' }}>Days Closed</Text>
                      <Text style={{ color: 'white' }}>{data?.daysClose?.length > 0 ? data.daysClose.join(", ") : "-"}</Text>
                    </Box>
                    
                    <Box mb="md">
                      <Text fw={600} size="sm" style={{ color: 'rgba(209, 174, 54, 0.9)' }}>Phone</Text>
                      <Text style={{ color: 'white' }}>{data.phone ? data.phone : "-"}</Text>
                    </Box>
                    
                    <Box mb="md">
                      <Text fw={600} size="sm" style={{ color: 'rgba(209, 174, 54, 0.9)' }}>Website</Text>
                {data.websiteUrl ? (
                        <Anchor href={data.websiteUrl} target="_blank" style={{ color: '#d1ae36' }}>
                    {data.websiteUrl}
                  </Anchor>
                ) : (
                        <Text style={{ color: 'white' }}>-</Text>
                      )}
                    </Box>
                    
                    <Box mb="md">
                      <Text fw={600} size="sm" style={{ color: 'rgba(209, 174, 54, 0.9)' }}>Description</Text>
                      <Text style={{ color: 'white', whiteSpace: 'pre-wrap' }}>{data.description ? data.description : "-"}</Text>
                    </Box>
                  </Paper>
              
              {data.coordinates && (
                <Box mt="xl">
                      <Divider my="md" color="rgba(255, 255, 255, 0.1)" label={<Text color="white">Restaurant Location</Text>} labelPosition="center" />
                  <RestaurantMap 
                    coordinates={data.coordinates}
                    name={data.name}
                    address={data.address}
                  />
                </Box>
              )}

            <Flex
              gap="md"
              justify="center"
                    align="center"
              wrap="wrap"
              mt="xl"
            >
              <Button
                component={Link}
                to="/owner/restaurants"
                variant="outline"
                      style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }}
              >
                Back
              </Button>
                    <Button 
                      onClick={toggle} 
                      variant="outline" 
                      color="red"
                      style={{
                        color: '#ff6b6b',
                        borderColor: 'rgba(255, 107, 107, 0.3)'
                      }}
                    >
                Delete
              </Button>
              <Button 
                component={Link} 
                to={`/owner/restaurant/${restaurantId}/edit`}
                      style={{
                        backgroundColor: '#d1ae36',
                        color: '#1a2a41',
                      }}
              >
                Edit
              </Button>
              <Button 
                component={Link} 
                to={`/owner/dashboard/${restaurantId}`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
              >
                View Bookings
              </Button>
            </Flex>
          </Box>
              </Box>
            </Paper>
          )}
        </Container>

          {/* Modal */}
          <Modal
            opened={opened}
            title="Delete Restaurant"
            modalContent="These info will be deleted and the restaurant will be delisted for reservation. You will not be able to undo this."
            toggle={toggle}
            close={close}
            onSubmit={handleDelData}
          />
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
export default RestaurantInfo;
