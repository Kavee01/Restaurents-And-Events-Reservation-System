import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Menu,
  Text,
  rem,
  UnstyledButton,
  Group,
  Divider,
  TextInput,
  Textarea,
  Select,
  SimpleGrid,
} from "@mantine/core";
import { 
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
  IconBuildingCommunity,
  IconUser,
  IconPhone,
  IconMail,
  IconSend,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconBrandFacebook,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, logOut } from "../../service/users";
import useToast from "../../hooks/useToast";
import useFetch from "../../hooks/useFetch";

// Define luxury styles
const styles = {
  wrapper: {
    margin: 0,
    padding: 0,
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#080f17',
    backgroundImage: 'url("/bg7.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  starsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(10, 20, 30, 0.7) 0%, rgba(5, 15, 35, 0.8) 100%)',
    zIndex: 1,
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '1rem',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(209, 174, 54, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
    color: '#d1ae36',
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '0 1rem'
  },
  navItem: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.25rem',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent',
    position: 'relative',
  },
  navItemHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white'
  },
  authButtons: {
    display: 'flex',
    gap: '1rem',
  },
  signInButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(209, 174, 54, 0.3)',
    color: '#d1ae36',
    fontWeight: '600',
    padding: '0.5rem 1.25rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  signUpButton: {
    backgroundColor: '#d1ae36',
    border: 'none',
    color: '#1a2a41',
    fontWeight: '600',
    padding: '0.5rem 1.25rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  contentContainer: {
    width: '100%',
    padding: '5rem 0 3rem 0',
    position: 'relative',
    zIndex: 2,
    flex: 1,
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '4rem',
    padding: '0 1rem',
  },
  mainTitle: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: 'white',
    marginBottom: '1.5rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.7)',
    maxWidth: '700px',
    margin: '0 auto 2.5rem auto',
    lineHeight: 1.6,
  },
  ctaButton: {
    backgroundColor: '#d1ae36',
    color: '#1a2a41',
    fontWeight: 600,
    padding: '0.85rem 2rem',
    fontSize: '1.1rem',
    borderRadius: '0.5rem',
    border: 'none',
    boxShadow: '0 4px 10px rgba(209, 174, 54, 0.3)',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-block',
  },
  footerContainer: {
    position: 'relative',
    zIndex: 5,
    marginTop: 'auto',
    backgroundColor: 'rgba(15, 23, 35, 0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '2rem 0',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    padding: '0 2rem',
  },
  footerLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
  },
  copyright: {
    fontSize: '0.9rem',
  },
  // Contact page specific styles
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '1rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '2.5rem',
  },
  contactInfoCard: {
    backgroundColor: 'rgba(209, 174, 54, 0.08)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(209, 174, 54, 0.2)',
    height: '100%',
  },
  contactInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '1.5rem',
    transition: 'all 0.2s ease',
  },
  contactButton: {
    backgroundColor: '#d1ae36',
    color: '#1a2a41',
    fontWeight: 600,
    padding: '0.85rem 2rem',
    fontSize: '1.1rem',
    borderRadius: '0.5rem',
    border: 'none',
    boxShadow: '0 4px 10px rgba(209, 174, 54, 0.3)',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  infoIcon: {
    backgroundColor: 'rgba(209, 174, 54, 0.15)', 
    width: '45px', 
    height: '45px', 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem',
    color: '#d1ae36',
  },
  socialIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d1ae36',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid rgba(209, 174, 54, 0.2)',
  },
};

