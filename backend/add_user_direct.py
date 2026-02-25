"""
VitaSage AI -- Setup: Create DB + Tables + Users
Run this ONCE before starting the app:
  python add_user_direct.py
"""
import sys

DB_HOST     = "localhost"
DB_PORT     = 5432
DB_NAME     = "vitasage_271527"
DB_USER     = "postgres"
DB_PASSWORD = "271527"

try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except ImportError:
    print("[ERROR] Run: python -m pip install psycopg2-binary")
    sys.exit(1)

try:
    from passlib.context import CryptContext
except ImportError:
    print("[ERROR] Run: python -m pip install passlib[bcrypt]")
    sys.exit(1)

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("\nVitaSage AI -- Setup")
print("=" * 50)

# ── Step 1: Create the database if it doesn't exist ──
try:
    conn0 = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname="postgres",
        user=DB_USER, password=DB_PASSWORD
    )
    conn0.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur0 = conn0.cursor()
    cur0.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    if not cur0.fetchone():
        cur0.execute(f'CREATE DATABASE {DB_NAME}')
        print(f"[OK] Database '{DB_NAME}' created")
    else:
        print(f"[OK] Database '{DB_NAME}' already exists")
    cur0.close()
    conn0.close()
except psycopg2.OperationalError as e:
    print(f"\n[ERROR] Cannot connect to PostgreSQL: {e}")
    print("Make sure PostgreSQL is running and password is correct.")
    sys.exit(1)

# ── Step 2: Connect to vitasage_271527 ──
conn = psycopg2.connect(
    host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
    user=DB_USER, password=DB_PASSWORD
)
conn.autocommit = False
cur = conn.cursor()
print(f"[OK] Connected to '{DB_NAME}'")

# ── Step 3: Create tables ──
cur.execute("""
    CREATE TABLE IF NOT EXISTS hospitals (
        id          SERIAL PRIMARY KEY,
        hospital_id VARCHAR(50)  UNIQUE NOT NULL,
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        address     TEXT,
        is_active   BOOLEAN DEFAULT TRUE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        hospital_id   INT REFERENCES hospitals(id) ON DELETE CASCADE,
        username      VARCHAR(100) UNIQUE NOT NULL,
        email         VARCHAR(255),
        password_hash TEXT NOT NULL,
        role          VARCHAR(20) CHECK (role IN ('admin','doctor','staff')) NOT NULL,
        full_name     VARCHAR(255),
        status        BOOLEAN DEFAULT TRUE,
        last_login    TIMESTAMP,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
cur.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id         SERIAL PRIMARY KEY,
        user_id    INT REFERENCES users(id) ON DELETE SET NULL,
        action     TEXT NOT NULL,
        details    JSONB,
        ip_address VARCHAR(45),
        timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
print("[OK] Tables ready")

# ── Step 4: Hospital 101 ──
cur.execute("SELECT id FROM hospitals WHERE hospital_id = %s", ("101",))
row = cur.fetchone()
if row:
    hospital_db_id = row[0]
    print("[OK] Hospital 101 already exists")
else:
    cur.execute(
        "INSERT INTO hospitals (hospital_id, name, email, address) VALUES (%s,%s,%s,%s) RETURNING id",
        ("101", "VitaSage Hospital 101", "admin123@gmail.com", "101 Health Avenue")
    )
    hospital_db_id = cur.fetchone()[0]
    print("[OK] Hospital 101 created")

# ── Step 5: User admin123@gmail.com ──
hashed = pwd_ctx.hash("271527")
cur.execute("SELECT id FROM users WHERE username = %s", ("admin123@gmail.com",))
if cur.fetchone():
    cur.execute(
        "UPDATE users SET password_hash = %s WHERE username = %s",
        (hashed, "admin123@gmail.com")
    )
    print("[OK] User 'admin123@gmail.com' password updated")
else:
    cur.execute(
        """INSERT INTO users (hospital_id, username, email, password_hash, role, full_name)
           VALUES (%s,%s,%s,%s,%s,%s)""",
        (hospital_db_id, "admin123@gmail.com", "admin123@gmail.com",
         hashed, "admin", "Admin User")
    )
    print("[OK] User 'admin123@gmail.com' created")

conn.commit()
cur.close()
conn.close()

print("\n[DONE] Login with:")
print("   Hospital ID : 101")
print("   Username    : admin123@gmail.com")
print("   Password    : 271527")
print("=" * 50)
