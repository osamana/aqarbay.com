"""
Seed database with real property listings and images from the internet
"""
import sys
import os
import uuid
import requests
from datetime import datetime
from io import BytesIO

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.db.models.property import Property, PropertyPurpose, PropertyType, PropertyStatus, PropertyCurrency
from app.db.models.property_image import PropertyImage
from app.db.models.location import Location
from app.db.models.agent import Agent  # Import to ensure SQLAlchemy knows about it
from app.db.models.user import User  # Import to ensure SQLAlchemy knows about it
from app.db.models.lead import Lead  # Import to ensure SQLAlchemy knows about it
from app.db.models.settings import Settings  # Import to ensure SQLAlchemy knows about it
from app.services.minio_service import minio_service
from slugify import slugify


# Sample property data with real estate images from Unsplash
PROPERTIES = [
    {
        "title_en": "Luxury Villa in Ramallah",
        "title_ar": "فيلا فاخرة في رام الله",
        "description_en": "Stunning 4-bedroom villa with modern amenities, private garden, and panoramic city views. Perfect for families seeking luxury and comfort.",
        "description_ar": "فيلا رائعة من 4 غرف نوم مع وسائل راحة حديثة وحديقة خاصة وإطلالات بانورامية على المدينة. مثالية للعائلات التي تبحث عن الفخامة والراحة.",
        "purpose": PropertyPurpose.sell,
        "type": PropertyType.villa,
        "price_amount": 450000,
        "price_currency": PropertyCurrency.USD,
        "area_m2": 350,
        "bedrooms": 4,
        "bathrooms": 3,
        "furnished": True,
        "parking": True,
        "year_built": 2020,
        "location_name": "Ramallah",
        "images": [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",  # Modern house exterior
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",  # Living room
            "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800",  # Kitchen
        ]
    },
    {
        "title_en": "Modern Apartment in Jerusalem",
        "title_ar": "شقة حديثة في القدس",
        "description_en": "Spacious 3-bedroom apartment in the heart of Jerusalem. Close to schools, shops, and public transportation. Recently renovated with high-quality finishes.",
        "description_ar": "شقة واسعة من 3 غرف نوم في قلب القدس. قريبة من المدارس والمحلات التجارية ووسائل النقل العام. تم تجديدها مؤخرًا بتشطيبات عالية الجودة.",
        "purpose": PropertyPurpose.sell,
        "type": PropertyType.apartment,
        "price_amount": 280000,
        "price_currency": PropertyCurrency.USD,
        "area_m2": 145,
        "bedrooms": 3,
        "bathrooms": 2,
        "furnished": False,
        "parking": True,
        "floor": 3,
        "year_built": 2018,
        "location_name": "Jerusalem",
        "images": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",  # Apartment building
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",  # Modern interior
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",  # Bedroom
        ]
    },
    {
        "title_en": "Cozy House in Bethlehem",
        "title_ar": "منزل مريح في بيت لحم",
        "description_en": "Charming 2-bedroom house with traditional Palestinian architecture. Features a beautiful courtyard and rooftop terrace. Ideal for small families.",
        "description_ar": "منزل جذاب من غرفتي نوم بعمارة فلسطينية تقليدية. يتميز بفناء جميل وتراس على السطح. مثالي للعائلات الصغيرة.",
        "purpose": PropertyPurpose.sell,
        "type": PropertyType.house,
        "price_amount": 185000,
        "price_currency": PropertyCurrency.USD,
        "area_m2": 120,
        "bedrooms": 2,
        "bathrooms": 1,
        "furnished": False,
        "parking": False,
        "year_built": 2015,
        "location_name": "Bethlehem",
        "images": [
            "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800",  # Stone house
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",  # Courtyard
        ]
    },
    {
        "title_en": "Downtown Commercial Space in Nablus",
        "title_ar": "مساحة تجارية في وسط نابلس",
        "description_en": "Prime commercial space in downtown Nablus. Perfect for retail or office use. High foot traffic area with excellent visibility.",
        "description_ar": "مساحة تجارية مميزة في وسط مدينة نابلس. مثالية للتجزئة أو الاستخدام المكتبي. منطقة ذات حركة مشاة عالية ورؤية ممتازة.",
        "purpose": PropertyPurpose.rent,
        "type": PropertyType.commercial,
        "price_amount": 2500,
        "price_currency": PropertyCurrency.USD,
        "area_m2": 85,
        "bedrooms": None,
        "bathrooms": 1,
        "furnished": False,
        "parking": False,
        "floor": 1,
        "year_built": 2010,
        "location_name": "Nablus",
        "images": [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",  # Office space
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",  # Modern office
        ]
    },
    {
        "title_en": "Furnished Apartment for Rent in Ramallah",
        "title_ar": "شقة مفروشة للإيجار في رام الله",
        "description_en": "Fully furnished 2-bedroom apartment available for rent. Modern appliances, utilities included. Move-in ready!",
        "description_ar": "شقة مفروشة بالكامل من غرفتي نوم متاحة للإيجار. أجهزة حديثة، المرافق مشمولة. جاهزة للسكن فورًا!",
        "purpose": PropertyPurpose.rent,
        "type": PropertyType.apartment,
        "price_amount": 800,
        "price_currency": PropertyCurrency.USD,
        "area_m2": 90,
        "bedrooms": 2,
        "bathrooms": 1,
        "furnished": True,
        "parking": True,
        "floor": 2,
        "year_built": 2019,
        "location_name": "Ramallah",
        "images": [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",  # Furnished apartment
            "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800",  # Modern kitchen
        ]
    },
    {
        "title_en": "Building Land in Hebron",
        "title_ar": "أرض للبناء في الخليل",
        "description_en": "Excellent opportunity! 500m² buildable land in a developing area of Hebron. All utilities available. Perfect for residential development.",
        "description_ar": "فرصة ممتازة! أرض قابلة للبناء بمساحة 500 متر مربع في منطقة نامية من الخليل. جميع المرافق متوفرة. مثالية للتطوير السكني.",
        "purpose": PropertyPurpose.sell,
        "type": PropertyType.land,
        "price_amount": 95000,
        "price_currency": PropertyCurrency.USD,
        "area_m2": 500,
        "bedrooms": None,
        "bathrooms": None,
        "furnished": False,
        "parking": False,
        "year_built": None,
        "location_name": "Hebron",
        "images": [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",  # Land
            "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=800",  # Landscape
        ]
    },
]


