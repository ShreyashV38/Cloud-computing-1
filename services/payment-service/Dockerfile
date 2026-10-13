# Stage 1: Generate Prisma client (needed for TypeScript type imports)
FROM node:20-alpine AS prisma-gen
WORKDIR /prisma-build
COPY db/package*.json ./
RUN npm install
COPY db/prisma/ ./prisma/
COPY db/prisma.config.ts ./
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Stage 2: Build the service
FROM node:20-alpine
WORKDIR /app/services/payment-service

# Install dependencies
COPY services/payment-service/package*.json ./
RUN npm install

# Copy source code
COPY services/payment-service/src/ ./src/
COPY services/payment-service/tsconfig.json ./

# Copy generated Prisma client to the expected relative path
COPY --from=prisma-gen /prisma-build/generated/ /app/db/generated/

EXPOSE 4005

CMD ["npx", "tsx", "src/index.ts"]
