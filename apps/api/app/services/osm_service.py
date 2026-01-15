"""
OpenStreetMap service for fetching nearby Points of Interest (POIs)
Uses Overpass API to query OSM data
"""
import httpx
from typing import List, Dict, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Overpass API endpoint (public, free, rate-limited)
OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"

# POI categories with their OSM tags
POI_CATEGORIES = {
    "schools": {
        "query": 'node["amenity"~"^(school|university|kindergarten|college)$"](around:{radius},{lat},{lng});',
        "icon": "school",
    },
    "mosques": {
        "query": 'node["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lng});',
        "icon": "mosque",
    },
    "hospitals": {
        "query": 'node["amenity"~"^(hospital|clinic|pharmacy)$"](around:{radius},{lat},{lng});',
        "icon": "hospital",
    },
    "supermarkets": {
        "query": 'node["shop"~"^(supermarket|convenience|grocery)$"](around:{radius},{lat},{lng});',
        "icon": "store",
    },
    "banks": {
        "query": 'node["amenity"="bank"](around:{radius},{lat},{lng});',
        "icon": "bank",
    },
    "restaurants": {
        "query": 'node["amenity"~"^(restaurant|cafe|fast_food)$"](around:{radius},{lat},{lng});',
        "icon": "restaurant",
    },
    "parks": {
        "query": 'node["leisure"~"^(park|playground)$"](around:{radius},{lat},{lng});',
        "icon": "park",
    },
    "gas_stations": {
        "query": 'node["amenity"="fuel"](around:{radius},{lat},{lng});',
        "icon": "gas_station",
    },
}


class OSMService:
    """Service for querying OpenStreetMap data via Overpass API"""

    def __init__(self):
        self.api_url = OVERPASS_API_URL
        self.timeout = 30.0  # Overpass API can be slow

    def _build_overpass_query(
        self, lat: float, lng: float, radius: int = 1000, categories: Optional[List[str]] = None
    ) -> str:
        """
        Build Overpass QL query for nearby POIs.
        
        Args:
            lat: Latitude
            lng: Longitude
            radius: Search radius in meters (default: 1000m = 1km)
            categories: List of category keys from POI_CATEGORIES (None = all)
        
        Returns:
            Overpass QL query string
        """
        if categories is None:
            categories = list(POI_CATEGORIES.keys())
        
        # Build query parts for each category
        query_parts = []
        for category in categories:
            if category in POI_CATEGORIES:
                query_template = POI_CATEGORIES[category]["query"]
                query_parts.append(
                    query_template.format(radius=radius, lat=lat, lng=lng)
                )
        
        # Combine into full query
        query = f"""
        [out:json][timeout:25];
        (
            {''.join(query_parts)}
        );
        out body;
        >;
        out skel qt;
        """
        return query

    async def get_nearby_pois(
        self,
        lat: float,
        lng: float,
        radius: int = 1000,
        categories: Optional[List[str]] = None,
        limit_per_category: int = 10,
    ) -> Dict[str, List[Dict]]:
        """
        Get nearby Points of Interest from OpenStreetMap.
        
        Args:
            lat: Latitude
            lng: Longitude
            radius: Search radius in meters (default: 1000m = 1km)
            categories: List of category keys (None = all)
            limit_per_category: Max number of results per category
        
        Returns:
            Dictionary with category keys and lists of POI objects
            Example:
            {
                "schools": [
                    {
                        "name": "Al-Aqsa School",
                        "lat": 31.7683,
                        "lng": 35.2137,
                        "distance": 250.5,
                        "type": "school"
                    }
                ],
                "mosques": [...]
            }
        """
        if not lat or not lng:
            return {}
        
        try:
            query = self._build_overpass_query(lat, lng, radius, categories)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.api_url,
                    data=query,
                    headers={"Content-Type": "text/plain"},
                )
                response.raise_for_status()
                data = response.json()
                
                # Parse Overpass response
                return self._parse_overpass_response(
                    data, lat, lng, categories, limit_per_category
                )
        
        except httpx.TimeoutException:
            logger.error(f"Overpass API timeout for ({lat}, {lng})")
            return {}
        except httpx.HTTPStatusError as e:
            logger.error(f"Overpass API error: {e.response.status_code}")
            return {}
        except Exception as e:
            logger.error(f"Error fetching POIs: {e}")
            return {}

    def _parse_overpass_response(
        self,
        data: Dict,
        origin_lat: float,
        origin_lng: float,
        categories: Optional[List[str]],
        limit_per_category: int,
    ) -> Dict[str, List[Dict]]:
        """Parse Overpass API response into structured POI data."""
        if categories is None:
            categories = list(POI_CATEGORIES.keys())
        
        result = {category: [] for category in categories}
        
        if "elements" not in data:
            return result
        
        # Group elements by category based on their tags
        for element in data["elements"]:
            if element.get("type") != "node":
                continue
            
            tags = element.get("tags", {})
            lat = element.get("lat")
            lng = element.get("lon")
            
            if not lat or not lng:
                continue
            
            # Calculate distance from origin
            distance = self._calculate_distance(origin_lat, origin_lng, lat, lng)
            
            # Determine category
            category = self._categorize_poi(tags)
            if not category or category not in categories:
                continue
            
            # Extract name (prefer Arabic name if available, fallback to English)
            name = (
                tags.get("name:ar")
                or tags.get("name")
                or tags.get("amenity")
                or tags.get("shop")
                or "Unknown"
            )
            
            poi = {
                "name": name,
                "name_en": tags.get("name"),
                "name_ar": tags.get("name:ar"),
                "lat": lat,
                "lng": lng,
                "distance": round(distance, 1),  # Distance in meters
                "type": tags.get("amenity") or tags.get("shop") or tags.get("leisure"),
                "address": tags.get("addr:street") or tags.get("address"),
            }
            
            result[category].append(poi)
        
        # Sort by distance and limit results per category
        for category in result:
            result[category].sort(key=lambda x: x["distance"])
            result[category] = result[category][:limit_per_category]
        
        return result

    def _categorize_poi(self, tags: Dict[str, str]) -> Optional[str]:
        """Determine POI category based on OSM tags."""
        amenity = tags.get("amenity", "").lower()
        shop = tags.get("shop", "").lower()
        leisure = tags.get("leisure", "").lower()
        religion = tags.get("religion", "").lower()
        
        # Schools
        if amenity in ["school", "university", "kindergarten", "college"]:
            return "schools"
        
        # Mosques
        if amenity == "place_of_worship" and religion == "muslim":
            return "mosques"
        
        # Hospitals
        if amenity in ["hospital", "clinic", "pharmacy"]:
            return "hospitals"
        
        # Supermarkets
        if shop in ["supermarket", "convenience", "grocery"]:
            return "supermarkets"
        
        # Banks
        if amenity == "bank":
            return "banks"
        
        # Restaurants
        if amenity in ["restaurant", "cafe", "fast_food"]:
            return "restaurants"
        
        # Parks
        if leisure in ["park", "playground"]:
            return "parks"
        
        # Gas stations
        if amenity == "fuel":
            return "gas_stations"
        
        return None

    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula.
        Returns distance in meters.
        """
        from math import radians, cos, sin, asin, sqrt
        
        # Convert to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))
        
        # Earth radius in meters
        r = 6371000
        
        return c * r


# Singleton instance
osm_service = OSMService()

