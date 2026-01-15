# Deploying AqarBay to Dokploy

This guide walks you through deploying the AqarBay real estate platform on Dokploy with your domain **aqarbay.com**.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ A Dokploy instance running (self-hosted or cloud)
2. ✅ Domain `aqarbay.com` purchased and DNS access
3. ✅ Git repository with your code (GitHub, GitLab, or Gitea)
4. ✅ Basic understanding of Docker Compose

---

## 🌐 DNS Configuration

Configure your DNS records to point to your Dokploy server IP address:

| Type  | Name               | Value                | TTL  |
|-------|--------------------|----------------------|------|
| A     | @                  | YOUR_DOKPLOY_IP      | 300  |
| A     | api                | YOUR_DOKPLOY_IP      | 300  |
| A     | s3                 | YOUR_DOKPLOY_IP      | 300  |
| A     | admin.s3           | YOUR_DOKPLOY_IP      | 300  |
| CNAME | www                | aqarbay.com          | 300  |

**Example:**
```
A      @          167.99.123.456
A      api        167.99.123.456
A      s3         167.99.123.456
A      admin.s3   167.99.123.456
CNAME  www        aqarbay.com
```

Wait 5-10 minutes for DNS propagation.

---

## 🚀 Deployment Steps

### Step 1: Push Code to Git Repository

If not already done:

```bash
cd /path/to/aqarbay
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/aqarbay.git
git push -u origin main
```

### Step 2: Create Application in Dokploy

1. **Log into Dokploy Dashboard**
2. Click **"Create Application"**
3. Choose **"Docker Compose"** as deployment type
4. Configure:
   - **Name**: `aqarbay`
   - **Git Repository**: Your repo URL
   - **Branch**: `main`
   - **Compose File Path**: `docker-compose.yml`

### Step 3: Set Environment Variables

In Dokploy, go to **Environment Variables** and add the following:

#### Required Variables

```bash
# Database
POSTGRES_DB=aqarbay
POSTGRES_USER=aqarbay
POSTGRES_PASSWORD=<generate-strong-password>

# JWT Authentication (generate with: openssl rand -hex 32)
JWT_SECRET=<your-jwt-secret-64-chars>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# MinIO Storage
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<generate-strong-password>
MINIO_BUCKET=aqarbay
MINIO_PUBLIC_URL=https://s3.aqarbay.com
MINIO_CONSOLE_URL=https://admin.s3.aqarbay.com

# Meilisearch (generate with: openssl rand -hex 32)
MEILI_MASTER_KEY=<your-meilisearch-key>

# API & Web
NEXT_PUBLIC_API_URL=https://api.aqarbay.com
PUBLIC_WEB_ORIGIN=https://aqarbay.com
NEXT_PUBLIC_MINIO_URL=https://s3.aqarbay.com

# Admin User
ADMIN_EMAIL=admin@aqarbay.com
ADMIN_PASSWORD=<your-admin-password>
ADMIN_FULL_NAME=Admin User
```

#### Generate Secrets

Run these commands locally to generate secure secrets:

```bash
# JWT Secret
openssl rand -hex 32

# Meilisearch Key
openssl rand -hex 32

# PostgreSQL Password (example)
openssl rand -base64 32

# MinIO Password
openssl rand -base64 32
```

### Step 4: Configure Domains & SSL

In Dokploy, go to **Domains** section and add:

