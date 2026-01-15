"""
Utility functions for API serialization
"""
from typing import Any, List
from decimal import Decimal
from datetime import datetime


def serialize_model(obj: Any) -> dict:
    """Serialize a SQLAlchemy model to dictionary"""
    result = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        
        # Handle different types
        if value is None:
            result[column.name] = None
        elif isinstance(value, datetime):
            result[column.name] = value.isoformat()
        elif isinstance(value, Decimal):
            result[column.name] = float(value)
        elif isinstance(value, (int, str, bool, float)):
            result[column.name] = value
        elif hasattr(value, 'value'):  # Enum
            result[column.name] = value.value
        else:
            result[column.name] = str(value)
    
    return result


def serialize_model_list(objects: List[Any]) -> List[dict]:
    """Serialize a list of SQLAlchemy models"""
    return [serialize_model(obj) for obj in objects]

