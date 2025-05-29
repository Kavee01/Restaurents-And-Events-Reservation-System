import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import SignInPage from "./pages/User/Signin";
import SignUpPage from "./pages/User/Signup";
import Account from "./pages/User/Account";
import EditAccount from "./pages/User/EditAccount";
import ForgotPassword from "./pages/User/ForgotPassword";
import ResetPassword from "./pages/User/ResetPassword";
import BookingList from "./pages/User/BookingList";
import OwnerDashboard from "./pages/Owner/OwnerDashboard";
import RestaurantInfo from "./pages/Owner/RestaurantInfo";
import NewRestaurant from "./pages/Owner/NewRestaurant";
import EditRestaurant from "./pages/Owner/EditRestaurant";
import NewBooking from "./pages/Restaurant/NewBooking";
import NotFound from "./pages/NotFound";
import EditBooking from "./pages/Booking/EditBooking";
import { Layout } from "./components/Layout/Layout";
import RestaurantList from "./pages/Restaurant/RestaurantList";
import RestaurantDetail from "./pages/Restaurant/RestaurantDetail";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import OwnerRestaurantList from "./pages/Owner/RestaurantList";
import mantineTheme from "./theme/mantineTheme";
import RestaurantContainer from "./pages/Restaurant/RestaurantContainer";
import EventContainer from "./pages/Event/EventContainer";
import ActivityContainer from "./pages/Activity/ActivityContainer";
import ServiceContainer from "./pages/Service/ServiceContainer";
import { ensureAdminExists } from "./util/adminChecker";

// Import new components
import ActivityList from "./pages/Owner/ActivityList";
import ActivityForm from "./pages/Owner/ActivityForm";
import EventList from "./pages/Owner/EventList";
import EventForm from "./pages/Owner/EventForm";
import ServiceList from "./pages/Owner/ServiceList";
import ServiceForm from "./pages/Owner/ServiceForm";

// Import public list and detail pages
import PublicEventList from "./pages/Event/EventList";
import EventDetail from "./pages/Event/EventDetail";
import EventBookingForm from "./pages/Event/EventBookingForm";
import PublicActivityList from "./pages/Activity/ActivityList";
import ActivityDetail from "./pages/Activity/ActivityDetail";
import ActivityBookingForm from "./pages/Activity/ActivityBookingForm";
import PublicServiceList from "./pages/Service/ServiceList";
import ServiceDetail from "./pages/Service/ServiceDetail";
import ServiceBookingForm from "./pages/Service/ServiceBookingForm";
import HomeContainer from "./pages/Home/HomeContainer";

// Import specialized booking pages
import ActivityBookings from "./pages/Activity/ActivityBookings";
import EventBookings from "./pages/Event/EventBookings";
import ServiceBookings from "./pages/Service/ServiceBookings";



// Import admin pages
import AdminDashboard from "./pages/Admin/Dashboard";

// Import new pages
import Explore from "./pages/Explore/Explore";
import Gallery from "./pages/Gallery/Gallery";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";

// Initialize admin account
ensureAdminExists().then(result => {
  console.log('Admin account check completed');
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <MantineProvider theme={mantineTheme} defaultColorScheme="light">
        <Notifications />
        <Routes>
          {/* Full-page routes outside of layout */}
          <Route path="/" element={<HomeContainer />} />
          <Route path="/restaurants" element={<RestaurantContainer />} />
          <Route path="/events" element={<EventContainer />} />
          <Route path="/activities" element={<ActivityContainer />} />
          <Route path="/services" element={<ServiceContainer />} />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          
          <Route path="/" element={<Layout />}>
            {/* Root */}
            {/* <Route path="/restaurants" element={<RestaurantList />} /> */}
            
            {/* Public Event Routes */}
            {/* <Route path="/events" element={<PublicEventList />} /> */}
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/booking" element={<EventBookingForm />} />
            
            {/* Public Activity Routes */}
            {/* <Route path="/activities" element={<PublicActivityList />} /> */}
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/activities/:id/booking" element={<ActivityBookingForm />} />
            
            {/* Public Service Routes */}
            {/* <Route path="/services" element={<PublicServiceList />} /> */}
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/services/:id/booking" element={<ServiceBookingForm />} />

            {/* Auth */}
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Account */}
            <Route path="/account" element={<Account />} />
            <Route path="/account/edit" element={<EditAccount />} />
            <Route path="/account/bookings" element={<BookingList />} />
            <Route path="/bookings" element={<BookingList />} />
            
            {/* Specialized Booking Pages */}
            <Route path="/bookings/activities" element={<ActivityBookings />} />
            <Route path="/bookings/events" element={<EventBookings />} />
            <Route path="/bookings/services" element={<ServiceBookings />} />

            {/* Restaurant */}
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route
              path="/restaurant/:id/new-booking"
              element={<NewBooking />}
            />

            {/* Booking */}
            <Route path="/booking/:id/edit" element={<EditBooking />} />

            {/* Owner */}
            <Route path="/owner/restaurants" element={<OwnerRestaurantList />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/dashboard/:restaurantId" element={<OwnerDashboard />} />
            <Route path="/owner/restaurant/NewRestaurant" element={<NewRestaurant />} />
            <Route path="/owner/restaurant/:restaurantId" element={<RestaurantInfo />} />
            <Route path="/owner/restaurant/:restaurantId/edit" element={<EditRestaurant />} />
            

            
            {/* Activities */}
            <Route path="/owner/activities" element={<ActivityList />} />
            <Route path="/owner/activities/new" element={<ActivityForm />} />
            <Route path="/owner/activities/:id/edit" element={<ActivityForm />} />
            
            {/* Events */}
            <Route path="/owner/events" element={<EventList />} />
            <Route path="/owner/events/new" element={<EventForm />} />
            <Route path="/owner/events/:id/edit" element={<EventForm />} />
            
            {/* Services */}
            <Route path="/owner/services" element={<ServiceList />} />
            <Route path="/owner/services/new" element={<ServiceForm />} />
            <Route path="/owner/services/:id/edit" element={<ServiceForm />} />
          </Route>

          {/* New Routes */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MantineProvider>
    </Router>
  </React.StrictMode>
);
