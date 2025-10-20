import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Song = {
    rawText: string;
    title: string;
    artist: string;
    link: string;
    image?: string;
    lyrics?: string;
    chords?: string;
    contentHtml?: string;
} | null;

type SongContextType = {
    currentSong: Song;
    setCurrentSong: (song: Song) => void;
};

const SongContext = createContext<SongContextType | undefined>(undefined);

type SongProviderProps = {
  children: ReactNode;
};

/**
 * Global state provider for the currently selected song
 * Shared between admin and player components
 */
export const SongProvider: React.FC<SongProviderProps> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song>(null);

  return (
    <SongContext.Provider value={{ currentSong, setCurrentSong }}>
      {children}
    </SongContext.Provider>
  );
};

/**
 * Hook to access the current song context
 * Must be used within SongProvider
 */
export const useSong = () => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error('useSong must be used within a SongProvider');
  }
  return context;
};