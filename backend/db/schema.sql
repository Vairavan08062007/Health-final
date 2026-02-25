-- ============================================================
-- VitaSage AI — PostgreSQL Schema (DB: vitasage_271527)
-- ============================================================

-- Drop in reverse dependency order for clean re-runs
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;

-- ─────────────────────────────────────────────
-- 1. Hospitals
-- ─────────────────────────────────────────────
CREATE TABLE hospitals (
    id          SERIAL PRIMARY KEY,
    hospital_id VARCHAR(50)  UNIQUE NOT NULL,   -- Human-readable ID e.g. HSP001
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    address     TEXT,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 2. Users (RBAC)
-- ─────────────────────────────────────────────
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    hospital_id   INT REFERENCES hospitals(id) ON DELETE CASCADE,
    username      VARCHAR(100) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) CHECK (role IN ('admin', 'doctor', 'staff')) NOT NULL,
    full_name     VARCHAR(255),
    status        BOOLEAN   DEFAULT TRUE,
    last_login    TIMESTAMP,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 3. Audit Logs (Compliance)
-- ─────────────────────────────────────────────
CREATE TABLE audit_logs (
    id         SERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(id) ON DELETE SET NULL,
    action     TEXT NOT NULL,
    details    JSONB,
    ip_address VARCHAR(45),
    timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- Indexes for performance
-- ─────────────────────────────────────────────
CREATE INDEX idx_users_hospital_id ON users(hospital_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ─────────────────────────────────────────────
-- Seed Data (password = Admin@123)
-- Hash generated with bcrypt rounds=12
-- ─────────────────────────────────────────────
INSERT INTO hospitals (hospital_id, name, email, address)
VALUES ('HSP001', 'VitaSage General Hospital', 'admin@vitasage.com', '123 Medical Drive, Health City');

INSERT INTO users (hospital_id, username, email, password_hash, role, full_name)
VALUES (
    1,
    'admin',
    'admin@vitasage.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLOeV75AHGfhHpi',  -- Admin@123
    'admin',
    'System Administrator'
);

INSERT INTO users (hospital_id, username, email, password_hash, role, full_name)
VALUES (
    1,
    'dr.smith',
    'drsmith@vitasage.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLOeV75AHGfhHpi',  -- Admin@123
    'doctor',
    'Dr. John Smith'
);

INSERT INTO users (hospital_id, username, email, password_hash, role, full_name)
VALUES (
    1,
    'staff01',
    'staff01@vitasage.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLOeV75AHGfhHpi',  -- Admin@123
    'staff',
    'Jane Receptionist'
);
