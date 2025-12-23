# EcoCampus: Smart Waste Management System

A production-ready, high-fidelity platform for managing campus waste with Deep Intelligence and verifiable workflows.

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- PostgreSQL installed and running.
- Node.js (v18+)

### 2. Database Environment Setup
Create a `.env` file in the `backend/` directory:
```env
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=smart_waste
JWT_SECRET=super_secure_random_string_here
```

### 3. Initialize & Seed
```bash
cd backend
npm install
node init_db.js
node seed.js
```

### 4. Start Backend
```bash
cd backend
npm start
```

### 5. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Credentials (Seeded Data)
| Role | Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin_root` | `admin123` |
| **Block Admin** | `block_manager` | `block123` |
| **Field Staff** | `cleanup_staff` | `staff123` |
| **Student** | `student_user` | `student123` |

## ✨ Key Features
- **Deep Intelligence**: Linear regression for waste forecasting & Weighted Heat Index for hotspot detection.
- **Proof-of-Work**: Staff must upload an image as evidence before marking tasks as resolved.
- **High-Contrast Design**: Slate-950 high-fidelity UI with emerald & indigo accents.
- **Role-Based Security**: Rigid JWT-based authorization for all operational routes.

## 📁 Repository Structure
- `/frontend`: React + Tailwind 4 application.
- `/backend`: Node.js/Express with PostgreSQL integration.
- `utils/ml.js`: Custom analytics and heuristics engine.
