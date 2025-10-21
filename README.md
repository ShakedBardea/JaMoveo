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

**Create environment file:**

**Option A:** Copy the example file
```bash
cp .env.example .env
```

**Option B:** Rename `.env.example` to `.env` manually

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

---

### 🔐 Admin Registration

To register as an administrator, enter the following code in the **Admin Code** field of the registration form:
`!MovEo-Adm1n-2025!$XyZ`

This code is required only once during the admin registration process.

---

### ⚙️ Additional Notes

The application uses **localStorage** to manage session data.  
To test multiple users simultaneously (e.g., admin and regular user), open **two separate browser windows** or use **different browsers**.  
Running both users in tabs of the same window will cause them to share the same session and behave as one user.
## 👥 Author

Shaked Bardea

