import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

// ----------------- REGISTER ADMIN -----------------
export async function adminRegisterController(req: Request, res: Response) {
    try {
        const { username, password, code } = req.body || {};
        if (!username || !password || !code) {
            return res.status(400).json({ message: 'username, password and code are required' });
        }

        const ADMIN_REG_CODE = process.env.ADMIN_REG_CODE || 'dev-admin';
        if (code.trim() !== ADMIN_REG_CODE) {
            return res.status(403).json({ message: 'Invalid admin code' });
        }

        const existingAdmin = await User.exists({ isAdmin: true });
        if (existingAdmin) return res.status(409).json({ message: 'Admin already exists' });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(409).json({ message: 'Username already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed, instrument: 'none', isAdmin: true });

        return res.status(201).json({ user: { id: user._id, username: user.username, instrument: user.instrument, isAdmin: true } });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
}

// ----------------- REGISTER USER -----------------
export async function userRegisterController(req: Request, res: Response) {
    try {
        const { username, password, instrument } = req.body || {};
        if (!username || !password || !instrument) {
            return res.status(400).json({ message: 'username, password and instrument are required' });
        }

        const allowedInstruments = ['none','drums','guitars','bass','saxophone','keyboards','vocals'];
        if (!allowedInstruments.includes(instrument)) {
            return res.status(400).json({ message: 'Invalid instrument selected' });
        }

        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ message: 'Username already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed, instrument, isAdmin: false });

        return res.status(201).json({ user: { id: user._id, username: user.username, instrument: user.instrument, isAdmin: false } });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
}

// ----------------- LOGIN -----------------
export async function loginController(req: Request, res: Response) {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ message: 'username and password are required' });

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

        return res.status(200).json({ user: { id: user._id, username: user.username, instrument: user.instrument, isAdmin: user.isAdmin } });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
}
