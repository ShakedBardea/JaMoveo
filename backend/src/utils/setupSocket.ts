import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getSongContentFromTab4U } from './scrapeTab4U';

export const setupSocket = (server: HTTPServer): void => {
  const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET','POST'], credentials: true },
  });

  // Store current active song to send to newly connected players
  let currentActiveSong: any = null;

  io.on('connection', (socket) => {
    let isAdmin = false;
    let userInfo: any = null;

    // Handle user login event
    socket.on('user_login', (data) => {
      socket.data.user = data;
      userInfo = data;
      isAdmin = !!data?.isAdmin;
      
      // Send current song to newly connected player (if song is active)
      if (!isAdmin && currentActiveSong) {
        socket.emit('song_selected', currentActiveSong);
      }
    });

    // Handle song selection from admin
    socket.on('select_song', async (songData) => {
      try {
        // Fetch full song content (lyrics and chords) from Tab4U
        const songContent = await getSongContentFromTab4U(songData.link);

        const fullSong = {
          ...songData,
          contentHtml: songContent.contentHtml,
          rawText: songContent.rawText,
          chords: songContent.chords,
          lyrics: songContent.lyrics,
        };

        // Store the current song for newly connecting players
        currentActiveSong = fullSong;

        // Broadcast song to all connected clients
        io.emit('song_selected', fullSong);
      } catch (error) {
        console.error('[Socket] Failed to fetch song content:', error);
        socket.emit('song_error', 'Could not load song content.');
      }
    });

    // Handle quit song event from admin
    socket.on('quit_song', () => {
      // Clear current song
      currentActiveSong = null;
      
      io.emit('quit_song');
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
      if (isAdmin) {
        // Clear current song when admin disconnects
        currentActiveSong = null;
        
        io.emit('quit_song');
      }
    });
  });
};