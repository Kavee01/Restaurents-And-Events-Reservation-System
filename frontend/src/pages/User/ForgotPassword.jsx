import React, { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  Container,
  Text
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch.jsx";
import useToast from "../../hooks/useToast";

// Define modern styles with animations - similar to the SignIn page
const styles = {
  wrapper: {
    width: '100vw',
    height: '100vh',
    padding: 0,
    margin: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundImage: 'url("/bg.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(10, 20, 30, 0.7) 0%, rgba(5, 15, 35, 0.8) 100%)',
    zIndex: 1
  },
  
  bubbles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    opacity: 0.5,
    background: 'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%), radial-gradient(circle at 15% 85%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 70%)'
  },
  
  floatingObject: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at center, rgba(209, 174, 54, 0.1), rgba(209, 174, 54, 0))',
    filter: 'blur(60px)',
    animation: 'float 15s ease-in-out infinite',
    zIndex: 1
  },
  
  floatingObject2: {
    position: 'absolute',
    right: '5%',
    bottom: '10%',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at center, rgba(60, 134, 160, 0.1), rgba(60, 134, 160, 0))',
    filter: 'blur(40px)',
    animation: 'float2 20s ease-in-out infinite',
    zIndex: 1
  },
  
  contentContainer: {
    width: '100%',
    height: '100%',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
  
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2.5rem',
    backgroundColor: 'rgba(10, 20, 30, 0.3)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
  },
  
  logoWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  
  logo: {
    fontSize: '1.25rem',
    color: 'white',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  },
  
  logoIcon: {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
    color: '#d1ae36',
    fontSize: '1rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  },
  
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  
  navItem: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  
  mainContent: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '2rem'
  },
  
  logoContainer: {
    width: '4.5rem',
    height: '4.5rem',
    borderRadius: '16px',
    background: 'rgba(15, 25, 40, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'fadeIn 0.8s ease-out'
  },
  
  logoBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(209, 174, 54, 0.05) 0%, rgba(209, 174, 54, 0.2) 100%)',
    opacity: 0.5
  },
  
  logoText: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#d1ae36',
    zIndex: 1,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  
  title: {
    fontSize: '2.5rem',
    fontWeight: '600',
    color: 'white',
    marginBottom: '0.75rem',
    textAlign: 'center',
    animation: 'fadeInUp 0.8s ease-out',
    animationDelay: '0.2s',
    animationFillMode: 'both'
  },
  
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '3rem',
    textAlign: 'center',
    maxWidth: '500px',
    lineHeight: '1.6',
    animation: 'fadeInUp 0.8s ease-out',
    animationDelay: '0.4s',
    animationFillMode: 'both'
  },
  
  formContainer: {
    width: '480px', 
    maxWidth: '90%',
    backgroundColor: 'rgba(15, 25, 40, 0.4)',
    borderRadius: '20px',
    padding: '2.5rem',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    animation: 'fadeInUp 0.8s ease-out',
    animationDelay: '0.6s',
    animationFillMode: 'both',
    position: 'relative',
    overflow: 'hidden'
  },
  
  formBgGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '100px',
    background: 'radial-gradient(ellipse at center, rgba(209, 174, 54, 0.15), rgba(209, 174, 54, 0))',
    filter: 'blur(40px)',
    borderRadius: '100%',
    zIndex: 0,
    opacity: 0.5,
    animation: 'pulse 6s ease-in-out infinite'
  },
  
  inputGroup: {
    marginBottom: '1.75rem',
    position: 'relative',
    zIndex: 1
  },
  
  inputStyles: {
    root: {
      marginBottom: 0,
      position: 'relative'
    },
    input: {
      height: '3.25rem',
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      fontSize: '1rem',
      padding: '0 1rem',
      transition: 'all 0.3s ease',
      '&:focus': {
        backgroundColor: 'rgba(255, 255, 255, 0.09)',
        borderColor: 'rgba(209, 174, 54, 0.5)',
        boxShadow: '0 0 0 3px rgba(209, 174, 54, 0.15)'
      },
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    label: {
      fontSize: '0.95rem',
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: '0.5rem',
      letterSpacing: '0.02em'
    }
  },
  
  resetButton: {
    width: '100%',
    height: '3.25rem',
    backgroundColor: '#3c86a0',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.75rem',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(60, 134, 160, 0.3)',
    '&:hover': {
      backgroundColor: '#4795b1',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(60, 134, 160, 0.4)'
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 10px rgba(60, 134, 160, 0.4)'
    }
  },
  
  linksContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2rem',
    width: '100%',
    padding: '1rem 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    zIndex: 1
  },
  
  link: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    position: 'relative',
    padding: '0.2rem 0',
    '&:hover': {
      color: '#d1ae36'
    },
    '&:hover::after': {
      transform: 'scaleX(1)',
      transformOrigin: 'bottom left'
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '100%',
      height: '1px',
      backgroundColor: '#d1ae36',
      transform: 'scaleX(0)',
      transformOrigin: 'bottom right',
      transition: 'transform 0.3s ease'
    }
  },
  
  footerWrapper: {
    width: '100%',
    zIndex: 3,
    backgroundColor: 'rgba(10, 20, 30, 0.3)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'fadeIn 0.8s ease-out',
    animationDelay: '0.8s',
    animationFillMode: 'both'
  },
  
  footerContent: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem'
  },
  
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)'
    }
  },
  
  footerLogoText: {
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  
  footerLinks: {
    display: 'flex',
    gap: '2rem'
  },
  
  footerLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    position: 'relative',
    padding: '0.2rem 0',
    '&:hover': {
      color: '#d1ae36'
    }
  },
  
  footerCopyright: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.85rem'
  },
  
  successMessage: {
    backgroundColor: 'rgba(25, 135, 84, 0.1)',
    color: '#1cc88a',
    border: '1px solid rgba(25, 135, 84, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    animation: 'fadeIn 0.8s ease-out'
  }
};

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [navHover, setNavHover] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Validate email format
    if (!emailRegex.test(email)) {
      errorToast({
        title: "Invalid Email",
        message: "Please enter a valid email address."
      });
      return;
    }
    
    setSubmitting(true);
    try {
      await sendRequest(
        `${import.meta.env.VITE_API_URL}/user/forgot-password`,
        "POST",
        { email }
      );
      
      setEmailSent(true);
      successToast({
        title: "Email Sent",
        message: "If your email is registered, you'll receive instructions to reset your password."
      });
      
      setSubmitting(false);
    } catch (err) {
      console.log(err);
      // Even if there's a server error, we'll still show a positive message to the user
      // This prevents user enumeration attacks and provides a better user experience
      setEmailSent(true);
      successToast({
        title: "Request Processed",
        message: "If your email is registered, you'll receive instructions to reset your password."
      });
      setSubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Apply keyframes styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translate(0, 0); }
        50% { transform: translate(-20px, 20px); }
        100% { transform: translate(0, 0); }
      }
      
      @keyframes float2 {
        0% { transform: translate(0, 0); }
        50% { transform: translate(20px, -20px); }
        100% { transform: translate(0, 0); }
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0% { opacity: 0.4; }
        50% { opacity: 0.7; }
        100% { opacity: 0.4; }
      }
      
      .float-obj {
        animation: float 15s ease-in-out infinite;
      }
      
      .float-obj2 {
        animation: float2 20s ease-in-out infinite;
      }
      
      .logo-container {
        animation: fadeIn 0.8s ease-out;
      }
      
      .title {
        animation: fadeInUp 0.8s ease-out 0.2s both;
      }
      
      .subtitle {
        animation: fadeInUp 0.8s ease-out 0.4s both;
      }
      
      .form-container {
        animation: fadeInUp 0.8s ease-out 0.6s both;
      }
      
      .form-glow {
        animation: pulse 6s ease-in-out infinite;
      }
      
      .footer {
        animation: fadeIn 0.8s ease-out 0.8s both;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.wrapper}>
      {/* Background elements */}
      <div style={styles.backgroundOverlay}></div>
      <div style={styles.bubbles}></div>
      <div className="float-obj" style={{...styles.floatingObject, top: '15%', left: '10%'}}></div>
      <div className="float-obj2" style={styles.floatingObject2}></div>
      
      {/* Content container */}
      <div style={styles.contentContainer}>
        {/* Header with navigation */}
        <header style={styles.header}>
          <div style={styles.logoWrapper}>
            <Link to="/" style={styles.logo}>
              <div style={styles.logoIcon}>P</div>
              PearlReserve
            </Link>
          </div>
          
          <nav style={styles.navigation}>
            <Link 
              to="/restaurants" 
              style={{
                ...styles.navItem,
                ...(navHover === 'restaurants' && { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white' 
                })
              }}
              onMouseEnter={() => setNavHover('restaurants')}
              onMouseLeave={() => setNavHover(null)}
            >
              Restaurants
            </Link>
            <Link 
              to="/events" 
              style={{
                ...styles.navItem,
                ...(navHover === 'events' && { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white' 
                })
              }}
              onMouseEnter={() => setNavHover('events')}
              onMouseLeave={() => setNavHover(null)}
            >
              Events
            </Link>
            <Link 
              to="/activities" 
              style={{
                ...styles.navItem,
                ...(navHover === 'activities' && { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white' 
                })
              }}
              onMouseEnter={() => setNavHover('activities')}
              onMouseLeave={() => setNavHover(null)}
            >
              Activities
            </Link>
            <Link 
              to="/services" 
              style={{
                ...styles.navItem,
                ...(navHover === 'services' && { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white' 
                })
              }}
              onMouseEnter={() => setNavHover('services')}
              onMouseLeave={() => setNavHover(null)}
            >
              Services
            </Link>
          </nav>
        </header>
        
        {/* Main content */}
        <main style={styles.mainContent}>
          <div className="logo-container" style={styles.logoContainer}>
            <div style={styles.logoBg}></div>
            <span style={styles.logoText}>PR</span>
          </div>
          
          <h1 className="title" style={styles.title}>Forgot Password</h1>
          <p className="subtitle" style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password
          </p>
          
          <div className="form-container" style={styles.formContainer}>
            <div className="form-glow" style={styles.formBgGlow}></div>
            
            {emailSent ? (
              <div style={styles.successMessage}>
                <Text size="lg" weight={600} mb={10}>Email Sent!</Text>
                <Text size="md">
                  If your email address is registered with us, you'll receive password reset instructions shortly.
                </Text>
              </div>
            ) : (
              <>
                <div style={styles.inputGroup}>
                  <TextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    required
                    withAsterisk={false}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    styles={styles.inputStyles}
                  />
                </div>
                
                <Button
                  fullWidth
                  onClick={handleSubmit}
                  loading={submitting}
                  sx={styles.resetButton}
                >
                  Reset Password
                </Button>
              </>
            )}
            
            <div style={styles.linksContainer}>
              <Link to="/signin" style={styles.link}>
                Back to Sign In
              </Link>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <div className="footer" style={styles.footerWrapper}>
          <div style={styles.footerContent}>
            <Link to="/" style={{textDecoration: 'none'}}>
              <div style={styles.footerLogo}>
                <div style={{...styles.logoIcon, width: '1.75rem', height: '1.75rem', fontSize: '0.85rem'}}>P</div>
                <span style={styles.footerLogoText}>PearlReserve</span>
              </div>
            </Link>
            
            <div style={styles.footerLinks}>
              <Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link>
              <Link to="/terms" style={styles.footerLink}>Terms of Service</Link>
              <Link to="/contact" style={styles.footerLink}>Contact Us</Link>
            </div>
            
            <div style={styles.footerCopyright}>
              ©2024 PearlReserve All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage; 