def download_and_upload_image(url: str, property_id: str) -> str:
    """Download image from URL and upload to MinIO"""
    try:
        # Download image
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Generate file key
        file_extension = "jpg"
        file_key = f"properties/{property_id}/{uuid.uuid4()}.{file_extension}"
        
        # Upload to MinIO
        minio_service.client.put_object(
            minio_service.bucket_name,
            file_key,
            BytesIO(response.content),
            length=len(response.content),
            content_type='image/jpeg'
        )
        
        print(f"  ✓ Uploaded image: {file_key}")
        return file_key
        
    except Exception as e:
        print(f"  ✗ Failed to download/upload image from {url}: {e}")
        return None


def seed_properties():
    db = SessionLocal()
    try:
        print("🌱 Seeding properties with real images...\n")
        
        # Get locations
        locations = {loc.name_en: loc for loc in db.query(Location).all()}
        
        for prop_data in PROPERTIES:
            # Check if property already exists
            existing = db.query(Property).filter(
                Property.title_en == prop_data["title_en"]
            ).first()
            
            if existing:
                print(f"⏭️  Skipping '{prop_data['title_en']}' (already exists)")
                continue
            
            # Get location
            location = locations.get(prop_data["location_name"])
            if not location:
                print(f"❌ Location '{prop_data['location_name']}' not found")
                continue
            
            # Create property
            property_id = uuid.uuid4()
            prop = Property(
                id=property_id,
                title_en=prop_data["title_en"],
                title_ar=prop_data["title_ar"],
                slug_en=slugify(prop_data["title_en"]),
                slug_ar=slugify(prop_data["title_ar"], allow_unicode=True),
                description_en=prop_data["description_en"],
                description_ar=prop_data["description_ar"],
                purpose=prop_data["purpose"],
                type=prop_data["type"],
                status=PropertyStatus.available,
                price_amount=prop_data["price_amount"],
                price_currency=prop_data["price_currency"],
                area_m2=prop_data.get("area_m2"),
                bedrooms=prop_data.get("bedrooms"),
                bathrooms=prop_data.get("bathrooms"),
                furnished=prop_data["furnished"],
                parking=prop_data["parking"],
                floor=prop_data.get("floor"),
                year_built=prop_data.get("year_built"),
                featured=True,  # Mark all as featured for demo
                published=True,  # Publish all
                location_id=location.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(prop)
            db.flush()  # Get the ID
            
            print(f"📝 Created: {prop_data['title_en']}")
            
            # Download and add images
            for idx, image_url in enumerate(prop_data["images"]):
                file_key = download_and_upload_image(image_url, str(property_id))
                if file_key:
                    image = PropertyImage(
                        id=uuid.uuid4(),
                        property_id=property_id,
                        file_key=file_key,
                        alt_en=prop_data["title_en"],
                        alt_ar=prop_data["title_ar"],
                        sort_order=idx,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(image)
            
            print()
        
        db.commit()
        print("✅ Seeding completed successfully!")
        print(f"\n🌐 View properties at: http://localhost:3000/en")
        
    except Exception as e:
        print(f"❌ Error seeding properties: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_properties()

