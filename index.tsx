import React from 'react';
import ReactDOM from 'react-dom/client';
import AppProviders from './App'; // Import AppProviders as the root

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProviders /> {/* Render AppProviders */}
  </React.StrictMode>
);