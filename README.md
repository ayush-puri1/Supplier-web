<div align="center">

```
██████╗ ███████╗██╗     ██████╗  █████╗ ██╗    ██╗
██╔══██╗██╔════╝██║     ██╔══██╗██╔══██╗██║    ██║
██║  ██║█████╗  ██║     ██████╔╝███████║██║ █╗ ██║
██║  ██║██╔══╝  ██║     ██╔══██╗██╔══██║██║███╗██║
██████╔╝███████╗███████╗██║  ██║██║  ██║╚███╔███╔╝
╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝
```

**Supplier Portal** — Built for scale. Designed for trust.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## What is Delraw?

Delraw is a **B2B supplier onboarding and product management portal**. It gives suppliers a structured way to register, submit verification documents, and list products — and gives admins the tools to review, approve, and manage everything through a strict audit-tracked workflow.

Think of it as the operations backbone between your business and the suppliers who stock it.

```
Supplier registers → Submits documents → Admin reviews → Verified → Lists products → Admin approves → Live
```

No product goes live without approval. No supplier gets access without verification. Every action is logged.

---

## Project Structure

```
delraw/
├── delraw-backend/          # NestJS API
│   ├── src/
│   │   ├── auth/            # JWT auth, OTP, guards, strategies
│   │   ├── admin/           # Admin dashboard logic, approvals
│   │   ├── products/        # Supplier product catalog management
│   │   ├── audit/           # Immutable action logging
│   │   ├── mail/            # Email notifications (Nodemailer)
│   │   ├── aws/             # S3 file uploads
│   │   └── common/          # Shared DTOs, interceptors, filters
│   └── prisma/
│       └── schema.prisma    # Full database schema
│
└── website/                 # Next.js 16 frontend
    └── src/
        └── app/
            ├── login/       # Auth pages
            ├── register/
            └── dashboard/
                ├── supplier/ # Supplier-facing views
                └── admin/    # Admin panel views
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **API Framework** | NestJS + TypeScript | Modular, dependency injection, decorators |
| **Database** | PostgreSQL | Relational — perfect for approval workflows |
| **ORM** | Prisma | Type-safe queries, clean migrations |
| **Authentication** | JWT (15 min) + Refresh tokens (7 days) | Short-lived access, revocable sessions |
| **Frontend** | Next.js 16 App Router | SSR, file-based routing, React Server Components |
| **Styling** | Tailwind CSS 4 | Utility-first, fast iteration |
| **File Storage** | AWS S3 | Scalable document and image storage |
| **Email** | Nodemailer | OTP delivery, status change notifications |
| **API Docs** | Swagger / OpenAPI | Auto-generated from decorators |

---

## Core Features

### 🔐 Authentication & Security
- Email + OTP verification on registration
- JWT access tokens (15 min expiry) + hashed refresh tokens (7 days)
- Token revocation on logout via `RevokedToken` blacklist
- Rate limiting on all auth endpoints — 5 attempts per minute
- Helmet + CORS configured
- Role-based access control — `SUPPLIER`, `ADMIN`, `SUPER_ADMIN`

### 🏭 Supplier Onboarding
Suppliers move through a strict state machine — no skipping steps:

```
DRAFT ──→ SUBMITTED ──→ UNDER_REVIEW ──→ VERIFIED
                                    └──→ REJECTED (with reason)
```

- Self-service registration with OTP email verification
- Document upload (GST, PAN, business certificates) to S3
- Rejection always includes a written reason visible on supplier dashboard
- Password reset via email OTP flow

### 📦 Product Catalog
Products follow their own approval pipeline:

```
DRAFT ──→ PENDING_APPROVAL ──→ LIVE
                          └──→ REJECTED (with reason)
