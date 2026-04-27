# 🗺️ Delraw Supplier Portal — Project Context

> [!IMPORTANT]
> **AI MAINTENANCE RULE — READ BEFORE DOING ANYTHING**
> This file is the **single source of truth** for any AI assistant working on this project.
> **You MUST update this file immediately after completing any task that modifies:**
> 1. Database schema (Prisma or MongoDB)
> 2. API endpoints (NestJS Controllers)
> 3. Frontend pages/routes (Next.js App Router)
> 4. Core business logic (Services, State Machines)
> 5. Environment variables or dependencies
> 6. Seed data or system configuration defaults
>
> Do not leave this file stale. Always update the **Changelog** and any affected section.

---

## 📌 Project Overview

**Delraw** is a B2B supplier portal platform. Suppliers register, go through admin verification, and list products for buyers. The platform is fully self-hosted — no cloud services.

| Property | Value |
|---|---|
| **Repo root** | `d:\Study\Development\delraw\supWeb\` |
| **Backend dir** | `delraw-backend\` |
| **Frontend dir** | `website\` |
| **Backend port** | `5000` |
| **Frontend port** | `3000` |
| **API base URL** | `http://localhost:5000` |
| **Frontend URL** | `http://localhost:3000` |

---

## 🏗️ System Architecture

```
Browser (Next.js 15 App Router — Port 3000)
        │
        │  REST API calls (Axios with JWT interceptors)
        ▼
NestJS Backend (Port 5000)
        │
        ├──► PostgreSQL (Prisma 7 + @prisma/adapter-pg)
        │      └── Users, Suppliers, Products, Orders, Documents,
        │          Notifications, Sessions, SystemConfig, RevokedTokens
        │
        ├──► MongoDB (Mongoose)
        │      ├── audit_logs     (AuditLog collection)
        │      └── product_images (ProductImage collection — metadata)
        │
        └──► MongoDB GridFS (via native GridFSBucket)
               ├── products bucket  — product image binaries
               └── documents bucket — supplier document binaries (PDFs, etc.)
```

**No AWS. No S3. No external cloud services. Everything is self-hosted.**

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | NestJS (JavaScript — not TypeScript) |
| ORM | Prisma 7 with `@prisma/adapter-pg` driver adapter |
| SQL DB | PostgreSQL (local) |
| NoSQL DB | MongoDB (local) via Mongoose |
| File Storage | MongoDB GridFS (replaces S3) |
| Auth | Passport.js — JWT strategy + local strategy |
| Email | Nodemailer (SMTP via Gmail App Password) |
| Validation | class-validator, class-transformer |
| Docs | Swagger (`@nestjs/swagger`) at `/api` |
| Rate Limiting | `@nestjs/throttler` (5 req/min short window) |
| File Uploads | Multer (memoryStorage) → GridFS |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript + React |
| Styling | Vanilla CSS (inline styles) — NOT Tailwind |
| HTTP Client | Axios (centralized in `src/lib/api.ts`) |
| Icons | Lucide React |
| Fonts | Google Fonts — Newsreader, Syne, DM Sans |
| Auth State | Custom `useAuth` hook (`src/hooks/useAuth.ts`) |
| Guards | `RoleGuard.tsx` component for route protection |

---

## 🔐 Authentication & Role System

### Roles (hierarchy: highest → lowest)
```
SUPER_ADMIN  >  ADMIN  >  SUPPLIER
```

### Auth Flow
```
Register (email + password)
  → OTP sent via email
  → POST /auth/verify-otp
  → POST /auth/login
  → Access Token (JWT, 15 min) + Refresh Token (7 days, hashed in DB)
  → POST /auth/refresh  →  new Access Token
  → POST /auth/logout   →  token blacklisted in RevokedToken table
```

### Security Details
- Access tokens are blacklisted on logout via `RevokedToken` table in Postgres
- Refresh tokens are bcrypt-hashed and stored in `User.refreshTokenHash`
- Role enforcement via `RolesGuard` + `@Roles()` decorator on every route
- Sessions tracked in `UserSession` table (device type, IP, expiry)
- Higher roles can access lower-role portals (Admin → Supplier portal)

