# Deployment Guide

## Overview

This guide covers production deployment using Docker Compose and GitHub Actions CI/CD pipeline.

## Prerequisites

### Local Development

- Node.js ≥ 18
- Docker & Docker Compose
- Git

### Production Server (VPS)

- Ubuntu/Debian Linux
- Docker & Docker Compose installed
- SSH access configured
- Ports 80, 443, 3000, 3001, 5432, 6379 available

## GitHub Secrets Configuration

Configure these secrets in **Settings → Secrets and variables → Actions**:

| Secret Name          | Description             | How to Get                                                      |
| -------------------- | ----------------------- | --------------------------------------------------------------- |
| `DOCKERHUB_USERNAME` | Docker Hub username     | Your Docker Hub account                                         |
| `DOCKERHUB_TOKEN`    | Docker Hub access token | [Docker Hub Settings](https://hub.docker.com/settings/security) |
| `SERVER_HOST`        | VPS IP or hostname      | e.g., `123.45.67.89`                                            |
| `SERVER_USER`        | SSH username            | e.g., `root` or `ubuntu`                                        |
| `SERVER_SSH_KEY`     | Private SSH key         | Generate with `ssh-keygen` (see below)                          |

### Generating SSH Key

```bash
# Generate key pair
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub USER@SERVER_HOST

# Display private key (copy to GitHub secret)
cat ~/.ssh/github_actions_deploy
```

## Server Setup

### 1. Install Docker

```bash
ssh USER@SERVER_HOST

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### 2. Create Project Directory

```bash
mkdir -p ~/portfolio
cd ~/portfolio
```

### 3. Create Environment File

Create `~/portfolio/.env`:

```bash
nano ~/portfolio/.env
```

**Example `.env`:**

```env
# Node Environment
NODE_ENV=production

# Backend
BACKEND_PORT=3000

# Frontend
FRONTEND_PORT=3001

# PostgreSQL
POSTGRES_USER=portfolio_prod
POSTGRES_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
POSTGRES_DB=portfolio_db
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD
REDIS_PORT=6379
REDIS_TTL=3600

# JWT
JWT_SECRET=CHANGE_THIS_TO_A_VERY_LONG_RANDOM_STRING
JWT_EXPIRATION=1d
REFRESH_TOKEN_SECRET=CHANGE_THIS_REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://YOUR_DOMAIN_OR_IP

# Nginx
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

**Generate secure secrets:**

```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For passwords
```

### 4. Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Deployment Process

### Automatic Deployment (Recommended)

Push to `main` branch triggers CI/CD:

```bash
git add .
git commit -m "Your message"
git push origin main
```

**GitHub Actions will:**

1. ✅ Run backend tests
2. ✅ Lint frontend code
3. ✅ Build Docker images
4. ✅ Push to Docker Hub
5. ✅ Deploy to production server

Monitor at: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

### Manual Deployment

```bash
ssh USER@SERVER_HOST
cd ~/portfolio

# Pull latest images
docker compose pull

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Post-Deployment Verification

### 1. Check Container Health

```bash
docker compose ps
# Expected: All services "Up" and "healthy"
```

### 2. Test Health Endpoints

```bash
curl http://YOUR_SERVER_IP/health              # Nginx
curl http://YOUR_SERVER_IP:3000/health         # Backend
curl http://YOUR_SERVER_IP:3001/health         # Frontend
```

### 3. Access Application

- **Frontend:** `http://YOUR_SERVER_IP`
- **Backend API:** `http://YOUR_SERVER_IP/api`

## Troubleshooting

### Container Fails to Start

```bash
# View logs
docker compose logs [service-name]

# Examples
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

### Health Checks Failing

```bash
# Check health status
docker inspect portfolio-frontend --format='{{.State.Health.Status}}'

# View health check logs
docker inspect portfolio-frontend --format='{{json .State.Health}}' | jq
```

### Database Issues

```bash
# View Postgres logs
docker compose logs postgres

# Connect to database
docker exec -it portfolio-postgres psql -U portfolio_prod -d portfolio_db

# Run migrations manually
docker exec -it portfolio-backend npm run prisma:migrate
```

### Rebuild and Redeploy

```bash
ssh USER@SERVER_HOST
cd ~/portfolio

# Stop services
docker compose down

# Remove containers and volumes (CAUTION: data loss)
docker compose down -v

# Pull and restart
docker compose pull
docker compose up -d
```

### View Real-time Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f nginx
```

## Monitoring

### Check Disk Space

```bash
df -h

# Clean up Docker resources
docker system prune -a --volumes
```

### Monitor Resource Usage

```bash
# Container stats
docker stats

# System resources
htop  # or top
```

## Rollback

```bash
ssh USER@SERVER_HOST
cd ~/portfolio

# Pull specific version
docker pull YOUR_DOCKERHUB_USERNAME/portfolio-backend:PREVIOUS_COMMIT_SHA
docker pull YOUR_DOCKERHUB_USERNAME/portfolio-frontend:PREVIOUS_COMMIT_SHA

# Update docker-compose.yml to use specific tags
# Then restart
docker compose up -d
```

## Security Best Practices

1. ✅ Use environment variables for sensitive data
2. ✅ Never commit `.env` files to Git
3. ✅ Use strong passwords (database, Redis)
4. ✅ Update regularly: `sudo apt update && sudo apt upgrade`
5. ✅ Enable firewall (only necessary ports)
6. ✅ Use HTTPS in production (SSL certificates)
7. ✅ Rotate secrets regularly (JWT, passwords)
8. ✅ Monitor logs for suspicious activity

## SSL/HTTPS Setup (Optional)

### Using Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

Update `nginx/conf.d/default.conf` for SSL configuration.

## Quick Reference

```bash
# View all containers
docker compose ps

# View logs
docker compose logs -f [service-name]

# Restart service
docker compose restart [service-name]

# Stop all services
docker compose down

# Start all services
docker compose up -d

# Pull latest images
docker compose pull

# Clean up
docker system prune -a
```

## Support

For issues:

- Check GitHub Actions logs
- View Docker container logs
- Review documentation
- Check Sentry for runtime errors

---

**For CI/CD pipeline configuration, see `.github/workflows/deploy.yml`**