function Contact() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const navigate = useNavigate();
  const { successToast, errorToast } = useToast();
  const { sendRequest } = useFetch();

  useEffect(() => {
    // Check if user is logged in and set form data
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || "",
        email: currentUser.email || ""
      }));
    }
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/contact/create`,
        "POST",
        formData
      );
      
      successToast({
        title: "Message Sent!",
        message: "We'll get back to you soon.",
      });
      
      // Reset form after successful submission
      setFormData({
        name: user ? user.name : "",
        email: user ? user.email : "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      errorToast({
        title: "Error",
        message: "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.starsBackground}></div>
      
      {/* Header/Navigation */}
      <header style={styles.header}>
        <div style={styles.logoWrapper}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>P</div>
            <span>PearlReserve</span>
          </Link>
        </div>
        
        <nav style={styles.nav}>
          <Link 
            to="/restaurants" 
            style={styles.navItem}
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
            style={styles.navItem}
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
            style={styles.navItem}
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
            style={styles.navItem}
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
          <Link 
            to="/explore" 
            style={styles.navItem}
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
            Explore
          </Link>
          <Link 
            to="/gallery" 
            style={styles.navItem}
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
            Gallery
          </Link>
          <Link 
            to="/about" 
            style={styles.navItem}
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
            About
          </Link>
          <Link 
            to="/contact" 
            style={styles.navItem}
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
            Contact
          </Link>
        </nav>
        
        <div style={styles.authButtons}>
          {!user ? (
            <>
              <Link 
                to="/signin" 
                style={styles.signInButton}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <IconLogin size={16} />
                Sign in
              </Link>
              <Link 
                to="/signup" 
                style={styles.signUpButton}
                onMouseOver={(e) => {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <IconUserPlus size={16} />
                Sign up
              </Link>
            </>
          ) : (
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
                {!user?.isOwner && (
                  <>
          
                    <Menu.Item
                  component={Link}
                  to="/account"
                  leftSection={<IconUser size={16} color="#d1ae36" stroke={1.5} />}
                >
                  My Account
                </Menu.Item>
                
                <Menu.Item
                  component={Link}
                  to="/account/bookings"
                  leftSection={<IconCalendarEvent size={16} color="#d1ae36" stroke={1.5} />}
                >
                  My Bookings
                </Menu.Item>
                

                    
                    
                  </>
                )}

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
                      to="/owner/dashboard"
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
                      to="/owner/dashboard"
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
                      to="/owner/dashboard"
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
                      to="/owner/dashboard"
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
                    
                    <Divider 
                      my="xs" 
                      color="rgba(255, 255, 255, 0.1)" 
                      label={
                        <Text size="xs" weight={500} color="white">
                          Additional Services
                        </Text>
                      } 
                      labelPosition="center"
                    />
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/activities"
                      leftSection={
                        <IconActivity
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
                      Activities
                    </Menu.Item>
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/events"
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
                      Events
                    </Menu.Item>
                    
                    <Menu.Item
                      component={Link}
                      to="/owner/services"
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
                      Services
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

      <div style={styles.contentContainer}>
        {/* Contact Hero Section */}
        <div style={styles.heroSection}>
          <h1 style={styles.mainTitle}>Get in Touch</h1>
          <p style={styles.subtitle}>
            Have questions or need assistance with your bookings? Our team is here to help you with personalized support for your luxury experiences.
          </p>
        </div>

        {/* Contact Form and Information */}
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={30}>
            {/* Contact Form */}
            <div style={styles.contactCard}>
              <Text color="rgba(209, 174, 54, 0.9)" weight={600} size="md" style={{ marginBottom: '1rem' }}>
                SEND US A MESSAGE
              </Text>
              <Text color="white" weight={700} size="xl" style={{ marginBottom: '2rem' }}>
                We'd Love to Hear From You
              </Text>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem', display: 'block' }}>
                    Your Name
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={styles.contactInput}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem', display: 'block' }}>
                    Email Address
                  </label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={styles.contactInput}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem', display: 'block' }}>
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={styles.contactInput}
                    placeholder="Enter your phone number (optional)"
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem', display: 'block' }}>
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    style={styles.contactInput}
                  >
                    <option value="">Select a subject</option>
                    <option value="Reservation Inquiry">Reservation Inquiry</option>
                    <option value="Booking Issue">Booking Issue</option>
                    <option value="Partnership Opportunity">Partnership Opportunity</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem', display: 'block' }}>
                    Message
                  </label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    style={{
                      ...styles.contactInput,
                      minHeight: '150px',
                      resize: 'vertical'
                    }}
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <button 
                  type="submit"
                  style={styles.contactButton}
                  disabled={loading}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 6px 15px rgba(209, 174, 54, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 10px rgba(209, 174, 54, 0.3)';
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'} <IconSend size={18} />
                </button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div style={styles.contactInfoCard}>
              <Text color="rgba(209, 174, 54, 0.9)" weight={600} size="md" style={{ marginBottom: '1rem' }}>
                CONTACT INFORMATION
              </Text>
              <Text color="white" weight={700} size="xl" style={{ marginBottom: '2rem' }}>
                How to Reach Us
              </Text>
              
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={styles.infoIcon}>
                    <IconMapPin size={22} />
                  </div>
                  <div>
                    <Text color="white" weight={600} size="md">Our Location</Text>
                    <Text color="rgba(255, 255, 255, 0.7)" size="sm">
                      Dammissara Mawatha , Dodanduwa, Galle
                    </Text>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={styles.infoIcon}>
                    <IconMail size={22} />
                  </div>
                  <div>
                    <Text color="white" weight={600} size="md">Email Address</Text>
                    <Text color="rgba(255, 255, 255, 0.7)" size="sm">
                      kaveeshachathurindi@gmail.com
                    </Text>
              
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div style={styles.infoIcon}>
                    <IconPhone size={22} />
                  </div>
                  <div>
                    <Text color="white" weight={600} size="md">Phone Numbers</Text>
                    <Text color="rgba(255, 255, 255, 0.7)" size="sm">
                      +94 11 234 5678 (Reservations)
                    </Text>
                    <Text color="rgba(255, 255, 255, 0.7)" size="sm">
                      +94 71 7553 463 (Customer Service)
                    </Text>
                  </div>
                </div>
              </div>
              
              <Divider my="lg" color="rgba(255, 255, 255, 0.1)" />
              
              <Text color="white" weight={600} size="md" style={{ marginBottom: '1rem', marginTop: '1.5rem' }}>
                Connect With Us
              </Text>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div 
                  style={styles.socialIcon}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.15)';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <IconBrandFacebook size={20} />
                </div>
                
                <div 
                  style={styles.socialIcon}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.15)';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <IconBrandInstagram size={20} />
                </div>
                
                <div 
                  style={styles.socialIcon}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.15)';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <IconBrandWhatsapp size={20} />
                </div>
              </div>
              
              <div style={{ marginTop: '3rem', backgroundColor: 'rgba(209, 174, 54, 0.1)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px dashed rgba(209, 174, 54, 0.3)' }}>
                <Text color="rgba(209, 174, 54, 0.9)" weight={700} size="sm" style={{ marginBottom: '0.5rem' }}>
                  VIP CUSTOMER SERVICE
                </Text>
                <Text color="white" size="sm">
                  Need immediate assistance? Our VIP service team is available 24/7 to help with urgent inquiries.
                </Text>
                <Text color="#d1ae36" weight={700} size="md" style={{ marginTop: '0.5rem' }}>
                  +94 77 LUXURY (589789)
                </Text>
              </div>
            </div>
          </SimpleGrid>
          
         
        </Container>
      </div>
      
      {/* Custom Footer */}
      <footer style={styles.footerContainer}>
        <div style={styles.footerContent}>
          <div style={styles.copyright}>
            &copy; {new Date().getFullYear()} PearlReserve — Premium Booking Experiences
          </div>
          <div style={styles.footerLinks}>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              About Us
            </a>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => e.target.style.color = '#d1ae36'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              style={styles.footerLink}
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

export default Contact; 