# Smart Inventory Dashboard

A production-grade, full-stack inventory management application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Node.js/Express 5**, and **PostgreSQL**. Features enterprise-level authentication, role-based access control, real-time analytics, Redis caching, background jobs, audit logging, and a beautiful dark/light mode interface.

[![CI](https://github.com/mounikamp1/smart-inventorymanagement-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/mounikamp1/smart-inventorymanagement-dashboard/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active-brightgreen)
![Tests](https://img.shields.io/badge/tests-13%20passing-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

---

## Table of Contents

- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Enterprise Features](#enterprise-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [Cursor Pagination](#cursor-pagination)
- [Audit Logging](#audit-logging)
- [Test Coverage](#test-coverage)
- [Design System](#design-system)
- [Security](#security)
- [Deployment](#deployment)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Live Demo

> Add your deployed URL here once hosted (e.g., Vercel / Railway).

| Service | URL |
|---------|-----|
| Frontend | _coming soon_ |
| API | _coming soon_ |

---

## Screenshots

> Replace the images below with actual screenshots of your running app.

| Dashboard (Dark Mode) | Products Catalog | Audit Log |
|---|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Products](docs/screenshots/products.png) | ![Audit](docs/screenshots/audit.png) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4, MUI DataGrid |
| State | Redux Toolkit, RTK Query, redux-persist |
| Auth | NextAuth v5 (JWT strategy, credentials provider) |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL + Prisma ORM 6 |
| Cache | Redis (ioredis) + BullMQ background jobs |
| Uploads | Cloudinary (image storage) |
| Validation | Zod v4 (client + server) |
| Rate Limiting | express-rate-limit |
| Testing | Jest + ts-jest (server & client) |
| CI | GitHub Actions |

---

## Enterprise Features

### Authentication & Security
- **JWT Authentication** — NextAuth v5 credentials provider with 8-hour session expiry
- **Role-Based Access Control (RBAC)** — `ADMIN` and `STAFF` roles enforced on both API and UI
- **Rate Limiting** — 300 req/15 min globally; 20 req/15 min on auth endpoints
- **Zod Validation** — Schema validation on every API input and client form
- **Session Expiry Warning** — Amber banner in navbar when session has < 15 minutes remaining
- **Password Hashing** — bcrypt with salt rounds

### Data & Performance
- **Redis Caching** — Products and dashboard data cached with TTL; invalidated on write
- **Cursor Pagination** — Efficient keyset pagination on products and inventory
- **Optimistic UI** — Instant UI updates via `useOptimistic` + `useTransition` before server confirmation
- **Background Jobs** — BullMQ queue for low-stock alerts and async tasks (graceful fallback when Redis unavailable)
- **DB Transactions** — Prisma transactions for multi-table writes

### Observability & Audit
- **Audit Logging** — Every product create/update/delete recorded in `AuditLog` table (userId, action, model, diff)
- **Audit Log UI** — ADMIN-only paginated table with model filter at `/audit`
- **Error Observability** — Structured error logging, uncaught exception handlers

### Developer Experience
- **Image Uploads** — Cloudinary integration with multer multipart handling
- **Test Coverage** — 13 passing unit tests (Jest + ts-jest) across server and client
- **Full TypeScript** — End-to-end type safety, strict tsconfig
- **CI Pipeline** — GitHub Actions runs tests and lint on every push and pull request

---

## Project Structure

```
smart-inventory-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI — tests + lint on push/PR
├── client/                          # Next.js 15 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── audit/               # Audit log viewer (ADMIN only)
│   │   │   ├── dashboard/           # Dashboard with charts
│   │   │   ├── inventory/           # Inventory with inline editing + cursor pagination
│   │   │   ├── products/            # Product catalog with optimistic create
│   │   │   ├── users/               # User directory (ADMIN only)
│   │   │   ├── expenses/            # Expense tracking & analytics
│   │   │   ├── settings/            # Profile settings (API-persisted)
│   │   │   ├── login/               # Auth pages
│   │   │   └── (components)/
│   │   │       ├── Navbar/          # Role badge + session expiry warning
│   │   │       ├── Sidebar/         # Role-based nav (Audit Log for ADMIN)
│   │   │       ├── Header/
│   │   │       └── Rating/
│   │   ├── schemas/
│   │   │   └── productSchema.ts     # Zod client-side schemas
│   │   ├── state/
│   │   │   ├── api.ts               # RTK Query endpoints
│   │   │   └── index.ts             # Redux store
│   │   └── lib/
│   │       └── auth.ts              # NextAuth configuration
│   ├── __tests__/
│   │   └── productSchema.test.ts    # Client unit tests (4 tests)
│   ├── jest.config.js
│   ├── jest.setup.ts
│   └── package.json
│
├── server/                          # Express 5 backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts    # Login / register
│   │   │   ├── productController.ts # CRUD + image upload + updateProduct
│   │   │   ├── userController.ts    # getMe / updateMe / getUsers
│   │   │   ├── auditController.ts   # Audit log query (ADMIN)
│   │   │   ├── dashboardController.ts
│   │   │   └── expenseController.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── auditRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   └── expenseRoutes.ts
│   │   ├── middleware/
│   │   │   ├── authenticate.ts      # JWT verification
│   │   │   └── requireRole.ts       # RBAC role check
│   │   ├── lib/
│   │   │   ├── prisma.ts            # Prisma client + audit log extension
│   │   │   ├── redis.ts             # Redis / ioredis client
│   │   │   └── queue.ts             # BullMQ queue setup
│   │   ├── jobs/
│   │   │   └── lowStockWorker.ts    # Background job worker
│   │   └── index.ts                 # Server entry point + rate limiting
│   ├── prisma/
│   │   ├── schema.prisma            # DB schema (incl. AuditLog model)
│   │   └── seed.ts
│   ├── __tests__/
│   │   └── auth.test.ts             # Server unit tests (9 tests)
│   ├── jest.config.js
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14+
- **Redis** 7+ (optional — app runs without it)
- **npm** 9+

### 1. Clone the Repository

```bash
git clone https://github.com/mounikamp1/smart-inventorymanagement-dashboard.git
cd smart-inventorymanagement-dashboard
```

### 2. Configure Environment Variables

**`server/.env`**
```env
PORT=8000
DATABASE_URL="postgresql://user:password@localhost:5432/inventorymanagement"
JWT_SECRET="your-secret-min-32-chars"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
LOW_STOCK_THRESHOLD=10
```

**`client/.env.local`**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET="your-nextauth-secret-min-32-chars"
API_BASE_URL=http://localhost:8000
```

### 3. Setup & Run Backend

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed        # optional
npm run dev         # http://localhost:8000
```

### 4. Setup & Run Frontend

```bash
cd client
npm install
npm run dev         # http://localhost:3000
```

---

## Available Scripts

### Client

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run unit tests (Jest) |
| `npm run lint` | ESLint |

### Server

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with ts-node-dev (hot reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm test` | Run unit tests (Jest) |
| `npm run seed` | Seed the database |

---

## API Reference

### Auth (`/auth`)
> Rate limited: 20 requests / 15 minutes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login, returns JWT | Public |
| POST | `/auth/register` | Create account | Public |

### Products (`/products`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | List products (cursor pagination, search, Redis cached) | Required |
| POST | `/products` | Create product (Zod validated) | ADMIN |
| PATCH | `/products/:id` | Update product (optimistic-UI compatible) | ADMIN |
| POST | `/products/upload` | Upload product image to Cloudinary | ADMIN |

### Users (`/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | Required |
| PATCH | `/users/me` | Update name / email | Required |
| GET | `/users` | List all users | ADMIN |

### Audit Logs (`/audit`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/audit` | List audit logs (paginated, filterable) | ADMIN |

### Dashboard & Expenses

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Dashboard summary (cached) | Required |
| GET | `/expenses` | Expenses by category | Required |

---

## Role-Based Access Control

| Feature | STAFF | ADMIN |
|---------|-------|-------|
| View dashboard, inventory, products | ✅ | ✅ |
| Edit stock quantity inline (inventory) | ❌ | ✅ |
| Create / update products | ❌ | ✅ |
| Upload product images | ❌ | ✅ |
| View user directory | ❌ | ✅ |
| View audit log (`/audit`) | ❌ | ✅ |
| Sidebar "Audit Log" link | ❌ | ✅ |
| Role badge in Navbar & Sidebar | — | Indigo |

---

## Cursor Pagination

Products and inventory use keyset (cursor) pagination for O(1) page navigation regardless of dataset size:

```
GET /products?cursor=<productId>&take=20&search=widget
```

Response includes `nextCursor` and `hasNextPage`. The UI renders **Previous / Next** controls that maintain a cursor history stack.

---

## Audit Logging

Every product mutation is automatically recorded by the Prisma client extension in `server/src/lib/prisma.ts`:

```json
{
  "id": "uuid",
  "userId": "user-id",
  "action": "UPDATE",
  "model": "Products",
  "recordId": "product-id",
  "diff": { "before": { "stockQuantity": 50 }, "after": { "stockQuantity": 45 } },
  "createdAt": "2026-04-28T10:00:00Z"
}
```

Browse at `/audit` (ADMIN only) with model filter and pagination.

---

## Test Coverage

```
server/src/__tests__/auth.test.ts          — 9 tests  ✅
client/src/__tests__/productSchema.test.ts — 4 tests  ✅
Total: 13 passing
```

Run all tests:
```bash
# Server
cd server && npm test

# Client
cd client && npm test
```

---

## Design System

### Color Palette

| Role | Color | Usage |
|------|-------|-------|
| Primary | Blue 500–600 | Actions, highlights |
| Secondary | Indigo 500–600 | Gradients, ADMIN badges |
| Success | Emerald 500–600 | Positive states, toggles |
| Warning | Amber 500–600 | Session expiry banners |
| Danger | Red 500–600 | Errors, low stock |
| Neutral | Gray 50–900 | Backgrounds, text |

### Key UI Patterns

- **Cards**: `rounded-2xl/3xl` + `shadow-xl` with border
- **Buttons**: Gradient with `hover:scale-105` transition
- **Badges**: Rounded-full pill — green/yellow/red for stock levels, indigo for ADMIN role
- **DataGrid**: MUI with custom dark-mode `sx` overrides
- **Optimistic rows**: `opacity-60` + `pointer-events-none` during pending transitions

---

## Security

- Passwords hashed with **bcrypt** (10 rounds)
- JWT verified on every protected route via `authenticate` middleware
- Role enforced via `requireRole(["ADMIN"])` middleware
- Rate limiting on auth endpoints (brute-force protection)
- Zod input validation — no raw user data reaches the database
- CORS configured to allowed origins only
- Cloudinary credentials stored server-side only (never exposed to client)
- `_auditUserId` internal field stripped from Prisma args before query execution

---

## Deployment

### Railway (recommended)

1. Create two services in Railway — one for the **server**, one for PostgreSQL, and optionally one for Redis.
2. Set the environment variables from the [Configure Environment Variables](#2-configure-environment-variables) section in each service's settings.
3. Set the **start command** for the server service to:
   ```bash
   npm run build && npm start
   ```

### Vercel (frontend)

1. Import the repository and set the **root directory** to `client`.
2. Add environment variables (`NEXT_PUBLIC_API_BASE_URL`, `NEXTAUTH_URL`, `AUTH_SECRET`, `API_BASE_URL`).
3. Deploy — Vercel auto-detects Next.js.

### Docker (self-hosted)

A `Dockerfile` per service and a `docker-compose.yml` for local orchestration can be added in a future release. Open an issue if you need this.

---

## Changelog

### v2.0.0 — April 28, 2026

- ✅ NextAuth v5 authentication with JWT + RBAC (ADMIN / STAFF roles)
- ✅ Rate limiting (express-rate-limit) on all routes and auth
- ✅ Redis caching for products and dashboard endpoints
- ✅ Cursor-based pagination on products and inventory
- ✅ Optimistic UI with `useOptimistic` + `useTransition` (products + inventory)
- ✅ Audit logging via Prisma extension — all product mutations recorded
- ✅ Audit Log UI at `/audit` with pagination and model filter
- ✅ Background jobs with BullMQ (low-stock alerts)
- ✅ Cloudinary image uploads for products
- ✅ Zod v4 schema validation (client + server)
- ✅ `/users/me` GET + PATCH for profile settings (API-backed)
- ✅ Session expiry warning banner (< 15 min remaining)
- ✅ Role badge in Navbar and Sidebar
- ✅ ADMIN-only Audit Log sidebar link
- ✅ Inline stock editing in Inventory DataGrid (ADMIN only)
- ✅ 13 unit tests across server and client (Jest + ts-jest)
- ✅ DB transactions for multi-table writes
- ✅ GitHub Actions CI pipeline (tests + lint)

### v1.0.0 — December 3, 2025

- ✅ Initial release with dashboard, inventory, products, users, expenses
- ✅ Dark/light mode with Redux-persist
- ✅ Full TypeScript implementation
- ✅ Premium Tailwind UI design

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'feat: add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Author

**Mounika M**
Full-stack developer · Maintained since December 2025

[![GitHub](https://img.shields.io/badge/GitHub-mounikamp1-181717?logo=github)](https://github.com/mounikamp1)
