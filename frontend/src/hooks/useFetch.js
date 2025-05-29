import { useState } from 'react';
import { getApiUrl } from '../config/api';

function useFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const sendRequest = async (url, method = "GET", body = null, customHeaders = null) => {
    setIsLoading(true);
    setError(null);
    
    const normalizedUrl = getApiUrl(url);
    console.log(`[useFetch] Sending ${method} request to: ${normalizedUrl}`);
    
    // Prepare headers
    let headers = customHeaders || {
      "Content-Type": "application/json",
    };

    // Get token if it exists
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("[useFetch] Found token, adding Authorization header");
    } else {
      console.log("[useFetch] No token found in localStorage");
    }

    // Prepare request options
    const options = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (body && method !== "GET" && method !== "DELETE") {
      // If it's FormData, don't stringify and don't set Content-Type (browser will set it)
      if (body instanceof FormData) {
        options.body = body;
        delete options.headers['Content-Type']; // Let browser set this with boundary
      } else {
        options.body = JSON.stringify(body);
      }
      console.log("[useFetch] Request body:", body instanceof FormData ? "FormData object" : body);
    }

    try {
      console.log("[useFetch] Fetch options:", options);
      const response = await fetch(normalizedUrl, options);
      console.log(`[useFetch] Response status: ${response.status}`);
      
      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
        console.log("[useFetch] JSON response data:", responseData);
      } else {
        const text = await response.text();
        console.log("[useFetch] Text response:", text);
        responseData = { message: text };
      }
      
      // Check if response is ok
      if (!response.ok) {
        const errorMessage = responseData.errorMsg || responseData.message || "Something went wrong";
        console.error("[useFetch] Error response:", errorMessage);
        throw new Error(errorMessage);
      }
      
      setIsLoading(false);
      return responseData;
    } catch (err) {
      console.error("[useFetch] Error:", err);
      setError(err.message || "Something went wrong");
      setIsLoading(false);
      throw err;
    }
  };

  return { isLoading, error, sendRequest };
}

export default useFetch; 