# EcoCampus: Smart Waste Management System

A production-ready, enterprise-grade platform for managing campus waste with real-time analytics and role-based workflows.

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- PostgreSQL installed and running
- Node.js (v18+)
- Git

### 2. Clone Repository
```bash
git clone https://github.com/Harini-0111/smart-campus-waste-management.git
cd smart-campus-waste-management
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory (use `.env.example` as template):
```env
DATABASE_URL=postgresql://username:password@localhost:5432/ecocampus
JWT_SECRET=your-secret-key-here-change-in-production
PORT=5000
```

Initialize database:
```bash
node init_db.js
node seed.js
npm start
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in `frontend/` directory (use `.env.example` as template):
```env
VITE_API_URL=http://localhost:5000/api
```

Start development server:
```bash
npm run dev
```

## 🔐 Authentication

The system uses JWT-based authentication with database-driven user management. Default seeded users are created during `seed.js` execution. Check the seed file for initial credentials.

**Roles:**
- Super Admin: Full system access
- Block Admin: Location-specific management
- Staff: Task execution and cleanup verification
- Student: Waste reporting

## ✨ Key Features

- **Real-time Analytics**: Waste forecasting and hotspot detection
- **Proof-of-Work**: Image verification for task completion
- **Role-Based Access**: Strict JWT authorization
- **Enterprise UI**: Professional design with smooth animations
- **Database-Driven**: PostgreSQL with full ACID compliance

## 📦 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=<your-backend-url>/api`

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables from `.env.example`
5. Provision PostgreSQL database and update `DATABASE_URL`

## 📁 Repository Structure

- `/frontend`: React + Vite + Tailwind CSS 4
- `/backend`: Node.js/Express + PostgreSQL
- `/backend/utils/ml.js`: Analytics engine
- `/backend/middleware`: Auth and upload handlers

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Tailwind CSS 4
- Vite
- Axios
- Recharts

**Backend:**
- Node.js
- Express
- PostgreSQL
- JWT
- Multer
- Bcrypt

## 📄 License

MIT License - See LICENSE file for details