### Default Accounts (after seed)
| Email | Password | Role |
|---|---|---|
| `superadmin@delraw.com` | `Admin@123` | `SUPER_ADMIN` |

---

## 📁 Backend Module Map (`delraw-backend/src/`)

| Module | Dir | Responsibility |
|---|---|---|
| **App** | `app.module.js` | Root module — wires all modules, DB connections, rate limiter |
| **Auth** | `auth/` | Login, register, OTP, JWT, refresh token, logout, guards |
| **Users** | `users/` | User profile CRUD, password change |
| **Supplier** | `supplier/` | Supplier profile, onboarding submit, dashboard stats, notifications |
| **Products** | `products/` | Product CRUD, image upload/delete via GridFS, category list |
| **Documents** | `documents/` | Document upload to GridFS, metadata in Postgres |
| **Admin** | `admin/` | Stats, supplier approval, product moderation, admin management, config |
| **Analytics** | `analytics/` | Platform-wide metrics and reporting |
| **Audit** | `audit/` | MongoDB audit log writes and queries |
| **Storage** | `storage/` | GridFS file upload/delete/stream service + controller |
| **Mail** | `mail/` | Nodemailer email service (OTP, notifications) |
| **Notifications** | `notifications/` | Global in-app notification creation service |
| **Orders** | `orders/` | Order lifecycle, commission math, status tracking |
| **Prisma** | `prisma/` | PrismaService (extends PrismaClient, uses pg adapter) |

---

## 🗄️ Database Schema

### PostgreSQL (Prisma 7) — Relational Data

| Model | Key Fields | Notes |
|---|---|---|
| `User` | id, email, password, role, otp, isActive, adminPermissions[] | Auth entity |
| `UserSession` | userId, ipAddress, deviceType, expiresAt, isActive | Login tracking |
| `Supplier` | userId, companyName, status, gstNumber, panNumber, city | FK → User |
| `Document` | supplierId, type, fileUrl, fileKey, status | fileUrl = `/files/documents/<gridfs-id>` |
| `Product` | supplierId, name, category, price, status, isLive | FK → Product |
| `ProductVariant` | productId, sku, name, price, stock | FK → Product (cascade delete) |
| `Order` | supplierId, productId, quantity, totalAmount, status | FK → Product + Supplier |
| `Notification` | userId, title, message, isRead | FK → User |
| `RevokedToken` | token, userId, expiresAt | JWT blacklist |
| `SystemConfig` | id="singleton", commission, maxProducts, maintenanceMode | One row |

### MongoDB (Mongoose) — Document / Append-only Data

| Collection | Schema File | Notes |
|---|---|---|
| `audit_logs` | `src/audit/audit_log.schema.js` | Platform-wide audit trail |
| `product_images` | `src/products/schemas/product_image.schema.js` | Image metadata; binary in GridFS |

### MongoDB GridFS — Binary Files

| Bucket | Contents | URL Pattern |
|---|---|---|
| `products` | Product image binaries | `GET /files/products/<objectId>` |
| `documents` | Supplier document binaries | `GET /files/documents/<objectId>` |

---

## 🔌 Full API Endpoint Reference

> Base: `http://localhost:5000`  All endpoints (except auth) require `Authorization: Bearer <token>`

### Auth — `/auth`
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/verify-otp` | Public | Verify email OTP |
| POST | `/auth/resend-otp` | Public | Resend OTP email |
| POST | `/auth/login` | Public | Login → tokens |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Any | Invalidate token |
| POST | `/auth/forgot-password` | Public | Send password reset OTP |
| POST | `/auth/reset-password` | Public | Reset with OTP |
| GET | `/auth/me` | Any | Current user info |

### Supplier — `/supplier`
| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/supplier/me` | SUPPLIER | Get own profile |
| PATCH | `/supplier/me` | SUPPLIER | Update profile fields |
| POST | `/supplier/submit` | SUPPLIER | Submit for verification |
| GET | `/supplier/dashboard` | SUPPLIER | Stats: products, orders, notifications, commission |
| GET | `/supplier/notifications` | SUPPLIER | All notifications |
| PATCH | `/supplier/notifications/:id/read` | SUPPLIER | Mark notification as read |

