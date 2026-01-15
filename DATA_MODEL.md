# Palestine Real Estate - Data Model Documentation

## 📊 Complete Data Architecture

This document defines the SINGLE SOURCE OF TRUTH for all data structures in the application.

---

## 🗄️ Database Schema

### 1. **users** (Admin Users)
```
id              UUID (PK)
email           String (unique)
password_hash   String
role            Enum: 'admin' | 'editor'
is_active       Boolean
created_at      DateTime
updated_at      DateTime
```

**Purpose**: Admin authentication and authorization
**Count**: Currently 1 (admin@example.com)

---

### 2. **locations** (Cities & Areas)
```
id          UUID (PK)
name_en     String
name_ar     String
slug_en     String (unique, indexed)
slug_ar     String (unique, indexed)
parent_id   UUID (FK → locations.id, nullable)
lat         Float (nullable)
lng         Float (nullable)
created_at  DateTime
updated_at  DateTime
```

**Purpose**: Hierarchical location taxonomy (City → Neighborhood)
**Count**: Currently 6 (Jerusalem, Ramallah, Nablus, Hebron, Gaza, Bethlehem)
**Relationships**:
- parent: Self-referential for hierarchy
- properties: One-to-Many with properties

---

### 3. **agents** (Real Estate Agents)
```
id          UUID (PK)
name        String
phone       String
whatsapp    String (nullable)
email       String (nullable)
photo_key   String (nullable, MinIO key)
bio_en      Text (nullable)
bio_ar      Text (nullable)
created_at  DateTime
updated_at  DateTime
```

**Purpose**: Agent profiles for property assignments
**Count**: Currently 0
**Relationships**:
- properties: One-to-Many with properties

---

### 4. **properties** (Property Listings)
```
id                    UUID (PK)
title_en              String
title_ar              String
slug_en               String (unique, indexed)
slug_ar               String (unique, indexed)
description_en        Text (nullable)
description_ar        Text (nullable)
purpose               Enum: 'sell' | 'rent'
type                  Enum: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'office' | 'store'
status                Enum: 'available' | 'reserved' | 'sold' | 'rented'
price_amount          Numeric(15,2)
price_currency        Enum: 'ILS' | 'USD' | 'JOD'
area_m2               Numeric(10,2, nullable)
bedrooms              Integer (nullable)
bathrooms             Integer (nullable)
furnished             Boolean (default: false)
parking               Boolean (default: false)
floor                 Integer (nullable)
year_built            Integer (nullable)
video_url             String (nullable)
lat                   Numeric(10,8, nullable)
lng                   Numeric(11,8, nullable)
show_exact_location   Boolean (default: false)
featured              Boolean (default: false, indexed)
published             Boolean (default: false, indexed)
location_id           UUID (FK → locations.id)
agent_id              UUID (FK → agents.id, nullable)
created_at            DateTime (indexed)
updated_at            DateTime
```

**Purpose**: Main property listings with bilingual content
**Count**: Currently 7 (6 seeded + 1 test)
**Relationships**:
- location: Many-to-One with locations (REQUIRED)
- agent: Many-to-One with agents (OPTIONAL)
- images: One-to-Many with property_images
- leads: One-to-Many with leads

---

### 5. **property_images** (Property Photos)
```
id          UUID (PK)
property_id UUID (FK → properties.id, indexed)
file_key    String (MinIO key)
alt_en      String (nullable)
alt_ar      String (nullable)
sort_order  Integer
created_at  DateTime
updated_at  DateTime
```

**Purpose**: Multiple images per property
**Storage**: Files stored in MinIO at `/realestate/{file_key}`
**Relationships**:
- property: Many-to-One with properties

---

### 6. **leads** (Customer Inquiries)
```
id          UUID (PK)
property_id UUID (FK → properties.id, nullable, indexed)
name        String
phone       String
email       String (nullable)
message     Text (nullable)
status      Enum: 'new' | 'contacted' | 'closed'
created_at  DateTime (indexed)
```

**Purpose**: Contact form submissions and inquiries
**Count**: Currently 0
**Relationships**:
- property: Many-to-One with properties (OPTIONAL)

---

### 7. **settings** (Site Configuration)
```
id              UUID (PK)
site_name_en    String
site_name_ar    String
primary_color   String (hex color)
logo_key        String (MinIO key, nullable)
contact_phone   String (nullable)
contact_whatsapp String (nullable)
facebook_url    String (nullable)
instagram_url   String (nullable)
meta_title_en   String (nullable)
meta_title_ar   String (nullable)
meta_desc_en    Text (nullable)
meta_desc_ar    Text (nullable)
created_at      DateTime
updated_at      DateTime
```

**Purpose**: Global site settings (SINGLETON - only 1 row)
**Count**: Always 1

---

## 🔄 Data Flow

### Public Website Flow:
```
1. User visits homepage
   ↓
2. Frontend calls: GET /api/public/properties?featured=true&page_size=6
   ↓
3. Backend queries: SELECT * FROM properties WHERE published=true AND featured=true
   ↓
4. Backend joins: location, agent, images
   ↓
5. Backend serializes to JSON (proper format)
   ↓
6. Frontend displays PropertyCards
```

### Admin Flow:
```
1. Admin logs in → POST /api/auth/login
   ↓
2. Receives JWT tokens
   ↓
3. Admin clicks "Locations"
   ↓
4. GET /api/admin/locations/ (with Bearer token)
   ↓
5. Backend queries: SELECT * FROM locations
   ↓
6. Backend serializes to JSON
   ↓
7. Frontend displays in table/cards
```

