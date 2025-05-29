import { useState, useEffect } from "react";
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
  Menu,
  UnstyledButton,
  Divider,
  rem,
  Paper,
  Box,
  Image,
} from "@mantine/core";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  IconAlertCircle, 
  IconCalendarEvent, 
  IconClock, 
  IconMapPin, 
  IconTicket,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconStar,
  IconChevronDown,
  IconActivity,
  IconToolsKitchen2,
  IconBuildingCommunity,
  IconUser,
  IconSwimming,
  IconCategory,
} from '@tabler/icons-react';
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useToast from "../../hooks/useToast";
import { getUser, logOut } from "../../service/users";
import { sharedStyles } from "../../components/Layout/SharedStyles";

function EventBookingForm() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    numberOfTickets: 1,
    specialRequests: "",
  });
  const [ticketsRemaining, setTicketsRemaining] = useState(0);
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false);

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
    
    getEventDetails();
  }, []);

  useEffect(() => {
    // Add PayPal script when component mounts
    if (!document.getElementById('paypal-script') && !paypalLoaded) {
      const script = document.createElement('script');
      script.id = 'paypal-script';
      // Use PayPal sandbox client ID
      script.src = `https://www.paypal.com/sdk/js?client-id=test&currency=USD`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    }
  }, [paypalLoaded]);

  // Render PayPal button when payment step is active and script is loaded
  useEffect(() => {
    if (paymentStep && paypalLoaded && !paypalButtonRendered && window.paypal) {
      renderPayPalButton();
    }
  }, [paymentStep, paypalLoaded, paypalButtonRendered]);

  const getEventDetails = async () => {
    try {
      const eventData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/events/${id}`,
        "GET"
      );
      
      setEvent(eventData);
      
      // Get availability information using the public endpoint
      const availabilityData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/eventbooking/event/${id}/availability`,
        "GET"
      );
      
      setTicketsRemaining(availabilityData.ticketsRemaining);
    } catch (err) {
      console.error(err);
      errorToast({
        title: "Error",
        message: "Failed to load event details. Please try again.",
      });
    } finally {
      setInitialLoading(false);
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

  const calculateTotal = () => {
    if (!event) return 0;
    return event.ticketPrice * formData.numberOfTickets;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/signin");
      return;
    }
    
    if (formData.numberOfTickets <= 0) {
      errorToast({
        title: "Error",
        message: "Please select at least one ticket.",
      });
      return;
    }
    
    if (formData.numberOfTickets > ticketsRemaining) {
      errorToast({
        title: "Error",
        message: `Only ${ticketsRemaining} tickets available.`,
      });
      return;
    }
    
    // Instead of immediately sending booking, move to payment step
    setPaymentStep(true);
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

  const renderPayPalButton = () => {
    if (document.getElementById('paypal-button-container') && window.paypal) {
      // Clear the container first
      document.getElementById('paypal-button-container').innerHTML = '';
      
      window.paypal.Buttons({
        // Set styling to match our site theme
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 50,
          layout: 'vertical'
        },
        // Set up the transaction
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              description: `Tickets for ${event.title}`,
              amount: {
                value: calculateTotal().toString()
              }
            }]
          });
        },
        // Finalize the transaction
        onApprove: async (data, actions) => {
          try {
            setLoading(true);
            // Get the order details
            const order = await actions.order.capture();
            
            // Now send booking data to our server
            const bookingData = {
              event: id,
              numberOfTickets: formData.numberOfTickets,
              specialRequests: formData.specialRequests,
              paymentDetails: {
                paypalOrderId: order.id,
                payerEmail: order.payer?.email_address || 'sandbox@example.com',
                paymentStatus: order.status || 'COMPLETED',
                transactionId: order.purchase_units?.[0]?.payments?.captures?.[0]?.id || order.id
              }
            };

            await sendRequest(
              `${import.meta.env.VITE_API_URL}/eventbooking`,
              "POST",
              bookingData
            );
            
            successToast({
              title: "Payment Successful",
              message: "Your tickets have been booked successfully!",
            });
            
            navigate("/bookings");
          } catch (err) {
            console.error("Payment error:", err);
            errorToast({
              title: "Payment Error",
              message: err.message || "Failed to process payment. Please try again.",
            });
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error("PayPal Error:", err);
          errorToast({
            title: "Payment Error",
            message: "There was an error processing your payment. Please try again.",
          });
        }
      }).render('#paypal-button-container');
      
      setPaypalButtonRendered(true);
    }
  };

  // Function to go back to booking form
  const handleBackToForm = () => {
    setPaymentStep(false);
    setPaypalButtonRendered(false);
  };

  // Add PayPal payment UI to the form
  const renderPaymentSection = () => {
    return (
      <div>
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
          <Stack spacing="md">
            <Title order={3} style={{ color: '#d1ae36' }}>Checkout</Title>
            
            <Card 
              withBorder 
              p="md" 
              radius="md" 
              style={{ 
                background: 'rgba(25, 35, 55, 0.5)', 
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}
            >
              <Title order={4} style={{ color: 'white' }} mb="md">Order Summary</Title>
              <Stack spacing="xs">
                <Group position="apart">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Event:</Text>
                  <Text style={{ color: 'white' }}>{event.title}</Text>
                </Group>
                <Group position="apart">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Date:</Text>
                  <Text style={{ color: 'white' }}>{formattedDate}</Text>
                </Group>
                <Group position="apart">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Time:</Text>
                  <Text style={{ color: 'white' }}>{event.time}</Text>
                </Group>
                <Group position="apart">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Price per ticket:</Text>
                  <Text style={{ color: '#d1ae36' }}>${event.ticketPrice}</Text>
                </Group>
                <Group position="apart">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Number of tickets:</Text>
                  <Text style={{ color: 'white' }}>{formData.numberOfTickets}</Text>
                </Group>
                <Divider my="sm" color="rgba(255, 255, 255, 0.1)" />
                <Group position="apart">
                  <Text weight={700} size="lg" style={{ color: 'white' }}>Total:</Text>
                  <Text weight={700} size="lg" style={{ color: '#d1ae36' }}>${calculateTotal()}</Text>
                </Group>
              </Stack>
            </Card>
            
            <Box mt="md">
              <Text weight={500} mb="md" style={{ color: 'white' }}>Pay with PayPal:</Text>
              <Group mb="md" position="center">
                <Image 
                  src="/paypal-logo.png" 
                  alt="PayPal" 
                  width={150} 
                  fit="contain"
                  style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.5))' }}
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.target.src = 'https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png';
                  }}
                />
              </Group>
              <Box 
                id="paypal-button-container" 
                maw={300} 
                mx="auto" 
                p="md" 
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              />
            </Box>
            
            <Button
              variant="subtle"
              onClick={handleBackToForm}
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff'
                }
              }}
            >
              Back to booking form
            </Button>
          </Stack>
        </Card>
      </div>
    );
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div style={sharedStyles.wrapper}>
        <div style={sharedStyles.starsBackground}></div>
        
        <div style={sharedStyles.contentContainer}>
          <Container size="md">
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
              Event not found or has been removed.
            </Alert>
            <Button 
              component={Link} 
              to="/events" 
              mt="md"
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
              Back to Events
            </Button>
          </Container>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
                  to="/bookings"
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
              to={`/events/${id}`} 
              variant="subtle" 
              color="white" 
              leftSection={<IconCalendarEvent size={14} />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Event
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
              <Title order={2} mb="xl" style={{ color: '#fff' }}>
                {paymentStep ? 'Complete Payment' : 'Event Booking'}
              </Title>

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
                      <Title order={3} style={{ color: '#d1ae36' }}>{event.title}</Title>
                      
                      <Group spacing="xs">
                        <IconCalendarEvent size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{formattedDate}</Text>
                      </Group>
                      
                      <Group spacing="xs">
                        <IconClock size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{event.time}</Text>
                      </Group>
                      
                      <Group spacing="xs">
                        <IconMapPin size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{event.venue}</Text>
                      </Group>
                      
                      <Group spacing="xs">
                        <IconTicket size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Text weight={500} style={{ color: '#d1ae36' }}>${event.ticketPrice} per ticket</Text>
                      </Group>
                      
                      <Badge 
                        color={ticketsRemaining > 10 ? "green" : ticketsRemaining > 0 ? "orange" : "red"}
                        variant="filled"
                        size="lg"
                        mt="xs"
                      >
                        {ticketsRemaining > 0 
                          ? `${ticketsRemaining} tickets remaining` 
                          : "Sold Out"}
                      </Badge>
                      
                      {event.description && (
                        <Text mt="md" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{event.description}</Text>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>

                <Grid.Col md={5}>
                  {paymentStep ? (
                    renderPaymentSection()
                  ) : (
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
                          <NumberInput
                            label="Number of Tickets"
                            value={formData.numberOfTickets}
                            onChange={(value) => handleNumberChange("numberOfTickets", value)}
                            min={1}
                            max={ticketsRemaining}
                            disabled={ticketsRemaining <= 0}
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

                          <Card 
                            withBorder 
                            p="md" 
                            radius="md" 
                            style={{ 
                              background: 'rgba(25, 35, 55, 0.5)', 
                              border: '1px solid rgba(255, 255, 255, 0.1)' 
                            }}
                          >
                            <Group position="apart">
                              <Text weight={500} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Price per ticket:</Text>
                              <Text style={{ color: '#d1ae36' }}>${event.ticketPrice}</Text>
                            </Group>
                            <Group position="apart" mt="xs">
                              <Text weight={500} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Number of tickets:</Text>
                              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{formData.numberOfTickets}</Text>
                            </Group>
                            <Divider my="sm" />
                            <Group position="apart">
                              <Text weight={700} size="lg" style={{ color: 'white' }}>Total:</Text>
                              <Text weight={700} size="lg" style={{ color: '#d1ae36' }}>${calculateTotal()}</Text>
                            </Group>
                          </Card>

                          <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                            disabled={ticketsRemaining <= 0}
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
                            {ticketsRemaining <= 0 ? "Sold Out" : "Proceed to Payment"}
                          </Button>
                        </Stack>
                      </form>
                    </Card>
                  )}
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

export default EventBookingForm; 