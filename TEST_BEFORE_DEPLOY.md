# 🧪 Pre-Deployment Testing Guide

Test your Docker Compose setup locally before deploying to Dokploy.

---

## Step 1: Clean Environment

Start fresh to simulate production deployment:

```bash
# Stop and remove all containers, volumes, and networks
docker-compose down -v

# Clean Docker system (optional but recommended)
docker system prune -f

# Remove old images (optional)
docker-compose down --rmi all
```

---

## Step 2: Environment Variables

Create a local `.env` file for testing:

```bash
cp .env.example .env
```

Edit `.env` with test values:

```bash
# Database
POSTGRES_DB=aqarbay
POSTGRES_USER=aqarbay
POSTGRES_PASSWORD=test-postgres-password-123

# JWT (for testing, use simple values)
JWT_SECRET=test-jwt-secret-key-min-32-chars-long-for-testing-purposes
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=test-minio-password-123
MINIO_BUCKET=aqarbay
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_CONSOLE_URL=http://localhost:9001

# Meilisearch
MEILI_MASTER_KEY=test-meili-key-min-16-chars-long

# API & Web (for local testing)
NEXT_PUBLIC_API_URL=http://localhost:8000
PUBLIC_WEB_ORIGIN=http://localhost:3000
NEXT_PUBLIC_MINIO_URL=http://localhost:9000

# Admin User
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123
ADMIN_FULL_NAME=Test Admin
```

---

## Step 3: Build All Services

Build all Docker images (this will take 5-10 minutes first time):

```bash
docker-compose build --no-cache
```

**Expected Output:**
- ✅ All services build successfully
- ✅ No errors in build process

**Watch for:**
- ❌ Build failures
- ❌ Missing dependencies
- ❌ Dockerfile errors

---

## Step 4: Start Services

Start all services in detached mode:

```bash
docker-compose up -d
```

**Expected Output:**
```
Creating network "aqarbay-network" ... done
Creating volume "postgres_data" ... done
Creating volume "redis_data" ... done
Creating volume "minio_data" ... done
Creating volume "meili_data" ... done
Creating aqarbay-db ... done
Creating aqarbay-redis ... done
Creating aqarbay-minio ... done
Creating aqarbay-search ... done
Creating aqarbay-api ... done
Creating aqarbay-web ... done
```

---

## Step 5: Check Service Health

Wait 30 seconds for health checks, then check status:

```bash
# Wait for services to initialize
sleep 30

# Check all services are running and healthy
docker-compose ps
```

**Expected Output:**
All services should show status as "Up" and "healthy":

```
NAME              STATUS                    PORTS
aqarbay-api       Up (healthy)              0.0.0.0:8000->8000/tcp
aqarbay-db        Up (healthy)              5432/tcp
aqarbay-minio     Up (healthy)              0.0.0.0:9000-9001->9000-9001/tcp
aqarbay-redis     Up (healthy)              6379/tcp
aqarbay-search    Up (healthy)              7700/tcp
aqarbay-web       Up (healthy)              0.0.0.0:3000->3000/tcp
```

**If any service is "unhealthy" or "starting", wait 1 more minute and check again.**

---

## Step 6: Check Logs for Errors

Check each service for errors:

```bash
# Check API logs
docker-compose logs api | tail -50

# Check Web logs
docker-compose logs web | tail -50

# Check database logs
docker-compose logs db | tail -20

# Check all logs together
docker-compose logs --tail=20
```

**Look for:**
- ✅ "Application startup complete" (API)
- ✅ "Ready in X ms" (Web)
- ✅ "database system is ready to accept connections" (DB)
- ❌ Any ERROR or FATAL messages

---

## Step 7: Test Health Endpoints

Test that health checks are responding:

```bash
# API health check
curl http://localhost:8000/health

# Should return: {"status":"healthy"}

# API root endpoint
curl http://localhost:8000/

# Should return: {"message":"Palestine Real Estate API","version":"1.0.0"}
```

---

## Step 8: Run Database Migrations

Initialize the database:

```bash
docker-compose exec api alembic upgrade head
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> eb48d0dfd5e0, initial schema
INFO  [alembic.runtime.migration] Running upgrade eb48d0dfd5e0 -> ea6d1be99847, add user accounts...
```

**No errors should appear.**

---

## Step 9: Create Admin User

```bash
docker-compose exec api python -m app.scripts.create_admin
```

**Expected Output:**
```
Admin user created successfully!
Email: admin@test.com
```

---

## Step 10: Initialize MinIO

```bash
docker-compose exec api python -m app.scripts.init_minio
```

**Expected Output:**
```
🔧 Initializing MinIO...
📦 Bucket name: aqarbay
✅ Bucket 'aqarbay' is ready!
🌐 Public URL base: http://localhost:9000/
```

---

## Step 11: Test Web Access

Open in your browser:

### Frontend
- ✅ http://localhost:3000 - Home page loads
- ✅ http://localhost:3000/en - English version
- ✅ http://localhost:3000/ar - Arabic version (RTL)

### API Documentation
- ✅ http://localhost:8000/docs - Swagger UI loads
- ✅ http://localhost:8000/redoc - ReDoc loads

### Admin Panel
- ✅ http://localhost:3000/en/admin/login - Login page loads
- ✅ Login with admin@test.com / admin123
- ✅ Admin dashboard loads