### Products — `/products`
| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/products/categories` | Any | List of platform categories |
| POST | `/products/upload-image` | SUPPLIER | Upload image → GridFS, returns `{ url }` |
| POST | `/products` | SUPPLIER | Create product (status: PENDING_APPROVAL) |
| GET | `/products` | SUPPLIER | Own products list (paginated) |
| GET | `/products/:id` | SUPPLIER | Single product with images |
| PATCH | `/products/:id` | SUPPLIER | Update product metadata |
| DELETE | `/products/:id` | SUPPLIER | Delete product (not if LIVE) |
| POST | `/products/:id/images` | SUPPLIER | Add image to gallery |
| DELETE | `/products/:id/images/:imageId` | SUPPLIER | Remove gallery image |

### Documents — `/documents`
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/documents/upload` | SUPPLIER | Upload doc to GridFS (multipart: `file` + `type`) |
| GET | `/documents/my` | SUPPLIER | Get all own documents |

### File Serving — `/files`
| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/files/:bucket/:id` | Public | Stream file from GridFS (sets Content-Type) |

### Admin — `/admin`
| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/admin/stats` | ADMIN+ | Platform stats |
| GET | `/admin/suppliers` | ADMIN+ | All suppliers (filterable) |
| GET | `/admin/suppliers/pending` | ADMIN+ | Suppliers awaiting review |
| GET | `/admin/suppliers/:id` | ADMIN+ | Supplier detail |
| PATCH | `/admin/suppliers/:id/status` | ADMIN+ | Approve/Reject supplier |
| GET | `/admin/products` | ADMIN+ | All products (filterable by status) |
| PATCH | `/admin/products/:id/status` | ADMIN+ | Approve/Reject product |
| GET | `/admin/admins` | SUPER_ADMIN | List all admin users |
| POST | `/admin/admins` | SUPER_ADMIN | Create new admin |
| PATCH | `/admin/admins/:id` | SUPER_ADMIN | Edit admin |
| DELETE | `/admin/admins/:id` | SUPER_ADMIN | Remove admin |
| GET | `/admin/config` | SUPER_ADMIN | Get system config |
| PATCH | `/admin/config` | SUPER_ADMIN | Update system config |
| GET | `/admin/users` | ADMIN+ | All users |
| GET | `/admin/audit-logs` | ADMIN+ | Audit logs (MongoDB) |

### Orders — `/orders`
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/orders` | Any | Create new order (internal purchase trigger) |
| GET | `/orders/my` | SUPPLIER | List own orders (paginated) |
| PATCH | `/orders/:id/status` | SUPPLIER | Update status (PROCESSING/SHIPPED/etc) |
| GET | `/orders/admin/all` | ADMIN+ | Platform-wide order list |
| GET | `/orders/admin/:id` | ADMIN+ | Detailed order view |

### Analytics — `/analytics`
| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/analytics/overview` | ADMIN+ | Platform-wide metrics |

---

## 📂 Frontend Page Map (`website/src/app/`)

### Public Pages
| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Landing page (marketing) |
| `/login` | `login/page.tsx` | Login form |
| `/register` | `register/page.tsx` | Registration + OTP verification flow |
| `/forgot-password` | `forgot-password/page.tsx` | Password reset flow |
| `/unauthorized` | `unauthorized/page.tsx` | Access denied page |

### Supplier Dashboard (`/dashboard/supplier/`)
| Route | File | Description |
|---|---|---|
| `/dashboard/supplier` | `page.tsx` | Home — real stats from API (products, orders, notifications) |
| `/dashboard/supplier/onboarding` | `onboarding/page.tsx` | Multi-step onboarding form |
| `/dashboard/supplier/products` | `products/page.tsx` | Product list |
| `/dashboard/supplier/products/new` | `products/new/page.tsx` | Add product form + image upload |
| `/dashboard/supplier/profile` | `profile/page.tsx` | Business profile editor |
| `/dashboard/supplier/notifications` | `notifications/page.tsx` | All notifications |
| `/dashboard/supplier/settings` | `settings/page.tsx` | Account settings |

