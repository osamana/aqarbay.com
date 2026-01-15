"""
Create admin user from environment variables.
Usage: python -m app.scripts.create_admin
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.crud.crud_user import crud_user
from app.schemas.user import UserCreate
from app.core.config import settings


def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = crud_user.get_by_email(db, email=settings.ADMIN_EMAIL)
        if existing_admin:
            print(f"Admin user {settings.ADMIN_EMAIL} already exists")
            return

        # Create admin user
        admin_user = UserCreate(
            email=settings.ADMIN_EMAIL,
            password=settings.ADMIN_PASSWORD,
            role="admin",
        )
        
        crud_user.create(db, obj_in=admin_user)
        print(f"Admin user created successfully: {settings.ADMIN_EMAIL}")
        print(f"Password: {settings.ADMIN_PASSWORD}")
        print("Please change the password after first login!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()

