import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CssBaseline from '@mui/material/CssBaseline';


// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Restaurant Owner Components
import ManageEvents from './pages/restaurant/ManageEvents';
import ManageRestaurant from './pages/restaurant/ManageRestaurant';
import ManageRestaurants from './pages/restaurant/ManageRestaurants';

// Customer Components
import BrowseRestaurants from './pages/customer/BrowseRestaurants';
import Calendar from './pages/restaurant/Calendar';
import ManageReservations from './pages/customer/ManageReservations';
import ManageEventBookings from './pages/customer/ManageEventBookings';
import MyEventBookings from './pages/customer/MyEventBookings';

// Layout Components
import Layout from './components/Layout';

// Context
import { AuthProvider } from './contexts/AuthContext';

// New import for Profile component
import Profile from './pages/profile/Profile';

// New import for Home component
import Home from './pages/Home';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Restaurant Owner Routes */}

              <Route
                path="/restaurant/events"
                element={
                  <Layout>
                    <ManageEvents />
                  </Layout>
                }
              />
              <Route
                path="/restaurant/manage"
                element={
                  <Layout>
                    <ManageRestaurant />
                  </Layout>
                }
              />
              <Route
                path="/restaurant/restaurants"
                element={
                  <Layout>
                    <ManageRestaurants />
                  </Layout>
                }
              />

              {/* Restaurant Owner Routes */}
              <Route
                path="/restaurant/Calendar"
                element={
                  <Layout>
                    <Calendar />
                  </Layout>
                }
              />
              <Route
                path="/customer/dashboard"
                element={
                  <Layout>
                    <BrowseRestaurants />
                  </Layout>
                }
              />
              <Route
                path="/browse"
                element={
                  <Layout>
                    <BrowseRestaurants />
                  </Layout>
                }
              />
              <Route
                path="/reservations"
                element={
                  <Layout>
                    <ManageReservations />
                  </Layout>
                }
              />
              <Route
                path="/event-bookings"
                element={
                  <Layout>
                    <ManageEventBookings />
                  </Layout>
                }
              />
              <Route
                path="/customer/events"
                element={
                  <Layout>
                    <MyEventBookings />
                  </Layout>
                }
              />

              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <Layout>
                    <Profile />
                  </Layout>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
