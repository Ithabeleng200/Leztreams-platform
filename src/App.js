// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateArtist from './pages/CreateArtist';
import CreateMentor from './pages/CreateMentor';
import ArtistDashboard from './pages/ArtistDashboard';
import MentorDashboard from './pages/MentorDashboard';
import Marketplace from './pages/Marketplace';
import Help from './pages/Help';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import MyAccount from './pages/MyAccount';
import Artist from './components/Artist';
import ArtistProfile from './components/ArtistProfile';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel ';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-artist" element={<CreateArtist />} />
        <Route path="/create-mentor" element={<CreateMentor />} />
        <Route path="/artists" element={<Artist />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/mentor/payment-success" element={<PaymentSuccess />} />
        <Route path="/mentor/payment-cancel" element={<PaymentCancel />} />

        {/* Protected Routes */}
        <Route
          path="/artist-dashboard"
          element={
            <ProtectedRoute>
              <ArtistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor-dashboard"
          element={
            <ProtectedRoute>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-account"
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
