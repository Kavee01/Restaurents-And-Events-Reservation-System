import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Flex,
  Box,
  ActionIcon,
  Menu,
  UnstyledButton,
  rem,
  Divider,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconTools,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconHeart,
  IconStar,
  IconChevronDown,
  IconMapPin,
  IconCalendarEvent,
  IconActivity,
  IconToolsKitchen2,
  IconSwimming,
  IconCategory,
  IconUser,
  IconBuildingCommunity,
  IconBuildingStore,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import useToast from "../../hooks/useToast";
import { sharedStyles } from "../../components/Layout/SharedStyles";
import { getUser, logOut } from "../../service/users";

function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { sendRequest } = useFetch();
  const navigate = useNavigate();
  const { successToast, errorToast } = useToast();

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
    
    getAllServices();
  }, []);

  const getAllServices = async () => {
    setLoading(true);
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/services/owner-services`,
        "GET"
      );
      setServices(resData);
    } catch (err) {
      console.log(err);
      errorToast({
        title: "Error",
        message: "Failed to load services. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await sendRequest(
          `${import.meta.env.VITE_API_URL}/services/${id}`,
          "DELETE"
        );
        
        setServices(services.filter(service => service._id !== id));
        
        successToast({
          title: "Success",
          message: "Service deleted successfully.",
        });
      } catch (err) {
        console.log(err);
        errorToast({
          title: "Error",
          message: "Failed to delete service. Please try again.",
        });
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
      <Container size="xl">
        <Group position="apart" mb="xl">
            <Title order={2} style={{ color: 'white' }}>Manage Services</Title>
          <Button 
            component={Link} 
            to="/owner/services/new"
            leftSection={<IconPlus size={14} />}
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
            Add New Service
          </Button>
        </Group>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {services.length === 0 ? (
              <Box py="lg">
                  <Text c="white">No services found. Add a new service to get started.</Text>
                  <Button 
                    mt="md" 
                    component={Link} 
                    to="/owner/services/new"
                    style={{
                      backgroundColor: '#d1ae36',
                      color: '#1a2a41',
                    }}
                  >
                  Create Service
                </Button>
              </Box>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {services.map((service) => (
                    <Card 
                      key={service._id} 
                      shadow="sm" 
                      padding="lg" 
                      radius="md" 
                      withBorder
                      style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(40, 50, 70, 0.05) 0%, rgba(30, 40, 60, 0.05) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15), 0 0 10px rgba(209, 174, 54, 0.2)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                    {service.imageUrl && (
                      <Card.Section>
                        <Image
                          src={service.imageUrl}
                          height={160}
                          alt={service.title}
                        />
                      </Card.Section>
                    )}

                    <Group position="apart" mt="md" mb="xs">
                        <Title order={4} style={{ color: '#2C3E50' }}>{service.title}</Title>
                        <Badge 
                          color="green"
                          style={{
                            backgroundColor: 'rgba(209, 174, 54, 0.9)',
                            color: '#fff',
                          }}
                        >
                          {service.serviceType}
                        </Badge>
                    </Group>

                      <Text size="sm" c="dimmed" lineClamp={2} style={{ flex: 1 }}>
                      {service.description}
                    </Text>
                    
                    <Group mt="md">
                        <Flex align="center" gap="5px">
                          <IconCurrencyDollar size={16} color="#d1ae36" stroke={1.5} />
                          <Text size="sm" c="dimmed">
                        <b>Price:</b> ${service.price}
                      </Text>
                        </Flex>
                      </Group>
                      
                      <Group mt="xs">
                        <Flex align="center" gap="5px">
                          <IconCalendarEvent size={16} color="#d1ae36" stroke={1.5} />
                          <Text size="sm" c="dimmed">
                        <b>Availability:</b> {service.availability}
                      </Text>
                        </Flex>
                    </Group>
                    
                    {service.providerInfo && (
                        <Group mt="xs">
                          <Flex align="center" gap="5px">
                            <IconUser size={16} color="#d1ae36" stroke={1.5} />
                            <Text size="sm" c="dimmed">
                        <b>Provider Info:</b> {service.providerInfo}
                      </Text>
                          </Flex>
                        </Group>
                    )}

                    <Flex 
                        mt="auto" 
                      align="center" 
                        justify="space-between"
                        pt="md"
                    >
                      <ActionIcon 
                        variant="subtle" 
                        color="red"
                        onClick={() => handleDeleteService(service._id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                      <Button 
                        variant="light" 
                        component={Link}
                        to={`/owner/services/${service._id}/edit`}
                        leftSection={<IconEdit size={14} />}
                          size="sm"
                          style={{
                            backgroundColor: 'rgba(33, 43, 54, 0.8)',
                            color: '#d1ae36',
                            border: '1px solid rgba(209, 174, 54, 0.3)'
                          }}
                      >
                        Edit
                      </Button>
                    </Flex>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </>
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

export default ServiceList; 