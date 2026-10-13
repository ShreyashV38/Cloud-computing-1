# ─── API Gateway Dockerfile ──────────────────────────────
FROM node:20-alpine

WORKDIR /app/gateway

# Install dependencies
COPY gateway/package*.json ./
RUN npm install

# Copy source code
COPY gateway/src/ ./src/
COPY gateway/tsconfig.json ./

EXPOSE 4000

CMD ["npx", "tsx", "src/index.ts"]
