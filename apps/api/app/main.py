from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.rate_limit import rate_limit_middleware
from app.api.routes import (
    auth,
    public,
    admin_properties,
    admin_locations,
    admin_agents,
    admin_leads,
    admin_settings,
    uploads,
    search,
    user_accounts,
    email_alerts,
)

app = FastAPI(
    title="Palestine Real Estate API",
    description="API for Palestine Real Estate platform",
    version="1.0.0",
)

# Rate limiting middleware (must be before CORS)
app.middleware("http")(rate_limit_middleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.PUBLIC_WEB_ORIGIN, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public routes
app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(user_accounts.router, prefix="/api/user", tags=["user-accounts"])
app.include_router(email_alerts.router, prefix="/api/email-alerts", tags=["email-alerts"])

# Auth routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Admin routes
app.include_router(admin_properties.router, prefix="/api/admin/properties", tags=["admin-properties"])
app.include_router(admin_locations.router, prefix="/api/admin/locations", tags=["admin-locations"])
app.include_router(admin_agents.router, prefix="/api/admin/agents", tags=["admin-agents"])
app.include_router(admin_leads.router, prefix="/api/admin/leads", tags=["admin-leads"])
app.include_router(admin_settings.router, prefix="/api/admin/settings", tags=["admin-settings"])
app.include_router(uploads.router, prefix="/api/admin/uploads", tags=["admin-uploads"])


@app.get("/")
def read_root():
    return {"message": "Palestine Real Estate API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

