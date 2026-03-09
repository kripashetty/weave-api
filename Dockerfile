# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cached unless package.json changes)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema (needed for migrations at startup)
COPY prisma ./prisma

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma client in production image
RUN npx prisma generate

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify
USER fastify

EXPOSE 3001

# Run migrations then start — uses prisma migrate deploy (non-interactive)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
