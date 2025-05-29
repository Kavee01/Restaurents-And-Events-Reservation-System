/**
 * API Configuration
 * 
 * This file centralizes API configuration for the application.
 * It provides utilities for working with API URLs and endpoints.
 */

// Get the base API URL from environment variables or use a fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to construct full API URLs from endpoints
export const getApiUrl = (endpoint) => {
  // Check if the URL is already absolute
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Endpoint constants for better maintainability
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: 'user/login',
  LOGOUT: 'user/logout',
  
  // Owner management endpoints
  OWNER_ACTIVITIES: 'activities/owner-activities',
  OWNER_EVENTS: 'events/owner-events',
  OWNER_SERVICES: 'services/owner-services',
  
  // Booking management endpoints
  ACTIVITY_BOOKINGS: 'activitybooking/owner-bookings',
  EVENT_BOOKINGS: 'eventbooking/owner-bookings',
  SERVICE_BOOKINGS: 'servicebooking/owner-bookings',
  
  // Function to generate booking endpoints with IDs
  getActivityBookingById: (id) => `activitybooking/${id}`,
  getEventBookingById: (id) => `eventbooking/${id}`,
  getServiceBookingById: (id) => `servicebooking/${id}`,
  
  // Function to generate booking actions
  confirmActivityBooking: (id) => `activitybooking/${id}/confirm`,
  confirmEventBooking: (id) => `eventbooking/${id}/confirm`,
  confirmServiceBooking: (id) => `servicebooking/${id}/confirm`,
  
  cancelActivityBooking: (id) => `activitybooking/${id}/cancel`,
  cancelEventBooking: (id) => `eventbooking/${id}/cancel`,
  cancelServiceBooking: (id) => `servicebooking/${id}/cancel`,
};

export default {
  API_BASE_URL,
  getApiUrl,
  ENDPOINTS,
}; 