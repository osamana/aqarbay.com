# 🚀 Quick Dokploy Deployment Guide for AqarBay

**Domain:** aqarbay.com

This is a quick reference guide. For detailed instructions, see [DOKPLOY_DEPLOYMENT.md](./DOKPLOY_DEPLOYMENT.md).

---

## Step 1: Configure DNS (5 minutes)

Point these DNS records to your Dokploy server IP:

```
A      @          YOUR_SERVER_IP
A      api        YOUR_SERVER_IP
A      s3         YOUR_SERVER_IP
A      admin.s3   YOUR_SERVER_IP
CNAME  www        aqarbay.com
```

**Wait 5-10 minutes for propagation**, then verify:
```bash
dig aqarbay.com
dig api.aqarbay.com
```

---

## Step 2: Generate Secrets (2 minutes)

Run these commands to generate secure secrets:

```bash
# JWT Secret (copy the output)
openssl rand -hex 32

# Meilisearch Key
openssl rand -hex 32

# Postgres Password
openssl rand -base64 32

# MinIO Password
openssl rand -base64 32
```

**Save these somewhere secure!** You'll need them in the next step.

---

## Step 3: Push Code to Git (1 minute)

```bash
cd /path/to/aqarbay
git add .
git commit -m "Ready for Dokploy deployment"
git push origin main
```

---

## Step 4: Create Application in Dokploy (5 minutes)

1. **Login to Dokploy Dashboard**
2. **Create New Application:**
   - Type: **Docker Compose**
   - Name: `aqarbay`
   - Git Repository: Your repo URL
   - Branch: `main`
   - Compose File: `docker-compose.yml`

3. **Set Environment Variables:**

Click "Environment" tab and add these (use your generated secrets):

```bash
POSTGRES_DB=aqarbay
POSTGRES_USER=aqarbay
POSTGRES_PASSWORD=<your-generated-postgres-password>

JWT_SECRET=<your-generated-jwt-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<your-generated-minio-password>
MINIO_BUCKET=aqarbay
MINIO_PUBLIC_URL=https://s3.aqarbay.com
MINIO_CONSOLE_URL=https://admin.s3.aqarbay.com

MEILI_MASTER_KEY=<your-generated-meili-key>

NEXT_PUBLIC_API_URL=https://api.aqarbay.com
PUBLIC_WEB_ORIGIN=https://aqarbay.com
NEXT_PUBLIC_MINIO_URL=https://s3.aqarbay.com

ADMIN_EMAIL=admin@aqarbay.com
ADMIN_PASSWORD=<your-strong-admin-password>
ADMIN_FULL_NAME=Admin User
```

4. **Configure Domains with SSL:**

| Domain | Service | Port | SSL |
|--------|---------|------|-----|
| aqarbay.com | web | 3000 | ✅ |
| www.aqarbay.com | web | 3000 | ✅ |
| api.aqarbay.com | api | 8000 | ✅ |
| s3.aqarbay.com | minio | 9000 | ✅ |
| admin.s3.aqarbay.com | minio | 9001 | ✅ |

5. **Click "Deploy"** and wait 5-10 minutes

---

## Step 5: Initialize Database (3 minutes)

After deployment completes, open the **Dokploy Terminal** for your app:

### Option A: Using the init script (recommended)

```bash
# Download and run the initialization script
./init-dokploy.sh
```

### Option B: Manual initialization

```bash
# Run migrations
docker-compose exec api alembic upgrade head

# Create admin user
docker-compose exec api python -m app.scripts.create_admin

# Initialize MinIO bucket
docker-compose exec api python -m app.scripts.init_minio
```

---

## Step 6: Verify Everything Works (5 minutes)

Check these URLs:

- ✅ **Main Site:** https://aqarbay.com
- ✅ **Arabic Site:** https://aqarbay.com/ar
- ✅ **Admin Login:** https://aqarbay.com/en/admin/login
- ✅ **API Docs:** https://api.aqarbay.com/docs
- ✅ **Health Check:** https://api.aqarbay.com/health
- ✅ **MinIO Console:** https://admin.s3.aqarbay.com

**Login to Admin Panel:**
1. Go to https://aqarbay.com/en/admin/login
2. Email: (from `ADMIN_EMAIL`)
3. Password: (from `ADMIN_PASSWORD`)

---

## Step 7: Add Content (10 minutes)

1. **Add Locations** (Admin → Locations):
   - رام الله (Ramallah)
   - نابلس (Nablus)
   - الخليل (Hebron)
   - غزة (Gaza)

2. **Add an Agent** (Admin → Agents)

3. **Create a Test Property** (Admin → Properties):
   - Upload images
   - Fill bilingual content (EN + AR)
   - Publish

4. **Verify on Frontend:**
   - Check https://aqarbay.com
   - Property should appear in listings

---

## 🎉 You're Live!

Your real estate platform is now live at **https://aqarbay.com**

---

## 📊 Quick Commands Reference

### View Logs
```bash
docker-compose logs -f api       # API logs
docker-compose logs -f web       # Frontend logs
docker-compose logs -f db        # Database logs
```

### Check Service Health
```bash
docker-compose ps
```

### Restart Services
```bash
docker-compose restart api
docker-compose restart web
```

### Backup Database
```bash
docker-compose exec db pg_dump -U aqarbay aqarbay > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T db psql -U aqarbay aqarbay
```

---

## 🆘 Troubleshooting

### Services won't start?
```bash
docker-compose down
docker-compose up -d
docker-compose logs
```

### Can't login to admin?
```bash
# Reset admin password
docker-compose exec api python -m app.scripts.create_admin
```

### Images not loading?
1. Check MinIO is running: `docker-compose ps minio`
2. Visit https://admin.s3.aqarbay.com
3. Login and verify bucket "aqarbay" exists
4. Set bucket policy to "public"

---

## 📚 More Resources

- **Detailed Deployment Guide:** [DOKPLOY_DEPLOYMENT.md](./DOKPLOY_DEPLOYMENT.md)
- **Production Checklist:** [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- **Setup Guide:** [SETUP.md](./SETUP.md)
- **Project Overview:** [README.md](./README.md)

---

## 🔒 Security Reminders

- ✅ Change admin password after first login
- ✅ Use strong, unique passwords for all services
- ✅ Keep secrets in Dokploy environment (never in code)
- ✅ Enable SSL/HTTPS for all domains
- ✅ Set up regular database backups
- ✅ Monitor logs for suspicious activity

---

**Total Deployment Time:** ~30 minutes  
**Difficulty:** Easy (with Dokploy)

Good luck! 🚀

