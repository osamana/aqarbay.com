"""
Create admin user with a simple password
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.crud.crud_user import crud_user
from app.schemas.user import UserCreate


def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = crud_user.get_by_email(db, email="admin@example.com")
        if existing_admin:
            print(f"✅ Admin user admin@example.com already exists")
            return

        # Create admin user with short password
        admin_user = UserCreate(
            email="admin@example.com",
            password="admin123",  # Short password that works
            role="admin",
        )
        
        crud_user.create(db, obj_in=admin_user)
        print(f"✅ Admin user created successfully!")
        print(f"📧 Email: admin@example.com")
        print(f"🔑 Password: admin123")
        print(f"\n🌐 Login at: http://localhost:3000/en/admin/login")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()

