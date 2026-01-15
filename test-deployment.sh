#!/bin/bash

# ================================================================
# AqarBay - Docker Compose Test Script
# ================================================================
# Tests the complete Docker Compose setup locally before Dokploy
# deployment to ensure everything builds and runs correctly.
# ================================================================

set -e  # Exit on error

echo "🧪 Testing AqarBay Docker Compose Setup"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Test function
test_step() {
    local description="$1"
    local command="$2"
    
    echo -e "${BLUE}[TEST]${NC} $description"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASS=$((PASS + 1))
        echo ""
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAIL=$((FAIL + 1))
        echo ""
        return 1
    fi
}

# Check .env exists
echo -e "${YELLOW}Checking prerequisites...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env from .env.example:"
    echo "  cp .env.example .env"
    echo "  # Edit .env with your values"
    exit 1
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi
echo ""

# Clean start
echo -e "${YELLOW}Step 1: Cleaning previous deployment...${NC}"
docker-compose down -v > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# Build
echo -e "${YELLOW}Step 2: Building Docker images (this may take 5-10 minutes)...${NC}"
if docker-compose build; then
    echo -e "${GREEN}✅ Build successful${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ Build failed${NC}"
    FAIL=$((FAIL + 1))
    exit 1
fi
echo ""

# Start services
echo -e "${YELLOW}Step 3: Starting all services...${NC}"
if docker-compose up -d; then
    echo -e "${GREEN}✅ Services started${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ Failed to start services${NC}"
    FAIL=$((FAIL + 1))
    exit 1
fi
echo ""

# Wait for health checks
echo -e "${YELLOW}Step 4: Waiting for services to become healthy (30 seconds)...${NC}"
for i in {30..1}; do
    echo -ne "${BLUE}⏳ $i seconds remaining...\r${NC}"
    sleep 1
done
echo -e "${GREEN}✅ Wait complete${NC}"
echo ""

# Check service status
echo -e "${YELLOW}Step 5: Checking service health...${NC}"
echo ""
docker-compose ps
echo ""

# Test API health
test_step "API Health Endpoint" "curl -sf http://localhost:8000/health"

# Test API root
test_step "API Root Endpoint" "curl -sf http://localhost:8000/"

# Test Web
test_step "Web Frontend Accessible" "curl -sf http://localhost:3000"

# Database migrations
echo -e "${YELLOW}Step 6: Running database migrations...${NC}"
if docker-compose exec -T api alembic upgrade head; then
    echo -e "${GREEN}✅ Migrations successful${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ Migrations failed${NC}"
    FAIL=$((FAIL + 1))
fi
echo ""

# Create admin user
echo -e "${YELLOW}Step 7: Creating admin user...${NC}"
if docker-compose exec -T api python -m app.scripts.create_admin; then
    echo -e "${GREEN}✅ Admin user created${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ Admin user creation failed${NC}"
    FAIL=$((FAIL + 1))
fi
echo ""

# Initialize MinIO
echo -e "${YELLOW}Step 8: Initializing MinIO bucket...${NC}"
if docker-compose exec -T api python -m app.scripts.init_minio; then
    echo -e "${GREEN}✅ MinIO initialized${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ MinIO initialization failed${NC}"
    FAIL=$((FAIL + 1))
fi
echo ""

# Test API endpoints
echo -e "${YELLOW}Step 9: Testing API endpoints...${NC}"
test_step "GET /api/public/settings" "curl -sf http://localhost:8000/api/public/settings"
test_step "GET /api/public/locations" "curl -sf http://localhost:8000/api/public/locations"
test_step "GET /api/public/properties" "curl -sf http://localhost:8000/api/public/properties"

# Check Docker resource usage
echo -e "${YELLOW}Step 10: Checking resource usage...${NC}"
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

# Final summary
echo ""
echo "========================================"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "========================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "Your setup is ready for Dokploy deployment!"
    echo ""
    echo "Next steps:"
    echo "  1. Open browser and verify:"
    echo "     - Frontend: ${BLUE}http://localhost:3000${NC}"
    echo "     - API Docs: ${BLUE}http://localhost:8000/docs${NC}"
    echo "     - Admin: ${BLUE}http://localhost:3000/en/admin/login${NC}"
    echo "     - MinIO: ${BLUE}http://localhost:9001${NC}"
    echo ""
    echo "  2. Test creating a property in admin panel"
    echo "  3. Verify property appears on frontend"
    echo "  4. If all looks good, proceed with Dokploy deployment!"
    echo ""
    echo "To stop services:"
    echo "  ${YELLOW}docker-compose down${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please check the errors above and fix them before deploying."
    echo ""
    echo "To see detailed logs:"
    echo "  ${YELLOW}docker-compose logs${NC}"
    echo ""
    echo "To see logs for a specific service:"
    echo "  ${YELLOW}docker-compose logs api${NC}"
    echo "  ${YELLOW}docker-compose logs web${NC}"
    echo "  ${YELLOW}docker-compose logs db${NC}"
    echo ""
    exit 1
fi

