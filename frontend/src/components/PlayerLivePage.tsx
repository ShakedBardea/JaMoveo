import React, { useEffect, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socketService';
import { useSong, Song } from '../context/SongContext';
import '../styles/AdminLivePage.css';

const PlayerLivePage: React.FC = () => {
  const { currentSong, setCurrentSong } = useSong();
  const { user } = useUser();
  const navigate = useNavigate();
  const [autoScroll, setAutoScroll] = useState(false);

  // Setup socket listeners for real-time song updates
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Flag to prevent state updates after component unmount
    let isActive = true;

    // Handle incoming song selection from admin
    const handleSongSelected = (song: Song | null) => {
      if (isActive && song) {
        console.log('[PlayerLive] Song received:', song.title);
        setCurrentSong(song);
      }
    };

    // Handle quit song event from admin
    const handleQuitSong = () => {
      if (!isActive) return;
      console.log('[PlayerLive] Quit song received, navigating to waiting page');
      setCurrentSong(null);
      navigate('/player');
    };

    // Register socket event listeners
    socket.on('song_selected', handleSongSelected);
    socket.on('quit_song', handleQuitSong);

    // Cleanup function to prevent memory leaks
    return () => {
      isActive = false;
      socket.off('song_selected', handleSongSelected);
      socket.off('quit_song', handleQuitSong);
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

  // Loading states
  if (!user) return <p>Redirecting...</p>;
  if (!currentSong) return <p>Waiting for song...</p>;

  // Determine display content based on user instrument
  const isVocals = user.instrument === 'vocals';
  const lyrics = typeof currentSong.lyrics === 'string' ? currentSong.lyrics : '';
  const chords = typeof currentSong.chords === 'string' ? currentSong.chords : '';

  return (
    <div className="admin-live-page">
      <div className="admin-header">
        <div className="header-left">
          <h1>🎵 JaMoveo Live</h1>
          <div className="song-info">
            <h2>{currentSong.title}</h2>
            <p>by {currentSong.artist}</p>
          </div>
        </div>

        <div className="header-right">
          <button 
            onClick={() => setAutoScroll(!autoScroll)} 
            className={`auto-scroll-button ${autoScroll ? 'active' : ''}`}
          >
            {autoScroll ? '⏸️ Stop Auto Scroll' : '▶️ Start Auto Scroll'}
          </button>
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

export default PlayerLivePage;