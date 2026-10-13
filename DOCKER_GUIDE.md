# 🐳 Docker Containerization Guide — MinimalStore

A step-by-step guide to containerize the MinimalStore microservices e-commerce application using **Docker** and **Docker Compose**.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Architecture Overview](#-architecture-overview)
3. [New Files Created](#-new-files-created)
4. [Understanding docker-compose.yml](#-understanding-docker-composeyml)
5. [Step-by-Step: Build & Run](#-step-by-step-build--run)
6. [Seed the Database](#-seed-the-database)
7. [Verify Everything Works](#-verify-everything-works)
8. [Docker Compose Concepts Explained](#-docker-compose-concepts-explained)
9. [Useful Commands](#-useful-commands)
10. [Troubleshooting](#-troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have the following installed:

| Tool              | Version   | Download Link                                      |
| ----------------- | --------- | -------------------------------------------------- |
| **Docker Desktop** | ≥ 24.x   | [docker.com/get-docker](https://www.docker.com/products/docker-desktop/) |
| **Docker Compose** | ≥ 2.x    | (Included with Docker Desktop)                     |

To verify your installation:

```bash
docker --version
docker compose version
```

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Docker Compose Orchestration                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────── frontend-net ───────────────────┐            │
│   │                                                     │            │
│   │   ┌───────────┐          ┌───────────┐             │            │
│   │   │  client   │ ───────→ │  gateway  │             │            │
│   │   │  :3000    │          │  :4000    │             │            │
│   │   └───────────┘          └─────┬─────┘             │            │
│   │                                │                    │            │
│   └────────────────────────────────┼────────────────────┘            │
│                                    │                                 │
│   ┌──────────────── backend-net ───┼───────────────────────────┐    │
│   │                                │                            │    │
│   │      ┌─────────────────────────┼──────────────────────┐    │    │
│   │      │                         │                       │    │    │
│   │      ▼              ▼          ▼         ▼             ▼    │    │
│   │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ ┌────────┐│    │
│   │  │product │  │search  │  │ cart   │  │ order  │ │payment ││    │
│   │  │ :4001  │  │ :4002  │  │ :4003  │  │ :4004  │ │ :4005  ││    │
│   │  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘ └───┬────┘│    │
│   │      │           │           │            │          │     │    │
│   │  ┌────────┐  ┌────────┐                                   │    │
│   │  │review  │  │ user   │                                   │    │
│   │  │ :4006  │  │ :4008  │                                   │    │
│   │  └───┬────┘  └───┬────┘                                   │    │
│   │      │           │                                         │    │
│   │      └─────┬─────┘                                         │    │
│   │            ▼                                                │    │
│   │      ┌──────────┐         ┌──────────────┐                 │    │
│   │      │db-service│ ──────→ │  postgres    │                 │    │
│   │      │  :4010   │         │  :5432       │                 │    │
│   │      └──────────┘         │ [volume:     │                 │    │
│   │                           │ postgres-data]│                 │    │
│   │                           └──────────────┘                 │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

- **2 Networks** isolate frontend from backend traffic
- The **gateway** bridges both networks (it's the only service on both)
- PostgreSQL data is stored on a **named volume** for persistence
- Each microservice connects to the **db-service** (not directly to PostgreSQL)

---

## 📁 New Files Created

```
ecom-site/
├── .dockerignore               ← Files/dirs to exclude from Docker builds
├── .env.docker                 ← Docker-specific environment variables
├── docker-compose.yml          ← Orchestration file (services, networks, volumes)
├── client/
│   └── Dockerfile              ← Next.js frontend container
├── db/
│   └── Dockerfile              ← DB service (Prisma + Express) container
├── gateway/
│   └── Dockerfile              ← API Gateway container
└── services/
    ├── cart-service/Dockerfile
    ├── order-service/Dockerfile
    ├── payment-service/Dockerfile
    ├── product-service/Dockerfile
    ├── review-service/Dockerfile
    ├── search-service/Dockerfile
    └── user-service/Dockerfile
```

---

## 📖 Understanding docker-compose.yml

### Services (11 total)

| # | Service            | Image / Build          | Port  | Network(s)                 | Description                        |
|---|--------------------|------------------------|-------|----------------------------|------------------------------------|
| 1 | `postgres`         | `postgres:16-alpine`   | 5432  | `backend-net`              | PostgreSQL database                |
| 2 | `db-service`       | `./db/Dockerfile`      | 4010  | `backend-net`              | Prisma ORM gateway to PostgreSQL   |
| 3 | `product-service`  | `./services/product-service/Dockerfile` | 4001 | `backend-net` | Product catalog CRUD         |
| 4 | `search-service`   | `./services/search-service/Dockerfile`  | 4002 | `backend-net` | Full-text product search     |
| 5 | `cart-service`     | `./services/cart-service/Dockerfile`    | 4003 | `backend-net` | Session-based cart           |
| 6 | `order-service`    | `./services/order-service/Dockerfile`   | 4004 | `backend-net` | Order placement & tracking   |
| 7 | `payment-service`  | `./services/payment-service/Dockerfile` | 4005 | `backend-net` | Payment processing           |
| 8 | `review-service`   | `./services/review-service/Dockerfile`  | 4006 | `backend-net` | Product reviews & ratings    |
| 9 | `user-service`     | `./services/user-service/Dockerfile`    | 4008 | `backend-net` | User profiles & addresses    |
| 10| `gateway`          | `./gateway/Dockerfile` | 4000  | `backend-net`, `frontend-net` | API reverse proxy gateway  |
| 11| `client`           | `./client/Dockerfile`  | 3000  | `frontend-net`             | Next.js frontend (SSR)             |

### Networks (2)

| Network         | Driver   | Purpose                                          |
|-----------------|----------|--------------------------------------------------|
| `frontend-net`  | `bridge` | Connects **client** ↔ **gateway** only           |
| `backend-net`   | `bridge` | Connects **gateway** ↔ all **microservices** ↔ **db-service** ↔ **postgres** |

> **Why 2 networks?** Network segmentation follows the principle of **least privilege**. The frontend container can only reach the gateway — it cannot directly access any microservice or the database. This mirrors real cloud deployments where public-facing services are in a DMZ and backend services are in a private subnet.

### Volumes (1)

| Volume           | Driver  | Mount Path                      | Purpose                              |
|------------------|---------|---------------------------------|--------------------------------------|
| `postgres-data`  | `local` | `/var/lib/postgresql/data`       | Persists PostgreSQL data across container restarts and rebuilds |

> **Why volumes?** Without a volume, PostgreSQL data lives inside the container's writable layer and is **lost** when the container is removed. A named volume ensures data survives `docker compose down` and `docker compose up --build`.

---

## 🚀 Step-by-Step: Build & Run

### Step 1: Open a Terminal

Open PowerShell or Command Prompt and navigate to the project root:

```powershell
cd C:\Users\shrey\OneDrive\Desktop\CloudComputing\ecom-site
```

### Step 2: Build All Containers

Build all 11 service images:

```bash
docker compose build
```

This will:
- Pull the `node:20-alpine` and `postgres:16-alpine` base images
- Install npm dependencies for each service
- Generate Prisma client in each microservice container
- Create tagged Docker images for each service

> **Note:** The first build may take 5–10 minutes. Subsequent builds use Docker's layer cache and are much faster.

### Step 3: Start All Containers

Launch all services in detached mode:

```bash
docker compose up -d
```

Expected output:
```
[+] Running 11/11
 ✔ Container postgres          Started
 ✔ Container db-service        Started
 ✔ Container product-service   Started
 ✔ Container search-service    Started
 ✔ Container cart-service      Started
 ✔ Container order-service     Started
 ✔ Container payment-service   Started
 ✔ Container review-service    Started
 ✔ Container user-service      Started
 ✔ Container gateway           Started
 ✔ Container client            Started
```

### Step 4: Verify Containers are Running

```bash
docker compose ps
```

You should see all 11 containers with status `Up`:

```
NAME               STATUS          PORTS
postgres           Up (healthy)    0.0.0.0:5432→5432/tcp
db-service         Up              0.0.0.0:4010→4010/tcp
product-service    Up              0.0.0.0:4001→4001/tcp
search-service     Up              0.0.0.0:4002→4002/tcp
cart-service       Up              0.0.0.0:4003→4003/tcp
order-service      Up              0.0.0.0:4004→4004/tcp
payment-service    Up              0.0.0.0:4005→4005/tcp
review-service     Up              0.0.0.0:4006→4006/tcp
user-service       Up              0.0.0.0:4008→4008/tcp
gateway            Up              0.0.0.0:4000→4000/tcp
client             Up              0.0.0.0:3000→3000/tcp
```

---

## 🌱 Seed the Database

After the first launch, the PostgreSQL database is empty. Seed it with sample products:

### Step 1: Push the Prisma Schema

```bash
docker compose exec db-service npx prisma db push
```

This creates all tables (User, Product, Category, Cart, Order, Payment, Review, Address).

### Step 2: Run the Seed Script

```bash
docker compose exec db-service npx tsx prisma/seed.ts
```

This populates the database with:
- 3 categories (Audio, Smart Devices, Peripherals)
- 10 sample products with images
- 1 demo user with an address
- Sample reviews and orders

---

## ✅ Verify Everything Works

### 1. Open the Application

Open your browser and visit: **http://localhost:3000**

You should see the MinimalStore homepage with product categories.

### 2. Check the Gateway Health

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "Gateway is running",
  "services": {
    "product-service": "http://product-service:4001",
    "search-service": "http://search-service:4002",
    ...
  }
}
```

### 3. Verify Networks

```bash
docker network ls
```

You should see `frontend-net` and `backend-net` listed.

### 4. Verify Volumes

```bash
docker volume ls
```

You should see `postgres-data` listed.

### 5. Test Data Persistence

```bash
# Stop all containers
docker compose down

# Start again
docker compose up -d

# Data should still be there — the volume persists!
```

---

## 🧠 Docker Compose Concepts Explained

### 1. Services

A **service** is a container definition in Docker Compose. Each service specifies:
- **Build context** — where the Dockerfile lives
- **Ports** — mapping host ports to container ports (`host:container`)
- **Environment** — env vars injected at runtime
- **depends_on** — startup ordering (e.g., db-service waits for postgres to be healthy)
- **Networks** — which networks the container joins

```yaml
product-service:
  build:
    context: .                                    # Build context = project root
    dockerfile: services/product-service/Dockerfile  # Path to Dockerfile
  ports:
    - "4001:4001"                                 # Expose port 4001
  environment:
    DB_SERVICE_URL: http://db-service:4010        # Docker DNS resolution
  depends_on:
    - db-service                                  # Start after db-service
  networks:
    - backend-net                                 # Join backend network
```

### 2. Networks

**Docker networks** provide isolated communication channels between containers.

```yaml
networks:
  frontend-net:
    driver: bridge    # Default Docker network driver
  backend-net:
    driver: bridge
```

- Containers on the same network can reach each other **by service name** (Docker's built-in DNS)
- Example: `gateway` can reach `product-service` at `http://product-service:4001`
- Containers on different networks **cannot** communicate (network isolation)
- The `gateway` is on **both** networks, acting as a bridge between frontend and backend

### 3. Volumes

**Docker volumes** provide persistent storage that survives container lifecycle events.

```yaml
volumes:
  postgres-data:
    driver: local     # Stored on the host filesystem
```

- Without a volume, data inside a container is **ephemeral** (lost on `docker compose down`)
- Our `postgres-data` volume is mounted at `/var/lib/postgresql/data` inside the PostgreSQL container
- Even after `docker compose down` and `docker compose up`, the database retains its data
- To **completely reset** data: `docker volume rm postgres-data`

---

## 🛠 Useful Commands

### Container Management

```bash
# Build and start everything
docker compose up --build -d

# View logs for all services
docker compose logs

# View logs for a specific service
docker compose logs gateway
docker compose logs -f client   # -f = follow (live tail)

# Stop all containers (preserves volumes)
docker compose down

# Stop and remove volumes (DELETES database data!)
docker compose down -v

# Restart a single service
docker compose restart gateway

# Rebuild a single service
docker compose up -d --build product-service
```

### Inspect & Debug

```bash
# List all running containers
docker compose ps

# Open a shell inside a container
docker compose exec db-service sh
docker compose exec gateway sh

# Check container resource usage
docker stats

# Inspect a specific network
docker network inspect frontend-net
docker network inspect backend-net

# List all volumes
docker volume ls

# Inspect the postgres volume
docker volume inspect postgres-data
```

### Database Commands

```bash
# Push schema to database
docker compose exec db-service npx prisma db push

# Seed the database
docker compose exec db-service npx tsx prisma/seed.ts

# Open Prisma Studio (database GUI)
docker compose exec db-service npx prisma studio

# Reset database (WARNING: deletes all data)
docker compose exec db-service npx prisma db push --force-reset
docker compose exec db-service npx tsx prisma/seed.ts
```

---

## ❓ Troubleshooting

### Container exits immediately

Check the logs:
```bash
docker compose logs <service-name>
```

Common causes:
- Missing environment variables
- Port already in use on the host

### Cannot connect to database

Ensure PostgreSQL is healthy:
```bash
docker compose ps postgres
```

If it shows `starting` instead of `healthy`, wait a few seconds and try again. The `healthcheck` ensures dependent services wait.

### Port already in use

If you see `port is already allocated`, stop any locally running services:
```powershell
# Find what's using port 5432 (for example)
netstat -ano | findstr :5432

# Kill the process
taskkill /PID <PID> /F
```

Or change the host port in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"   # Map to host port 5433 instead
```

### Rebuild from scratch

If things are broken, do a clean rebuild:
```bash
docker compose down -v          # Stop and remove volumes
docker compose build --no-cache  # Rebuild without cache
docker compose up -d             # Start fresh
```

Then re-seed the database (see [Seed the Database](#-seed-the-database)).

---

## 📝 Summary

| Concept         | Implementation                                                      |
|-----------------|---------------------------------------------------------------------|
| **Services**    | 11 services: PostgreSQL, DB Service, 7 Microservices, Gateway, Client |
| **Networks**    | `frontend-net` (client ↔ gateway), `backend-net` (gateway ↔ services ↔ DB) |
| **Volumes**     | `postgres-data` — persists PostgreSQL data across container restarts  |
| **Dockerfiles** | 10 custom Dockerfiles (1 per component) + 1 official PostgreSQL image |
| **Multi-stage** | Microservice Dockerfiles use multi-stage builds to generate Prisma types |
