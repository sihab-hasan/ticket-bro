<div align="center">

<img src="frontend/public/assets/logos/ticket-bro-logo.png" alt="Ticket Bro" width="120" />

# 🎟️ Ticket Bro

**A Smart Event Management & Ticketing Platform**

[![Node.js](https://img.shields.io/badge/Node.js-v24-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express.js-v4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Vite](https://img.shields.io/badge/Vite-v7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

<br/>

[Features](#-features) &nbsp;·&nbsp; [Tech Stack](#%EF%B8%8F-tech-stack) &nbsp;·&nbsp; [Getting Started](#-getting-started) &nbsp;·&nbsp; [Project Structure](#-project-structure) &nbsp;·&nbsp; [API Reference](#-api-reference) &nbsp;·&nbsp; [Security](#-security) &nbsp;·&nbsp; [Carbon Footprint](#-carbon-footprint) &nbsp;·&nbsp; [Contributing](#-contributing)

<br/>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="frontend/src/assets/images/ticket-bro-logo-dark-mode.png" />
  <source media="(prefers-color-scheme: light)" srcset="frontend/src/assets/images/ticket-bro-logo-light-mode.png" />
  <img src="frontend/src/assets/images/ticket-bro-logo-light-mode.png" alt="Ticket Bro Logo" height="42" />
</picture>

</div>

---

## 📖 About

**Ticket Bro** is a production-grade full-stack MERN web application — a unified platform for managing, discovering, and participating in all types of events, from paid concerts and conferences to free community workshops and charity drives.

It combines **smart technology**, **volunteer engagement**, and an **anti-fraud QR ticket system** to create a safe, inclusive, and impactful event ecosystem. Built on a scalable **Turborepo monorepo** architecture with pnpm workspaces, Ticket Bro is engineered for real-world deployment.

> 🎓 Built as a Web Application Engineering project using the MERN stack.

---

## ✨ Features

### 👤 For Users

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT + Refresh tokens, Google/Facebook OAuth, Two-Factor Authentication (2FA) |
| 🔍 **Discover Events** | Browse & filter by category, location, date, price, and type |
| 🗺️ **Map View** | Location-based event discovery with interactive Leaflet maps |
| 🎫 **Booking** | Online booking with QR-code digital tickets — PDF download + email delivery |
| 🔔 **Notifications** | Real-time alerts for bookings, reminders, and upcoming events |
| 💬 **Messaging** | Direct chat with event organizers via real-time Socket.io |
| 🏆 **Loyalty Points** | Points system with reward redemption |
| ⏳ **Waitlist** | Auto-join waitlist for fully booked events |
| 📋 **History** | Full booking history, cancellations, and refund tracking |

### 🧑‍💼 For Organizers

| Feature | Description |
|---|---|
| 📊 **Analytics Dashboard** | Real-time revenue, attendance, and sales insights |
| 🎪 **Event Management** | Create events with multiple ticket tiers — VIP, Standard, Early Bird |
| 📸 **Captured Moments** | Post-event photo gallery for attendees |
| 📤 **Attendee Export** | Check-in management and attendee data export (CSV) |
| 💰 **Payouts** | Payout tracking and financial reporting |
| 🔁 **Dynamic Pricing** | Demand-based and tier-based ticket pricing |

### 🛡️ For Admins

| Feature | Description |
|---|---|
| 👥 **User Management** | Full control over users, organizers, and moderators |
| ✅ **Event Moderation** | Approval workflow and content moderation |
| 🔍 **Anti-Fraud** | QR ticket validation system to prevent duplicate entries |
| 📈 **Platform Analytics** | Aggregated performance dashboard across all events |
| 📝 **Audit Logs** | Complete trail of all administrative actions |
| 📢 **Broadcasts** | System-wide notifications to all users |

### ⚙️ System

| Feature | Description |
|---|---|
| ⚡ **Real-time** | Socket.io WebSockets for live updates across all features |
| 🗄️ **Redis Caching** | High-performance API response caching and rate-limit store |
| 🖼️ **Image Pipeline** | Multer → Sharp (resize/compress) → Cloudinary CDN |
| 🌿 **Carbon Tracking** | Live CO₂ footprint widget using the Sustainable Web Design model |
| 🏗️ **Monorepo** | Turborepo + pnpm workspaces for efficient builds and caching |
| 🐳 **Docker** | Containerized backend for portable deployment |

---

## 🛠️ Tech Stack

### Frontend

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,redux,js,figma" />

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI framework |
| **Vite** | 7.x | Build tool & dev server |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Shadcn/UI** | latest | Accessible component library |
| **Redux Toolkit** | 2.x | Global state management |
| **React Router DOM** | 7.x | Client-side routing |
| **React Hook Form + Zod** | latest | Forms & schema validation |
| **Framer Motion** | 12.x | Animations & transitions |
| **React Leaflet** | 5.x | Interactive maps (OpenStreetMap) |
| **Socket.io Client** | 4.x | Real-time WebSocket communication |
| **Axios** | 1.x | HTTP client with interceptors |

### Backend

<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,redis,docker" />

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 24.x | JavaScript runtime |
| **Express.js** | 4.x | Web framework |
| **MongoDB + Mongoose** | 9.x | Database & ODM |
| **Redis** | latest | Caching & rate limiting store |
| **Socket.io** | 4.x | WebSocket server |
| **Passport.js + JWT** | latest | Authentication — local + OAuth2 |
| **Nodemailer** | 8.x | Transactional email with HTML templates |
| **Cloudinary + Sharp** | latest | Image storage, resize & CDN |
| **qrcode + PDFKit** | latest | QR ticket generation & PDF export |
| **@tgwf/co2** | 0.18.x | Carbon footprint estimation |
| **Winston** | 3.x | Structured application logging |
| **Helmet** | latest | HTTP security headers |
| **express-rate-limit** | latest | IP-based brute force protection |

### DevOps & Tooling

<img src="https://skillicons.dev/icons?i=pnpm,docker,jest,eslint,git,github" />

| Tool | Purpose |
|---|---|
| **Turborepo** | Monorepo build orchestration & caching |
| **pnpm workspaces** | Fast, disk-efficient package management |
| **Jest + Supertest** | Backend unit & integration testing |
| **ESLint** | Code linting & style enforcement |
| **Nodemon** | Auto-reload during development |
| **Docker** | Containerized backend deployment |

---

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed before proceeding:

| Tool | Version | Install |
|---|---|---|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | v8+ | `npm install -g pnpm` |
| **MongoDB** | v6+ | [mongodb.com](https://mongodb.com) or [Atlas](https://www.mongodb.com/atlas) |
| **Redis** | v7+ | [redis.io](https://redis.io) or [Redis Cloud](https://redis.io/cloud) |

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ticket-bro.git
cd ticket-bro
```

---

### 2. Install Dependencies

```bash
# Installs root, backend, and frontend dependencies in one command
pnpm install
```

---

### 3. Configure Environment Variables

#### Backend

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values:

```env
# ── Server ────────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=5000
API_VERSION=v1
API_PREFIX=/api

# ── Database ──────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/ticketbro

# ── JWT ───────────────────────────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Cookie ────────────────────────────────────────────────────────────────────
COOKIE_SECRET=your_cookie_secret_here
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax

# ── Email (SMTP) ──────────────────────────────────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME=Ticket Bro
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# ── Cloudinary ────────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── URLs ──────────────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# ── OAuth (optional) ──────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# ── Carbon Footprint ──────────────────────────────────────────────────────────
CARBON_GREEN_HOST=false
```

#### Frontend

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

### 4. Run the Application

```bash
# Runs both frontend and backend concurrently
pnpm dev
```

| Service | URL |
|---|---|
| 🎨 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:5000/api/v1 |
| ❤️ Health Check | http://localhost:5000/health |
| 🌿 Carbon Stats | http://localhost:5000/api/v1/carbon/stats |

---

## 📁 Project Structure

```
ticket-bro/
├── 📦 backend/
│   ├── src/
│   │   ├── app.js                        # Express app & middleware pipeline
│   │   ├── server.js                     # HTTP server entry point
│   │   ├── config/                       # App, DB, auth, mail, Redis configs
│   │   ├── common/
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.js
│   │   │   │   ├── rbac.middleware.js
│   │   │   │   ├── rateLimiter.middleware.js
│   │   │   │   └── carbonFootprint.middleware.js   # 🌿 CO₂ tracking
│   │   │   ├── utils/                    # PDF generator, QR codes, helpers
│   │   │   ├── errors/                   # Custom error classes & codes
│   │   │   └── validations/              # Shared Joi schemas
│   │   ├── infrastructure/
│   │   │   ├── cache/                    # Redis client & cache service
│   │   │   ├── logger/                   # Winston + Morgan logging
│   │   │   ├── mail/                     # Nodemailer + HTML email templates
│   │   │   ├── storage/                  # Cloudinary + Sharp image processor
│   │   │   ├── tokens/                   # JWT token service
│   │   │   └── websocket/                # Socket.io event handlers
│   │   ├── modules/
│   │   │   ├── auth/                     # JWT, OAuth, 2FA, password reset
│   │   │   ├── users/                    # Profile, preferences
│   │   │   ├── events/                   # CRUD, geo-search, image upload
│   │   │   ├── bookings/                 # Create, cancel, waitlist
│   │   │   ├── tickets/                  # Ticket types, QR validation, PDF
│   │   │   ├── payments/                 # Processing, refunds, payouts
│   │   │   ├── admins/                   # Moderation, user management
│   │   │   ├── analytics/                # Revenue reports, metrics
│   │   │   ├── notifications/            # In-app + email notifications
│   │   │   ├── locations/                # GeoJSON, nearby search
│   │   │   ├── messaging/                # Real-time chat
│   │   │   ├── categories/               # Event categorization
│   │   │   ├── loyalty/                  # Points & rewards
│   │   │   ├── reviews/                  # Ratings & reviews
│   │   │   ├── promotions/               # Discount codes
│   │   │   └── auditLogs/                # Admin action trail
│   │   └── routes/                       # Central route registration
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── App.jsx                       # Root component
│   │   ├── main.jsx                      # React entry point
│   │   ├── app/                          # Routes, providers, layout
│   │   ├── pages/                        # One component per route (30+)
│   │   ├── features/                     # Redux slices + API hooks by domain
│   │   ├── components/
│   │   │   ├── auth/                     # Login, register, OAuth buttons
│   │   │   ├── ui/                       # Shadcn base components
│   │   │   └── CarbonFootprintDisplay.jsx  # 🌿 Live CO₂ widget
│   │   ├── hooks/
│   │   │   ├── useCarbonFootprint.js     # PerformanceObserver CO₂ hook
│   │   │   └── useMessaging.js           # Real-time chat hooks
│   │   ├── store/                        # Redux Toolkit store
│   │   ├── api/                          # Axios instances & interceptors
│   │   ├── context/                      # Theme, modal, socket context
│   │   └── styles/                       # Global CSS
│   ├── public/
│   │   └── assets/
│   │       ├── logos/                    # ticket-bro-logo.png · .svg · light/dark
│   │       └── icons/                    # PWA icons (72px – 512px)
│   ├── .env.example
│   └── package.json
│
├── turbo.json                            # Turborepo pipeline config
├── pnpm-workspace.yaml                   # pnpm workspace config
└── package.json                          # Root scripts
```

---

## 🔌 API Reference

**Base URL:** `http://localhost:5000/api/v1`

> Full API documentation is available in [`backend/src/backend.txt`](backend/src/backend.txt)

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Login with email & password |
| `POST` | `/auth/refresh` | — | Refresh access token |
| `POST` | `/auth/logout` | ✅ | Logout & invalidate tokens |
| `GET` | `/auth/oauth/google` | — | Google OAuth login |
| `GET` | `/auth/oauth/facebook` | — | Facebook OAuth login |
| `POST` | `/auth/verify-email` | — | Verify email address |
| `POST` | `/auth/forgot-password` | — | Send password reset email |
| `POST` | `/auth/reset-password` | — | Reset password with token |
| `POST` | `/auth/2fa/enable` | ✅ | Enable Two-Factor Authentication |
| `POST` | `/auth/2fa/verify` | ✅ | Verify 2FA code |

### Events

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/events` | — | List all events (filterable) |
| `GET` | `/events/:id` | — | Get single event details |
| `POST` | `/events` | Organizer | Create a new event |
| `PUT` | `/events/:id` | Organizer | Update event |
| `DELETE` | `/events/:id` | Organizer/Admin | Delete event |
| `GET` | `/events/nearby` | — | Find events near coordinates |
| `POST` | `/events/:id/images` | Organizer | Upload event images |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/bookings` | ✅ | Create a booking |
| `GET` | `/bookings/my` | ✅ | Get user's booking history |
| `GET` | `/bookings/:id` | ✅ | Get booking details |
| `POST` | `/bookings/:id/cancel` | ✅ | Cancel a booking |
| `GET` | `/bookings/:id/ticket` | ✅ | Download PDF ticket |
| `POST` | `/bookings/:id/validate` | Organizer | Validate QR ticket (check-in) |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/initiate` | ✅ | Initiate payment for booking |
| `POST` | `/payments/webhook` | — | Payment gateway webhook |
| `GET` | `/payments/my` | ✅ | User payment history |
| `POST` | `/payments/:id/refund` | Admin | Process refund |

### Messaging

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/messaging/conversations` | ✅ | Get user conversations |
| `GET` | `/messaging/conversations/:id` | ✅ | Get messages in conversation |
| `POST` | `/messaging/conversations` | ✅ | Start a new conversation |
| `POST` | `/messaging/conversations/:id/messages` | ✅ | Send a message |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admins/dashboard` | Admin | Platform-wide analytics |
| `GET` | `/admins/users` | Admin | List & manage all users |
| `PATCH` | `/admins/users/:id/ban` | Admin | Ban a user |
| `GET` | `/admins/events` | Admin | All events for moderation |
| `PATCH` | `/admins/events/:id/approve` | Admin | Approve an event |
| `GET` | `/admins/audit-logs` | Admin | View full audit trail |
| `POST` | `/admins/broadcast` | Admin | Send system-wide notification |

### Carbon Footprint

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/carbon/stats` | — | Session-level CO₂ emissions data |

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "sessionTotalBytes": 6843392,
    "sessionTotalCO2Grams": 1.2468,
    "greenHost": false,
    "model": "Sustainable Web Design (SWD)"
  }
}
```

---

## 🔐 Security

Ticket Bro implements defense-in-depth across every layer of the stack:

| Layer | Implementation |
|---|---|
| **Passwords** | bcrypt with 12 salt rounds |
| **Tokens** | JWT Access (15min) + Refresh (7d) with rotation |
| **2FA** | TOTP via `speakeasy` (RFC 6238 compliant) |
| **HTTP Headers** | `helmet.js` — XSS, CSRF, clickjacking protection |
| **Rate Limiting** | `express-rate-limit` with Redis store |
| **NoSQL Injection** | `express-mongo-sanitize` |
| **Access Control** | RBAC enforced at route + service layers |
| **Ticket Fraud** | Unique QR codes with server-side single-use validation |
| **Audit Trail** | All admin actions logged with actor ID + timestamp |
| **Input Validation** | Joi schema validation on all incoming request bodies |

### Role Hierarchy

```
SUPER_ADMIN
    └── ADMIN
           └── MODERATOR
                  └── ORGANIZER
                         └── USER
```

---

## 🌿 Carbon Footprint

Ticket Bro actively measures and displays its real-time environmental impact using the **Sustainable Web Design (SWD)** model on both frontend and backend.

```
┌──────────────────────────────────┐
│  🍃 Carbon Footprint      ∨   ✕  │
│                                  │
│  CO₂ Emissions                   │
│  1.2468 g CO₂eq                  │
│                                  │
│  Data Transferred                │
│  6.53 MB                         │
│                                  │
│  Estimates based on network      │
│  data transfer this session.     │
└──────────────────────────────────┘
```

### How It Works

**Frontend** — The `useCarbonFootprint.js` hook uses the browser's native `PerformanceObserver` API to track all network resource transfers in real time. The `CarbonFootprintDisplay` component renders a live floating widget in the bottom-right corner.

**Backend** — `carbonFootprint.middleware.js` intercepts every HTTP request/response, measures total bytes transferred, and estimates CO₂ using the `@tgwf/co2` npm package.

**Formula (Sustainable Web Design model):**

```
CO₂ (g) = Bytes Transferred × 0.0000001822
```

### Measured Results

| Metric | Value | Rating |
|---|---|---|
| CO₂ per session | ~1.25g CO₂eq | 🟡 Good |
| Data transferred | ~6.53 MB | — |
| Target goal | < 1g CO₂eq | 🟢 Excellent |

### Optimization Strategies

<details>
<summary><b>▶ Reach the Excellent rating — click to expand</b></summary>

<br/>

**1. Lazy-load all routes**

```jsx
const HomePage = lazy(() => import("../pages/HomePage"));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    {/* ... */}
  </Routes>
</Suspense>
```

**2. Vite manual chunk splitting**

```js
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["react", "react-dom"],
        router: ["react-router-dom"],
        redux: ["@reduxjs/toolkit", "react-redux"],
        ui: ["framer-motion", "lucide-react"],
      }
    }
  }
}
```

**3. Brotli compression on backend**

```bash
pnpm add shrink-ray-current
```

```js
const shrinkRay = require("shrink-ray-current");
app.use(shrinkRay()); // Replaces compression()
```

**Projected result after all optimizations: ~0.4–0.6g CO₂eq** 🟢

</details>

---

## 🧪 Testing

```bash
# Run all backend tests with coverage report
pnpm --filter backend test

# Watch mode for development
pnpm --filter backend test:watch

# Generate coverage report
pnpm --filter backend test -- --coverage
```

Coverage reports are generated in `backend/coverage/lcov-report/index.html`.

---

## 🐳 Docker

```bash
# Build the backend image
cd backend
docker build -t ticket-bro-backend .

# Run the container
docker run -p 5000:5000 --env-file .env ticket-bro-backend
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please follow the existing code style and ensure all tests pass before submitting.

**Commit conventions:**

| Prefix | Use for |
|---|---|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `refactor:` | Code restructuring |
| `test:` | Adding/updating tests |
| `chore:` | Tooling, deps, config |

---

## 📄 License

Licensed under the **ISC License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

<img src="frontend/public/assets/logos/ticket-bro.svg" alt="Ticket Bro Icon" width="48" />

<br/>

Made with ❤️ by **Ticket Bro Team**

<br/>

⭐ **Star this repo if you found it helpful!**

</div>