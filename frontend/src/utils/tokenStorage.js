/**
 * Token storage utility to centralize token management
 */

const TOKEN_KEYS = {
    ACCESS_TOKEN: 'token',
    USER_DATA: 'userData'
  };
  
  /**
   * Get access token from localStorage
   * @returns {string|null} The access token or null if not found
   */
  export const getToken = () => {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  };
  
  /**
   * Set access token in localStorage
   * @param {string} token - The access token to store
   */
  export const setToken = (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
    } else {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    }
  };
  
  /**
   * Clear all authentication tokens
   */
  export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  };
  
  /**
   * Check if access token exists
   * @returns {boolean} True if access token exists
   */
  export const hasAccessToken = () => {
    return !!getToken();
  };
  
  /**
   * Store user data in localStorage
   * @param {Object} userData - User data to store
   */
  export const storeUserData = (userData) => {
    if (userData) {
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    } else {
      localStorage.removeItem(TOKEN_KEYS.USER_DATA);
    }
  };
  
  /**
   * Get user data from localStorage
   * @returns {Object|null} The user data object or null if not found
   */
  export const getUserData = () => {
    const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };
  
  /**
   * Clear user data
   */
  export const clearUserData = () => {
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  };
  
  /**
   * Clear all authentication related data
   */
  export const clearAuthData = () => {
    clearToken();
    clearUserData();
  };
  
  export default {
    getToken,
    setToken,
    hasAccessToken,
    storeUserData,
    getUserData,
    clearUserData,
    clearAuthData
  };