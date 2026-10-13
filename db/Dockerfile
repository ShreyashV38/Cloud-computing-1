# ─── DB Service (Prisma Gateway) Dockerfile ──────────────
FROM node:20-alpine

WORKDIR /app/db

# Install dependencies (deterministic)
COPY db/package*.json ./
RUN npm install

# Copy Prisma schema and config
COPY db/prisma/ ./prisma/
COPY db/prisma.config.ts ./

# Generate Prisma client
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy source code
COPY db/src/ ./src/

EXPOSE 4010

CMD ["npx", "tsx", "src/index.ts"]