---

## 📝 Enum Values (Fixed Options)

### PropertyPurpose
- `sell` - For Sale
- `rent` - For Rent

### PropertyType
- `apartment` - Apartment
- `house` - House
- `villa` - Villa
- `land` - Land
- `commercial` - Commercial
- `office` - Office
- `store` - Store

### PropertyStatus
- `available` - Available
- `reserved` - Reserved
- `sold` - Sold
- `rented` - Rented

### PropertyCurrency
- `ILS` - Israeli Shekel (₪)
- `USD` - US Dollar ($)
- `JOD` - Jordanian Dinar

### LeadStatus
- `new` - New Inquiry
- `contacted` - Agent Contacted Customer
- `closed` - Closed/Resolved

### UserRole
- `admin` - Full access
- `editor` - Limited access

---

## 🔗 API Endpoints (Consistent URLs)

### Public Endpoints
- `GET /api/public/settings/` - Site settings
- `GET /api/public/locations/` - All locations
- `GET /api/public/properties/` - Property listing (with filters)
- `GET /api/public/properties/{slug}/?locale=en|ar` - Property details
- `POST /api/public/leads/` - Submit inquiry

### Admin Endpoints (Require JWT Bearer Token)

**Properties:**
- `GET /api/admin/properties/` - List all
- `POST /api/admin/properties/` - Create
- `GET /api/admin/properties/{id}/` - Get by ID
- `PUT /api/admin/properties/{id}/` - Update
- `DELETE /api/admin/properties/{id}/` - Delete
- `POST /api/admin/properties/{id}/publish/` - Publish
- `POST /api/admin/properties/{id}/unpublish/` - Unpublish

**Locations:**
- `GET /api/admin/locations/` - List all
- `POST /api/admin/locations/` - Create
- `GET /api/admin/locations/{id}/` - Get by ID
- `PUT /api/admin/locations/{id}/` - Update
- `DELETE /api/admin/locations/{id}/` - Delete

**Agents:**
- `GET /api/admin/agents/` - List all
- `POST /api/admin/agents/` - Create
- `GET /api/admin/agents/{id}/` - Get by ID
- `PUT /api/admin/agents/{id}/` - Update
- `DELETE /api/admin/agents/{id}/` - Delete

**Leads:**
- `GET /api/admin/leads/` - List all
- `GET /api/admin/leads/{id}/` - Get by ID
- `PUT /api/admin/leads/{id}/` - Update status
- `DELETE /api/admin/leads/{id}/` - Delete

**Settings:**
- `GET /api/admin/settings/` - Get settings
- `PUT /api/admin/settings/` - Update settings

**Uploads:**
- `POST /api/admin/uploads/presign/?file_extension=jpg` - Get presigned URL
- `POST /api/admin/uploads/property-images/` - Register uploaded image
- `DELETE /api/admin/uploads/property-images/{id}/` - Delete image

---

## 📦 Data Serialization Rules

### Backend → Frontend
All SQLAlchemy models are serialized using `serialize_model()` utility:
- UUIDs → strings
- Decimals → floats
- DateTimes → ISO8601 strings
- Enums → string values
- Relationships → nested objects or IDs

### Frontend → Backend
- All IDs as strings
- Decimal numbers as strings (parsed by backend)
- Dates as ISO strings
- Enums as string values

---

## ✅ Data Consistency Rules

1. **Every property MUST have a location** (location_id is required)
2. **Slugs are auto-generated** from titles if not provided
3. **Published = false by default** (admin must explicitly publish)
4. **Featured properties must also be published** to show on homepage
5. **Locations have unique slugs** per language
6. **Properties have unique slugs** per language
7. **Settings table has exactly 1 row** (singleton)
8. **All admin API calls use trailing slashes** (/api/admin/locations/)
9. **All timestamps are UTC**
10. **Images are stored in MinIO** at bucket: `realestate`

---

## 🎯 Current Data State

```
✓ 1 admin user (admin@example.com)
✓ 6 locations (Jerusalem, Ramallah, Nablus, Hebron, Gaza, Bethlehem)
✓ 0 agents
✓ 7 properties (all published, 6 featured, with real images)
✓ 0 leads
✓ 1 settings record
```

---

## 🔧 Admin UI Components

### Centralized API Client: `lib/admin-api.ts`
All admin pages MUST use functions from this file:
- `getProperties()`, `createProperty()`, `updateProperty()`, `deleteProperty()`
- `getLocations()`, `createLocation()`, `updateLocation()`, `deleteLocation()`
- `getAgents()`, `createAgent()`, `updateAgent()`, `deleteAgent()`
- `getLeads()`, `updateLead()`
- `getSettings()`, `updateSettings()`

### Reusable Components:
- `AdminSidebar` - Fixed sidebar navigation
- `PropertyForm` - Used for both create & edit
- `SearchForm` - Used on homepage & listings

---

## 🚨 Common Issues & Solutions

**Issue**: "No locations in admin"
**Solution**: Locations exist in DB, ensure:
- API endpoint includes trailing slash
- Frontend uses `adminApi.getLocations()`
- Check browser console for errors

**Issue**: "Cannot serialize SQLAlchemy object"
**Solution**: Always use `serialize_model()` or `serialize_model_list()` in API routes

**Issue**: "Property image not showing"
**Solution**: Image URL format: `http://localhost:9000/realestate/{file_key}`

**Issue**: "Admin redirect 404"
**Solution**: All admin routes must include locale: `/${locale}/admin/dashboard`

---

**This is the definitive data model. Any deviations should be documented here first.**

