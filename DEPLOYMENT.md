# Deployment Guide - Palestine Real Estate

This guide covers deploying the Palestine Real Estate platform to production using Dokploy or any Docker-based hosting.

## Pre-Deployment Checklist

### 1. Environment Variables

Create a production `.env` file with strong secrets:

```bash
# Database - Use strong passwords!
POSTGRES_PASSWORD=<generate-strong-password>
POSTGRES_DB=realestate
POSTGRES_USER=realestate

# JWT - Use a very strong secret (32+ characters)
JWT_SECRET=<generate-strong-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# MinIO - Strong credentials
MINIO_ROOT_USER=<choose-username>
MINIO_ROOT_PASSWORD=<generate-strong-password>
MINIO_BUCKET=realestate

# Meilisearch
MEILI_MASTER_KEY=<generate-strong-key>

# Production URLs
PUBLIC_WEB_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Admin User
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<generate-strong-password>
```

**Important**: Never commit `.env` to Git! Always use `.env.example` as template.

### 2. Domain Setup

You need two domains/subdomains:
- Main site: `yourdomain.com` or `www.yourdomain.com`
- API: `api.yourdomain.com`

Configure DNS records before deployment:
- A record for main domain → Your server IP
- A record for API subdomain → Your server IP

## Dokploy Deployment

### Step 1: Prepare Repository

```bash
# Initialize git if not done
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment"

# Push to your Git provider (GitHub, GitLab, etc.)
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Create Dokploy Application

1. Log into your Dokploy dashboard
2. Click "Create Application"
3. Select "Docker Compose"
4. Connect your Git repository
5. Select the `main` branch
6. Set the root path to `/` (or wherever `docker-compose.yml` is)

### Step 3: Configure Environment Variables

In Dokploy, add all environment variables from your `.env` file:

1. Go to Application Settings → Environment Variables
2. Add each variable one by one
3. Mark sensitive variables as "Secret"

**Required variables**:
- All variables from `.env.example`
- Update URLs to use your actual domain names

### Step 4: Configure Domains

1. In Application Settings → Domains
2. Add your main domain for the `web` service:
   - Domain: `yourdomain.com`
   - Service: `web`
   - Port: `3000`
   - Enable SSL/TLS

3. Add your API domain:
   - Domain: `api.yourdomain.com`
   - Service: `api`
   - Port: `8000`
   - Enable SSL/TLS

### Step 5: Configure Volumes

Ensure persistent volumes are created for:
- `postgres_data` → Database storage
- `minio_data` → Uploaded images
- `meili_data` → Search index

Dokploy should handle this automatically from docker-compose.yml.

### Step 6: Deploy

1. Click "Deploy" button
2. Wait for build and deployment (5-10 minutes first time)
3. Monitor logs for any errors

### Step 7: Post-Deployment Setup

Once deployed, run these commands (via Dokploy terminal or SSH):

```bash
# Run database migrations
docker-compose exec api alembic upgrade head

# Create admin user
docker-compose exec api python -m app.scripts.create_admin

# Seed sample data (optional)
docker-compose exec api python -m app.scripts.seed_data
```

### Step 8: Verify Deployment

1. Visit `https://yourdomain.com` - Should show homepage
2. Visit `https://yourdomain.com/en` - English version
3. Visit `https://yourdomain.com/ar` - Arabic version
4. Visit `https://api.yourdomain.com/docs` - API documentation
5. Visit `https://yourdomain.com/en/admin/login` - Admin login

## Alternative Deployment Methods

### VPS with Docker Compose

1. **SSH into your VPS**:
```bash
ssh user@your-server-ip
```

2. **Install Docker and Docker Compose**:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Clone your repository**:
```bash
git clone <your-repo-url>
cd aqarbay
```

4. **Setup environment**:
```bash
cp .env.example .env
nano .env  # Edit with your production values
```

5. **Start services**:
```bash
docker-compose up -d
```

6. **Setup Nginx reverse proxy** (recommended):
```nginx
# /etc/nginx/sites-available/aqarbay

# API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Web
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

7. **Enable SSL with Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### Kubernetes Deployment

For Kubernetes, you'll need to convert docker-compose.yml to K8s manifests:

1. Use Kompose to convert:
```bash
kompose convert
```

2. Apply to cluster:
```bash
kubectl apply -f .
```

3. Configure Ingress for domains
4. Configure persistent volume claims
5. Add secrets for environment variables

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
```

### Database Backup

```bash
# Backup
docker-compose exec db pg_dump -U realestate realestate > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T db psql -U realestate realestate < backup_20240101.sql
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Run any new migrations
docker-compose exec api alembic upgrade head
```

### Scale Services

In `docker-compose.yml`, you can scale services:

```yaml
services:
  api:
    # ... existing config
    deploy:
      replicas: 3  # Run 3 API instances
```

## Performance Optimization

### 1. CDN for Static Assets

Configure CDN (Cloudflare, etc.) for:
- Frontend static files
- MinIO uploaded images

### 2. Database Optimization

```bash
# Connect to database
docker-compose exec db psql -U realestate

# Create indexes for better performance
CREATE INDEX idx_properties_purpose ON properties(purpose);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_location ON properties(location_id);
CREATE INDEX idx_properties_featured ON properties(featured);
```

### 3. Caching

Redis is already configured. Enable caching in API:
- Cache settings endpoint
- Cache location list
- Cache property counts

## Security Checklist

- [ ] All environment variables use strong secrets
- [ ] SSL/TLS enabled for all domains
- [ ] Admin credentials changed from defaults
- [ ] Database not exposed publicly
- [ ] MinIO console not exposed publicly
- [ ] Regular security updates applied
- [ ] Firewall configured to only allow 80, 443
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured

## Troubleshooting

### Issue: Services won't start

```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs

# Restart specific service
docker-compose restart api
```

### Issue: Database connection errors

```bash
# Verify database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify connection string in .env
echo $DATABASE_URL
```

### Issue: Images not loading

```bash
# Check MinIO
docker-compose logs minio

# Verify bucket exists
docker-compose exec minio mc ls local/

# Check MinIO endpoint in .env
```

## Support

For deployment issues:
1. Check logs first
2. Verify all environment variables are set
3. Ensure domains are properly configured
4. Check firewall and security group settings

