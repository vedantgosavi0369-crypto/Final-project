import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPortal from './pages/AdminPortal';
import PasswordCreation from './pages/PasswordCreation';
import DoctorProfile from './components/DoctorProfile';
import PatientProfile from './components/PatientProfile';
import CursorFollower from './components/CursorFollower';
import HelpSidebar from './components/HelpSidebar';
import SplashScreen from './components/SplashScreen';

function App() {
  const [isLaunching, setIsLaunching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLaunching(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLaunching) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <CursorFollower />
      <HelpSidebar />
      <div className="min-h-screen text-gray-900 bg-gray-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
          <Route path="/patient-profile" element={<PatientProfile />} />
          <Route path="/password-creation" element={<PasswordCreation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
