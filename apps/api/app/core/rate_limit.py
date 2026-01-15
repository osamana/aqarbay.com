from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Callable
import redis
from app.core.config import settings
import time

# Initialize Redis client
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    redis_client = None


class RateLimiter:
    """
    Rate limiter using Redis.
    Limits requests per IP address.
    """
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        requests_per_day: int = 10000,
    ):
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.requests_per_day = requests_per_day
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        # Check for forwarded IP (behind proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        # Check for real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct client
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def is_rate_limited(self, key: str, limit: int, window: int) -> bool:
        """
        Check if rate limit is exceeded.
        
        Args:
            key: Redis key (e.g., "rate_limit:ip:127.0.0.1:minute")
            limit: Maximum requests allowed
            window: Time window in seconds
        
        Returns:
            True if rate limited, False otherwise
        """
        if not redis_client:
            # If Redis is not available, allow all requests
            return False
        
        try:
            current = redis_client.get(key)
            
            if current is None:
                # First request in this window
                redis_client.setex(key, window, "1")
                return False
            
            current_count = int(current)
            
            if current_count >= limit:
                return True
            
            # Increment counter
            redis_client.incr(key)
            return False
            
        except Exception as e:
            # If Redis fails, log but don't block requests
            print(f"Rate limit check failed: {e}")
            return False
    
    def check_rate_limit(self, request: Request) -> bool:
        """
        Check if request should be rate limited.
        
        Returns:
            True if rate limited, False otherwise
        """
        ip = self.get_client_ip(request)
        
        # Check minute limit
        minute_key = f"rate_limit:{ip}:minute:{int(time.time() / 60)}"
        if self.is_rate_limited(minute_key, self.requests_per_minute, 60):
            return True
        
        # Check hour limit
        hour_key = f"rate_limit:{ip}:hour:{int(time.time() / 3600)}"
        if self.is_rate_limited(hour_key, self.requests_per_hour, 3600):
            return True
        
        # Check day limit
        day_key = f"rate_limit:{ip}:day:{int(time.time() / 86400)}"
        if self.is_rate_limited(day_key, self.requests_per_day, 86400):
            return True
        
        return False


# Default rate limiter instances
public_rate_limiter = RateLimiter(
    requests_per_minute=60,
    requests_per_hour=1000,
    requests_per_day=10000,
)

admin_rate_limiter = RateLimiter(
    requests_per_minute=120,
    requests_per_hour=5000,
    requests_per_day=50000,
)

lead_submission_rate_limiter = RateLimiter(
    requests_per_minute=5,  # Stricter for form submissions
    requests_per_hour=50,
    requests_per_day=200,
)


async def rate_limit_middleware(request: Request, call_next: Callable):
    """
    Rate limiting middleware.
    Applies different limits based on route path.
    """
    # Skip rate limiting for health checks
    if request.url.path in ["/health", "/", "/docs", "/openapi.json", "/redoc"]:
        return await call_next(request)
    
    # Determine which rate limiter to use
    path = request.url.path
    
    if path.startswith("/api/public/leads"):
        # Stricter limit for lead submissions
        limiter = lead_submission_rate_limiter
    elif path.startswith("/api/admin"):
        # Admin endpoints
        limiter = admin_rate_limiter
    elif path.startswith("/api/public"):
        # Public endpoints
        limiter = public_rate_limiter
    else:
        # Default: no rate limiting
        return await call_next(request)
    
    # Check rate limit
    if limiter.check_rate_limit(request):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "Rate limit exceeded. Please try again later.",
                "retry_after": 60,
            },
            headers={"Retry-After": "60"},
        )
    
    return await call_next(request)

