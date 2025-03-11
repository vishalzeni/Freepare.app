import React, { createContext, useState, useContext, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

// Create a Context
const SessionContext = createContext();

// Provider Component
export const SessionProvider = ({ children }) => {
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Function to check token expiry
  const checkTokenExpiry = () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds

        // If the token expiry time is less than current time, show dialog
        if (decodedToken.exp < currentTime) {
          setIsTokenExpired(true);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  };

  // Use Effect to check token expiry when the app loads
  useEffect(() => {
    checkTokenExpiry();
  }, []);

  useEffect(() => {
    if (isTokenExpired) {
      setOpenDialog(true); // Show dialog if token is expired
    }
  }, [isTokenExpired]);

  // Function to handle login click (redirect to login page)
  const handleLoginClick = () => {
    localStorage.removeItem('jwtToken'); // Clear expired token
    window.open('/login', '_blank'); // Open the login page in a new tab
  };

  return (
    <SessionContext.Provider value={{ openDialog, setOpenDialog, handleLoginClick }}>
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use session context
export const useSession = () => {
  return useContext(SessionContext);
};
