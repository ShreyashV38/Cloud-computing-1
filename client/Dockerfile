# ─── Next.js Frontend Client Dockerfile ──────────────────
FROM node:20-alpine

WORKDIR /app/client

# Install dependencies
COPY client/package*.json ./
RUN npm install

# Copy app source
COPY client/app/ ./app/
COPY client/next.config.ts ./
COPY client/tsconfig.json ./
COPY client/eslint.config.mjs ./
COPY client/postcss.config.mjs ./

EXPOSE 3000

CMD ["npx", "next", "dev", "--hostname", "0.0.0.0"]
