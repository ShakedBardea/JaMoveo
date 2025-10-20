import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import authRoutes from './routes/auth.routes';
import songRoutes from './routes/songs.routes';
import { setupSocket } from './utils/setupSocket';




const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
}

app.use(cors({
    origin: '*',
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/songs', songRoutes);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected'); // שורה בטוחה, לא חושפת סיסמה

        setupSocket(server);

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });