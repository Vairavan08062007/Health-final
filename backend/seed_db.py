"""
VitaSage AI — Database Seeder
Generates correct bcrypt hashes and seeds the database.
Run: python seed_db.py
"""
import asyncio
import sys
sys.path.insert(0, '.')

from passlib.context import CryptContext
from sqlalchemy import text
from app.database import engine, Base
from app.models import Hospital, User

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

HOSPITAL = {
    "hospital_id": "HSP001",
    "name": "VitaSage General Hospital",
    "email": "admin@vitasage.com",
    "address": "123 Medical Drive, Health City",
}

USERS = [
    {"username": "admin",    "email": "admin@vitasage.com",    "password": "Admin@123", "role": "admin",  "full_name": "System Administrator"},
    {"username": "dr.smith", "email": "drsmith@vitasage.com",  "password": "Admin@123", "role": "doctor", "full_name": "Dr. John Smith"},
    {"username": "staff01",  "email": "staff01@vitasage.com",  "password": "Admin@123", "role": "staff",  "full_name": "Jane Receptionist"},
]


async def seed():
    print("\n🌱 VitaSage AI — Database Seeder")
    print("=" * 45)

    async with engine.begin() as conn:
        # Create all tables
        print("📦 Creating tables if not exist...")
        await conn.run_sync(Base.metadata.create_all)

        # Check if hospital already exists
        result = await conn.execute(
            text("SELECT id FROM hospitals WHERE hospital_id = :hid"),
            {"hid": HOSPITAL["hospital_id"]}
        )
        existing = result.fetchone()

        if existing:
            hospital_db_id = existing[0]
            print(f"✅ Hospital {HOSPITAL['hospital_id']} already exists (id={hospital_db_id})")
        else:
            result = await conn.execute(
                text("""
                    INSERT INTO hospitals (hospital_id, name, email, address)
                    VALUES (:hospital_id, :name, :email, :address)
                    RETURNING id
                """),
                HOSPITAL
            )
            hospital_db_id = result.fetchone()[0]
            print(f"✅ Created hospital: {HOSPITAL['hospital_id']} (id={hospital_db_id})")

        # Seed users
        print("\n👤 Seeding users...")
        for u in USERS:
            check = await conn.execute(
                text("SELECT id FROM users WHERE username = :username"),
                {"username": u["username"]}
            )
            if check.fetchone():
                print(f"   ⚠  User '{u['username']}' already exists — skipping")
                continue

            hashed = pwd_ctx.hash(u["password"])
            await conn.execute(
                text("""
                    INSERT INTO users (hospital_id, username, email, password_hash, role, full_name)
                    VALUES (:hospital_id, :username, :email, :password_hash, :role, :full_name)
                """),
                {
                    "hospital_id": hospital_db_id,
                    "username": u["username"],
                    "email": u["email"],
                    "password_hash": hashed,
                    "role": u["role"],
                    "full_name": u["full_name"],
                }
            )
            print(f"   ✅ Created {u['role']}: {u['username']} / {u['password']}")

    print("\n🎉 Seeding complete!")
    print("\n🔑 Login Credentials:")
    print("   Hospital ID : HSP001")
    print("   Password    : Admin@123")
    print("   Users       : admin | dr.smith | staff01")
    print("=" * 45)


if __name__ == "__main__":
    asyncio.run(seed())
