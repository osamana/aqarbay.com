"""
Fix admin login by recreating user with proper password hashing
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.db.models.user import User
from sqlalchemy import text


def fix_admin():
    db = SessionLocal()
    try:
        # Delete existing admin user
        db.execute(text("DELETE FROM users WHERE email = 'admin@example.com'"))
        db.commit()
        print("🗑️  Deleted old admin user")
        
        # Create new admin using raw SQL with a known bcrypt hash
        # This is bcrypt hash for "admin123"
        password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqgFx8KVBG"
        
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
        
        print("✅ Admin user recreated successfully!")
        print("📧 Email: admin@example.com")
        print("🔑 Password: admin123")
        print("\n🌐 Login at: http://localhost:3000/en/admin/login")
        
    except Exception as e:
        print(f"❌ Error fixing admin: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    fix_admin()

