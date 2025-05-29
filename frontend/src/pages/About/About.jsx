import { useState, useEffect } from "react";
import {
  Container,
  Text,
  UnstyledButton,
  Group,
  rem,
  Menu,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import {
  IconLogin,
  IconUserPlus,
  IconUser,
  IconChevronDown,
  IconHistory,
  IconStar,
  IconAward,
  IconUsers,
  IconBuildingEstate,
  IconChefHat,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconMapPin,
  IconBuildingCommunity,
  IconSwimming,
  IconToolsKitchen2,
  IconActivity,
  IconLogout,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, logOut } from "../../service/users";
import useToast from "../../hooks/useToast";
import useFetch from "../../hooks/useFetch";

// Define luxury styles (reusing the same style structure)
const styles = {
  wrapper: {
    margin: 0,
    padding: 0,
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#080f17',
    backgroundImage: 'url("/bg3.jpg")',
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
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
  },
  statCard: {
    backgroundColor: 'rgba(209, 174, 54, 0.08)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(209, 174, 54, 0.2)',
    textAlign: 'center',
  },
  teamCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '1rem',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
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
};

function About() {
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
        {/* About Hero Section */}
        <div style={styles.heroSection}>
          <h1 style={styles.mainTitle}>Our Story</h1>
          <p style={styles.subtitle}>
            Discover the essence of luxury dining and exceptional hospitality at PearlReserve, where every moment is crafted to perfection.
          </p>
        </div>

        {/* About Content */}
        <Container size="lg">
          {/* Our Mission Section */}
          <div style={{ marginBottom: '4rem' }}>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing={30}>
              <div style={styles.featureCard}>
                <div style={{ marginBottom: '1.5rem', color: '#d1ae36' }}>
                  <IconHistory size={40} />
                </div>
                <Text color="white" weight={700} size="lg" style={{ marginBottom: '1rem' }}>
                  Our Legacy
                </Text>
                <Text color="rgba(255, 255, 255, 0.7)" size="sm" style={{ lineHeight: 1.6 }}>
                  Founded in 2025, PearlReserve has revolutionized the way people experience luxury dining and events in Sri Lanka.
                </Text>
              </div>

              <div style={styles.featureCard}>
                <div style={{ marginBottom: '1.5rem', color: '#d1ae36' }}>
                  <IconStar size={40} />
                </div>
                <Text color="white" weight={700} size="lg" style={{ marginBottom: '1rem' }}>
                  Our Mission
                </Text>
                <Text color="rgba(255, 255, 255, 0.7)" size="sm" style={{ lineHeight: 1.6 }}>
                  To provide unparalleled dining experiences by connecting food enthusiasts with the finest restaurants in Sri Lanka.
                </Text>
              </div>

              <div style={styles.featureCard}>
                <div style={{ marginBottom: '1.5rem', color: '#d1ae36' }}>
                  <IconAward size={40} />
                </div>
                <Text color="white" weight={700} size="lg" style={{ marginBottom: '1rem' }}>
                  Our Vision
                </Text>
                <Text color="rgba(255, 255, 255, 0.7)" size="sm" style={{ lineHeight: 1.6 }}>
                  To become the leading platform for premium dining experiences and culinary excellence in South Asia.
                </Text>
              </div>
            </SimpleGrid>
          </div>

          {/* Statistics Section */}
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <Text color="rgba(209, 174, 54, 0.9)" weight={600} size="md" style={{ marginBottom: '1rem' }}>
              OUR IMPACT
            </Text>
            <Text color="white" weight={700} size="xl" style={{ marginBottom: '2rem' }}>
              Numbers That Define Us
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={30}>
              <div style={styles.statCard}>
                <IconUsers size={40} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
                <Text color="white" weight={700} size="xl">50,000+</Text>
                <Text color="rgba(255, 255, 255, 0.7)" size="sm">Happy Customers</Text>
              </div>

              <div style={styles.statCard}>
                <IconBuildingEstate size={40} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
                <Text color="white" weight={700} size="xl">200+</Text>
                <Text color="rgba(255, 255, 255, 0.7)" size="sm">Partner Restaurants</Text>
              </div>

              <div style={styles.statCard}>
                <IconChefHat size={40} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
                <Text color="white" weight={700} size="xl">1,000+</Text>
                <Text color="rgba(255, 255, 255, 0.7)" size="sm">Special Events</Text>
              </div>

              <div style={styles.statCard}>
                <IconStar size={40} style={{ color: '#d1ae36', marginBottom: '1rem' }} />
                <Text color="white" weight={700} size="xl">4.8/5</Text>
                <Text color="rgba(255, 255, 255, 0.7)" size="sm">Customer Rating</Text>
              </div>
            </SimpleGrid>
          </div>

          
          {/* Social Proof Section */}
          <div style={{ 
            backgroundColor: 'rgba(209, 174, 54, 0.08)', 
            padding: '3rem', 
            borderRadius: '1rem',
            border: '1px solid rgba(209, 174, 54, 0.2)',
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            <Text color="rgba(209, 174, 54, 0.9)" weight={600} size="md" style={{ marginBottom: '1rem' }}>
              JOIN OUR COMMUNITY
            </Text>
            <Text color="white" weight={700} size="xl" style={{ marginBottom: '2rem' }}>
              Connect With Us
            </Text>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
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
                <IconBrandFacebook size={24} />
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
                <IconBrandInstagram size={24} />
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
                <IconBrandWhatsapp size={24} />
              </div>
            </div>
          </div>
      </Container>
      </div>

      {/* Footer */}
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

export default About; 