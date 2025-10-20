import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../services/socketService';
import '../styles/RegisterPage.css';

const UserRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    instrument: 'guitars'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const instruments = [
    { value: 'guitars', label: 'Guitar' },
    { value: 'bass', label: 'Bass' },
    { value: 'drums', label: 'Drums' },
    { value: 'saxophone', label: 'Saxophone' },
    { value: 'keyboards', label: 'Piano' },
    { value: 'vocals', label: 'Vocals' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

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

    // Disconnect any existing socket connection
    socket.disconnect();

    try {
      const response = await axios.post(`${apiUrl}/api/register`, formData);
      const data = response.data;

      if (data.user) {
        // Store user in localStorage and establish socket connection
        localStorage.setItem('user', JSON.stringify(data.user));

        socket.connect();
        socket.emit('user_login', {
          userId: data.user.id,
          username: data.user.username,
          instrument: data.user.instrument,
        });

        setSuccess('Registration successful! You can now login');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const status = err?.response?.status;
      const message: string | undefined = err?.response?.data?.message;
      
      if (status === 409) {
        setError('Username already taken');
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
        <h2>User Registration</h2>
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
            <label htmlFor="instrument">Instrument:</label>
            <select
              id="instrument"
              name="instrument"
              value={formData.instrument}
              onChange={handleChange}
              required
            >
              {instruments.map(inst => (
                <option key={inst.value} value={inst.value}>
                  {inst.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Registering...' : 'Register'}
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

export default UserRegisterPage;