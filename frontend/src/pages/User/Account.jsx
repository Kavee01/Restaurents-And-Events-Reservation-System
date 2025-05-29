/* eslint-disable no-unused-vars */
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
  Card,
  Grid,
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
  IconSettings,
  IconReceipt,
  IconPencil,
  IconHistory,
} from "@tabler/icons-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import classes from "../User/Account.module.css";
import { getUser, logOut } from "../../service/users";
import useToast from "../../hooks/useToast";

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
  contentContainer: {
    width: '100%',
    padding: '5rem 0 3rem 0',
    position: 'relative',
    zIndex: 2,
    flex: 1,
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '0 1rem',
  },
  mainTitle: {
    fontSize: '3rem',
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
  accountCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '1rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '2rem',
  },
  statCard: {
    backgroundColor: 'rgba(209, 174, 54, 0.08)',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid rgba(209, 174, 54, 0.2)',
    height: '100%',
    transition: 'all 0.3s ease',
  },
  statTitle: {
    color: '#d1ae36',
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  statValue: {
    color: 'white',
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: '0.75rem',
  },
  statDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
  },
  actionButton: {
    backgroundColor: '#d1ae36',
    color: '#1a2a41',
    fontWeight: 600,
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: 'none',
    boxShadow: '0 4px 10px rgba(209, 174, 54, 0.3)',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: 'rgba(209, 174, 54, 0.2)',
    color: '#d1ae36',
    fontWeight: 600,
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(209, 174, 54, 0.3)',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
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

function Account() {
  const navigate = useNavigate();
  const { sendRequest } = useFetch();
  const [data, setData] = useState([]);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const { successToast, errorToast } = useToast();
  const [user, setUser] = useState(null);

  // Helper function to get display name
  const getDisplayName = (userObj) => {
    if (!userObj) return "";
    return userObj.name || userObj.user || 
           (typeof userObj.payload === 'object' && userObj.payload.name) || 
           "User";
  };

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUser();
    if (currentUser) {
      // Check if we have locally updated user info
      const localUserUpdates = localStorage.getItem("updatedUserInfo");
      if (localUserUpdates) {
        try {
          const updatedUser = JSON.parse(localUserUpdates);
          // Merge with current user data
          setUser({...currentUser, ...updatedUser});
        } catch (e) {
          console.error("Error parsing local user updates:", e);
          setUser(currentUser);
        }
      } else {
        setUser(currentUser);
      }
    } else {
      navigate("/signin");
      return;
    }
    getList();
    setLoading(false);
  }, [navigate]);

  //Returns user account type
  function checkAccountType() {
    if (user?.isOwner === true) {
      return "Admin";
    } else {
      return "User";
    }
  }

  //Retrieve number of booking data
  const getList = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/booking`,
        "GET"
      );
      setData(resData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

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
                    {getDisplayName(user)}
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
      </header>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={styles.contentContainer}>
          {/* Account Hero Section */}
          <div style={styles.heroSection}>
            <h1 style={styles.mainTitle}>My Account</h1>
            <p style={styles.subtitle}>
              Manage your profile information and view your booking history.
            </p>
          </div>

          {/* Account Dashboard */}
          <Container size="lg">
            {/* Account Info */}
            <div style={styles.accountCard}>
              <Text color="rgba(209, 174, 54, 0.9)" weight={600} size="md" style={{ marginBottom: '1rem' }}>
                ACCOUNT INFORMATION
              </Text>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing={30} style={{ marginBottom: '2rem' }}>
                {/* Welcome Card */}
                <div style={styles.statCard}>
                  <div style={styles.statTitle}>Account Dashboard</div>
                  <div style={styles.statValue}>Welcome</div>
                  <div style={styles.statDescription}>{getDisplayName(user)}</div>
                </div>
                
                {/* Account Type Card */}
                <div style={styles.statCard}>
                  <div style={styles.statTitle}>Account Type</div>
                  <div style={styles.statValue}>{checkAccountType()}</div>
                  <div style={styles.statDescription}>{user?.email}</div>
                </div>
                
                {/* Bookings Card */}
                <div style={styles.statCard}>
                  <div style={styles.statTitle}>Number Of Bookings</div>
                  <div style={styles.statValue}>{data.length || 0}</div>
                  <div style={styles.statDescription}>Manage your bookings</div>
                </div>
              </SimpleGrid>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <Link 
                  to="/account/edit" 
                  style={styles.actionButton}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 6px 15px rgba(209, 174, 54, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 10px rgba(209, 174, 54, 0.3)';
                  }}
                >
                  <IconPencil size={18} />
                  Edit Account Info
                </Link>
                <Link 
                  to="/account/bookings" 
                  style={styles.secondaryButton}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.2)';
                  }}
                >
                  <IconHistory size={18} />
                  View Bookings
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )}
      
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

export default Account;
