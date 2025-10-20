# JaMoveo - Live Music Rehearsal System

A real-time collaborative music rehearsal platform that allows a band leader (admin) to select songs and display synchronized lyrics and chords to all band members.

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Socket.IO Client  
**Backend:** Node.js, Express, TypeScript, MongoDB, Socket.IO

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) or local MongoDB

## 🚀 Installation & Running

### 1. Clone the Repository
```bash
git clone https://github.com/ShakedBardea/JaMoveo.git
cd JaMoveo
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Then edit `.env` and replace the placeholders with your actual values:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `ADMIN_REG_CODE` - Your chosen admin registration code
  
### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## 👥 Author

Shaked Bardea

## 📝 License

ISC
