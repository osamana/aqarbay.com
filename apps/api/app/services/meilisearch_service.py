from typing import Optional, List, Dict, Any
from meilisearch import Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Meilisearch client
meilisearch_client: Optional[Client] = None

if settings.MEILI_URL and settings.MEILI_MASTER_KEY:
    try:
        meilisearch_client = Client(
            url=settings.MEILI_URL,
            api_key=settings.MEILI_MASTER_KEY,
        )
        logger.info("Meilisearch client initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize Meilisearch: {e}")
        meilisearch_client = None
else:
    logger.warning("Meilisearch not configured (MEILI_URL or MEILI_MASTER_KEY missing)")


class MeilisearchService:
    """Service for Meilisearch operations."""
    
    INDEX_NAME = "properties"
    
    def __init__(self):
        self.client = meilisearch_client
    
    def is_available(self) -> bool:
        """Check if Meilisearch is available."""
        return self.client is not None
    
    def ensure_index(self):
        """Create index if it doesn't exist and configure settings."""
        if not self.is_available():
            return
        
        try:
            # Get or create index
            index = self.client.index(self.INDEX_NAME)
            
            # Configure searchable attributes
            index.update_searchable_attributes([
                "title_en",
                "title_ar",
                "description_en",
                "description_ar",
                "location_name_en",
                "location_name_ar",
            ])
            
            # Configure filterable attributes
            index.update_filterable_attributes([
                "purpose",
                "type",
                "status",
                "price_amount",
                "price_currency",
                "bedrooms",
                "bathrooms",
                "area_m2",
                "furnished",
                "parking",
                "featured",
                "published",
                "location_id",
                "location_slug_en",
                "location_slug_ar",
            ])
            
            # Configure sortable attributes
            index.update_sortable_attributes([
                "price_amount",
                "created_at",
                "area_m2",
            ])
            
            logger.info(f"Meilisearch index '{self.INDEX_NAME}' configured")
            
        except Exception as e:
            logger.error(f"Error configuring Meilisearch index: {e}")
    
    def index_property(self, property_data: Dict[str, Any]):
        """
        Index a single property.
        
        Args:
            property_data: Property data dictionary with all fields
        """
        if not self.is_available():
            return
        
        try:
            self.ensure_index()
            index = self.client.index(self.INDEX_NAME)
            
            # Prepare document for indexing
            document = {
                "id": str(property_data.get("id")),
                "title_en": property_data.get("title_en", ""),
                "title_ar": property_data.get("title_ar", ""),
                "slug_en": property_data.get("slug_en", ""),
                "slug_ar": property_data.get("slug_ar", ""),
                "description_en": property_data.get("description_en", ""),
                "description_ar": property_data.get("description_ar", ""),
                "purpose": property_data.get("purpose"),
                "type": property_data.get("type"),
                "status": property_data.get("status"),
                "price_amount": float(property_data.get("price_amount", 0)),
                "price_currency": property_data.get("price_currency"),
                "area_m2": float(property_data.get("area_m2", 0)) if property_data.get("area_m2") else None,
                "bedrooms": property_data.get("bedrooms"),
                "bathrooms": property_data.get("bathrooms"),
                "furnished": property_data.get("furnished", False),
                "parking": property_data.get("parking", False),
                "floor": property_data.get("floor"),
                "year_built": property_data.get("year_built"),
                "featured": property_data.get("featured", False),
                "published": property_data.get("published", False),
                "location_id": str(property_data.get("location_id", "")),
                "location_name_en": property_data.get("location_name_en", ""),
                "location_name_ar": property_data.get("location_name_ar", ""),
                "location_slug_en": property_data.get("location_slug_en", ""),
                "location_slug_ar": property_data.get("location_slug_ar", ""),
                "agent_id": str(property_data.get("agent_id", "")) if property_data.get("agent_id") else None,
                "created_at": property_data.get("created_at"),
            }
            
            index.add_documents([document])
            logger.debug(f"Indexed property: {document['id']}")
            
        except Exception as e:
            logger.error(f"Error indexing property: {e}")
    
    def update_property(self, property_data: Dict[str, Any]):
        """Update an indexed property."""
        self.index_property(property_data)  # Meilisearch handles updates via add_documents
    
    def delete_property(self, property_id: str):
        """Delete a property from the index."""
        if not self.is_available():
            return
        
        try:
            index = self.client.index(self.INDEX_NAME)
            index.delete_document(property_id)
            logger.debug(f"Deleted property from index: {property_id}")
        except Exception as e:
            logger.error(f"Error deleting property from index: {e}")
    
    def search(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        sort: Optional[List[str]] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """
        Search properties.
        
        Args:
            query: Search query string
            filters: Filter dictionary (e.g., {"purpose": "sell", "type": "apartment"})
            sort: Sort order (e.g., ["price_amount:asc"])
            limit: Maximum results
            offset: Offset for pagination
        
        Returns:
            Search results dictionary with hits, total, etc.
        """
        if not self.is_available():
            return {
                "hits": [],
                "total": 0,
                "offset": offset,
                "limit": limit,
            }
        
        try:
            self.ensure_index()
            index = self.client.index(self.INDEX_NAME)
            
            # Build filter string
            filter_str = None
            if filters:
                filter_parts = []
                for key, value in filters.items():
                    if value is not None:
                        if isinstance(value, bool):
                            filter_parts.append(f"{key} = {str(value).lower()}")
                        elif isinstance(value, (int, float)):
                            filter_parts.append(f"{key} = {value}")
                        else:
                            filter_parts.append(f"{key} = '{value}'")
                if filter_parts:
                    filter_str = " AND ".join(filter_parts)
            
            # Perform search
            search_params = {
                "limit": limit,
                "offset": offset,
            }
            
            if filter_str:
                search_params["filter"] = filter_str
            
            if sort:
                search_params["sort"] = sort
            
            results = index.search(query, search_params)
            
            return {
                "hits": results.get("hits", []),
                "total": results.get("estimatedTotalHits", 0),
                "offset": offset,
                "limit": limit,
            }
            
        except Exception as e:
            logger.error(f"Error searching Meilisearch: {e}")
            return {
                "hits": [],
                "total": 0,
                "offset": offset,
                "limit": limit,
            }
    
    def bulk_index(self, properties: List[Dict[str, Any]]):
        """Bulk index multiple properties."""
        if not self.is_available():
            return
        
        try:
            self.ensure_index()
            index = self.client.index(self.INDEX_NAME)
            
            documents = []
            for prop_data in properties:
                document = {
                    "id": str(prop_data.get("id")),
                    "title_en": prop_data.get("title_en", ""),
                    "title_ar": prop_data.get("title_ar", ""),
                    "slug_en": prop_data.get("slug_en", ""),
                    "slug_ar": prop_data.get("slug_ar", ""),
                    "description_en": prop_data.get("description_en", ""),
                    "description_ar": prop_data.get("description_ar", ""),
                    "purpose": prop_data.get("purpose"),
                    "type": prop_data.get("type"),
                    "status": prop_data.get("status"),
                    "price_amount": float(prop_data.get("price_amount", 0)),
                    "price_currency": prop_data.get("price_currency"),
                    "area_m2": float(prop_data.get("area_m2", 0)) if prop_data.get("area_m2") else None,
                    "bedrooms": prop_data.get("bedrooms"),
                    "bathrooms": prop_data.get("bathrooms"),
                    "furnished": prop_data.get("furnished", False),
                    "parking": prop_data.get("parking", False),
                    "floor": prop_data.get("floor"),
                    "year_built": prop_data.get("year_built"),
                    "featured": prop_data.get("featured", False),
                    "published": prop_data.get("published", False),
                    "location_id": str(prop_data.get("location_id", "")),
                    "location_name_en": prop_data.get("location_name_en", ""),
                    "location_name_ar": prop_data.get("location_name_ar", ""),
                    "location_slug_en": prop_data.get("location_slug_en", ""),
                    "location_slug_ar": prop_data.get("location_slug_ar", ""),
                    "agent_id": str(prop_data.get("agent_id", "")) if prop_data.get("agent_id") else None,
                    "created_at": prop_data.get("created_at"),
                }
                documents.append(document)
            
            if documents:
                index.add_documents(documents)
                logger.info(f"Bulk indexed {len(documents)} properties")
            
        except Exception as e:
            logger.error(f"Error bulk indexing properties: {e}")


# Singleton instance
meilisearch_service = MeilisearchService()

