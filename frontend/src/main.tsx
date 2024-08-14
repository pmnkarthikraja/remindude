import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { WeekProvider } from './components/weekContext';


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <WeekProvider>
      <App />
    </WeekProvider>
  </React.StrictMode>
);


