/**
 * ============================================================
 *  DELRAW SUPPLIER PORTAL — MASTER ROUTE REFERENCE
 * ============================================================
 *
 * This file is a single source of truth for every route in the
 * supplier portal frontend (Next.js App Router).
 *
 * HOW NEXT.JS APP ROUTER WORKS:
 *  - Every folder inside `src/app/` that contains a `page.tsx`
 *    becomes a URL segment automatically.
 *  - `src/app/page.tsx`            → /
 *  - `src/app/login/page.tsx`      → /login
 *  - `src/app/dashboard/supplier/page.tsx` → /dashboard/supplier
 *  - Dynamic segments use square brackets: [id] → :id in the URL
 *    e.g. `dashboard/admin/suppliers/[id]` → /dashboard/admin/suppliers/123
 *
 * HOW TO USE THIS FILE:
 *  - Import ROUTES.<section>.<name> anywhere you need a URL string.
 *  - All paths are plain strings — no runtime cost, fully type-safe.
 *  - For dynamic routes, use the helper functions provided at the
 *    bottom of this file to build real URLs with actual IDs.
 *
 * QUICK TEST LINKS (run `npm run dev`, then open in browser):
 *  http://localhost:3000/
 *  http://localhost:3000/login
 *  http://localhost:3000/register
 *  http://localhost:3000/forgot-password
 *  http://localhost:3000/dashboard/supplier
 *  http://localhost:3000/dashboard/admin
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// SECTION 1 — PUBLIC / AUTHENTICATION ROUTES
// These routes are accessible to everyone (no login required).
// ─────────────────────────────────────────────────────────────

export const AUTH_ROUTES = {
  /**
   * LANDING PAGE
   * Path    : /
   * File    : src/app/page.tsx
   * Access  : Public
   * Purpose : Marketing landing page for the Delraw Supplier Portal.
   *           Showcases the product, features, and CTAs for sign-up.
   */
  HOME: "/",

  /**
   * LOGIN
   * Path    : /login
   * File    : src/app/login/page.tsx
   * Access  : Public (redirects to dashboard if already logged in)
   * Purpose : Email + password authentication form.
   *           On success → redirects to /dashboard/supplier or /dashboard/admin
   *           depending on the user's role.
   */
  LOGIN: "/login",

  /**
   * REGISTER
   * Path    : /register
   * File    : src/app/register/page.tsx
   * Access  : Public
   * Purpose : New supplier sign-up form.
   *           Collects company name, email, password, and role.
   *           On success → redirects to /dashboard/supplier/onboarding
   */
  REGISTER: "/register",

  /**
   * FORGOT PASSWORD
   * Path    : /forgot-password
   * File    : src/app/forgot-password/page.tsx
   * Access  : Public
   * Purpose : Password reset request form.
   *           User enters their email and receives a reset link.
   */
  FORGOT_PASSWORD: "/forgot-password",
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 2 — SUPPLIER DASHBOARD ROUTES
// These routes are protected — available only to authenticated
// users with the SUPPLIER role.
// ─────────────────────────────────────────────────────────────

