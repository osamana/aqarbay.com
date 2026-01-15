"""
Create admin user directly using bcrypt
"""
import sys
import os
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.db.models.user import User, UserRole
import bcrypt


def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.email == "admin@example.com").first()
        if existing:
            print(f"✅ Admin user admin@example.com already exists")
            print(f"📧 Email: admin@example.com")
            print(f"🔑 Password: admin123")
            print(f"\n🌐 Login at: http://localhost:3000/en/admin/login")
            return

        # Hash password with bcrypt directly
        password = "admin123"
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create admin user
        admin_user = User(
            id=uuid.uuid4(),
            email="admin@example.com",
            password_hash=password_hash,
            role=UserRole.admin,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(admin_user)
        db.commit()
        
        print(f"✅ Admin user created successfully!")
        print(f"📧 Email: admin@example.com")
        print(f"🔑 Password: admin123")
        print(f"\n🌐 Login at: http://localhost:3000/en/admin/login")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()

