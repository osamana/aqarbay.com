# AqarBay Development Workflow - Quick Reference

A quick guide for managing local development and production deployment.

---

## 🏠 Local Development

### First Time Setup

```bash
# 1. Clone and navigate
cd /Users/osama/projects/aqarbay

# 2. Create local environment file
cp .env.example .env

# 3. Edit .env with local values (simple passwords OK for local)
# Use: POSTGRES_PASSWORD=localtest, NEXT_PUBLIC_API_URL=http://localhost:8000, etc.

# 4. Start all services
docker-compose up -d

# 5. Wait for services (30 seconds)
sleep 30

# 6. Run migrations
docker-compose exec api alembic upgrade head

# 7. Create admin user
docker-compose exec api python -m app.scripts.create_admin

# 8. Access locally
# - Web: http://localhost:3000
# - API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - Admin: http://localhost:3000/en/admin/login
```

### Daily Development

```bash
# Start services
docker-compose up -d

# Make code changes...

# Restart specific service after changes
docker-compose restart api   # If you changed API code
docker-compose restart web   # If you changed Web code

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Stop services when done
docker-compose down
```

### Testing Your Changes

```bash
# Full rebuild (test production-like build)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for health checks
sleep 40

# Check all healthy
docker-compose ps

# Test manually
curl http://localhost:8000/health
curl http://localhost:3000
open http://localhost:3000  # Open in browser
```

---

## 🌐 Production Deployment

### Deploy Changes

```bash
# 1. Make sure changes work locally
docker-compose up -d
# Test everything...

# 2. Commit your changes
git add .
git commit -m "feat: your feature description"

# 3. Push to main (triggers auto-deployment on Dokploy)
git push origin main

# 4. Monitor deployment
# - Check Dokploy UI
# - Or SSH: ssh root@72.60.191.38 "docker logs aqarbay-api --tail 50"

# 5. Verify production
curl https://api.aqarbay.com/health
curl https://aqarbay.com
```

### Check Production Status

```bash
# SSH into server
ssh root@72.60.191.38

# Check containers
docker ps -a | grep aqarbay

# View logs
docker logs aqarbay-api --tail 100
docker logs aqarbay-web --tail 100

# Check specific service health
docker exec aqarbay-api python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/health').read())"
```

### Production Migrations

```bash
# After pushing migration to main:
ssh root@72.60.191.38
docker exec aqarbay-api alembic upgrade head
```

---

## 🔄 Common Tasks

### Create Database Migration

```bash
# Local development
docker-compose exec api alembic revision --autogenerate -m "add new field to properties"

# Check the generated migration file in apps/api/alembic/versions/

# Apply locally
docker-compose exec api alembic upgrade head

# Test it works

# Push to production
git add apps/api/alembic/versions/*.py
git commit -m "db: add new field to properties"
git push origin main

# Apply on production
ssh root@72.60.191.38
docker exec aqarbay-api alembic upgrade head
```

### Add New Python Package

```bash
# 1. Add to apps/api/requirements.txt
echo "new-package==1.0.0" >> apps/api/requirements.txt

# 2. Rebuild locally
docker-compose build api
docker-compose up -d api

# 3. Test it works

# 4. Push to production
git add apps/api/requirements.txt
git commit -m "deps: add new-package"
git push origin main
# Dokploy will rebuild automatically
```

### Add New NPM Package

```bash
# 1. Add to apps/web/package.json (or use npm in container)
docker-compose exec web npm install new-package

# 2. Copy updated package files
docker cp aqarbay-web:/app/package.json apps/web/
docker cp aqarbay-web:/app/package-lock.json apps/web/

# 3. Rebuild
docker-compose build web
docker-compose up -d web

# 4. Push to production
git add apps/web/package.json apps/web/package-lock.json
git commit -m "deps: add new-package"
git push origin main
```

### Reset Local Database

```bash
# WARNING: This deletes all local data!
docker-compose down -v
docker-compose up -d
docker-compose exec api alembic upgrade head
docker-compose exec api python -m app.scripts.create_admin
```

### View Real-time Logs

```bash
# Local
docker-compose logs -f api web

# Production
ssh root@72.60.191.38 "docker logs aqarbay-api -f"
```

---

## 🎯 Best Practices

### ✅ DO:
- Always test locally before pushing to production
- Use feature branches for new features
- Write clear commit messages
- Check logs after deployment
- Keep .env.example updated (without secrets)
- Backup production database regularly

### ❌ DON'T:
- Commit `.env` file (it's in .gitignore)
- Edit files directly on production server
- Push untested code to main
- Use simple passwords in production
- Skip migrations when deploying database changes
- Force push to main branch

---

## 🚨 Emergency Procedures

### Production Site is Down

```bash
# 1. Check status
ssh root@72.60.191.38
docker ps -a | grep aqarbay

# 2. Check logs for errors
docker logs aqarbay-api --tail 100
docker logs aqarbay-web --tail 100

# 3. Restart if needed
docker restart aqarbay-api
docker restart aqarbay-web

# 4. If still down, check Dokploy UI for deployment errors
```

### Rollback Production

```bash
# 1. Find previous working commit
git log --oneline

# 2. Revert to it
git revert <commit-hash>
git push origin main

# 3. Dokploy will auto-deploy the rollback
```

### Database Corruption

```bash
# 1. SSH into server
ssh root@72.60.191.38

# 2. Backup current database
docker exec aqarbay-db pg_dump -U aqarbay aqarbay > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Try to repair or restore from backup
# (Contact DBA or restore from latest backup)
```

---

## 📊 Monitoring

### Check Everything is Healthy

**Local:**
```bash
docker-compose ps
# All should show "Up (healthy)"
```

**Production:**
```bash
ssh root@72.60.191.38 "docker ps | grep aqarbay"
# All should show "Up X hours (healthy)"
```

### Performance Monitoring

```bash
# Check resource usage
ssh root@72.60.191.38 "docker stats --no-stream | grep aqarbay"
```

---

## 🔗 Quick Links

- **Production Web**: https://aqarbay.com
- **Production API**: https://api.aqarbay.com/docs
- **MinIO Console**: https://admin.s3.aqarbay.com
- **Local Web**: http://localhost:3000
- **Local API**: http://localhost:8000/docs
- **Dokploy Dashboard**: (your Dokploy URL)

---

## 📞 Key Information

- **Production Server**: 72.60.191.38
- **SSH Access**: `ssh root@72.60.191.38`
- **Dokploy Project**: xario-aqarbay-i5ttcs
- **Git Branch (Prod)**: main
- **Git Branch (Dev)**: develop or feature branches

---

## 🎓 Learning Resources

- **Project Docs**: See README.md, PROJECT_SUMMARY.md
- **Deployment**: See DOKPLOY_DEPLOYMENT.md
- **Domain Setup**: See DOMAIN_SETUP.md
- **Production Checklist**: See PRODUCTION_CHECKLIST.md

---

**Remember**: Local → Test → Push → Auto-Deploy → Verify ✅

