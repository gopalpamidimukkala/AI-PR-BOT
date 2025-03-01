import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AppRoutes from '../routes/routes';
import './App.css';

function App() {
  const [postType, setPostType] = useState(null);
  
  const handleTypeSelect = (type) => {
    setPostType(type);
  };

  const handleResetView = () => {
    setPostType(null);
  };

  const handlePostSuccess = (result) => {
    toast.success('Post successfully created!');
    setPostType(null);
  };

  const handleSchedule = (file, content) => {
    // Implement scheduling logic
  };

  const handleRegenerate = () => {
    // Implement regeneration logic
  };

  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <AppRoutes />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 