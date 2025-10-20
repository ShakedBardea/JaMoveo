import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../services/socketService';
import '../styles/AdminResultsPage.css';

interface SearchResult {
  title: string;
  artist: string;
  link: string;
  image?: string;
}

const AdminResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, query } = location.state as { results: SearchResult[]; query: string };

  const handleSongSelect = (song: SearchResult) => {
    navigate('/admin/live', { 
      state: { 
        selectedSong: song,
        searchQuery: query 
      } 
    });
  };

  const handleBackToSearch = () => {
    navigate('/admin');
  };

  const handleLogout = () => {
    // Disconnect socket and remove user from localStorage
    socket.disconnect();
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-results-page">
      <div className="admin-header">
        <div className="header-left">
          <h1>🎵 JaMoveo Admin</h1>
          <p className="search-info">Results for: "{query}"</p>
        </div>
        <div className="header-right">
          <button onClick={handleBackToSearch} className="back-button">
            Back to Search
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="results-container">
        <div className="results-header">
          <h2>Search Results</h2>
          <p className="results-count">{results.length} song{results.length !== 1 ? 's' : ''} found</p>
        </div>

        <div className="results-grid">
          {results.map((song, index) => (
            <div 
              key={index} 
              className="song-card"
              onClick={() => handleSongSelect(song)}
            >
              <div className="song-image">
                {song.image ? (
                  <img 
                    src={song.image} 
                    alt={`${song.artist} - ${song.title}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`no-image ${song.image ? 'hidden' : ''}`}>
                  🎵
                </div>
              </div>
              
              <div className="song-info">
                <h3 className="song-title">{song.title}</h3>
                <p className="song-artist">{song.artist}</p>
              </div>
              
              <div className="song-actions">
                <button className="select-button">
                  Select Song
                </button>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="no-results">
            <h3>No songs found</h3>
            <p>Try a different search term or check your spelling.</p>
            <button onClick={handleBackToSearch} className="back-to-search-button">
              Back to Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResultsPage;