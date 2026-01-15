#!/bin/bash

# ================================================================
# AqarBay - Dokploy Initialization Script
# ================================================================
# Run this script after first deployment to set up the database
# and create the initial admin user.
#
# Usage:
#   chmod +x init-dokploy.sh
#   ./init-dokploy.sh
# ================================================================

set -e

echo "🚀 Initializing AqarBay on Dokploy..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running inside Docker or on host
if [ -f /.dockerenv ]; then
    echo "${BLUE}📦 Running inside Docker container${NC}"
    API_CMD=""
else
    echo "${BLUE}🖥️  Running on host - using docker-compose exec${NC}"
    API_CMD="docker-compose exec -T api"
fi

echo ""
echo "${YELLOW}Step 1: Waiting for services to be ready...${NC}"
sleep 10

echo ""
echo "${YELLOW}Step 2: Running database migrations...${NC}"
$API_CMD alembic upgrade head
echo "${GREEN}✅ Database migrations completed${NC}"

echo ""
echo "${YELLOW}Step 3: Creating admin user...${NC}"
$API_CMD python -m app.scripts.create_admin
echo "${GREEN}✅ Admin user created${NC}"

echo ""
echo "${YELLOW}Step 4: Initializing MinIO bucket...${NC}"
$API_CMD python -m app.scripts.init_minio
echo "${GREEN}✅ MinIO bucket initialized${NC}"

echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}🎉 AqarBay initialization complete!${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "  1. Visit your website: ${BLUE}https://aqarbay.com${NC}"
echo "  2. Login to admin: ${BLUE}https://aqarbay.com/en/admin/login${NC}"
echo "  3. Check API docs: ${BLUE}https://api.aqarbay.com/docs${NC}"
echo ""
echo "Default admin credentials are set in your environment variables:"
echo "  Email: \$ADMIN_EMAIL"
echo "  Password: \$ADMIN_PASSWORD"
echo ""
echo "${YELLOW}⚠️  Remember to change the admin password after first login!${NC}"
echo ""

