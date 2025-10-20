import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socketService';
import { useSong } from '../context/SongContext';
import { useUser } from '../hooks/useUser';
import '../styles/PlayerMainPage.css';

const PlayerMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSong, setCurrentSong } = useSong();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  // Initialize socket connection and setup event listeners
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(false);

    // Establish socket connection if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Send user login information to server
    const sendUserLogin = () => {
      console.log('[PlayerMain] Sending user login to server');
      socket.emit('user_login', user);
    };

    // Send immediately if already connected
    if (socket.connected) {
      sendUserLogin();
    }

    // Send on reconnection
    socket.on('connect', sendUserLogin);

    // Flag to prevent state updates after component unmount
    let listenersActive = true;

    // Navigate to live page when admin selects a song
    const songHandler = (songData: any) => {
      if (listenersActive) {
        console.log('[PlayerMain] Song selected by admin, navigating to live page');
        setCurrentSong(songData);
        navigate('/player/live');
      }
    };

    // Reset to waiting state when admin quits song
    const quitHandler = () => {
      if (listenersActive) {
        console.log('[PlayerMain] Admin quit song, returning to waiting state');
        setCurrentSong(null);
      }
    };

    // Register socket event listeners
    socket.on('song_selected', songHandler);
    socket.on('quit_song', quitHandler);

    // Cleanup function to prevent memory leaks
    return () => {
      listenersActive = false;
      socket.off('connect', sendUserLogin);
      socket.off('song_selected', songHandler);
      socket.off('quit_song', quitHandler);
    };
  }, []);

  // Handle user logout
  const handleLogout = () => {
    console.log('[PlayerMain] User logging out');
    localStorage.removeItem('user');
    socket.disconnect();
    navigate('/login');
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="player-main-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-main-page">
      <div className="player-header">
        <div className="header-left">
          <h1>🎵 JaMoveo Player</h1>
          <div className="user-info">
            <p>Welcome, <span className="username">{user.username}</span></p>
            <p className="instrument">Instrument: <span className="instrument-name">{user.instrument}</span></p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>

      <div className="waiting-container">
        <div className="waiting-content">
          <div className="waiting-icon">🎵</div>
          <h2>Waiting for next song</h2>
          <p className="waiting-subtitle">
            The admin will select a song and it will appear here automatically
          </p>

          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Connected to rehearsal session</span>
          </div>

          <div className="instructions">
            <h3>How it works:</h3>
            <ul>
              <li>Wait for the admin to search and select a song</li>
              <li>The song will automatically appear on your screen</li>
              <li>You'll see lyrics and chords based on your instrument</li>
              <li>Use the auto-scroll feature to follow along</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerMainPage;