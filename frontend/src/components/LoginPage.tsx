import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { socket } from '../services/socketService';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3001';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading] = useState(false);
  const [message, setMessage] = useState('');

  // Clean up any existing socket connections and stored auth data on component mount
  useEffect(() => {
    try { 
      socket.disconnect(); 
    } catch {}
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Remove legacy token if exists
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(''); // Clear previous error messages
  
    try {
      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
  
      if (!res.ok || !data.user) {
        setMessage('Login failed');
        return;
      }
  
      // Store user data in localStorage for persistence
      const user = {
        id: data.user.id,
        username: data.user.username,
        instrument: data.user.instrument,
        isAdmin: !!data.user.isAdmin,
      };
      localStorage.setItem('user', JSON.stringify(user));
  
      // Attach authentication data to socket
      socket.auth = {
        userId: user.id,
        username: user.username,
        instrument: user.instrument,
        isAdmin: user.isAdmin,
      };
  
      // Connect socket and emit user_login event once connection is established
      socket.connect();
      socket.once('connect', () => {
        socket.emit('user_login', user);
      });
  
      // Navigate to appropriate page based on user role
      navigate(user.isAdmin ? '/admin' : '/player');
    } catch (err) {
      console.error(err);
      setMessage('Server error');
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