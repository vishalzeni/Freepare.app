import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css'; // Import the global CSS file

// Remove ColorModeContext and related code

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
