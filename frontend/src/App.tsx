import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { SongProvider } from './context/SongContext';

// Pages
import LoginPage from './components/LoginPage';
import UserRegisterPage from './components/UserRegisterPage';
import AdminRegisterPage from './components/AdminRegisterPage';
import AdminSearchPage from './components/AdminSearchPage';
import AdminResultsPage from './components/AdminResultsPage';
import AdminLivePage from './components/AdminLivePage';
import PlayerMainPage from './components/PlayerMainPage';
import PlayerLivePage from './components/PlayerLivePage';

export type UserType = {
  id: string;
  username: string;
  isAdmin: boolean;
};

function App() {
  // Retrieve user from localStorage
  const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const isLoggedIn = () => !!getUser();

  // Protected route wrapper - restricts access based on authentication and role
  const PrivateRoute = ({ element, onlyAdmin = false }: { element: React.ReactElement; onlyAdmin?: boolean }) => {
    const user = getUser();
    if (!user) return <Navigate to="/login" replace />;
    if (onlyAdmin && !user.isAdmin) return <Navigate to="/player" replace />;
    return element;
  };

  return (
    <SongProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes - Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user-signup" element={<UserRegisterPage />} />
            <Route path="/admin-signup" element={<AdminRegisterPage />} />

            {/* Admin-only routes */}
            <Route path="/admin" element={<PrivateRoute element={<AdminSearchPage />} onlyAdmin />} />
            <Route path="/admin/results" element={<PrivateRoute element={<AdminResultsPage />} onlyAdmin />} />
            <Route path="/admin/live" element={<PrivateRoute element={<AdminLivePage />} onlyAdmin />} />

            {/* Player routes */}
            <Route path="/player" element={<PrivateRoute element={<PlayerMainPage />} />} />
            <Route path="/player/live" element={<PrivateRoute element={<PlayerLivePage />} />} />

            {/* Fallback for undefined routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </SongProvider>
  );
}

export default App;