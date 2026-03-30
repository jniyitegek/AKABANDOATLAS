# 📖 Akabando Atlas Literacy Platform

Akabando Atlas is an interactive literacy platform designed to improve student reading fluency through real-time speech analysis, dynamic practice content, and professional reporting tools.

---

## 🚀 Quick Start

Follow these steps to get the project running locally.

### 1. Prerequisites
- **Node.js** (v18.0 or higher)
- **MongoDB** (Local instance or Atlas connection string)
- **Git**

### 2. Installation

Clone the repository and install dependencies for both the frontend and backend.

```bash
# Clone the repository
git clone <repository-url>
cd akabando-atlas

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create `.env` files in both directories based on the provided examples.

**Backend (`backend/.env`):**
```env
PORT=4000
MONGODB_URI=your_mongodb_uri
```

**Frontend (`frontend/.env.local`):**
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret
MONGODB_URI=your_mongodb_uri
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

---

## 🛠️ Development & Production

### Running in Development
For the best experience, run both the backend and frontend concurrently.

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Building for Production
The frontend is optimized for production using Next.js Turbopack.

```bash
cd frontend
npm run build
npm start
```

---

## ✨ Key Features

- **Reading Simulator**: Real-time speech-to-text analysis with accuracy and fluency tracking.
- **Report Cards**: Automated, professional PDF reports with granular mistake analysis.
- **Content Management**: Admins and Facilitators can manually add custom sentences to the global practice library.
- **Interactive Chat**: Real-time global and private messaging powered by Socket.IO.
- **Glassmorphism UI**: A premium, modern interface designed for engagement and accessibility.

---

## 📂 Project Structure

```text
akabando-atlas/
├── backend/            # Express.js Server & Socket.IO
│   ├── models/         # Database Schemas (Mongoose)
│   └── index.js        # Entry point (Port 4000)
└── frontend/           # Next.js 16 Web App
    ├── app/            # Application Routes & API
    ├── components/     # Reusable UI Components
    ├── models/         # Frontend-specific Schemas
    └── public/         # Static Assets
```

---

## 📝 License
This project is for educational use within the Akabando School environment.
