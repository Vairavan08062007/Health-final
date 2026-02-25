"""
VitaSage AI -- Add Custom User
Adds Hospital 101 + admin user quickly.
Run: python add_user.py
"""
import asyncio
import sys
sys.path.insert(0, '.')

from passlib.context import CryptContext
from sqlalchemy import text
from app.database import engine, Base

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def add():
    print("\nVitaSage AI -- Adding Custom User")
    print("=" * 45)

    async with engine.begin() as conn:
        # Create tables if not exist
        await conn.run_sync(Base.metadata.create_all)

        # -- Hospital 101 --
        result = await conn.execute(
            text("SELECT id FROM hospitals WHERE hospital_id = :hid"),
            {"hid": "101"}
        )
        existing_hosp = result.fetchone()

        if existing_hosp:
            hospital_db_id = existing_hosp[0]
            print(f"[OK] Hospital 101 already exists (id={hospital_db_id})")
        else:
            result = await conn.execute(
                text("""
                    INSERT INTO hospitals (hospital_id, name, email, address)
                    VALUES (:hospital_id, :name, :email, :address)
                    RETURNING id
                """),
                {
                    "hospital_id": "101",
                    "name": "VitaSage Hospital 101",
                    "email": "admin123@gmail.com",
                    "address": "101 Health Avenue",
                }
            )
            hospital_db_id = result.fetchone()[0]
            print(f"[OK] Created Hospital: 101 (db id={hospital_db_id})")

        # -- Admin User --
        result = await conn.execute(
            text("SELECT id FROM users WHERE username = :u"),
            {"u": "admin123@gmail.com"}
        )
        if result.fetchone():
            print("[INFO] User 'admin123@gmail.com' already exists -- updating password...")
            hashed = pwd_ctx.hash("271527")
            await conn.execute(
                text("UPDATE users SET password_hash = :ph WHERE username = :u"),
                {"ph": hashed, "u": "admin123@gmail.com"}
            )
            print("[OK] Password updated!")
        else:
            hashed = pwd_ctx.hash("271527")
            await conn.execute(
                text("""
                    INSERT INTO users (hospital_id, username, email, password_hash, role, full_name)
                    VALUES (:hospital_id, :username, :email, :password_hash, :role, :full_name)
                """),
                {
                    "hospital_id": hospital_db_id,
                    "username": "admin123@gmail.com",
                    "email": "admin123@gmail.com",
                    "password_hash": hashed,
                    "role": "admin",
                    "full_name": "Admin User",
                }
            )
            print("[OK] Created user: admin123@gmail.com")

    print("\n[DONE] Login with:")
    print("   Hospital ID : 101")
    print("   Username    : admin123@gmail.com")
    print("   Password    : 271527")
    print("=" * 45)


if __name__ == "__main__":
    asyncio.run(add())
