import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider, DataProvider, ToastProvider } from './contexts';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
