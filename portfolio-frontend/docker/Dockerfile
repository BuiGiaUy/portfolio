###############################
# STAGE 1 — BUILDER
###############################
FROM node:20-slim AS builder

WORKDIR /app

ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Build Next.js (tạo .next/standalone + .next/static)
RUN npm run build


###############################
# STAGE 2 — RUNNER
###############################
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy 
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3001

CMD ["node", "server.js"]
