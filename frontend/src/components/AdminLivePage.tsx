import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../services/socketService';
import { useSong } from '../context/SongContext';
import { useUser } from '../hooks/useUser';
import '../styles/AdminLivePage.css';

const AdminLivePage: React.FC = () => {
  const { user } = useUser();
  const { currentSong, setCurrentSong } = useSong();
  const navigate = useNavigate();
  const location = useLocation();
  const [autoScroll, setAutoScroll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection and setup event listeners
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Establish socket connection
    if (!socket.connected) {
      socket.connect();
    }
    
    console.log('[AdminLive] Sending admin login to server');
    socket.emit('user_login', user);

    // Flag to prevent state updates after component unmount
    let isActive = true;

    // Get selected song from navigation state (if coming from search results)
    const { selectedSong } = location.state as { selectedSong?: any };
    
    if (!currentSong && !selectedSong) {
      navigate('/admin');
      return;
    }

    // Request full song data from server if a new song was selected
    if (selectedSong && !currentSong) {
      console.log('[AdminLive] Requesting song content from server:', selectedSong.title);
      socket.emit('select_song', selectedSong);
    }

    // Receive full song data with lyrics and chords from server
    const handleSongSelected = (song: any) => {
      if (isActive && song) {
        console.log('[AdminLive] Received full song data from server');
        setCurrentSong(song);
        setLoading(false);
      }
    };

    // Handle quit song event
    const handleQuitSong = () => {
      if (isActive) {
        console.log('[AdminLive] Quit song received, returning to admin page');
        setCurrentSong(null);
        navigate('/admin');
      }
    };

    // Handle song loading errors
    const handleSongError = (err: string) => {
      if (isActive) {
        console.error('[AdminLive] Error loading song:', err);
        setError(err);
      }
    };

    // Register socket event listeners
    socket.on('song_selected', handleSongSelected);
    socket.on('quit_song', handleQuitSong);
    socket.on('song_error', handleSongError);

    setLoading(false);

    // Cleanup function to prevent memory leaks
    return () => {
      isActive = false;
      socket.off('song_selected', handleSongSelected);
      socket.off('quit_song', handleQuitSong);
      socket.off('song_error', handleSongError);
    };
  }, []);

  // Auto-scroll functionality for easier reading during performance
  useEffect(() => {
    let interval: NodeJS.Timer;
    if (autoScroll) {
      interval = setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'smooth' });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [autoScroll]);

  // Admin action: Quit current song and return all players to waiting state
  const handleQuitSong = () => {
    console.log('[AdminLive] Admin quitting song, broadcasting to all players');
    socket.emit('quit_song');
    setCurrentSong(null);
    navigate('/admin');
  };

  // Handle admin logout
  const handleLogout = () => {
    console.log('[AdminLive] Admin logging out');
    socket.disconnect();
    navigate('/login');
  };

  // Loading and error states
  if (loading) return <p>Loading song...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!currentSong) return <p>No song selected</p>;
  
  // Determine display content based on user instrument
  const isVocals = user.instrument === 'vocals';
  const lyrics = typeof currentSong.lyrics === 'string' ? currentSong.lyrics : '';
  const chords = typeof currentSong.chords === 'string' ? currentSong.chords : '';

  return (
    <div className="admin-live-page">
      <div className="admin-header">
        <div className="header-left">
          <h1>🎵 JaMoveo Live </h1>
          <div className="song-info">
            <h2>{currentSong.title}</h2>
            <p>by {currentSong.artist}</p>
          </div>
        </div>

        <div className="header-right">
          <button onClick={() => setAutoScroll(!autoScroll)} className={`auto-scroll-button ${autoScroll ? 'active' : ''}`}>
            {autoScroll ? '⏸️ Stop Auto Scroll' : '▶️ Start Auto Scroll'}
          </button>
          <button onClick={handleQuitSong} className="quit-button">Quit Song</button>
        </div>
      </div>

      <div className="live-content">
        <div className="song-display">
          <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
            {(lyrics || chords) ? (
              <div className="song-content" dir="rtl" style={{ fontFamily: '"Fira Mono", monospace', letterSpacing: '0.02em' }}>
                {(() => {
                  const chordLines = chords ? chords.split('\n') : [];
                  const lyricLines = lyrics ? lyrics.split('\n') : [];

                  // Vocalists see only lyrics, other instruments see both chords and lyrics
                  if (isVocals) {
                    return lyricLines.map((line, idx) => (
                      <div key={idx} className="song-line">
                        <div className="lyrics-line">{line}</div>
                      </div>
                    ));
                  }

                  // Display chords above corresponding lyrics
                  return chordLines.map((chordLine, idx) => (
                    <div key={idx} className="song-line">
                      <div className="chords-line">{chordLine}</div>
                      <div className="lyrics-line">{lyricLines[idx] || ''}</div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <pre dir="rtl">{(currentSong as any).rawText || 'No content available'}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLivePage;