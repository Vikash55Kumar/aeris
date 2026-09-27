# AERIS Backend Service

> High-Resolution AI Weather Intelligence, Dynamic Hydrological Modeling & Urban Flood Early Warning Platform.

---

## 1. Overview & Architecture

`aeris-backend` is an independent, standalone enterprise backend built with **Node.js, TypeScript, Express, Prisma ORM, and PostgreSQL**. It coordinates multi-sensor meteorological data ingestion, hydrodynamic inundation modeling, intelligent route optimization, and standardized OASIS Common Alerting Protocol (CAP-v1.2) emergency warning dissemination.

```
aeris-backend/
├── prisma/
│   ├── schema.prisma            # PostgreSQL & Prisma data models & enums
│   └── seed.ts                  # Comprehensive database seeding script
├── docker/
│   ├── Dockerfile               # Production multi-stage Docker build
│   └── docker-compose.yml       # Local PostgreSQL + Backend orchestration
├── src/
│   ├── app.ts                   # Express application setup
│   ├── index.ts                 # Server bootstrap & WebSocket router
│   ├── core/                    # Config, Prisma client, Security (JWT/bcrypt), Logger, Errors
│   ├── middlewares/             # JWT Auth, RBAC Guard, Zod Validator, Error Interceptor
│   ├── schemas/                 # Zod validation schemas
│   ├── repositories/            # Prisma data access layer
│   ├── services/                # Business logic (Auth, Events, Weather, Hydro, Journey, Alert)
│   ├── controllers/             # HTTP controller handlers
│   ├── routes/                  # Express REST routes (/api/v1/*)
│   ├── websockets/              # Real-time WebSocket streaming (/ws/radar, /ws/telemetry, /ws/alerts)
│   └── jobs/                    # Periodic ingestion and storm-tracking tickers
└── tests/                       # Automated test suite (Vitest + Supertest)
```

---

## 2. Quick Start Guide

### Prerequisites
- **Node.js**: `v20+` or `v22+`
- **npm** or **bun**
- **PostgreSQL** with PostGIS extension (or Docker)

### Installation
```bash
cd aeris-backend
npm install
```

### Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

### Database Setup & Seeding
```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Push schema to database
npm run prisma:push

# 3. Seed demo data (Mumbai MMR, Admin/Guest users, Event A1027, River Gauges)
npm run seed
```

---

## 3. Running the Service

### Development Mode (with Hot Reloading)
```bash
npm run dev
```

### Running with Docker Compose (PostgreSQL + API)
```bash
cd docker
docker-compose up --build
```

### Running Automated Tests
```bash
npm test
```

---

## 4. Key REST API Endpoints (`/api/v1`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticate administrator with email & password |
| `POST` | `/api/v1/auth/guest` | Public | Instant guest observer authentication |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile and jurisdiction |
| `GET` | `/api/v1/events/overview` | Public | Command center situational metrics & 5-step causal pipeline |
| `GET` | `/api/v1/events/active` | Public | Retrieve active severe convective events (e.g., A1027) |
| `GET` | `/api/v1/weather/overview` | Public | Atmospheric telemetry diagnostics & hyetograph steps |
| `GET` | `/api/v1/weather/deep-dive` | Public | Multi-sensor telemetry inspection data for analysis modals |
| `GET` | `/api/v1/hydrology/overview` | Public | River gauge stages (Mithi River), basin discharge & waterlogging |
| `GET` | `/api/v1/journey/locations` | Public | Directory of Mumbai MMR transit and corridor landmarks |
| `POST` | `/api/v1/journey/plan` | Public | Tri-route corridor plan (*Balanced, Fastest, Weather-Safer*) |
| `POST` | `/api/v1/journey/optimize-departure` | Public | Departure window scoring & convective cell avoidance algorithm |
| `GET` | `/api/v1/alerts` | Public | Active emergency alerts feed |
| `GET` | `/api/v1/alerts/cap.xml` | Public | **OASIS CAP-v1.2 XML** emergency broadcast feed for NDMA/SDMA |
| `GET` | `/api/v1/health` | Public | Service health check and database status |
| `GET` | `/api/v1/health/pipelines` | Public | Real-time status of 6 ingestion data pipelines |

---

## 5. Real-Time WebSocket Feeds (`/ws`)

Connect to `ws://localhost:8000/ws` or specific channels:
- **`/ws/radar`**: 2-second Doppler radar beam sweeps and storm centroid updates.
- **`/ws/telemetry`**: 5-second multi-sensor atmospheric metrics ($CTT$, $dBZ$, lightning, $CAPE$).
- **`/ws/alerts`**: Push channel broadcasting new critical emergency alerts immediately.

---

## 6. Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin (SDMA)** | `sdma.officer@maharashtra.gov.in` | `Aeris@SDMA2026` |
| **Guest Observer** | `guest.observer@aeris.in` | `Guest@AerisPublic2026` (or direct `/api/v1/auth/guest`) |
