# Palestine Real Estate (EN/AR) — Full Build Spec (Cursor Prompt) — Dokploy Docker Compose
**Theme color:** `#f5c325`  
**Frontend:** Next.js (App Router)  
**Backend API:** FastAPI (Python)  
**Admin Dashboards:** Next.js (separate app or route group, same repo)  
**Database:** PostgreSQL  
**Cache/Queues:** Redis  
**Search:** Meilisearch (optional but recommended)  
**Media Storage:** MinIO (S3-compatible)  
**Deployment:** Docker Compose on Dokploy  
**Auth:** JWT (access + refresh), admin-only listing management  
**Locales:** English + Arabic (RTL)

---

## 0) Objective
Build a **small, modern real-estate listing website** for Palestine supporting:
- Public property browsing and search (Buy/Rent + basic filters)
- SEO-friendly listing pages and location pages
- Bilingual EN/AR with RTL in Arabic
- Admin-only dashboards to manage listings/locations/agents/media/leads
- Docker Compose deployment on Dokploy
- Minimal but production-usable features

No public user accounts. No “agents portal”. No blog. Keep the product lean.

---

## 1) Repo Structure (Monorepo)
Use a monorepo so Docker Compose is straightforward.

```
real-estate-palestine/
  apps/
    web/                 # Next.js public site + admin dashboards
    api/                 # FastAPI backend
  packages/
    ui/                  # optional: shared components (Tailwind + shadcn)
    config/              # optional: shared env validation, eslint, tsconfig
  infra/
    nginx/               # reverse proxy config (optional)
  docker-compose.yml
  .env.example
  README.md
```

You can also keep only `apps/web` and `apps/api` and skip `packages/` if you want faster build.

---

## 2) Tech Choices (Do Not Overbuild)
### 2.1 Web (Next.js)
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- `next-intl` for i18n
- `zod` for validation
- `react-hook-form` for forms
- `axios` or native `fetch` (prefer native)
- `shadcn/ui` for admin UI components

### 2.2 API (FastAPI)
- FastAPI
- SQLAlchemy 2.0 + Alembic migrations
- Pydantic v2
- PostgreSQL driver `psycopg`
- Redis for caching + rate-limits and background tasks (optional)
- Celery or RQ (optional). For MVP: avoid unless needed.
- JWT auth using `python-jose` or `pyjwt`
- Password hashing: `passlib[bcrypt]`
- Upload management: store to MinIO via `boto3` or `minio` client
- Image transformations: optional (skip at MVP)

### 2.3 Infrastructure
- PostgreSQL
- Redis
- MinIO
- (Optional) Meilisearch for fast text search; otherwise rely on DB filters
- Reverse proxy: Dokploy already manages; optionally add Nginx for static/proxy

---

## 3) Core Features (MVP)
### 3.1 Public Website
Pages (with locale prefix):
- `/{locale}` Home
- `/{locale}/listings` Search/Filter results
- `/{locale}/listings/[slug]` Property details
- `/{locale}/locations` Locations index
- `/{locale}/locations/[slug]` Location page (listings filtered by location)
- `/{locale}/contact` Contact

Core UI elements:
- Buy/Rent toggle
- Type filter
- City/location filter
- Price range
- Bedrooms (optional)
- Sort: newest, price asc/desc

Property page:
- Gallery
- Price badge
- Facts grid (area, beds, baths, etc.)
- Map (approx coordinates allowed)
- Call + WhatsApp + Inquiry form
- Similar listings

SEO:
- Server-rendered pages (default with App Router + fetch in server components)
- Sitemap
- OpenGraph tags
- JSON-LD schema for real estate (recommended)

### 3.2 Admin Dashboards (Next.js)
Admin-only pages:
- `/admin/login`
- `/admin/dashboard`
- `/admin/properties`
- `/admin/properties/new`
- `/admin/properties/[id]/edit`
- `/admin/locations`
- `/admin/agents`
- `/admin/leads`
- `/admin/settings`

Admin capabilities:
- CRUD Properties
- Upload images
- Translate content EN/AR per listing
- Publish/unpublish
- Mark status (available/reserved/sold/rented)
- Manage locations hierarchy (city → neighborhood)
- Manage agents
- View leads + mark status (new/contacted/closed)
- Settings: logo, theme color, contact numbers

### 3.3 Backend API
- REST API for public and admin
- Public endpoints read-only
- Admin endpoints protected (JWT)

---

## 4) Data Model (Database Schema)
Use PostgreSQL. Design for bilingual content cleanly.

