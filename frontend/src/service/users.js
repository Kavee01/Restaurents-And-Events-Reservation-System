/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import useFetch from "../hooks/useFetch";
import { getToken, removeToken } from "../util/security";

export function getUser() {
  try {
    const token = getToken();
    if (!token) return null;
    
    // Parse the token payload
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    const payload = tokenData.payload || tokenData;
    
    // For the admin user, ensure the isAdmin flag is set
    if (payload.email === 'admin') {
      payload.isAdmin = true;
    }
    
    // Ensure we have consistent ID fields
    if (payload.id && !payload._id) {
      payload._id = payload.id;
    } else if (payload._id && !payload.id) {
      payload.id = payload._id;
    }
    
    console.log('User data from token:', {
      id: payload.id,
      _id: payload._id,
      email: payload.email,
      isAdmin: payload.isAdmin,
      isOwner: payload.isOwner
    });
    
    return payload;
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("token"); // Clear invalid token
    return null;
  }
}

export function logOut() {
  localStorage.removeItem("token");
}

export function validateToken() {
  try {
    const token = getToken();
    if (!token) return false;
    
    // Parse the token expiration time
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    const exp = tokenData.exp;
    
    // Check if token is expired
    if (exp && Date.now() >= exp * 1000) {
      // Token is expired
      localStorage.removeItem("token");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    localStorage.removeItem("token"); // Clear invalid token
    return false;
  }
}