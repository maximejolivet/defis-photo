import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import AllPhotos from './pages/AllPhotos';
import FreeUpload from './pages/FreeUpload';
import './index.css';
import BirthdayConfetti from './components/BirthdayConfetti';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BirthdayConfetti />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-photos"
            element={
              <ProtectedRoute>
                <AllPhotos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/photo-libre"
            element={
              <ProtectedRoute>
                <FreeUpload />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/gallery" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