### Admin Dashboard (`/dashboard/admin/`)
| Route | File | Description |
|---|---|---|
| `/dashboard/admin` | `page.tsx` | Overview — live stats, supplier + product queues |
| `/dashboard/admin/suppliers` | `suppliers/page.tsx` | Full supplier list with actions |
| `/dashboard/admin/suppliers/:id` | `suppliers/[id]/page.tsx` | Supplier detail + document review |
| `/dashboard/admin/products` | `products/page.tsx` | Product moderation queue |
| `/dashboard/admin/analytics` | `analytics/page.tsx` | Platform analytics |
| `/dashboard/admin/audit-logs` | `audit-logs/page.tsx` | Audit log viewer |
| `/dashboard/admin/users` | `users/page.tsx` | User management |

### Super Admin Dashboard (`/dashboard/super-admin/`)
| Route | File | Description |
|---|---|---|
| `/dashboard/super-admin` | `page.tsx` | Super admin home |
| `/dashboard/super-admin/admin-management` | `admin-management/page.tsx` | Create/edit/remove admins |
| `/dashboard/super-admin/config` | `config/page.tsx` | System configuration (commission, limits, flags) |

---

## 🧩 Shared Frontend Components (`website/src/components/`)

| Component | File | Used In |
|---|---|---|
| `Sidebar` | `Sidebar.tsx` | All dashboard pages (role-aware nav) |
| `DashboardHeader` | `DashboardHeader.tsx` | All dashboard pages (top bar with notifications) |
| `RoleGuard` | `RoleGuard.tsx` | Route-level access control wrapper |
| `StatusBadge` | `StatusBadge.tsx` | Supplier/product status chips |
| `AlertBanner` | `ui/AlertBanner.tsx` | Inline success/error alerts on forms |
| `Navbar` | `Navbar.tsx` | Public landing page navigation |

### `src/lib/api.ts`
- Axios instance pointing to `http://localhost:5000`
- Interceptor: attaches `Authorization: Bearer <token>` from `localStorage`
- Interceptor: auto-refreshes token on 401 and retries the original request
- **`getMediaUrl(path)`**: Prefixes relative GridFS paths with `API_URL`
- Exports: `api` (default Axios instance), `fetchWithAuth(path, options)` (fetch-based helper)

### `src/hooks/useAuth.ts`
- Reads user from `localStorage.token` (JWT decode)
- Provides: `user`, `logout()`, `isLoading`

---

## 🔄 Business Logic State Machines

### Supplier Lifecycle
```
DRAFT → SUBMITTED → UNDER_REVIEW → VERIFIED
                                └→ REJECTED
                                └→ CONDITIONAL
                                └→ SUSPENDED
```
- Suppliers cannot list products until status = `VERIFIED`
- Supplier profile is **automatically created** for Admin/Super Admin accounts (seeded)

### Product Lifecycle
```
DRAFT → PENDING_APPROVAL → LIVE
                       └→ REJECTED
                       └→ DELISTED
```
- Only `LIVE` products appear in buyer-facing views
- Live products cannot be deleted — must be delisted first

### Document Lifecycle
```
PENDING → VERIFIED
       └→ REJECTED
```

---

## 🌱 Environment Variables (`.env`)

```env
# PostgreSQL — primary relational DB (Prisma 7)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/delraw?schema=public"

# MongoDB — audit logs + GridFS file storage
MONGODB_URI="mongodb://localhost:27017/delraw_audit"

# JWT
JWT_SECRET=delraw_jwt_2026

# SMTP (Gmail App Password)
SMTP_USER="sawanpuri011@gmail.com"
SMTP_PASS="mhrhvwlhbiqksgwp"

# CORS
FRONTEND_URL="http://localhost:3000"
```

