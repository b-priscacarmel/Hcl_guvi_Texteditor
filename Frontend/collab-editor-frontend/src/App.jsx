import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DocumentPage from './pages/DocumentPage';
import './index.css';

export default function App() {
  const [username, setUsername] = useState(() => {
    return sessionStorage.getItem('collab_username') || '';
  });

  const handleLogin = (name) => {
    sessionStorage.setItem('collab_username', name);
    setUsername(name);
  };

  if (!username) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid #2d3748',
            borderRadius: '10px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage username={username} />} />
        <Route path="/document/:id" element={<DocumentPage username={username} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
