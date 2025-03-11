import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from './theme'; // Only import lightTheme
import './global.css'; // Import the global CSS file

// Remove ColorModeContext and related code

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const Main = () => {
  const theme = useMemo(() => lightTheme, []); // Use only lightTheme

  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
