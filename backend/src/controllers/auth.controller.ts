import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

// ----------------- REGISTER ADMIN -----------------
export async function adminRegisterController(req: Request, res: Response) {
    try {
        const { username, password, code } = req.body || {};
        
        // Validate required fields
        if (!username || !password || !code) {
            return res.status(400).json({ message: 'Username, password and admin code are required' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Validate username length
        if (username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }

        const ADMIN_REG_CODE = process.env.ADMIN_REG_CODE || 'dev-admin';
        if (code.trim() !== ADMIN_REG_CODE) {
            return res.status(403).json({ message: 'Invalid admin registration code' });
        }

        const existingAdmin = await User.exists({ isAdmin: true });
        if (existingAdmin) return res.status(409).json({ message: 'An admin account already exists' });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(409).json({ message: 'This username is already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed, instrument: 'none', isAdmin: true });

        return res.status(201).json({ user: { id: user._id, username: user.username, instrument: user.instrument, isAdmin: true } });
    } catch (err: any) {
        console.error('Admin registration error:', err);
        return res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
}

// ----------------- REGISTER USER -----------------
export async function userRegisterController(req: Request, res: Response) {
    try {
        const { username, password, instrument } = req.body || {};
        
        // Validate required fields
        if (!username || !password || !instrument) {
            return res.status(400).json({ message: 'Username, password and instrument are required' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Validate username length
        if (username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }

        const allowedInstruments = ['none','drums','guitars','bass','saxophone','keyboards','vocals'];
        if (!allowedInstruments.includes(instrument)) {
            return res.status(400).json({ message: 'Please select a valid instrument' });
        }

        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ message: 'This username is already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed, instrument, isAdmin: false });

        return res.status(201).json({ user: { id: user._id, username: user.username, instrument: user.instrument, isAdmin: false } });
    } catch (err: any) {
        console.error('User registration error:', err);
        return res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
}

// ----------------- LOGIN -----------------
export async function loginController(req: Request, res: Response) {
    try {
        const { username, password } = req.body || {};
        
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        return res.status(200).json({ user: { id: user._id, username: user.username, instrument: user.instrument, isAdmin: user.isAdmin } });
    } catch (err: any) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Login failed. Please try again.' });
    }
}