---

## 🌱 Seed Script (`prisma/seed.js`)

Run with: `node prisma/seed.js`

Creates:
1. **Super Admin** — `superadmin@delraw.com` / `Admin@123` (all 6 permissions)
2. **Supplier profile** linked to super admin (required for portal access)
3. **SystemConfig singleton** — 10% commission, 50 max products, registrations open

---

## 📝 Changelog

| Date | What Changed |
|---|---|
| **2026-04-27** | **Ground-Level Improvements**: Implemented global `NotificationModule` for in-app alerts. Created `OrdersModule` to manage B2B transactions, commission logic, and order tracking. Updated Supplier Dashboard to render live orders and notifications from Postgres. Permanently deleted legacy `src/aws/` module. |
| **2026-04-27** | **End-to-End Connectivity Fixes**: Implemented `GET /admin/audit-logs` in `AdminController`. Created `getMediaUrl` helper in `website/src/lib/api.ts` to automatically prefix relative GridFS file paths with the backend API URL. Applied this helper across all product and supplier document views in both Admin and Supplier portals. Cleaned up legacy mock data in `api.ts`. |
| **2026-04-27** | **AWS → GridFS Migration**: Removed `@aws-sdk/client-s3`. Created `StorageModule` with `StorageService` (GridFSBucket) and `StorageController` (`GET /files/:bucket/:id`). Product images now in MongoDB `product_images` collection + GridFS `products` bucket. Documents now in GridFS `documents` bucket. |
| **2026-04-27** | **Prisma Schema Cleanup**: Removed dead `AuditLog` model and `ProductImage` model from Postgres. Added `fileKey` to `Document` for GridFS deletion. Migration `20260427173730` applied. |
| **2026-04-27** | **Audit Log Bug Fixes**: `actorEmail`/`actorRole` made optional in schema. `findAllAdmins()` now queries MongoDB instead of empty Postgres table. Logout audit call now includes user email/role. |
| **2026-04-27** | **Frontend Hardcoded Data Removed**: Supplier dashboard replaced `DEMO_ORDERS`, fake stats, simulated order with real `/supplier/dashboard` API call. Notification panel now shows real DB notifications. |
| **2026-04-27** | **Seed Script Rewritten**: Removed all fake suppliers and mock products. Now creates only Super Admin + SystemConfig. |
| **2026-04-26** | Sidebar settings link, session-based notification panel, background blur. |
| **2026-04-24** | MongoDB Audit Service stabilized, role-based log retrieval fixed. |
| **2026-04-23** | Migrated to Prisma 7 (`@prisma/adapter-pg`), updated PrismaService. |
| **2026-04-22** | Unified Sidebar component across all dashboard roles (Admin, Super Admin, Supplier). |

---

## 🚧 Known Issues / TODOs

### Backend
- No WebSocket/SSE for real-time order notifications (polling only)

### Frontend
- No drag-and-drop for product image reordering
- Onboarding page is large (45KB) — could be split into steps/components
- No CSV export for audit logs

---

## 🗂️ Key File Locations

| What | Path |
|---|---|
| Backend entry | `delraw-backend/src/main.js` |
| Prisma schema | `delraw-backend/prisma/schema.prisma` |
| Prisma config (Prisma 7) | `delraw-backend/prisma.config.js` |
| Seed script | `delraw-backend/prisma/seed.js` |
| GridFS service | `delraw-backend/src/storage/storage.service.js` |
| ProductImage schema (Mongo) | `delraw-backend/src/products/schemas/product_image.schema.js` |
| Audit log schema (Mongo) | `delraw-backend/src/audit/audit_log.schema.js` |
| Frontend API client | `website/src/lib/api.ts` |
| Media URL helper | `website/src/lib/api.ts` -> `getMediaUrl()` |
| Auth hook | `website/src/hooks/useAuth.ts` |
| Sidebar component | `website/src/components/Sidebar.tsx` |

---

*Last Updated: 2026-04-27 by AI (Antigravity) after End-to-End Infrastructure connection*
*Owner: Sawan*
