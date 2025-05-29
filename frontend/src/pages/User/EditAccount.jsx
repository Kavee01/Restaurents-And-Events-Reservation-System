/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Text,
  Title,
  SimpleGrid,
  TextInput,
  Button,
  Group,
  Checkbox,
  Container,
  Divider,
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
  IconBuildingCommunity,
  IconUser,
  IconSettings,
  IconArrowLeft,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import useFetch from "../../hooks/useFetch";
import useToast from "../../hooks/useToast";
import { getUser, logOut } from "../../service/users";

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
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '1rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '2rem',
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#d1ae36',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  formInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(209, 174, 54, 0.3)',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  currentInfoCard: {
    backgroundColor: 'rgba(209, 174, 54, 0.08)',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid rgba(209, 174, 54, 0.2)',
    marginBottom: '1.5rem'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  infoIcon: {
    color: '#d1ae36',
    marginRight: '0.75rem',
    marginTop: '0.25rem'
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.85rem',
    marginBottom: '0.25rem'
  },
  infoValue: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500'
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
  checkboxLabel: {
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '500',
    paddingLeft: '0.5rem'
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

function EditAccount() {
  const navigate = useNavigate();
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  
  // Current user
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
      // Debug: Log all fields in the user object
      console.log("User data from token:", currentUser);
      
      // Check if we have locally updated user info
      const localUserUpdates = localStorage.getItem("updatedUserInfo");
      let mergedUser = { ...currentUser };
      
      if (localUserUpdates) {
        try {
          const updatedUser = JSON.parse(localUserUpdates);
          console.log("Local storage updates:", updatedUser);
          // Merge with current user data
          mergedUser = { ...currentUser, ...updatedUser };
        } catch (e) {
          console.error("Error parsing local user updates:", e);
        }
      }
      
      setUser(mergedUser);
      
      // Try multiple potential field names for the user's name
      const userName = mergedUser.name || mergedUser.user || 
                     (typeof mergedUser.payload === 'object' && mergedUser.payload.name) || 
                     ""; 
      
      // Set form values from merged user data
      setEmail(mergedUser.email || "");
      setName(userName);
      setAddress(mergedUser.address || "");
      setIsOwner(mergedUser.isOwner || false);
      
      console.log("Final user data loaded:", { email: mergedUser.email, name: userName, isOwner: mergedUser.isOwner });
      setLoading(false);
    } else {
      navigate("/signin");
      return;
    }
  }, [navigate]);

  // Handle form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!email || !name) {
      errorToast({
        title: "Missing Information",
        message: "Email and Name are required fields.",
      });
      return;
    }
    
    setLoading(true);

    try {
      // Prepare update data with all potential name fields
      const updatedUserData = {
        email: email,
        name: name,
        user: name, // Also set 'user' field
        address: address,
        isOwner: isOwner
      };

      console.log("Updating user with data:", updatedUserData);
      
      // Send update request to backend
      try {
        const response = await sendRequest(
          `${import.meta.env.VITE_API_URL}/user/update`,
          "PUT",
          updatedUserData
        );
        
        console.log("API response:", response);
        
        // Store updated info in localStorage as well for consistency
        if (user) {
          const updatedUser = { 
            ...user,
            ...updatedUserData
          };
          localStorage.setItem("updatedUserInfo", JSON.stringify(updatedUser));
        }
        
        successToast({
          title: "Success!",
          message: "Your account information has been updated.",
        });
      } catch (apiError) {
        console.warn("API update failed, using local fallback:", apiError);
        
        // Fallback: Store updated values in localStorage to persist
        if (user) {
          const updatedUser = { 
            ...user,
            ...updatedUserData
          };
          
          // Store updated info in localStorage 
          localStorage.setItem("updatedUserInfo", JSON.stringify(updatedUser));
          
          successToast({
            title: "Success!",
            message: "Your account information has been updated locally.",
          });
        }
      }

      // Navigate back to account page
      navigate("/account");
    } catch (error) {
      setLoading(false);
      errorToast({
        title: "Update Failed",
        message: error.message || "Failed to update account information. Please try again.",
      });
    }
  };

  // Handle logout
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
          <Button
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
            onClick={handleLogout}
          >
            <Group gap={7}>
              <IconLogout size={16} />
              <Text fw={500} size="sm" lh={1} mr={3}>
                Logout ({getDisplayName(user)})
              </Text>
            </Group>
          </Button>
        )}
      </header>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={styles.contentContainer}>
          {/* Account Hero Section */}
          <div style={styles.heroSection}>
            <h1 style={styles.mainTitle}>Edit Your Account</h1>
            <p style={styles.subtitle}>
              Update your profile information below.
            </p>
          </div>

          {/* Edit Account Form */}
          <Container size="md">
            <div style={styles.formCard}>
              <Text color="rgba(209, 174, 54, 0.9)" weight={600} size="md" style={{ marginBottom: '1.5rem' }}>
                CURRENT ACCOUNT INFORMATION
              </Text>
              
              {/* Current Info Display */}
              <div style={styles.currentInfoCard}>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>
                    <IconUser size={18} />
                  </div>
                  <div style={styles.infoContent}>
                    <div style={styles.infoLabel}>Name</div>
                    <div style={styles.infoValue}>{getDisplayName(user)}</div>
                  </div>
                </div>
                
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>
                    <IconMapPin size={18} />
                  </div>
                  <div style={styles.infoContent}>
                    <div style={styles.infoLabel}>Email</div>
                    <div style={styles.infoValue}>{user?.email}</div>
                  </div>
                </div>
                
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>
                    <IconBuildingCommunity size={18} />
                  </div>
                  <div style={styles.infoContent}>
                    <div style={styles.infoLabel}>Account Type</div>
                    <div style={styles.infoValue}>{user?.isOwner ? 'Admin/Owner' : 'Customer'}</div>
                  </div>
                </div>
              </div>
              
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '2rem 0' }} />
              
              <Text color="rgba(209, 174, 54, 0.9)" weight={600} size="md" style={{ marginBottom: '1.5rem' }}>
                UPDATE YOUR INFORMATION
              </Text>
              
              {/* Edit Form */}
              <form onSubmit={handleUpdate}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    style={styles.formInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(209, 174, 54, 0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(209, 174, 54, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(209, 174, 54, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Name</label>
                  <input
                    type="text"
                    style={styles.formInput}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(209, 174, 54, 0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(209, 174, 54, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(209, 174, 54, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Address (optional)</label>
                  <input
                    type="text"
                    style={styles.formInput}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(209, 174, 54, 0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(209, 174, 54, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(209, 174, 54, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                

                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    type="submit" 
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
                    <IconDeviceFloppy size={18} />
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    style={styles.secondaryButton}
                    onClick={() => navigate('/account')}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'rgba(209, 174, 54, 0.2)';
                    }}
                  >
                    <IconArrowLeft size={18} />
                    Back to Account
                  </button>
                </div>
              </form>
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

export default EditAccount;
