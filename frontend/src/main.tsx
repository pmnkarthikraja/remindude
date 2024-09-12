import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { WeekProvider } from './components/weekContext';
import { UserProvider } from './components/userContext';


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
          <UserProvider>
    <WeekProvider>
      <App />
    </WeekProvider>
    </UserProvider>
  </React.StrictMode>
);


