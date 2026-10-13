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
WORKDIR /app/services/user-service

# Install dependencies
COPY services/user-service/package*.json ./
RUN npm install

# Copy source code
COPY services/user-service/src/ ./src/
COPY services/user-service/tsconfig.json ./

# Copy generated Prisma client to the expected relative path
COPY --from=prisma-gen /prisma-build/generated/ /app/db/generated/

EXPOSE 4008

CMD ["npx", "tsx", "src/index.ts"]