### MinIO Console
- ✅ http://localhost:9001 - MinIO console loads
- ✅ Login with minioadmin / test-minio-password-123
- ✅ Bucket "aqarbay" exists

---

## Step 12: Test Admin Functionality

In the admin panel (http://localhost:3000/en/admin):

1. **Create a Location:**
   - Go to Locations
   - Add "رام الله" (Ramallah)
   - Save successfully

2. **Create an Agent:**
   - Go to Agents
   - Add test agent
   - Save successfully

3. **Create a Property:**
   - Go to Properties
   - Fill in details (EN + AR)
   - Upload an image
   - Publish
   - Save successfully

4. **Verify on Frontend:**
   - Go to http://localhost:3000
   - Property appears in listings
   - Click property - detail page loads
   - Images display correctly

---

## Step 13: Test API Endpoints

Using curl or Postman:

```bash
# Get settings
curl http://localhost:8000/api/public/settings

# Get locations
curl http://localhost:8000/api/public/locations

# Get properties
curl http://localhost:8000/api/public/properties

# Should all return JSON responses
```

---

## Step 14: Check Resource Usage

Monitor Docker resource usage:

```bash
docker stats --no-stream
```

**Expected:**
- API: < 500MB RAM
- Web: < 300MB RAM  
- DB: < 200MB RAM
- Total: < 2GB RAM

---

## Step 15: Test Stop/Restart

Ensure services restart cleanly:

```bash
# Stop all services
docker-compose stop

# Start again
docker-compose start

# Wait 30 seconds
sleep 30

# Check all healthy
docker-compose ps
```

All services should come back up as "healthy".

---

## ✅ Complete Checklist

Before deploying to Dokploy, verify:

### Build & Startup
- [ ] `docker-compose build` completes without errors
- [ ] `docker-compose up -d` starts all services
- [ ] All services show status "healthy" in `docker-compose ps`
- [ ] No ERROR messages in logs

### Database
- [ ] Database migrations run successfully
- [ ] Admin user created
- [ ] MinIO bucket initialized

### Web Access
- [ ] Frontend loads at http://localhost:3000
- [ ] API docs load at http://localhost:8000/docs
- [ ] Admin login works
- [ ] MinIO console accessible

### Functionality
- [ ] Can create location in admin
- [ ] Can create agent in admin
- [ ] Can create property in admin
- [ ] Can upload images
- [ ] Property appears on frontend
- [ ] Images display correctly
- [ ] Arabic/English switching works

### API
- [ ] Health check endpoint responds
- [ ] Public API endpoints return data
- [ ] Admin endpoints require authentication

### Performance
- [ ] Total resource usage < 2GB RAM
- [ ] Services restart cleanly

---

## 🐛 Troubleshooting

### Build fails for API
```bash
# Check Python dependencies
cd apps/api
cat requirements.txt
# Ensure all packages are valid

# Rebuild API only
docker-compose build api
```

### Build fails for Web
```bash
# Check Node dependencies
cd apps/web
npm install
# Fix any package issues

# Rebuild web only
docker-compose build web
```

### Service won't start
```bash
# Check detailed logs
docker-compose logs [service-name] --tail=100

# Common issues:
# - Port already in use (stop conflicting service)
# - Environment variable missing (check .env)
# - Volume permission issues (check docker permissions)
```

### Database connection fails
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify DATABASE_URL in .env
```

### Health check fails
```bash
# Check health check directly
docker-compose exec api curl http://localhost:8000/health

# If fails, check if API is running
docker-compose logs api
```

### Images don't load
```bash
# Check MinIO is running
docker-compose ps minio

# Access MinIO console
# http://localhost:9001

# Verify bucket exists and is public
```

---

## 🎯 Success Criteria

Your setup is ready for Dokploy if:

✅ All services build without errors  
✅ All services start and become healthy  
✅ No errors in logs  
✅ Database migrations work  
✅ Admin user can be created  
✅ Web interface loads  
✅ Admin panel works  
✅ Can create and view properties  
✅ Images upload and display  
✅ Services restart cleanly  

---

## 📊 Quick Test Script

Save this as `test-deployment.sh`:

```bash
#!/bin/bash

echo "🧪 Testing AqarBay Docker Compose Setup"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_step() {
    echo -e "${YELLOW}Testing: $1${NC}"
    if eval "$2"; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
    echo ""
}

# Build
test_step "Docker Compose Build" "docker-compose build --quiet"

# Start
test_step "Starting Services" "docker-compose up -d"

# Wait
echo "⏳ Waiting 30 seconds for services to initialize..."
sleep 30

# Health checks
test_step "API Health" "curl -sf http://localhost:8000/health > /dev/null"
test_step "Web Accessible" "curl -sf http://localhost:3000 > /dev/null"

# Migrations
test_step "Database Migrations" "docker-compose exec -T api alembic upgrade head"

# Admin
test_step "Create Admin User" "docker-compose exec -T api python -m app.scripts.create_admin"

# MinIO
test_step "Initialize MinIO" "docker-compose exec -T api python -m app.scripts.init_minio"

echo ""
echo "🎉 All tests completed!"
echo ""
echo "Next: Open http://localhost:3000 and verify manually"
```

Run it:
```bash
chmod +x test-deployment.sh
./test-deployment.sh
```

---

**Once all tests pass, you're ready for Dokploy! 🚀**

