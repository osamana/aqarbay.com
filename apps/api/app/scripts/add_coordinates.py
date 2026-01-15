"""
Add GPS coordinates to locations and properties for map display
"""
import sys
import os
import random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.db.models.location import Location
from app.db.models.property import Property

# Real GPS coordinates for Palestinian cities (center points)
LOCATION_COORDINATES = {
    "Jerusalem": {"lat": 31.7683, "lng": 35.2137},
    "Ramallah": {"lat": 31.9038, "lng": 35.2034},
    "Nablus": {"lat": 32.2211, "lng": 35.2544},
    "Hebron": {"lat": 31.5292, "lng": 35.0938},
    "Gaza": {"lat": 31.5, "lng": 34.4667},
    "Bethlehem": {"lat": 31.7054, "lng": 35.2024},
    "Jericho": {"lat": 31.8607, "lng": 35.4571},
    "Jenin": {"lat": 32.4608, "lng": 35.2972},
    "Tulkarm": {"lat": 32.3115, "lng": 35.0283},
    "Qalqilya": {"lat": 32.1897, "lng": 34.9708},
}

def add_slight_variation(lat: float, lng: float, variation: float = 0.02):
    """
    Add slight random variation to coordinates so properties in same city
    don't appear at exact same spot on map
    """
    lat_offset = (random.random() - 0.5) * variation
    lng_offset = (random.random() - 0.5) * variation
    return round(lat + lat_offset, 6), round(lng + lng_offset, 6)

def update_coordinates():
    db = SessionLocal()
    try:
        print("🗺️  Adding GPS coordinates to locations and properties...\n")
        
        # Update location coordinates
        print("📍 Updating location coordinates:")
        locations = db.query(Location).all()
        for location in locations:
            coords = LOCATION_COORDINATES.get(location.name_en)
            if coords:
                location.lat = coords["lat"]
                location.lng = coords["lng"]
                print(f"  ✓ {location.name_en}: ({coords['lat']}, {coords['lng']})")
            else:
                print(f"  ⚠️  No coordinates found for: {location.name_en}")
        
        db.commit()
        print()
        
        # Update property coordinates based on their location
        print("🏠 Updating property coordinates:")
        properties = db.query(Property).all()
        updated_count = 0
        
        for prop in properties:
            if prop.location:
                # Get location coordinates
                loc_coords = LOCATION_COORDINATES.get(prop.location.name_en)
                if loc_coords:
                    # Add slight variation so properties don't overlap on map
                    prop.lat, prop.lng = add_slight_variation(
                        loc_coords["lat"], 
                        loc_coords["lng"]
                    )
                    title = prop.title_en[:50] + "..." if len(prop.title_en) > 50 else prop.title_en
                    print(f"  ✓ {title}")
                    print(f"    Location: {prop.location.name_en} ({prop.lat}, {prop.lng})")
                    updated_count += 1
                else:
                    print(f"  ⚠️  No coordinates for location: {prop.location.name_en}")
        
        db.commit()
        
        print(f"\n✅ Successfully updated coordinates:")
        print(f"   - {len([loc for loc in locations if loc.lat])} locations")
        print(f"   - {updated_count} properties")
        print(f"\n🗺️  Properties should now appear on the map!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_coordinates()

