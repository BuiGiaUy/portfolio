###################################
# STAGE 1 — BUILDER
###################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
# Fix network  VN
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 20000

RUN npm ci

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build


###################################
# STAGE 2 — RUNNER
###################################
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

# Fix network  VN
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 20000

# install production deps
RUN npm ci --omit=dev

# Install curl for healthcheck
RUN apk add --no-cache curl

EXPOSE 3000

CMD ["node", "dist/main.js"]
