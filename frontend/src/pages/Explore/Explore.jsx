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
  Grid,
  Card,
  Badge,
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
  IconSwimming,
  IconCategory,
  IconCompass,
  IconBeach,
  IconMountain,
  IconBuildingMonument,
  IconTree,
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
  // Styles specific to Explore page
  exploreCategoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'white',
    marginBottom: '0.5rem',
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },
  exploreButton: {
    backgroundColor: 'rgba(209, 174, 54, 0.2)',
    color: '#d1ae36',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  destinationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  badge: {
    backgroundColor: 'rgba(209, 174, 54, 0.2)',
    color: '#d1ae36',
    fontSize: '0.8rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
    display: 'inline-block',
  },
};

function Explore() {
  const [user, setUser] = useState(null);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const navigate = useNavigate();
  const { successToast, errorToast } = useToast();
  const { sendRequest } = useFetch();

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    try {
      const res = sendRequest(
        `${import.meta.env.VITE_API_URL}/user/logout`,
        "POST",
        { email: user.email }
      );
      logOut();
      setUser(null);
      navigate("/");
      successToast({
        title: "Success",
        message: "Logged out successfully",
      });
    } catch (error) {
      errorToast({
        title: "Error",
        message: "Failed to logout",
      });
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.starsBackground}></div>
      
      {/* Header/Navigation - Same as Home */}
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
        {/* Explore Hero Section */}
        <div style={styles.heroSection}>
          <h1 style={styles.mainTitle}>Explore Sri Lanka's Hidden Treasures</h1>
          <p style={styles.subtitle}>
            Discover the magic of Sri Lanka - from pristine beaches and lush mountains to ancient temples and vibrant culture. Let PearlReserve guide you to unforgettable experiences across this tropical paradise.
          </p>
        </div>

        
        {/* Travel Experience Section */}
        <Container size="lg" style={{ marginBottom: '4rem' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '1rem',
            padding: '3rem 2rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
          }}>
            <Text color="rgba(209, 174, 54, 0.9)" weight={600} size="md" style={{ marginBottom: '1rem' }}>
              TRAVEL WITH CONFIDENCE
            </Text>
            <Text color="white" weight={700} size="2rem" style={{ marginBottom: '1.5rem' }}>
              Curated Experiences by Local Experts
            </Text>
            <Text color="rgba(255, 255, 255, 0.7)" style={{ maxWidth: '800px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Our team of local travel experts has handpicked the best experiences Sri Lanka has to offer. From hidden gems to must-see attractions, we'll help you discover the authentic beauty of the island while providing premium service every step of the way.
            </Text>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
              <div style={{ maxWidth: '200px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(209, 174, 54, 0.15)', 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <IconMapPin size={30} color="#d1ae36" />
                </div>
                <Text color="white" weight={600} size="lg" style={{ marginBottom: '0.5rem' }}>
                  Guided Tours
                </Text>
                <Text color="rgba(255, 255, 255, 0.6)" size="sm">
                  Expert local guides to show you the best spots
                </Text>
              </div>
              
              <div style={{ maxWidth: '200px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(209, 174, 54, 0.15)', 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <IconStar size={30} color="#d1ae36" />
                </div>
                <Text color="white" weight={600} size="lg" style={{ marginBottom: '0.5rem' }}>
                  Premium Service
                </Text>
                <Text color="rgba(255, 255, 255, 0.6)" size="sm">
                  Luxury accommodations and transportation
                </Text>
              </div>
              
              <div style={{ maxWidth: '200px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(209, 174, 54, 0.15)', 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <IconHeart size={30} color="#d1ae36" />
                </div>
                <Text color="white" weight={600} size="lg" style={{ marginBottom: '0.5rem' }}>
                  Authentic Experiences
                </Text>
                <Text color="rgba(255, 255, 255, 0.6)" size="sm">
                  Connect with local culture and traditions
                </Text>
              </div>
            </div>
            
            <div style={{ marginTop: '2.5rem' }}>
              <Link 
                to="/contact" 
                style={{
                  ...styles.ctaButton,
                  backgroundColor: '#d1ae36',
                  color: '#1a2a41',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 6px 15px rgba(209, 174, 54, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 10px rgba(209, 174, 54, 0.3)';
                }}
              >
                Plan Your Journey
              </Link>
            </div>
          </div>
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

export default Explore; 