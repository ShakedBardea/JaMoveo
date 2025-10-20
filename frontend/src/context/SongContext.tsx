import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the Song type structure
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
 * SongProvider - Global state management for current song
 * This context stores the currently selected song that is shared across
 * admin and player views. Socket event handling is done at the component level.
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
 * useSong - Custom hook to access song context
 * @returns Current song state and setter function
 * @throws Error if used outside of SongProvider
 */
export const useSong = () => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error('useSong must be used within a SongProvider');
  }
  return context;
};