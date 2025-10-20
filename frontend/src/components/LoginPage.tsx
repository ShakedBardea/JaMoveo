import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { socket, connectWithAuth, disconnectSocket } from '../services/socketService';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3001';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  // error text is kept in `message`
  const [loading] = useState(false);
  const [message, setMessage] = useState('');


   useEffect(() => {
    try { socket.disconnect(); } catch {}
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // רק אם שמור אצלך מאתמול
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(''); // מאפסים הודעה קודמת
  
    try {
      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
  
      if (!res.ok || !data.user) {
        setMessage(data.message || 'Login failed');
        return;
      }
  
      // שמירה בלוקאל סטורג'
      const user = {
        id: data.user.id,
        username: data.user.username,
        instrument: data.user.instrument,
        isAdmin: !!data.user.isAdmin ,
      };
      localStorage.setItem('user', JSON.stringify(user));
  
      // הצמדת auth לסוקט
      socket.auth = {
        userId: user.id,
        username: user.username,
        instrument: user.instrument,
        isAdmin: user.isAdmin,
      };
  
      // חיבור ושליחת user_login פעם אחת
      socket.connect();
      socket.once('connect', () => {
        socket.emit('user_login', user);
      });
  
      navigate(user.isAdmin ? '/admin' : '/player');
    } catch (err) {
      console.error(err);
      setMessage('Server error'); // שימוש רגיל ב-useState
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🎵 JaMoveo</h1>
          <p>Welcome to the rehearsal system</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {message && <div className="error-message">{message}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="switch-page">
          <p>Don't have an account?</p>
          <div className="register-links">
            <Link to="/user-signup" className="switch-button">
              Register as User
            </Link>
            <Link to="/admin-signup" className="switch-button admin-link">
              Register as Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