export const SUPPLIER_ROUTES = {
  /**
   * SUPPLIER DASHBOARD (Home)
   * Path    : /dashboard/supplier
   * File    : src/app/dashboard/supplier/page.tsx
   * Access  : Protected — Supplier role required
   * Purpose : Main overview/home page for a supplier.
   *           Shows KPI cards (revenue, orders, products, rating),
   *           recent orders table, performance charts, and quick actions.
   */
  DASHBOARD: "/dashboard/supplier",

  /**
   * SUPPLIER ONBOARDING
   * Path    : /dashboard/supplier/onboarding
   * File    : src/app/dashboard/supplier/onboarding/page.tsx
   * Access  : Protected — Supplier role required
   * Purpose : Multi-step onboarding wizard for new suppliers.
   *           Steps include company details, product categories, documents,
   *           bank info, and review/submission.
   *           New accounts are redirected here after registration until
   *           onboarding is complete.
   */
  ONBOARDING: "/dashboard/supplier/onboarding",

  /**
   * SUPPLIER PRODUCTS (List)
   * Path    : /dashboard/supplier/products
   * File    : src/app/dashboard/supplier/products/page.tsx
   * Access  : Protected — Supplier role required
   * Purpose : Grid/list view of all products owned by this supplier.
   *           Supports search, filter by category/status, and pagination.
   *           Links to the "Add New Product" form.
   */
  PRODUCTS: "/dashboard/supplier/products",

  /**
   * ADD NEW PRODUCT
   * Path    : /dashboard/supplier/products/new
   * File    : src/app/dashboard/supplier/products/new/page.tsx
   * Access  : Protected — Supplier role required
   * Purpose : Form to create and submit a new product listing.
   *           Includes name, description, category, pricing, images,
   *           and inventory fields.
   */
  PRODUCTS_NEW: "/dashboard/supplier/products/new",

  /**
   * SUPPLIER PROFILE
   * Path    : /dashboard/supplier/profile
   * File    : src/app/dashboard/supplier/profile/page.tsx
   * Access  : Protected — Supplier role required
   * Purpose : Supplier profile settings page.
   *           Allows editing contact info, company details,
   *           branding, and notification preferences.
   */
  PROFILE: "/dashboard/supplier/profile",

  /**
   * SUPPLIER NOTIFICATIONS
   * Path    : /dashboard/supplier/notifications
   * File    : src/app/dashboard/supplier/notifications/page.tsx
   * Access  : Protected — Supplier role required
   * Purpose : Notification center showing alerts for orders, messages,
   *           system updates, and onboarding status changes.
   */
  NOTIFICATIONS: "/dashboard/supplier/notifications",

  /**
   * SUPPLIER SETTINGS
   * Path    : /dashboard/supplier/settings
   * File    : src/app/dashboard/supplier/settings/page.tsx (TBD)
   * Access  : Protected — Supplier role required
   * Purpose : General account settings, security, and preferences.
   */
  SETTINGS: "/dashboard/supplier/settings",

  /**
   * GLOBAL SEARCH
   * Path    : /dashboard/supplier/search
   * Access  : Protected — Supplier role required
   */
  SEARCH: "/dashboard/supplier/search",
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 3 — ADMIN DASHBOARD ROUTES
// These routes are protected — available only to authenticated
// users with the ADMIN role.
// ─────────────────────────────────────────────────────────────

export const ADMIN_ROUTES = {
  /**
   * ADMIN DASHBOARD (Home)
   * Path    : /dashboard/admin
   * File    : src/app/dashboard/admin/page.tsx
   * Access  : Protected — Admin role required
   * Purpose : High-level overview for administrators.
   *           Shows platform-wide stats: total suppliers, users,
   *           revenue, active products, and recent activity feed.
   */
  DASHBOARD: "/dashboard/admin",

  /**
   * ADMIN — SUPPLIERS MANAGEMENT
   * Path    : /dashboard/admin/suppliers
   * File    : src/app/dashboard/admin/suppliers/page.tsx
   * Access  : Protected — Admin role required
   * Purpose : Full list of all registered suppliers.
   *           Admins can filter by status (pending / verified / suspended),
   *           search by name, and click through to a supplier's detail view.
   */
  SUPPLIERS: "/dashboard/admin/suppliers",

  /**
   * ADMIN — SUPPLIER DETAIL (Dynamic)
   * Path    : /dashboard/admin/suppliers/:id
   * File    : src/app/dashboard/admin/suppliers/[id]/page.tsx
   * Access  : Protected — Admin role required
   * Purpose : Detailed view of a single supplier.
   *           Shows onboarding progress, documents, product listings,
   *           and provides Approve / Reject / Suspend actions.
   *
   * Usage   : Use the `adminSupplierDetailPath(id)` helper below
   *           to build a real URL, e.g. adminSupplierDetailPath("abc123")
   *           → "/dashboard/admin/suppliers/abc123"
   */
  SUPPLIER_DETAIL: "/dashboard/admin/suppliers/[id]",

  /**
   * ADMIN — PRODUCTS MANAGEMENT
   * Path    : /dashboard/admin/products
   * File    : src/app/dashboard/admin/products/page.tsx
   * Access  : Protected — Admin role required
   * Purpose : Platform-wide product catalogue visible to admins.
   *           Supports approving/rejecting product submissions,
   *           filtering by supplier and category.
   */
  PRODUCTS: "/dashboard/admin/products",

  /**
   * ADMIN — USERS MANAGEMENT
   * Path    : /dashboard/admin/users
   * File    : src/app/dashboard/admin/users/page.tsx
   * Access  : Protected — Admin role required
   * Purpose : Manage all user accounts on the platform.
   *           Admins can view, search, and update user roles or statuses.
   */
  USERS: "/dashboard/admin/users",

  /**
   * ADMIN — ANALYTICS
   * Path    : /dashboard/admin/analytics
   * File    : src/app/dashboard/admin/analytics/page.tsx
   * Access  : Protected — Admin role required
   * Purpose : Platform-wide analytics dashboard.
   *           Revenue trends, supplier growth, product performance,
   *           geographic distribution charts.
   */
  ANALYTICS: "/dashboard/admin/analytics",

  /**
   * ADMIN — AUDIT LOGS
   * Path    : /dashboard/admin/audit-logs
   * File    : src/app/dashboard/admin/audit-logs/page.tsx
   * Access  : Protected — Admin role required
   * Purpose : Chronological log of all admin actions performed on the platform
   *           (approvals, rejections, user changes, config updates).
   *           Useful for compliance and security review.
   */
  AUDIT_LOGS: "/dashboard/admin/audit-logs",

  /**
   * ADMIN — PLATFORM CONFIGURATION
   * Path    : /dashboard/admin/config
   * File    : src/app/dashboard/admin/config/page.tsx
   * Access  : Protected — Admin role required
   * Purpose : System-level settings for the platform.
   *           Feature flags, onboarding step toggles, rate limits,
   *           email templates, and integration keys.
   */
  CONFIG: "/dashboard/admin/config",
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 4 — COMBINED ROUTE MAP
// A flat map of ALL routes for easy reference, iteration,
// or passing to middleware / route guards.
// ─────────────────────────────────────────────────────────────

export const ROUTES = {
  auth: AUTH_ROUTES,
  supplier: SUPPLIER_ROUTES,
  admin: ADMIN_ROUTES,
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 5 — ROUTE GROUPS (for access-control logic)
// Use these arrays to check if a given pathname requires
// authentication, or a specific role.
// ─────────────────────────────────────────────────────────────

/**
 * Routes accessible without any authentication.
 * Middleware / guards should allow these through freely.
 */
export const PUBLIC_ROUTES: string[] = [
  AUTH_ROUTES.HOME,
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
];

/**
 * Routes that require the user to be logged in as a SUPPLIER.
 * Any other role should be redirected to their own dashboard.
 */
export const SUPPLIER_PROTECTED_ROUTES: string[] = Object.values(SUPPLIER_ROUTES);

/**
 * Routes that require the user to be logged in as an ADMIN.
 * Any other role should be redirected to /login.
 */
export const ADMIN_PROTECTED_ROUTES: string[] = Object.values(ADMIN_ROUTES).map(
  // Replace the [id] token so we can do startsWith() checks in middleware
  (r) => r.replace("/[id]", "")
);

// ─────────────────────────────────────────────────────────────
// SECTION 6 — DYNAMIC ROUTE HELPERS
// Call these functions to build real URLs for dynamic segments.
// ─────────────────────────────────────────────────────────────

/**
 * Build the URL for an individual supplier detail page (admin view).
 *
 * @param supplierId - The supplier's unique ID (string or number)
 * @returns A fully resolved URL string
 *
 * @example
 * adminSupplierDetailPath("abc123")
 * // → "/dashboard/admin/suppliers/abc123"
 */
export function adminSupplierDetailPath(supplierId: string | number): string {
  return `/dashboard/admin/suppliers/${supplierId}`;
}

// ─────────────────────────────────────────────────────────────
// SECTION 7 — REDIRECT DEFAULTS
// Used by auth logic to decide where to send a user after login
// or when they hit a protected route without the right role.
// ─────────────────────────────────────────────────────────────

export const REDIRECT_DEFAULTS = {
  /**
   * Where a logged-in SUPPLIER lands after successful login.
   */
  SUPPLIER_HOME: SUPPLIER_ROUTES.DASHBOARD,

  /**
   * Where a logged-in ADMIN lands after successful login.
   */
  ADMIN_HOME: ADMIN_ROUTES.DASHBOARD,

  /**
   * Where unauthenticated users are redirected when they try
   * to access any protected route.
   */
  UNAUTHENTICATED: AUTH_ROUTES.LOGIN,

  /**
   * Where a new supplier is sent immediately after registration
   * (before onboarding is complete).
   */
  NEW_SUPPLIER: SUPPLIER_ROUTES.ONBOARDING,
} as const;

/*
 * ─────────────────────────────────────────────────────────────
 * FULL ROUTE TREE (for quick reference while developing)
 * ─────────────────────────────────────────────────────────────
 *
 * /                                        ← Landing Page
 * /login                                   ← Login
 * /register                                ← Register
 * /forgot-password                         ← Forgot Password
 *
 * /dashboard/supplier                      ← Supplier Home
 * /dashboard/supplier/onboarding           ← Onboarding Wizard
 * /dashboard/supplier/products             ← My Products List
 * /dashboard/supplier/products/new         ← Add New Product
 * /dashboard/supplier/profile              ← Profile Settings
 * /dashboard/supplier/notifications        ← Notifications
 *
 * /dashboard/admin                         ← Admin Home
 * /dashboard/admin/suppliers               ← All Suppliers List
 * /dashboard/admin/suppliers/:id           ← Supplier Detail
 * /dashboard/admin/products                ← All Products (admin)
 * /dashboard/admin/users                   ← User Management
 * /dashboard/admin/analytics               ← Analytics
 * /dashboard/admin/audit-logs              ← Audit Logs
 * /dashboard/admin/config                  ← Platform Config
 * ─────────────────────────────────────────────────────────────
 */
