# VitaSage AI 🏥

> Hospital Management SaaS — Phase 1: Authentication & RBAC
> **Stack**: FastAPI · PostgreSQL (DB: vitasage_271527) · React + Vite + Tailwind CSS

---

## Quick Start

### 1 — Database Setup

```sql
-- In psql, create the database
CREATE DATABASE vitasage_271527;
\c vitasage_271527
\i backend/db/schema.sql
```

This creates all tables and seeds **3 demo users** (all password: `Admin@123`):

| Username  | Role   | Hospital |
|-----------|--------|----------|
| admin     | admin  | HSP001   |
| dr.smith  | doctor | HSP001   |
| staff01   | staff  | HSP001   |

---

### 2 — Backend (FastAPI)

```bash
cd backend

# Copy env and update your DB password
copy .env.example .env

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload
```

🌐 API: http://localhost:8000  
📄 Swagger Docs: http://localhost:8000/docs

---

### 3 — Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

🌐 App: http://localhost:5173

---

## Environment Variables (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:password@localhost:5432/vitasage_271527` | Your PostgreSQL URL |
| `JWT_SECRET` | `vitasage-super-secret-jwt-key-2024` | **Change in production!** |
| `JWT_EXPIRE_HOURS` | `8` | Token expiry |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS allowed origin |
| `REGISTER_SECRET` | `vitasage-bootstrap-secret` | Secret to register new hospitals |

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/login` | Login (hospital_id + username + password) | Public |
| POST | `/auth/register-hospital` | Bootstrap a new hospital | Secret key |

### Users (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/` | List all users in hospital |
| POST | `/users/` | Create new user |
| PATCH | `/users/{id}/toggle` | Enable/disable user |
| GET | `/users/me` | Get current user profile |

### Hospitals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/hospitals/me` | Get current hospital info |

---

## Project Structure

```
infinite-celestial/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app (CORS, rate-limit, security headers)
│   │   ├── config.py        # Settings from .env
│   │   ├── database.py      # Async SQLAlchemy engine
│   │   ├── models.py        # ORM: Hospital, User, AuditLog
│   │   ├── schemas.py       # Pydantic I/O models
│   │   ├── dependencies.py  # JWT decode, role guards
│   │   └── routers/
│   │       ├── auth.py      # /auth/*
│   │       ├── hospitals.py # /hospitals/*
│   │       └── users.py     # /users/*
│   ├── db/schema.sql        # DDL + seed data
│   ├── requirements.txt
│   └── .env
└── frontend/
    └── src/
        ├── api/axios.js           # Axios + JWT interceptor
        ├── contexts/AuthContext.jsx
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   └── DashboardLayout.jsx
        └── pages/
            ├── Login.jsx          # Glassmorphism login
            ├── AdminDashboard.jsx # User mgmt table + modal
            ├── DoctorDashboard.jsx
            └── StaffDashboard.jsx
```

---

## Security Features

- 🔐 **JWT** with role claims (`admin | doctor | staff`)
- 🔑 **bcrypt** password hashing (rounds=12)
- 🛡 **CORS** restricted to frontend origin
- ⚡ **Rate limiting** via slowapi
- 🪪 **Audit logs** for every login attempt
- 🔒 **Security headers** (X-Content-Type, X-Frame-Options, XSS)
- 🏥 **Hospital isolation** — users scoped to their hospital only
