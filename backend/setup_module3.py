"""
VitaSage AI -- Module 3 Setup: Staff User + Vitals Table
Run: python setup_module3.py
"""
import sys
sys.path.insert(0, '.')

try:
    import psycopg2
    from passlib.context import CryptContext
except ImportError as e:
    print(f"[ERROR] {e}. Run: python -m pip install psycopg2-binary passlib[bcrypt]")
    sys.exit(1)

DB_HOST="localhost"; DB_PORT=5432; DB_NAME="vitasage_271527"; DB_USER="postgres"; DB_PASSWORD="271527"
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("\nVitaSage AI -- Module 3 Setup")
print("=" * 50)

conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
conn.autocommit = False
cur = conn.cursor()
print("[OK] Connected")

# ── patient_vitals table ──────────────────────────────────
cur.execute("""
CREATE TABLE IF NOT EXISTS patient_vitals (
    id             SERIAL PRIMARY KEY,
    patient_id     INT REFERENCES patient_master(id) ON DELETE CASCADE,
    systolic       INT,
    diastolic      INT,
    sugar_fasting  FLOAT,
    sugar_random   FLOAT,
    temperature    FLOAT,
    recorded_by    INT REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)""")
print("[OK] patient_vitals table ready")

# ── Hospital 101 ──────────────────────────────────────────
cur.execute("SELECT id FROM hospitals WHERE hospital_id = %s", ("101",))
hosp = cur.fetchone()
if not hosp:
    cur.execute(
        "INSERT INTO hospitals (hospital_id, name, email, address) VALUES (%s,%s,%s,%s) RETURNING id",
        ("101","VitaSage Hospital 101","admin123@gmail.com","101 Health Avenue")
    )
    hosp_id = cur.fetchone()[0]
else:
    hosp_id = hosp[0]
print(f"[OK] Hospital 101 (id={hosp_id})")

# ── Staff User: staff123@gmail.com ────────────────────────
cur.execute("SELECT id FROM users WHERE username = %s", ("staff123@gmail.com",))
if cur.fetchone():
    cur.execute("UPDATE users SET password_hash=%s WHERE username=%s",
                (pwd_ctx.hash("271527"), "staff123@gmail.com"))
    print("[OK] Staff user password updated")
else:
    cur.execute(
        "INSERT INTO users (hospital_id, username, email, password_hash, role, full_name) VALUES (%s,%s,%s,%s,%s,%s)",
        (hosp_id, "staff123@gmail.com", "staff123@gmail.com", pwd_ctx.hash("271527"), "staff", "Staff Member")
    )
    print("[OK] Staff user created: staff123@gmail.com")

conn.commit()
cur.close()
conn.close()

print("\n[DONE] Module 3 Setup Complete!")
print("  Staff Login -> Hospital: 101 | User: staff123@gmail.com | Pass: 271527")
print("=" * 50)
