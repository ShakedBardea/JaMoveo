import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../services/socketService';
import '../styles/AdminSearchPage.css';

interface SearchResult {
  title: string;
  artist: string;
  link: string;
  image?: string;
}

const AdminSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Retrieve user data from localStorage 
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('User not logged in');
 
      const response = await axios.get(`${apiUrl}/api/songs/search-songs?query=${encodeURIComponent(searchQuery)}`);

      if (response.data && response.data.length > 0) {
        navigate('/admin/results', { 
          state: { 
            results: response.data,
            query: searchQuery 
          } 
        });
      } else {
        setError('No songs found. Try a different search term.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Disconnect socket and remove user from localStorage
    localStorage.removeItem('user');
    socket.disconnect();
    navigate('/login');
  };

  return (
    <div className="admin-search-page">
      <div className="admin-header">
        <div className="header-left">
          <h1>🎵 JaMoveo Admin</h1>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="search-container">
        <div className="search-content">
          <h2>Search any song...</h2>
          <p className="search-subtitle">Find songs from Tab4U database</p>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter song name or artist..."
                className="search-input"
                required
                autoFocus
              />
              <button 
                type="submit" 
                disabled={loading || !searchQuery.trim()}
                className="search-button"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="search-tips">
            <h3>Search Tips:</h3>
            <ul>
              <li>Search by song title or artist name</li>
              <li>Use partial names (e.g., "Hey" will find "Hey Jude")</li>
              <li>Try different spellings if no results found</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSearchPage;