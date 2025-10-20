import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../services/socketService';
import '../styles/RegisterPage.css';

const AdminRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    code: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.username.trim()) {
      setLoading(false);
      setError('Username is required');
      return;
    }
    if (formData.password.length < 8) {
      setLoading(false);
      setError('Password must be at least 8 characters');
      return;
    }
    if (!formData.code.trim()) {
      setLoading(false);
      setError('Admin code is required');
      return;
    }

    // Disconnect existing socket connection if any
    socket.disconnect();

    try {
      const response = await axios.post(`${apiUrl}/api/admin/register`, formData);
      const data = response.data;

      if (data.user) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        // Establish socket connection
        socket.connect();
        socket.emit('user_login', {
          userId: data.user.id,
          username: data.user.username,
        });

        setSuccess('Admin registration successful! You can now login');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Admin registration failed');
      }
    } catch (err: any) {
      console.error('Admin registration error:', err);
      const status = err?.response?.status;
      const message: string | undefined = err?.response?.data?.message;
      if (status === 409) {
        // Admin already exists in the system or username is taken
        setError(message || 'Admin already exists or username taken');
      } else if (status === 403) {
        setError('Invalid admin code');
      } else if (status === 400) {
        setError(message || 'Invalid input');
      } else {
        setError(message || 'Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="logo">🎵 JaMoveo</div>
        <h2>Admin Registration</h2>
        <p className="admin-note">Only one admin can register in the system</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              autoComplete="new-username"
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
              placeholder="Enter password (min 8 characters)"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="code">Admin Code:</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter admin code"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading} className="register-button admin-button">
            {loading ? 'Registering as Admin...' : 'Register as Admin'}
          </button>
        </form>
        <div className="switch-link">
          <p>Already have an account?</p>
          <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;