# AqarBay Production Deployment Checklist

Use this checklist before and after deploying to production.

## 📋 Pre-Deployment Checklist

### Security

- [ ] All passwords are strong and unique
- [ ] `JWT_SECRET` is a cryptographically secure random string (64+ characters)
- [ ] `MEILI_MASTER_KEY` is a secure random string
- [ ] `POSTGRES_PASSWORD` is strong and secure
- [ ] `MINIO_ROOT_PASSWORD` is strong and secure
- [ ] `ADMIN_PASSWORD` is changed from default
- [ ] All secrets are stored in Dokploy environment variables (not in code)
- [ ] `.env` file is in `.gitignore` (never committed)

### Domain & DNS

- [ ] Domain `aqarbay.com` is purchased and active
- [ ] DNS A records point to Dokploy server IP:
  - [ ] `@` (root domain)
  - [ ] `api`
  - [ ] `s3`
  - [ ] `admin.s3`
  - [ ] `www` (CNAME to root)
- [ ] DNS propagation complete (check with `dig aqarbay.com`)
- [ ] SSL certificates enabled in Dokploy for all domains

### Code & Configuration

- [ ] All code committed to Git repository
- [ ] Latest changes pushed to remote (GitHub/GitLab)
- [ ] `docker-compose.yml` updated for production
- [ ] `next.config.js` includes production domain in image remotePatterns
- [ ] Environment variables match `.env.example` template
- [ ] Database migrations are up to date locally
- [ ] No development/debug settings enabled

### Infrastructure

- [ ] Dokploy server has sufficient resources:
  - [ ] Minimum 2 CPU cores
  - [ ] Minimum 4GB RAM (8GB recommended)
  - [ ] Minimum 40GB disk space
- [ ] Docker and Docker Compose installed on server
- [ ] Firewall configured to allow ports 80, 443
- [ ] Backup strategy planned for database and media

## 🚀 Deployment Checklist

### Initial Setup

- [ ] Application created in Dokploy
- [ ] Git repository connected
- [ ] All environment variables set in Dokploy
- [ ] Docker Compose file path configured
- [ ] All four domains configured with SSL:
  - [ ] `aqarbay.com` → web (port 3000)
  - [ ] `api.aqarbay.com` → api (port 8000)
  - [ ] `s3.aqarbay.com` → minio (port 9000)
  - [ ] `admin.s3.aqarbay.com` → minio console (port 9001)

### First Deployment

- [ ] Clicked "Deploy" in Dokploy
- [ ] All containers built successfully
- [ ] All containers running (check logs)
- [ ] All services healthy (check `docker-compose ps`)
- [ ] No errors in logs

### Database Initialization

- [ ] Database migrations applied: `alembic upgrade head`
- [ ] Admin user created: `python -m app.scripts.create_admin`
- [ ] MinIO bucket initialized: `python -m app.scripts.init_minio`
- [ ] Verified admin login works

## ✅ Post-Deployment Checklist

### Functionality Tests

- [ ] Website loads: https://aqarbay.com
- [ ] Website loads in Arabic: https://aqarbay.com/ar
- [ ] API accessible: https://api.aqarbay.com
- [ ] API docs load: https://api.aqarbay.com/docs
- [ ] Health check passes: https://api.aqarbay.com/health
- [ ] Admin panel loads: https://aqarbay.com/en/admin/login
- [ ] Admin login successful
- [ ] MinIO console accessible: https://admin.s3.aqarbay.com
- [ ] Can create a test property
- [ ] Can upload images to property
- [ ] Images display correctly on frontend
- [ ] Property appears on listings page
- [ ] Property detail page loads correctly
- [ ] Contact form submits successfully
- [ ] Lead appears in admin panel
- [ ] Search works
- [ ] Filters work

### Security Verification

- [ ] All domains redirect HTTP to HTTPS
- [ ] SSL certificates valid (no browser warnings)
- [ ] Admin panel requires authentication
- [ ] API admin endpoints require authentication
- [ ] Database not publicly accessible
- [ ] Redis not publicly accessible
- [ ] Meilisearch not publicly accessible
- [ ] CORS configured correctly (only allowed origins)
- [ ] Rate limiting working (test with rapid requests)

### Performance & Monitoring

- [ ] All pages load in < 3 seconds
- [ ] Images load properly
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] Arabic (RTL) layout works correctly
- [ ] All health checks passing
- [ ] No memory leaks (monitor over 24 hours)
- [ ] Set up monitoring/alerting (optional)

### Content & SEO

- [ ] Sitemap accessible: https://aqarbay.com/sitemap.xml
- [ ] Robots.txt accessible: https://aqarbay.com/robots.txt
- [ ] OpenGraph tags present (check with https://www.opengraph.xyz/)
- [ ] Favicon displays correctly
- [ ] Site settings configured in admin
- [ ] Logo uploaded
- [ ] Contact information updated
- [ ] At least 3 locations added
- [ ] At least 1 agent added
- [ ] At least 3 properties published

### Backup & Recovery

- [ ] Database backup script created
- [ ] First manual backup completed
- [ ] Backup schedule configured (daily recommended)
- [ ] Backup restoration tested
- [ ] Media files backup plan in place
- [ ] Recovery procedure documented

## 🔄 Ongoing Maintenance

### Daily

- [ ] Check application is accessible
- [ ] Check for any error logs
- [ ] Monitor disk space usage

### Weekly

- [ ] Review new leads/inquiries
- [ ] Check backup logs
- [ ] Monitor performance metrics
- [ ] Update content as needed

### Monthly

- [ ] Review and update properties
- [ ] Test backup restoration
- [ ] Review security logs
- [ ] Check for dependency updates
- [ ] Review disk space and clean old backups
- [ ] Verify SSL certificates are renewing

### Quarterly

- [ ] Review and update documentation
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Update dependencies (if needed)
- [ ] Disaster recovery drill

## 📞 Emergency Contacts

Document your emergency procedures:

```
Primary Admin: __________________
Email: __________________
Phone: __________________

Hosting Provider: __________________
Support: __________________

Domain Registrar: __________________
Support: __________________

Server Access:
SSH: __________________
Dokploy URL: __________________
```

## 🐛 Common Issues & Solutions

### Website not loading
1. Check DNS propagation
2. Verify Dokploy service is running
3. Check SSL certificate status
4. Review Nginx/reverse proxy logs

### Images not loading
1. Verify MinIO is running
2. Check bucket exists and is public
3. Verify MINIO_PUBLIC_URL is correct
4. Check CORS settings in MinIO

### Admin can't login
1. Verify admin user exists in database
2. Check JWT_SECRET is set correctly
3. Review API logs for errors
4. Try resetting admin password

### Database connection errors
1. Check PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Check database credentials
4. Review database logs

---

## 📚 Additional Resources

- [Dokploy Documentation](https://docs.dokploy.com)
- [Main README](./README.md)
- [Setup Guide](./SETUP.md)
- [Deployment Guide](./DOKPLOY_DEPLOYMENT.md)
- [Project Summary](./PROJECT_SUMMARY.md)

---

**Last Updated:** _______________  
**Deployed By:** _______________  
**Production URL:** https://aqarbay.com  
**Version:** 1.0.0

