import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPortal from './pages/AdminPortal';
import CursorFollower from './components/CursorFollower';
import HelpSidebar from './components/HelpSidebar';

function App() {
  return (
    <Router>
      <CursorFollower />
      <HelpSidebar />
      <div className="min-h-screen text-gray-900 bg-gray-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
