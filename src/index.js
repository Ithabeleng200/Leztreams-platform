import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './components/AuthContext'; // ✅ Import it here

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap the entire app */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Optional performance logging
reportWebVitals();
