# Docker Deployment Guide

## Overview

This docker-compose setup provides a complete production-ready environment with:

- **Frontend**: React/Vite application
- **Backend**: NestJS API
- **PostgreSQL**: Database
- **Redis**: Cache and session storage
- **Nginx**: Reverse proxy with rate limiting

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Initial Database Setup

```bash
# Run database migrations
docker-compose exec backend npm run prisma:migrate

# Seed database (optional)
docker-compose exec backend npm run prisma:seed
```

## Service Details

### Frontend

- **Port**: 3001 (internal), accessible via Nginx on port 80
- **Health Check**: HTTP GET request every 30s
- **Build Context**: `./portfolio-frontend`

### Backend

- **Port**: 3000 (internal), accessible via Nginx at `/api`
- **Health Check**: `/health` endpoint every 30s
- **Dependencies**: Waits for PostgreSQL and Redis to be healthy
- **Build Context**: `./portfolio-backend`

### PostgreSQL

- **Port**: 5432
- **Health Check**: `pg_isready` command every 10s
- **Volume**: `postgres_data` for data persistence

### Redis

- **Port**: 6379
- **Health Check**: Ping command every 10s
- **Volume**: `redis_data` for persistence
- **Memory Limit**: 256MB with LRU eviction policy

### Nginx

- **Ports**: 80 (HTTP), 443 (HTTPS - when SSL configured)
- **Features**:
  - Reverse proxy to backend and frontend
  - Rate limiting (10 req/s for API, 30 req/s for general)
  - Gzip compression
  - Static asset caching
  - WebSocket support

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Execute Commands in Containers

```bash
# Backend shell
docker-compose exec backend sh

# PostgreSQL CLI
docker-compose exec postgres psql -U portfolio -d portfolio_db

# Redis CLI
docker-compose exec redis redis-cli -a redis_secret
```

## Volumes

Persistent data is stored in named volumes:

- `portfolio-postgres-data`: Database files
- `portfolio-redis-data`: Redis persistence
- `portfolio-backend-logs`: Application logs
- `portfolio-frontend-dist`: Frontend build artifacts
- `portfolio-nginx-logs`: Nginx access and error logs

### Backup Database

```bash
# Backup
docker-compose exec postgres pg_dump -U portfolio portfolio_db > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U portfolio portfolio_db
```

## Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready` - 10s interval, 5 retries
- **Redis**: `redis-cli ping` - 10s interval, 5 retries
- **Backend**: HTTP `/health` - 30s interval, 3 retries
- **Frontend**: HTTP root - 30s interval, 3 retries
- **Nginx**: HTTP `/health` - 30s interval, 3 retries

## Dependency Management

Services start in order:

1. PostgreSQL + Redis (parallel)
2. Backend (waits for DB and Redis to be healthy)
3. Frontend (waits for Backend to be healthy)
4. Nginx (waits for Frontend and Backend to be healthy)

## Networking

All services communicate via the `portfolio-network` bridge network:

- Internal DNS resolution by service name
- Isolated from host network by default
- Exposed ports defined in docker-compose.yml

## Security Best Practices

### Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in Nginx with valid SSL certificates
- [ ] Restrict PostgreSQL and Redis ports (remove port exposure)
- [ ] Configure firewall rules
- [ ] Enable Docker secrets for sensitive data
- [ ] Regular security updates: `docker-compose pull`

### Environment Variables

Never commit `.env` file. Always use `.env.example` as template.

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Check health status
docker-compose ps
```

### Database Connection Errors

```bash
# Verify PostgreSQL is running
docker-compose exec postgres pg_isready

# Check DATABASE_URL format
echo $DATABASE_URL
```

### Redis Connection Errors

```bash
# Test Redis connection
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

### Port Conflicts

If ports are already in use, modify in `.env`:

```env
POSTGRES_PORT=5433
REDIS_PORT=6380
NGINX_HTTP_PORT=8080
```

## Monitoring

### Resource Usage

```bash
# Container stats
docker stats

# Specific service
docker stats portfolio-backend
```

### Database Monitoring

```bash
# Active connections
docker-compose exec postgres psql -U portfolio -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
docker-compose exec postgres psql -U portfolio -c "\l+"
```

## Development vs Production

### Development

```bash
# Use development environment
NODE_ENV=development docker-compose up

# Enable hot reload by mounting source
# (Already configured in docker-compose.yml)
```

### Production

```bash
# Build optimized images
NODE_ENV=production docker-compose build --no-cache

# Start with resource limits
docker-compose up -d
```

## Scaling

Scale horizontally:

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Note: Requires load balancer configuration in Nginx
```

## Maintenance

### Update Images

```bash
# Pull latest base images
docker-compose pull

# Rebuild services
docker-compose build --no-cache

# Restart with new images
docker-compose up -d
```

### Clean Up

```bash
# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

## Support

For issues or questions, refer to:

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
