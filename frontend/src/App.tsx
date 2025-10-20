import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { socket } from './services/socketService';
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

// טיפוס משתמש
export type UserType = {
  id: string;
  username: string;
  isAdmin: boolean;
};

function App() {
  // Socket connection is now handled by individual components
  // when they need to connect with user authentication
  
  // בודק אם המשתמש שמור בלוקאל סטורג'
  const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const isLoggedIn = () => !!getUser();

  // רכיב שמגן על מסכים פרטיים
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
            {/* ברירת מחדל */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* עמודי הרשמה והתחברות */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user-signup" element={<UserRegisterPage />} />
            <Route path="/admin-signup" element={<AdminRegisterPage />} />

            {/* עמודים למנהלים בלבד */}
            <Route path="/admin" element={<PrivateRoute element={<AdminSearchPage />} onlyAdmin />} />
            <Route path="/admin/results" element={<PrivateRoute element={<AdminResultsPage />} onlyAdmin />} />
            <Route path="/admin/live" element={<PrivateRoute element={<AdminLivePage />} onlyAdmin />} />

            {/* עמודים לנגנים */}
            <Route path="/player" element={<PrivateRoute element={<PlayerMainPage />} />} />
            <Route path="/player/live" element={<PrivateRoute element={<PlayerLivePage />} />} />

            {/* ברירת מחדל לשגיאה */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </SongProvider>
  );
}

export default App;
