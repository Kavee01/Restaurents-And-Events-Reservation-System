/**
 * Admin account checker utility
 * This initializes the admin account when the application loads
 */

/**
 * Calls the backend to ensure the admin user exists
 * If it doesn't exist, the backend will create it
 */
export async function ensureAdminExists() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/check-admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Admin check completed:', data.message);
      return true;
    } else {
      console.error('Failed to check admin account:', data.errorMsg);
      return false;
    }
  } catch (error) {
    console.error('Error checking admin account:', error);
    return false;
  }
} 