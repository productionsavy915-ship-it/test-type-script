# ─────────────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Copy only lockfiles first for better layer caching
COPY package.json bun.lockb* bun.lock* ./

RUN if [ -f bun.lockb ] || [ -f bun.lock ]; then \
      bun install --ci --frozen-lockfile --production; \
    else \
      bun install --ci --production; \
    fi

# ─────────────────────────────────────────────────────
# Stage 2: Production runner
# ─────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Cloud Run injects PORT automatically (default: 8080).
# For local Docker run: docker run -e PORT=3000 -p 3000:3000 ...

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

USER bun

# EXPOSE is documentation only; actual port is controlled by PORT env var
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