```

- Suppliers manage variants (size, colour, price, stock)
- Product images stored in S3 with ordering support
- Category validation on creation
- Max products per supplier configurable by admin

### 🛡️ Admin Panel
- **Supplier review queue** — approve or reject with mandatory reason
- **Product approval queue** — approve or reject with mandatory reason
- **Dashboard stats** — live counts of pending, verified, rejected
- **Active sessions viewer** — see who is logged in, from what device and IP
- **System config** — toggle maintenance mode, auto-approve, registration lock
- **Audit log viewer** — full searchable history of every action

### 📋 Audit Trail
Every significant action is recorded and immutable:

```json
{
  "action": "PRODUCT_APPROVED",
  "actorId": "admin_123",
  "entityType": "PRODUCT",
  "entityId": "prod_456",
  "metadata": { "supplierId": "sup_789" },
  "createdAt": "2025-03-20T10:30:00Z"
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS S3 bucket (for file uploads)
- SMTP credentials (for email)

### Backend Setup

```bash
# 1. Clone and install
cd delraw-backend
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your values — see Environment Variables section below

# 3. Run database migrations
npx prisma migrate dev

# 4. Seed with test data
npx prisma db seed

# 5. Start development server
npm run start:dev
```

API available at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api/docs`

### Frontend Setup

```bash
cd website
npm install
npm run dev
```

Frontend available at `http://localhost:3001`

---

## Environment Variables

### Backend — `delraw-backend/.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/delraw"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="15m"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="delraw-uploads"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@delraw.com"

# App
FRONTEND_URL="http://localhost:3001"
PORT=3000
```

### Frontend — `website/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## Seed Accounts

After running `npx prisma db seed`, these test accounts are available:

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@delraw.com` | `SuperAdmin123!` |
| Admin | `admin@delraw.com` | `Admin123!` |
| Supplier | `supplier@delraw.com` | `Supplier123!` |

> ⚠️ Change all passwords before any production deployment.

---

## API Reference

Full interactive API documentation is available at `/api/docs` when the backend is running.

### Auth Endpoints

```
POST   /auth/register          Register new supplier account
POST   /auth/login             Login — returns access + refresh tokens
POST   /auth/logout            Logout — revokes tokens
POST   /auth/send-otp          Send OTP to email
POST   /auth/verify-otp        Verify OTP code
POST   /auth/forgot-password   Request password reset OTP
POST   /auth/reset-password    Reset password with OTP
POST   /auth/refresh           Get new access token using refresh token
```

### Supplier Endpoints

```
GET    /supplier/me            Get own supplier profile
PATCH  /supplier/profile       Update profile
POST   /supplier/submit        Submit profile for admin review
POST   /supplier/documents     Upload verification document
```

### Product Endpoints

```
GET    /products               List own products (paginated)
POST   /products               Create new product
PATCH  /products/:id           Update product
DELETE /products/:id           Delete product
POST   /products/:id/images    Upload product image
DELETE /products/:id/images/:imageId  Remove image
```

### Admin Endpoints

```
GET    /admin/suppliers                      List all suppliers (paginated)
PATCH  /admin/suppliers/:id/approve          Approve supplier
PATCH  /admin/suppliers/:id/reject           Reject supplier (reason required)
GET    /admin/products                       List all products (paginated)
PATCH  /admin/products/:id/approve           Approve product
PATCH  /admin/products/:id/reject            Reject product (reason required)
PATCH  /admin/documents/:id/approve          Approve individual document
PATCH  /admin/documents/:id/reject           Reject individual document
GET    /admin/sessions                       View active user sessions
GET    /admin/config                         Get system configuration
PATCH  /admin/config                         Update system configuration
GET    /admin/audit-logs                     View audit log (paginated, filterable)
```

---

## Database Schema Overview

```
User ──┬── Supplier ──┬── Document[]
       │              └── Product[] ──── ProductVariant[]
       │                            └── ProductImage[]
       │
       ├── UserSession[]
       └── RevokedToken[]

SystemConfig          (singleton — one row)
AuditLog[]            (append-only)
```

### Key Design Decisions

**Why a separate `Supplier` model from `User`?**
`User` handles identity (email, password, role). `Supplier` handles business profile (company name, GST, trust score). Keeping them separate means admins and super admins have a `User` but no `Supplier` — which is correct.

**Why `RevokedToken`?**
JWTs are stateless — you cannot "cancel" one once issued. The `RevokedToken` table is a blacklist checked on every request. On logout, the token is added here and rejected on all future uses.

**Why state machines for suppliers and products?**
Enforced sequential states (no skipping from DRAFT to VERIFIED) prevent data integrity issues and make the approval workflow predictable. Every transition is validated in the service layer.

---

## System Config Options

Admins can change these without redeployment via `PATCH /admin/config`:

| Setting | Default | Effect |
|---|---|---|
| `maintenanceMode` | `false` | Blocks all non-admin access |
| `allowNewRegistrations` | `true` | Disables supplier registration when false |
| `supplierAutoApprove` | `false` | Skips UNDER_REVIEW, auto-verifies on submit |
| `maxProductsPerSupplier` | `50` | Hard limit on product count per supplier |
| `defaultTrustScore` | `50` | Assigned to new suppliers on verification |
| `platformName` | `"Delraw"` | Shown in emails and UI |
| `supportEmail` | `"support@delraw.com"` | Shown in rejection emails |

---

## Status Reference

### Supplier Statuses

| Status | Meaning |
|---|---|
| `DRAFT` | Profile incomplete, not submitted |
| `SUBMITTED` | Submitted, waiting for admin to start review |
| `UNDER_REVIEW` | Admin is actively reviewing |
| `VERIFIED` | Approved — can list products |
| `REJECTED` | Rejected — rejection reason stored and shown |

### Product Statuses

| Status | Meaning |
|---|---|
| `DRAFT` | Being edited, not submitted |
| `PENDING_APPROVAL` | Submitted, awaiting admin approval |
| `LIVE` | Approved and visible |
| `REJECTED` | Rejected — rejection reason stored and shown |

---

## Security Notes

- Refresh tokens are stored as bcrypt hashes — never plain text
- OTP codes expire in 5 minutes, max 5 attempts before invalidation
- All auth endpoints rate-limited (5 req/min login, 3 req/min OTP send)
- Helmet sets security headers on all responses
- CORS restricted to `FRONTEND_URL` environment variable
- S3 bucket should have public access blocked — use presigned URLs for reads
- JWT secret must be at least 32 characters in production

---

## Development Scripts

```bash
# Backend
npm run start:dev      # Start with hot reload
npm run start:prod     # Production start
npm run build          # Compile TypeScript
npx prisma studio      # Open database GUI
npx prisma db seed     # Seed test data
npx prisma migrate dev # Run pending migrations

# Frontend
npm run dev            # Start with hot reload
npm run build          # Production build
npm run lint           # ESLint check
```

---

## Roadmap

Features planned for after MVP:

- [ ] Per-document individual approve/reject UI in admin panel
- [ ] Product image gallery with drag-to-reorder
- [ ] Active sessions manager — view and terminate sessions by device
- [ ] Audit log export to CSV
- [ ] Webhook notifications for external integrations
- [ ] Bulk product operations (approve/reject multiple at once)
- [ ] Supplier analytics dashboard (signups, approval rates over time)
- [ ] 2FA with authenticator apps

---

<div align="center">

Built with care by the Delraw team.

</div>
