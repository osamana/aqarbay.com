# AqarBay - Palestine Real Estate Platform 🏘️

A modern, bilingual (English/Arabic) real estate listing platform for Palestine, built with Next.js and FastAPI.

**Domain:** [aqarbay.com](https://aqarbay.com)

---

## ✨ Features

- 🏘️ **Property Listings**: Buy/Rent properties with advanced filtering
- 🌍 **Bilingual**: Full English & Arabic support with RTL
- 🔐 **Admin Dashboard**: Manage properties, locations, agents, and leads
- 📸 **Media Management**: MinIO-based S3-compatible storage
- 🔍 **Search**: Meilisearch integration for fast text search
- 📱 **Responsive**: Mobile-first design
- 🚀 **SEO Optimized**: Server-side rendering, sitemaps, OpenGraph tags
- 🐳 **Docker Ready**: Deploy with Docker Compose on Dokploy

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd aqarbay
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env and set your secrets
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Run database migrations**
```bash
docker-compose exec api alembic upgrade head
```

5. **Create admin user**
```bash
docker-compose exec api python -m app.scripts.create_admin
```

6. **Access the applications**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001

See [SETUP.md](./SETUP.md) for detailed local development setup.

---

## 🌐 Production Deployment (Dokploy)

**Domain:** aqarbay.com

### Quick Deploy (~30 minutes)

Follow the [QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md) for the fastest deployment.

### Detailed Guides

- **[DOKPLOY_DEPLOYMENT.md](./DOKPLOY_DEPLOYMENT.md)** - Complete deployment guide
- **[DOMAIN_SETUP.md](./DOMAIN_SETUP.md)** - DNS and domain configuration
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Pre/post-deployment checklist
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Overview of deployment setup

### Deployment Architecture

```
aqarbay.com          → Next.js Frontend (port 3000)
api.aqarbay.com      → FastAPI Backend (port 8000)
s3.aqarbay.com       → MinIO S3 Storage (port 9000)
admin.s3.aqarbay.com → MinIO Console (port 9001)
```

All domains with **SSL/TLS** via Let's Encrypt.

---

## 🛠️ Tech Stack

### Frontend
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- next-intl (i18n)
- shadcn/ui components

### Backend
- FastAPI
- SQLAlchemy 2.0
- PostgreSQL
- Redis
- JWT Authentication

### Infrastructure
- Docker Compose
- PostgreSQL 16
- Redis 7
- MinIO (S3-compatible storage)
- Meilisearch

---

## 📁 Project Structure

```
aqarbay/
├── apps/
│   ├── api/                 # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/routes/  # API endpoints
│   │   │   ├── core/        # Config, security
│   │   │   ├── crud/        # Database operations
│   │   │   ├── db/models/   # SQLAlchemy models
│   │   │   ├── schemas/     # Pydantic schemas
│   │   │   ├── scripts/     # Admin scripts
│   │   │   └── services/    # MinIO, Meilisearch
│   │   ├── alembic/         # Database migrations
│   │   └── Dockerfile
│   │
│   └── web/                 # Next.js frontend
│       ├── app/[locale]/    # Internationalized routes
│       ├── components/      # React components
│       ├── lib/             # Utilities
│       ├── messages/        # i18n translations
│       └── Dockerfile
│
├── docker-compose.yml       # Production-ready
├── .env.example             # Environment template
├── init-dokploy.sh          # Deployment init script
└── README.md                # This file
```

---

## 🔑 Key Features Explained

### Multi-language Support
- Full English and Arabic translations
- RTL layout for Arabic
- Locale-specific URLs (`/en/...`, `/ar/...`)
- Bilingual content fields in database

### Property Management
- CRUD operations for properties
- Multiple image uploads
- Bilingual titles and descriptions
- Purpose: Buy/Rent
- Types: Apartment, House, Villa, Land, Commercial, Office, Store
- Status: Available, Reserved, Sold, Rented
- Featured properties
- Publish/unpublish control

### Search & Filtering
- Filter by purpose, type, location, price, bedrooms
- Sort by newest, price
- Pagination
- Fast text search (Meilisearch)

### Admin Dashboard
- Secure JWT authentication
- Property management
- Location management
- Agent profiles
- Lead tracking
- Site settings

### SEO Features
- Server-side rendering
- Dynamic sitemaps (EN/AR)
- OpenGraph tags
- Robots.txt
- Semantic HTML

---

## 🎨 Design

- **Primary Color**: `#f5c325` (Gold)
- **Typography**: System font stack
- **Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Mobile-first**: Responsive design

---

## 📖 Documentation

- **[README.md](./README.md)** - This file (overview)
- **[SETUP.md](./SETUP.md)** - Local development setup
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete feature list
- **[DATA_MODEL.md](./DATA_MODEL.md)** - Database schema
- **[QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md)** - Fast deployment
- **[DOKPLOY_DEPLOYMENT.md](./DOKPLOY_DEPLOYMENT.md)** - Detailed deployment
- **[DOMAIN_SETUP.md](./DOMAIN_SETUP.md)** - DNS configuration
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Deployment checklist
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Deployment overview

---

## 🔐 Security

- JWT-based authentication
- Password hashing (bcrypt)
- CORS protection
- Input validation (Pydantic/Zod)
- SQL injection prevention (ORM)
- Secure file uploads
- Rate limiting
- Environment-based secrets
- HTTPS/SSL in production

---

## 🧪 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Public Endpoints
- `GET /api/public/settings` - Site configuration
- `GET /api/public/locations` - All locations
- `GET /api/public/properties` - Property search
- `GET /api/public/properties/{slug}` - Property details
- `POST /api/public/leads` - Submit inquiry

### Admin Endpoints (Require Auth)
- `/api/admin/properties` - Property CRUD
- `/api/admin/locations` - Location CRUD
- `/api/admin/agents` - Agent CRUD
- `/api/admin/leads` - Lead management
- `/api/admin/settings` - Site settings
- `/api/admin/uploads` - File uploads

---

## 🗄️ Database

**PostgreSQL 16** with tables:
- `users` - Admin users
- `agents` - Real estate agents
- `locations` - Hierarchical locations
- `properties` - Property listings (bilingual)
- `property_images` - Property photos
- `leads` - Customer inquiries
- `settings` - Site configuration

All migrations managed via **Alembic**.

---

## 🚢 Deployment Options

### 1. Dokploy (Recommended) ✅
- Docker Compose native
- Auto SSL/TLS
- Easy domain management
- See [QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md)

### 2. Any VPS
- Ubuntu/Debian with Docker
- Nginx reverse proxy
- Let's Encrypt SSL
- See [DEPLOYMENT.md](./DEPLOYMENT.md) (if exists)

### 3. Kubernetes
- Kompose conversion ready
- Manifest examples available

---

## 🔧 Development Commands

### Backend
```bash
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd apps/web
npm install
npm run dev
```

### Database Migrations
```bash
# Create migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Apply migration
docker-compose exec api alembic upgrade head
```

### View Logs
```bash
docker-compose logs -f api
docker-compose logs -f web
```

---

## 🎯 Admin Features

- ✅ Property CRUD with bilingual content
- ✅ Image upload with drag-and-drop
- ✅ Location management (hierarchical)
- ✅ Agent profiles
- ✅ Lead management
- ✅ Site settings (logo, colors, contact)
- ✅ Publish/unpublish properties
- ✅ Status tracking

---

## 🌐 Public Features

- ✅ Property search with filters
- ✅ Property details with gallery
- ✅ Location-based browsing
- ✅ Contact forms and lead capture
- ✅ WhatsApp integration
- ✅ Responsive design
- ✅ SEO optimization

---

## 📊 Default Credentials

After running `create_admin` script:
- **Email**: Value from `ADMIN_EMAIL` in .env
- **Password**: Value from `ADMIN_PASSWORD` in .env

⚠️ **Change these in production!**

---

## 🤝 Contributing

This is a private project. For feature requests or bug reports, contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Support

For support:
- Email: support@aqarbay.com
- Documentation: See guides in this repository

---

## 🙏 Credits

Built for Palestine 🇵🇸

**Technologies:**
- Next.js, React, TypeScript
- FastAPI, Python, SQLAlchemy
- PostgreSQL, Redis, MinIO
- Docker, Dokploy

---

## 🚀 Get Started

**Local Development:**
```bash
docker-compose up -d
docker-compose exec api alembic upgrade head
docker-compose exec api python -m app.scripts.create_admin
```
Then visit http://localhost:3000

**Production Deployment:**
See [QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md) - deploy in ~30 minutes!

---

**Built with ❤️ for Palestine**

**Website:** https://aqarbay.com  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
