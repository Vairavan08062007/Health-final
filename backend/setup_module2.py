"""
VitaSage AI -- Module 2 Setup
Creates doctor user (akash/271527) + new tables + seed patient
Run: python setup_module2.py
"""
import sys
sys.path.insert(0, '.')

try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    from passlib.context import CryptContext
except ImportError as e:
    print(f"[ERROR] Missing package: {e}. Run: python -m pip install psycopg2-binary passlib[bcrypt]")
    sys.exit(1)

DB_HOST="localhost"; DB_PORT=5432; DB_NAME="vitasage_271527"; DB_USER="postgres"; DB_PASSWORD="271527"
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("\nVitaSage AI -- Module 2 Setup")
print("=" * 50)

conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
conn.autocommit = False
cur = conn.cursor()
print("[OK] Connected to vitasage_271527")

# ── New Tables ────────────────────────────────────────────
cur.execute("""
CREATE TABLE IF NOT EXISTS patient_master (
    id                 SERIAL PRIMARY KEY,
    abha_id            VARCHAR(12) UNIQUE NOT NULL,
    aadhaar            VARCHAR(12) UNIQUE,
    name               VARCHAR(255) NOT NULL,
    age                INT,
    gender             VARCHAR(10),
    blood_group        VARCHAR(5),
    allergies          TEXT,
    chronic_conditions TEXT,
    emergency_contact  VARCHAR(255),
    emergency_phone    VARCHAR(15),
    current_medicines  TEXT,
    risk_level         VARCHAR(10) DEFAULT 'Low' CHECK (risk_level IN ('Low','Medium','High')),
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)""")

cur.execute("""
CREATE TABLE IF NOT EXISTS doctor_suggestions (
    id            SERIAL PRIMARY KEY,
    doctor_id     INT REFERENCES users(id) ON DELETE SET NULL,
    patient_id    INT REFERENCES patient_master(id) ON DELETE CASCADE,
    notes         TEXT NOT NULL,
    risk_level    VARCHAR(10) DEFAULT 'Low' CHECK (risk_level IN ('Low','Medium','High')),
    followup_date DATE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)""")

cur.execute("""
CREATE TABLE IF NOT EXISTS prescriptions (
    id            SERIAL PRIMARY KEY,
    doctor_id     INT REFERENCES users(id) ON DELETE SET NULL,
    patient_id    INT REFERENCES patient_master(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage        VARCHAR(100),
    frequency     VARCHAR(100),
    duration      VARCHAR(100),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)""")

cur.execute("""
CREATE TABLE IF NOT EXISTS patient_reports (
    id           SERIAL PRIMARY KEY,
    patient_id   INT REFERENCES patient_master(id) ON DELETE CASCADE,
    category     VARCHAR(50) CHECK (category IN ('Lab Report','Radiology','Prescription','Emergency')) NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    file_path    TEXT NOT NULL,
    uploaded_by  INT REFERENCES users(id) ON DELETE SET NULL,
    upload_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)""")
print("[OK] New tables created")

# ── Ensure Hospital 101 exists ────────────────────────────
cur.execute("SELECT id FROM hospitals WHERE hospital_id = %s", ("101",))
hosp = cur.fetchone()
if not hosp:
    cur.execute(
        "INSERT INTO hospitals (hospital_id, name, email, address) VALUES (%s,%s,%s,%s) RETURNING id",
        ("101","VitaSage Hospital 101","admin123@gmail.com","101 Health Avenue")
    )
    hosp_id = cur.fetchone()[0]
    print("[OK] Hospital 101 created")
else:
    hosp_id = hosp[0]
    print(f"[OK] Hospital 101 exists (id={hosp_id})")

# ── Doctor User: akash ────────────────────────────────────
cur.execute("SELECT id FROM users WHERE username = %s", ("akash",))
if cur.fetchone():
    cur.execute("UPDATE users SET password_hash=%s WHERE username=%s", (pwd_ctx.hash("271527"), "akash"))
    print("[OK] Doctor 'akash' password updated")
else:
    cur.execute(
        "INSERT INTO users (hospital_id, username, email, password_hash, role, full_name) VALUES (%s,%s,%s,%s,%s,%s)",
        (hosp_id, "akash", "akash@vitasage.com", pwd_ctx.hash("271527"), "doctor", "Dr. Akash Kumar")
    )
    print("[OK] Doctor 'akash' created")

# ── Seed Patient ──────────────────────────────────────────
cur.execute("SELECT id FROM patient_master WHERE abha_id = %s", ("123456789000",))
if not cur.fetchone():
    cur.execute("""
        INSERT INTO patient_master
          (abha_id, aadhaar, name, age, gender, blood_group, allergies,
           chronic_conditions, emergency_contact, emergency_phone, current_medicines, risk_level)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        ("123456789000","987654321098","Rahul Sharma",35,"Male","B+",
         "Penicillin, Sulfa drugs","Type 2 Diabetes, Hypertension",
         "Priya Sharma (Wife)","9876543210","Metformin 500mg, Amlodipine 5mg","High")
    )
    print("[OK] Seed patient created (ABHA: 123456789000)")
else:
    print("[OK] Seed patient already exists")

conn.commit()
cur.close()
conn.close()

print("\n[DONE] Module 2 Setup Complete!")
print("  Doctor Login  -> Hospital: 101 | User: akash | Pass: 271527")
print("  Test Patient  -> ABHA ID: 123456789000")
print("=" * 50)