### 4.1 Approach to Bilingual Content
**Option A (Recommended):** store EN + AR fields in same table (simple)
- `title_en`, `title_ar`
- `description_en`, `description_ar`
- `slug_en`, `slug_ar`
This avoids translation tables and complexity.

### 4.2 Tables
#### `users`
- `id` (uuid)
- `email` (unique)
- `password_hash`
- `role` (`admin` or `editor`)
- `is_active`
- timestamps

#### `agents`
- `id` (uuid)
- `name`
- `phone`
- `whatsapp`
- `email` (optional)
- `photo_key` (file key in MinIO)
- `bio_en` (optional)
- `bio_ar` (optional)
- timestamps

#### `locations`
- `id` (uuid)
- `name_en`
- `name_ar`
- `slug_en` (unique)
- `slug_ar` (unique)
- `parent_id` (nullable FK to `locations.id`)  # hierarchy
- `lat`, `lng` (optional)
- timestamps

#### `properties`
- `id` (uuid)
- `title_en`, `title_ar`
- `slug_en` (unique), `slug_ar` (unique)
- `description_en`, `description_ar`
- `purpose` (`sell` | `rent`)
- `type` (`apartment` | `house` | `villa` | `land` | `commercial` | `office` | `store`)
- `status` (`available` | `reserved` | `sold` | `rented`)
- `price_amount` (numeric)
- `price_currency` (`ILS` | `USD` | `JOD`)
- `area_m2` (numeric)
- `bedrooms` (int, nullable)
- `bathrooms` (int, nullable)
- `furnished` (bool)
- `parking` (bool)
- `floor` (int, nullable)
- `year_built` (int, nullable)
- `video_url` (nullable)
- `lat`, `lng` (nullable)
- `show_exact_location` (bool, default false)
- `featured` (bool)
- `published` (bool)
- `location_id` (FK)
- `agent_id` (FK nullable)
- timestamps

#### `property_images`
- `id` (uuid)
- `property_id` (FK)
- `file_key` (MinIO key)
- `alt_en` (nullable)
- `alt_ar` (nullable)
- `sort_order` (int)
- timestamps

#### `leads`
- `id` (uuid)
- `property_id` (FK nullable)
- `name`
- `phone`
- `email` (nullable)
- `message`
- `status` (`new` | `contacted` | `closed`)
- `created_at`

#### `settings` (single row)
- `id` (uuid)
- `site_name_en`, `site_name_ar`
- `primary_color` (default `#f5c325`)
- `logo_key` (MinIO key)
- `contact_phone`
- `contact_whatsapp`
- `facebook_url` (nullable)
- `instagram_url` (nullable)
- default SEO meta: `meta_title_en`, `meta_title_ar`, `meta_desc_en`, `meta_desc_ar`
- timestamps

---

## 5) API Design (REST)
Base URL: `/api`

### 5.1 Auth (Admin)
- `POST /api/auth/login` → returns `{access_token, refresh_token}`
- `POST /api/auth/refresh` → returns new access token
- `POST /api/auth/logout` (optional)
- `GET /api/auth/me`

JWT:
- Access token: 15 min
- Refresh token: 7–30 days

### 5.2 Public Endpoints
- `GET /api/public/settings`
- `GET /api/public/home` (optional, or derive from settings)
- `GET /api/public/locations?locale=en|ar`
- `GET /api/public/properties`
  - filters:
    - `purpose`
    - `type`
    - `location_slug`
    - `min_price`, `max_price`
    - `beds`
    - `featured`
    - `published=true`
  - pagination: `page`, `page_size`
  - sort: `newest`, `price_asc`, `price_desc`
- `GET /api/public/properties/{slug}?locale=en|ar`
- `POST /api/public/leads`

### 5.3 Admin Endpoints (JWT required)
- `GET /api/admin/properties`
- `POST /api/admin/properties`
- `GET /api/admin/properties/{id}`
- `PUT /api/admin/properties/{id}`
- `DELETE /api/admin/properties/{id}` (soft-delete preferred)
- `POST /api/admin/properties/{id}/publish`
- `POST /api/admin/properties/{id}/unpublish`
- `POST /api/admin/properties/{id}/images` (upload)
- `DELETE /api/admin/property-images/{id}`

- `GET/POST/PUT/DELETE /api/admin/locations`
- `GET/POST/PUT/DELETE /api/admin/agents`
- `GET/PUT /api/admin/settings`
- `GET/PUT /api/admin/leads`

