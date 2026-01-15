# Palestine Real Estate - Setup Guide

## Prerequisites

- Docker & Docker Compose installed
- Git

## Quick Start

### 1. Clone and Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and set your secrets (important!)
# At minimum, change these:
# - POSTGRES_PASSWORD
# - JWT_SECRET  
# - MINIO_ROOT_PASSWORD
# - ADMIN_PASSWORD
```

### 2. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)
- Meilisearch (port 7700)
- API (port 8000)
- Web (port 3000)

### 3. Run Database Migrations

```bash
# Wait for database to be ready (30 seconds), then:
docker-compose exec api alembic upgrade head
```

### 4. Create Admin User

```bash
docker-compose exec api python -m app.scripts.create_admin
```

This creates an admin user with credentials from .env:
- Email: ADMIN_EMAIL
- Password: ADMIN_PASSWORD

### 5. Seed Sample Data (Optional)

```bash
docker-compose exec api python -m app.scripts.seed_data
```

This creates sample locations and settings.

### 6. Access Applications

- **Frontend**: http://localhost:3000
  - English: http://localhost:3000/en
  - Arabic: http://localhost:3000/ar

- **API Docs**: http://localhost:8000/docs

- **Admin Login**: http://localhost:3000/en/admin/login

- **MinIO Console**: http://localhost:9001
  - Username: MINIO_ROOT_USER
  - Password: MINIO_ROOT_PASSWORD

## Development

### Frontend Development

```bash
cd apps/web
npm install
npm run dev
```

### Backend Development

```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Create New Migration

```bash
docker-compose exec api alembic revision --autogenerate -m "description"
docker-compose exec api alembic upgrade head
```

## Production Deployment (Dokploy)

### 1. Push to Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-git-url>
git push -u origin main
```

### 2. In Dokploy

1. Create new application from Docker Compose
2. Connect your Git repository
3. Set environment variables (copy from .env.example)
4. Configure domains:
   - Frontend: yourdomain.com
   - API: api.yourdomain.com
5. Enable TLS/SSL
6. Deploy!

### 3. After First Deploy

```bash
# SSH into Dokploy server or use Dokploy console
docker-compose exec api alembic upgrade head
docker-compose exec api python -m app.scripts.create_admin
docker-compose exec api python -m app.scripts.seed_data
```

### 4. Update Environment Variables

Make sure to set in production:
- `PUBLIC_WEB_ORIGIN=https://yourdomain.com`
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- Strong passwords for all services
- Real admin credentials

## Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### MinIO Issues

```bash
# Check MinIO logs
docker-compose logs minio

# Access MinIO console and manually create bucket if needed
# Go to http://localhost:9001
# Create bucket named "realestate"
# Set policy to public read
```

### API Issues

```bash
# View API logs
docker-compose logs -f api

# Restart API
docker-compose restart api

# Check API health
curl http://localhost:8000/health
```

### Frontend Issues

```bash
# View web logs
docker-compose logs -f web

# Rebuild frontend
docker-compose up -d --build web
```

## Project Structure

```
aqarbay/
├── apps/
│   ├── api/              # FastAPI backend
│   │   ├── app/
│   │   ├── alembic/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── web/              # Next.js frontend
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── messages/
│       ├── package.json
│       └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── README.md
└── SETUP.md
```

## Key Features

✅ Bilingual (EN/AR) with RTL support
✅ Property management (CRUD)
✅ Location hierarchy
✅ Agent profiles
✅ Lead capture
✅ Image uploads with MinIO
✅ Search and filters
✅ SEO optimized
✅ Responsive design
✅ Admin dashboard
✅ Docker deployment ready

## API Endpoints

### Public
- `GET /api/public/settings` - Site settings
- `GET /api/public/locations` - All locations
- `GET /api/public/properties` - Property listing (with filters)
- `GET /api/public/properties/{slug}` - Property details
- `POST /api/public/leads` - Submit contact form

### Admin (requires authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/properties` - List properties
- `POST /api/admin/properties` - Create property
- `PUT /api/admin/properties/{id}` - Update property
- `DELETE /api/admin/properties/{id}` - Delete property
- Similar endpoints for locations, agents, leads, settings

Full API documentation: http://localhost:8000/docs

## Support

For issues or questions, check:
- API logs: `docker-compose logs api`
- Web logs: `docker-compose logs web`
- Database logs: `docker-compose logs db`

