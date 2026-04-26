# 🗺️ Project Context Map: Delraw Supplier Portal

## 🤖 AI Instructions & Maintenance Rule
> [!IMPORTANT]
> **CRITICAL RULE**: This file is the primary context for any AI assistant working on this project. 
> **You MUST update this file immediately after completing any task that modifies:**
> 1.  **Database Schema** (Prisma or MongoDB)
> 2.  **API Routes/Endpoints** (NestJS Controllers)
> 3.  **Frontend Pages/Routes** (Next.js App Router)
> 4.  **Core Business Logic** (Services, State Machines)
> 5.  **Environment Variables** or **Dependencies**

---

## 🏗️ System Architecture
The project follows a decoupled **Full-Stack** architecture:
- **Backend**: NestJS (Node.js framework) providing a RESTful API.
- **Frontend**: Next.js 16 (App Router) with React Server Components.
- **Primary Database**: PostgreSQL (via Prisma ORM) for relational data (Users, Suppliers, Products).
- **Secondary Database**: MongoDB (via Mongoose) for Audit Logs and high-frequency event tracking.
- **Storage**: AWS S3 for documents and product images.

---

## 📂 Project Structure

### 1. Backend (`/delraw-backend`)
- `src/auth/`: JWT Auth, OTP verification, Refresh Tokens, Role-based Guards.
- `src/supplier/`: Supplier profile management, onboarding states.
- `src/products/`: Product management, variants, and image ordering.
- `src/admin/`: Admin-only workflows (approvals, stats, system config).
- `src/audit/`: MongoDB-backed audit logging service.
- `src/prisma/`: Prisma service and schema definitions.
- `src/mail/`: Nodemailer integration for OTP and notifications.

### 2. Frontend (`/website`)
- `src/app/`: Next.js App Router.
    - `(auth)/`: Login, Register, Forgot Password flows.
    - `dashboard/supplier/`: Supplier-facing portal.
    - `dashboard/admin/`: Administrative dashboard.
    - `dashboard/super-admin/`: Advanced system configuration.
- `src/lib/api.ts`: Centralized Axios instance with JWT interceptors and mock mode support.
- `src/components/`: Reusable UI components (Sidebar, Layouts, Forms).

---

## 🔐 Authentication & Roles
- **Roles**: `SUPPLIER`, `ADMIN`, `SUPER_ADMIN`.
- **Flow**: Register → OTP Verify → Login → JWT Access (15m) + Refresh (7d).
- **Security**:
    - JWTs are stateful via `RevokedToken` blacklist in PostgreSQL.
    - Refresh tokens are bcrypt-hashed in the database.
    - Hierarchy: Super Admin > Admin > Supplier.

---

## 🔄 Business Logic & State Machines

### Supplier Onboarding
`DRAFT` ➔ `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `VERIFIED` | `REJECTED`
- *Note*: Suppliers must be `VERIFIED` before they can list products.

### Product Approval
`DRAFT` ➔ `PENDING_APPROVAL` ➔ `LIVE` | `REJECTED`
- *Note*: Only `LIVE` products are visible in the upcoming marketplace/buyer views.

---

## 📊 Data Model (Key Entities)
| Entity | Storage | Description |
|---|---|---|
| **User** | PostgreSQL | Auth credentials, role, OTP state. |
| **Supplier** | PostgreSQL | Company details, status, linked to User. |
| **Product** | PostgreSQL | Catalog items, specs, price, category. |
| **AuditLog** | MongoDB | Immutable history of all system actions. |
| **Notification**| PostgreSQL | In-app alerts for suppliers. |
| **SystemConfig**| PostgreSQL | Singleton for global settings (Maintenance, Limits). |

---

## 🛠️ Tech Stack Details
- **Backend**: NestJS, Prisma, Mongoose, Passport, Nodemailer, AWS SDK.
- **Frontend**: Next.js, Tailwind CSS 4, Axios, Lucide React.
- **DevOps**: Docker Compose (for local DBs), dotenv.

---

## 📝 Recent Major Changes (Changelog)
- **2026-04-27**: Redesigned Supplier Dashboard with premium UI, onboarding roadmap, and real API integration.
- **2026-04-27**: Context Map initialized. Audit Logs migrated to MongoDB for scalability.
- **2026-04-24**: Stabilized MongoDB Audit Service and role-based log retrieval.
- **2026-04-23**: Migrated to Prisma 7 and updated `PrismaService` connection logic.
- **2026-04-22**: Unified Sidebar component implemented across all dashboard roles.

---

## 🚀 Active Development / TODOs
- [ ] Implement per-document approval in Admin dashboard.
- [ ] Add drag-and-drop reordering for product images.
- [ ] Audit log export to CSV feature.
- [ ] Real-time notifications using WebSockets or SSE.

---
*SAWAN -Last Updated: 2026-04-27*