### 5.4 Upload Flow (Recommended)
1) Admin requests upload URL:
- `POST /api/admin/uploads/presign` → `{upload_url, file_key}`
2) Client uploads directly to MinIO using presigned URL
3) Client registers image in DB for property

This avoids uploading big files through API container.

---

## 6) Next.js App Details
### 6.1 i18n Routing
Use `app/[locale]/...` with locales: `en`, `ar`.

- `middleware.ts` redirects `/` → `/en` by default or based on headers
- Set HTML `dir` in layout:
  - `ar` → `dir="rtl"`
  - `en` → `dir="ltr"`

### 6.2 Styling
- Tailwind
- Use `#f5c325` as accent only:
  - Primary button
  - Price highlight
  - Active filter chips

### 6.3 Public Pages Implementation (Server Components)
- Home: fetch featured listings + locations
- Listings: parse search params → call `/api/public/properties`
- Property page: fetch by slug + locale
- Locations: fetch locations list
- Location page: fetch listings filtered by location slug
- Contact: form posts to leads endpoint

### 6.4 Admin Pages Implementation
Approach:
- Admin area uses client components with session stored in HTTP-only cookies OR in memory.
- Prefer **HTTP-only cookies** set by API for security.

Admin pages use:
- Data tables
- Create/edit forms with Zod + React Hook Form
- Image uploader with presigned URLs
- Draft/publish toggle
- EN/AR tab for localized fields

---

## 7) Security Rules (Minimal but Real)
- Admin endpoints require JWT
- Rate limit public endpoints (basic)
- Validate all payloads (Pydantic)
- Sanitize rich text if used (or accept plain markdown)
- CORS restricted to your domain
- Store secrets in Dokploy env vars (not committed)

---

## 8) Docker Compose (Dokploy)
Create `docker-compose.yml` in root.

### 8.1 Services
- `web` (Next.js)
- `api` (FastAPI)
- `db` (Postgres)
- `redis`
- `minio`
- `meilisearch` (optional)

### 8.2 Example docker-compose.yml
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: realestate
      POSTGRES_USER: realestate
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    restart: unless-stopped

  # Optional
  meilisearch:
    image: getmeili/meilisearch:v1.7
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
    volumes:
      - meili_data:/meili_data
    ports:
      - "7700:7700"
    restart: unless-stopped

  api:
    build:
      context: ./apps/api
    environment:
      DATABASE_URL: postgresql+psycopg://realestate:${POSTGRES_PASSWORD}@db:5432/realestate
      REDIS_URL: redis://redis:6379/0
      JWT_SECRET: ${JWT_SECRET}
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      MINIO_BUCKET: realestate
      PUBLIC_WEB_ORIGIN: ${PUBLIC_WEB_ORIGIN}
      MEILI_URL: http://meilisearch:7700
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
    depends_on:
      - db
      - redis
      - minio
    ports:
      - "8000:8000"
    restart: unless-stopped

  web:
    build:
      context: ./apps/web
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    depends_on:
      - api
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
  meili_data:
```

### 8.3 Notes for Dokploy
- Dokploy usually handles reverse proxy and TLS.
- Expose only `web` publicly; keep others internal if possible.
- If Dokploy requires ports, expose `web:3000` and `api:8000` and route via Dokploy domain routing.
- Use Dokploy env vars to set secrets and production URLs.

---

## 9) Environment Variables (.env.example)
Create `.env.example`:

```
POSTGRES_PASSWORD=change_me
JWT_SECRET=change_me

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=change_me

MEILI_MASTER_KEY=change_me

PUBLIC_WEB_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 10) Backend Implementation (FastAPI) — Must Include
### 10.1 API Project Layout
```
apps/api/
  app/
    main.py
    core/
      config.py
      security.py
      deps.py
    db/
      session.py
      base.py
      models/
      migrations/
    schemas/
    crud/
    api/
      routes/
        auth.py
        public.py
        admin_properties.py
        admin_locations.py
        admin_agents.py
        admin_settings.py
        admin_leads.py
        uploads.py
  Dockerfile
  pyproject.toml
```

### 10.2 Required Behaviors
- Alembic migrations for schema
- Create default admin user on first start (script)
- Property slug generation per locale:
  - If slug missing, generate from title and ensure uniqueness
- Filtering in `/public/properties`:
  - Use indexed fields and join location by slug
- Image handling:
  - presigned MinIO upload
  - store file_key in DB
- Public lead form:
  - store lead
  - send email (optional; MVP skip, but store leads)

---

