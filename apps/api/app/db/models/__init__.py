# Import all models in the correct order to avoid circular imports
from app.db.models.user import User, UserRole
from app.db.models.agent import Agent
from app.db.models.location import Location
from app.db.models.settings import Settings
from app.db.models.property import Property, PropertyPurpose, PropertyType, PropertyStatus, PropertyCurrency
from app.db.models.property_image import PropertyImage
from app.db.models.property_poi import PropertyPOI
from app.db.models.lead import Lead, LeadStatus
from app.db.models.search_analytics import SearchAnalytics
from app.db.models.activity_log import ActivityLog, ActivityType
from app.db.models.email_alert import EmailAlert
from app.db.models.user_account import UserAccount

__all__ = [
    "User",
    "UserRole",
    "Agent",
    "Location",
    "Settings",
    "Property",
    "PropertyPurpose",
    "PropertyType",
    "PropertyStatus",
    "PropertyCurrency",
    "PropertyImage",
    "PropertyPOI",
    "Lead",
    "LeadStatus",
    "SearchAnalytics",
    "ActivityLog",
    "ActivityType",
    "EmailAlert",
    "UserAccount",
]

