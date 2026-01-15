"""
Search-related endpoints for autocomplete and suggestions
"""
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_db
from app.services.meilisearch_service import meilisearch_service
from app.crud.crud_property import crud_property
from app.crud.crud_location import crud_location

router = APIRouter()


@router.get("/suggestions")
def get_search_suggestions(
    q: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Get search suggestions/autocomplete results.
    Returns property titles and locations that match the query.
    """
    if not q or len(q) < 1:
        return {"suggestions": []}
    
    suggestions = []
    
    # Use Meilisearch if available for fast autocomplete
    if meilisearch_service.is_available():
        try:
            results = meilisearch_service.search(
                query=q,
                filters={"published": True},
                limit=limit,
                offset=0,
            )
            
            for hit in results.get("hits", []):
                suggestions.append({
                    "type": "property",
                    "title_en": hit.get("title_en", ""),
                    "title_ar": hit.get("title_ar", ""),
                    "slug_en": hit.get("slug_en", ""),
                    "slug_ar": hit.get("slug_ar", ""),
                    "location": hit.get("location_name_en", ""),
                })
        except Exception as e:
            # Fallback to database if Meilisearch fails
            pass
    
    # Also search locations
    locations = crud_location.get_multi(db, skip=0, limit=limit * 2)
    for loc in locations:
        if q.lower() in loc.name_en.lower() or q.lower() in loc.name_ar.lower():
            suggestions.append({
                "type": "location",
                "name_en": loc.name_en,
                "name_ar": loc.name_ar,
                "slug_en": loc.slug_en,
                "slug_ar": loc.slug_ar,
            })
    
    return {"suggestions": suggestions[:limit]}


@router.post("/track")
def track_search(
    query: Optional[str] = None,
    filters: Optional[dict] = None,
    result_count: Optional[int] = None,
    request: Request = None,
    db: Session = Depends(get_db),
):
    """
    Track search queries for analytics.
    Stores search activity in the database.
    """
    from app.db.models.search_analytics import SearchAnalytics
    
    # Get IP and user agent if request is available
    ip_address = None
    user_agent = None
    if request:
        # Get IP from headers
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip_address = forwarded.split(",")[0].strip()
        else:
            real_ip = request.headers.get("X-Real-IP")
            if real_ip:
                ip_address = real_ip
            elif request.client:
                ip_address = request.client.host
        
        user_agent = request.headers.get("User-Agent")
    
    # Create analytics record
    search_analytics = SearchAnalytics(
        query=query,
        filters=filters,
        result_count=result_count,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    db.add(search_analytics)
    db.commit()
    
    return {"status": "tracked", "id": str(search_analytics.id)}