## 11) Frontend Implementation (Next.js) — Must Include
### 11.1 App Layout
```
apps/web/
  app/
    [locale]/
      layout.tsx
      page.tsx
      listings/
        page.tsx
        [slug]/page.tsx
      locations/
        page.tsx
        [slug]/page.tsx
      contact/page.tsx
      about/page.tsx
      admin/
        login/page.tsx
        dashboard/page.tsx
        properties/page.tsx
        properties/new/page.tsx
        properties/[id]/edit/page.tsx
        locations/page.tsx
        agents/page.tsx
        leads/page.tsx
        settings/page.tsx
  components/
  lib/
  middleware.ts
  Dockerfile
  next.config.js
  tailwind.config.ts
```

### 11.2 RTL
- In `[locale]/layout.tsx` set `dir`
- Use logical CSS utilities (Tailwind handles most)
- Ensure components look correct in RTL:
  - alignment, spacing, icons orientation

### 11.3 Admin Auth Handling
- Login stores access token in HTTP-only cookie via API `Set-Cookie`
- Admin pages call API with cookie attached
- If unauthorized: redirect to `/admin/login`
- Add middleware protection for `/admin/*`

---

## 12) SEO + Sitemap
### 12.1 Sitemap
Generate `/sitemap.xml` with:
- all published listing pages (EN + AR)
- all locations (EN + AR)
- main pages

### 12.2 OpenGraph per listing
- title localized
- first image as OG
- description localized
- canonical URLs per locale

### 12.3 JSON-LD
Add schema.org data for listings (basic):
- `Product` or `Residence` (keep simple)

---

## 13) Meilisearch Integration (Optional but Recommended)
If used:
- Index properties:
  - title_en/title_ar, description, location names, type
- Sync on publish/update using API hook or background job.
If skipped:
- Use Postgres `ILIKE` search on title/description for basic keyword search.

---

## 14) Implementation Steps (Cursor Execution Plan)
### Step 1 — Bootstrapping
1. Create monorepo structure
2. Create Next.js app (`apps/web`)
3. Create FastAPI app (`apps/api`)
4. Add Dockerfiles for both
5. Add docker-compose

### Step 2 — Database + Migrations
1. SQLAlchemy models
2. Alembic init + first migration
3. Seed admin user script

### Step 3 — Auth
1. Login endpoint
2. JWT handling
3. Protect admin routes

### Step 4 — Admin CRUD
1. Locations CRUD
2. Agents CRUD
3. Properties CRUD + translation fields
4. Image upload flow via MinIO presign
5. Settings single page
6. Leads list + status update

### Step 5 — Public Site
1. Home + featured listings
2. Listings filters
3. Listing details
4. Locations pages
5. Contact form

### Step 6 — SEO
1. Sitemap
2. OG tags
3. JSON-LD
4. robots.txt

### Step 7 — Dokploy Deployment
1. Push repo to Git
2. Create Dokploy app from compose
3. Set env vars
4. Provision volumes
5. Setup domains + TLS
6. Run migrations

---

## 15) UI Requirements (Minimal but High Quality)
- Modern cards with clean typography
- Listing cards show:
  - image
  - title (localized)
  - price + currency
  - location
  - key specs (beds/baths/area)
- Search filters:
  - responsive
  - mobile drawer
- Primary color used as accent
- Logo displayed in header + admin sidebar

---

## 16) Non-Negotiable Quality Constraints
- No code duplication between EN/AR pages; locale-driven rendering
- No client-side fetching for SEO-critical pages (use server fetch)
- Validate everything with Zod (frontend) + Pydantic (backend)
- Use Alembic migrations always
- Use UUIDs
- Keep admin UI functional and not fancy

---

## 17) Deliverables (What Cursor Should Produce)
- Working Next.js public site + admin dashboards
- Working FastAPI backend with all endpoints
- Docker Compose deployable on Dokploy
- Postgres migrations + seed script
- MinIO media upload working
- Bilingual UI + RTL support
- Basic SEO + sitemap
- Clean code and documentation

---

## 18) Extra (Optional if time)
- Image compression via server job
- Email notifications for new leads
- Analytics events (page view, lead submit)

---

## 19) Notes on Theme Color `#f5c325`
Use it for:
- Primary buttons
- Active filter pills
- Price badges
Avoid large yellow backgrounds.

---

## 20) Start Here (First Coding Task)
**Implement the backend models + migrations + auth + settings endpoint first**, then build admin dashboards, then public pages.

---

END OF SPEC
