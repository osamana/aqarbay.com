"""
Create admin user using the system's password hashing
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.db.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import text


def create_admin():
    db = SessionLocal()
    try:
        # Delete existing admin user
        db.execute(text("DELETE FROM users WHERE email = 'admin@example.com'"))
        db.commit()
        print("🗑️  Deleted old admin user")
        
        # Hash password using the system's method
        password_hash = get_password_hash("admin123")
        
        # Create new admin
        db.execute(text("""
            INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                'admin@example.com',
                :password_hash,
                'admin',
                true,
                NOW(),
                NOW()
            )
        """), {"password_hash": password_hash})
        
        db.commit()
        
        print("✅ Admin user created successfully!")
        print("📧 Email: admin@example.com")
        print("🔑 Password: admin123")
        print("\n🌐 Login at: http://localhost:3000/en/admin/login")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()