#### Main Website
- **Domain**: `aqarbay.com` and `www.aqarbay.com`
- **Service**: `web`
- **Port**: `3000`
- **SSL**: Enable (Let's Encrypt)

#### API
- **Domain**: `api.aqarbay.com`
- **Service**: `api`
- **Port**: `8000`
- **SSL**: Enable (Let's Encrypt)

#### MinIO (S3 Storage)
- **Domain**: `s3.aqarbay.com`
- **Service**: `minio`
- **Port**: `9000`
- **SSL**: Enable (Let's Encrypt)

#### MinIO Console
- **Domain**: `admin.s3.aqarbay.com`
- **Service**: `minio`
- **Port**: `9001`
- **SSL**: Enable (Let's Encrypt)

### Step 5: Deploy

1. Click **"Deploy"** in Dokploy
2. Wait for all services to build and start (5-10 minutes)
3. Monitor logs for any errors

### Step 6: Initialize Database

After successful deployment, run migrations and create admin user:

**Option A: Using Dokploy Terminal**

1. Go to your application in Dokploy
2. Click on **Terminal** or **Console**
3. Select the `api` container
4. Run:

```bash
# Run database migrations
alembic upgrade head

# Create admin user
python -m app.scripts.create_admin
```

**Option B: Using SSH to Dokploy Server**

```bash
# SSH into your Dokploy server
ssh user@your-dokploy-server

# Navigate to project
cd /path/to/dokploy/apps/aqarbay

# Run migrations
docker-compose exec api alembic upgrade head

# Create admin user
docker-compose exec api python -m app.scripts.create_admin
```

### Step 7: Initialize MinIO Bucket

Create the MinIO bucket for storing images:

```bash
# Using Dokploy terminal (api container)
python -m app.scripts.init_minio

# Or manually via MinIO console:
# 1. Visit https://admin.s3.aqarbay.com
# 2. Login with MINIO_ROOT_USER and MINIO_ROOT_PASSWORD
# 3. Create bucket named "aqarbay"
# 4. Set access policy to "public" for the bucket
```

Or create a simple script:

```bash
# In Dokploy terminal (api container)
cat > init_minio.py << 'EOF'
from app.services.minio_service import minio_service

try:
    minio_service.create_bucket_if_not_exists()
    print("✅ MinIO bucket created successfully!")
except Exception as e:
    print(f"❌ Error: {e}")
EOF

python init_minio.py
```

### Step 8: Verify Deployment

Check that all services are running:

1. **Website**: https://aqarbay.com
2. **API Docs**: https://api.aqarbay.com/docs
3. **Admin Login**: https://aqarbay.com/en/admin/login
4. **MinIO Console**: https://admin.s3.aqarbay.com

---

## 🔧 Post-Deployment Configuration

### 1. Login to Admin Panel

1. Visit: https://aqarbay.com/en/admin/login
2. Login with credentials:
   - Email: (from `ADMIN_EMAIL`)
   - Password: (from `ADMIN_PASSWORD`)

### 2. Configure Site Settings

1. Go to **Admin → Settings**
2. Update:
   - Site name (English & Arabic)
   - Contact information
   - Logo
   - Social media links

### 3. Add Locations

1. Go to **Admin → Locations**
2. Add Palestinian cities:
   - رام الله (Ramallah)
   - نابلس (Nablus)
   - الخليل (Hebron)
   - غزة (Gaza)
   - بيت لحم (Bethlehem)
   - etc.

### 4. Add Agents

1. Go to **Admin → Agents**
2. Add your real estate agents with photos

### 5. Create Properties

1. Go to **Admin → Properties**
2. Create your first property listing
3. Upload images
4. Publish when ready

---

## 🛡️ Security Checklist

After deployment, verify:

- ✅ All domains use HTTPS (SSL enabled)
- ✅ Strong passwords set for all services
- ✅ Admin password changed from default
- ✅ Database not publicly accessible
- ✅ MinIO bucket has correct permissions
- ✅ CORS configured correctly in API
- ✅ JWT secret is random and secure
- ✅ Firewall rules properly configured

---

## 📊 Monitoring & Maintenance

### View Logs

In Dokploy:
- Go to your application
- Click **Logs**
- Select service (web, api, db, etc.)

Via SSH:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
```

### Health Checks

All services have health checks configured:

```bash
# Check service health
docker-compose ps

# Should show all services as "healthy"
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart web
```

### Database Backup

**Automated backup script:**

```bash
#!/bin/bash
# Save as: backup-db.sh

BACKUP_DIR="/backups/aqarbay"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/aqarbay_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

docker-compose exec -T db pg_dump -U aqarbay aqarbay | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

Run daily via cron:
```bash
# Edit crontab
crontab -e

# Add line (runs at 2 AM daily)
0 2 * * * /path/to/backup-db.sh
```

### Update Deployment

When you push changes to your Git repository:

1. Dokploy can auto-deploy (if enabled)
2. Or manually click **"Redeploy"** in Dokploy
3. Dokploy will pull latest code and rebuild

---

## 🐛 Troubleshooting

### Issue: Services won't start

**Check logs:**
```bash
docker-compose logs api
docker-compose logs web
```

**Common causes:**
- Missing environment variables
- Database connection failed
- Port conflicts

**Solution:**
```bash
# Restart services
docker-compose down
docker-compose up -d

# Check health
docker-compose ps
```

### Issue: Can't access website

**Check:**
1. DNS propagated? (use `dig aqarbay.com`)
2. SSL certificate issued? (check Dokploy SSL status)
3. Service running? (`docker-compose ps`)
4. Firewall allowing ports 80/443?

### Issue: Images not loading

**Check MinIO:**
1. Is MinIO running? (`docker-compose ps minio`)
2. Is bucket created? (visit admin.s3.aqarbay.com)
3. Is bucket public? (check bucket policy)
4. Is `MINIO_PUBLIC_URL` correct?

**Fix:**
```bash
# Access MinIO console
# https://admin.s3.aqarbay.com
# Login and set bucket "aqarbay" to public read
```

### Issue: API returns 500 errors

**Check:**
1. Database migrations applied?
2. Environment variables correct?
3. Database connection working?

**Fix:**
```bash
# Re-run migrations
docker-compose exec api alembic upgrade head

# Check logs
docker-compose logs api
```

### Issue: Admin login fails

**Reset admin password:**
```bash
docker-compose exec api python -m app.scripts.create_admin
```

---

## 📈 Scaling Considerations

As your traffic grows, consider:

1. **Database**: Move to managed PostgreSQL (AWS RDS, DigitalOcean)
2. **Storage**: Use S3/DigitalOcean Spaces instead of MinIO
3. **CDN**: CloudFlare or AWS CloudFront for images
4. **Caching**: Redis cluster for high availability
5. **Load Balancer**: Nginx/HAProxy for multiple web instances

---

## 🔄 CI/CD Pipeline (Optional)

Automate deployments with GitHub Actions:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Dokploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Dokploy
        run: |
          curl -X POST https://your-dokploy.com/api/deploy \
            -H "Authorization: Bearer ${{ secrets.DOKPLOY_TOKEN }}" \
            -d '{"project": "aqarbay"}'
```

---

## 📞 Support

If you encounter issues:

1. Check Dokploy documentation: https://docs.dokploy.com
2. Check application logs in Dokploy dashboard
3. Review this guide's troubleshooting section
4. Check the main README.md and SETUP.md files

---

## ✅ Deployment Checklist

Use this checklist for each deployment:

- [ ] DNS records configured and propagated
- [ ] Git repository pushed with latest code
- [ ] Dokploy application created
- [ ] All environment variables set (use .env.example as reference)
- [ ] Domains configured with SSL
- [ ] Application deployed successfully
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] MinIO bucket created and configured
- [ ] Admin panel accessible
- [ ] Website loads correctly (EN & AR)
- [ ] API docs accessible
- [ ] Test property creation with image upload
- [ ] Test public property listing page
- [ ] Verify all domains work with HTTPS
- [ ] Database backup configured
- [ ] Monitoring set up

---

**You're ready to launch AqarBay! 🚀🏘️**

For any questions about the application itself, refer to:
- `README.md` - General overview
- `SETUP.md` - Local development setup
- `PROJECT_SUMMARY.md` - Complete feature list

