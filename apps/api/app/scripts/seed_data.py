"""
Seed the database with sample data for development.
Usage: python -m app.scripts.seed_data
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.crud.crud_location import crud_location
from app.crud.crud_settings import crud_settings
from app.schemas.location import LocationCreate
from app.schemas.settings import SettingsUpdate


def seed_locations(db):
    """Create sample locations."""
    locations = [
        {"name_en": "Jerusalem", "name_ar": "القدس", "slug_en": "jerusalem", "slug_ar": "القدس"},
        {"name_en": "Ramallah", "name_ar": "رام الله", "slug_en": "ramallah", "slug_ar": "رام-الله"},
        {"name_en": "Nablus", "name_ar": "نابلس", "slug_en": "nablus", "slug_ar": "نابلس"},
        {"name_en": "Hebron", "name_ar": "الخليل", "slug_en": "hebron", "slug_ar": "الخليل"},
        {"name_en": "Gaza", "name_ar": "غزة", "slug_en": "gaza", "slug_ar": "غزة"},
        {"name_en": "Bethlehem", "name_ar": "بيت لحم", "slug_en": "bethlehem", "slug_ar": "بيت-لحم"},
    ]
    
    for loc_data in locations:
        existing = crud_location.get_by_slug(db, slug=loc_data["slug_en"])
        if not existing:
            crud_location.create(db, obj_in=LocationCreate(**loc_data))
            print(f"Created location: {loc_data['name_en']}")


def seed_settings(db):
    """Create or update default settings."""
    settings = crud_settings.get_or_create(db)
    crud_settings.update(db, db_obj=settings, obj_in=SettingsUpdate(
        site_name_en="Palestine Real Estate",
        site_name_ar="عقارات فلسطين",
        primary_color="#f5c325",
        meta_title_en="Find Your Dream Property in Palestine",
        meta_title_ar="اعثر على عقارك المثالي في فلسطين",
        meta_desc_en="Browse properties for sale and rent across Palestine",
        meta_desc_ar="تصفح العقارات للبيع والإيجار في جميع أنحاء فلسطين",
    ))
    print("Settings initialized")


def main():
    db = SessionLocal()
    try:
        print("Seeding database...")
        seed_locations(db)
        seed_settings(db)
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

