# Deployment Guide

## Overview

This guide covers the setup and deployment process for the Portfolio application using GitHub Actions CI/CD pipeline.

## Prerequisites

### Local Development

- Node.js 20+
- Docker & Docker Compose
- Git

### Production Server (VPS)

- Ubuntu/Debian Linux server
- Docker & Docker Compose installed
- SSH access configured
- Ports 80, 443, 3000, 3001, 5432, 6379 available

---

## GitHub Secrets Configuration

Before the CI/CD pipeline can run, configure these secrets in your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name          | Description               | How to Get                                                                                                     |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username  | Your Docker Hub account username                                                                               |
| `DOCKERHUB_TOKEN`    | Docker Hub access token   | Create at [Docker Hub → Account Settings → Security → Access Tokens](https://hub.docker.com/settings/security) |
| `SERVER_HOST`        | VPS server IP or hostname | Your VPS provider dashboard (e.g., `123.45.67.89` or `myserver.com`)                                           |
| `SERVER_USER`        | SSH username for VPS      | Usually `root`, `ubuntu`, or custom user                                                                       |
| `SERVER_SSH_KEY`     | Private SSH key           | Generate with `ssh-keygen -t ed25519 -C "github-actions"` (see below)                                          |

### Generating SSH Key for GitHub Actions

On your **local machine**:

```bash
# Generate new SSH key pair
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub USER@SERVER_HOST

# Display private key (copy this to GitHub secret)
cat ~/.ssh/github_actions_deploy
```

**Important:** Copy the entire private key including the header and footer:

```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

## Server Setup

### 1. Install Docker & Docker Compose

```bash
# SSH into your server
ssh USER@SERVER_HOST

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (optional)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Create Project Directory

```bash
# Create directory structure
mkdir -p ~/portfolio/nginx/conf.d

# Navigate to project directory
cd ~/portfolio
```

### 3. Create Environment File

Create `~/portfolio/.env` with your production values:

```bash
nano ~/portfolio/.env
```

**Example `.env` file:**

```env
# Node Environment
NODE_ENV=production

# Backend Configuration
BACKEND_PORT=3000

# Frontend Configuration
FRONTEND_PORT=3001

# PostgreSQL Configuration
POSTGRES_USER=portfolio_prod
POSTGRES_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
POSTGRES_DB=portfolio_db
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD
REDIS_PORT=6379
REDIS_TTL=3600

# JWT Configuration
JWT_SECRET=CHANGE_THIS_TO_A_VERY_LONG_RANDOM_STRING
JWT_EXPIRATION=1d

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://YOUR_DOMAIN_OR_IP

# Nginx Configuration
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

**Security Note:** Replace all `CHANGE_THIS_*` values with secure random strings.

Generate secure secrets:

```bash
# Generate random secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For passwords
```

### 4. Configure Firewall (Optional but Recommended)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

---

## Deployment Process

### Automatic Deployment (Recommended)

The CI/CD pipeline automatically deploys when you push to the `main` branch:

```bash
# On your local machine
git add .
git commit -m "Your commit message"
git push origin main
```

**GitHub Actions will:**

1. ✅ Run backend tests
2. ✅ Lint frontend code
3. ✅ TypeCheck frontend code
4. ✅ Build Docker images
5. ✅ Push images to Docker Hub
6. ✅ Deploy to production server

Monitor the deployment at: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

### Manual Deployment (Fallback)

If you need to deploy manually:

```bash
# SSH into server
ssh USER@SERVER_HOST

# Navigate to project directory
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

---

## Post-Deployment Verification

### 1. Check Container Health

```bash
# SSH into server
ssh USER@SERVER_HOST

# Check all containers are running and healthy
docker compose ps

# Expected output: All services should show "Up" and "healthy"
```

### 2. Test Health Endpoints

```bash
# Test nginx health endpoint
curl http://YOUR_SERVER_IP/health

# Test backend health endpoint
curl http://YOUR_SERVER_IP:3000/health

# Test frontend health endpoint
curl http://YOUR_SERVER_IP:3001/health
```

**Expected responses:**

- Nginx: `OK`
- Backend: `{"status":"ok","timestamp":"...","service":"NestJS Clean Architecture"}`
- Frontend: `OK`

### 3. Access Application

Open in browser:

- **Frontend:** `http://YOUR_SERVER_IP`
- **Backend API:** `http://YOUR_SERVER_IP/api`

---

## Troubleshooting

### Container Fails to Start

```bash
# View logs
docker compose logs [service-name]

# Common services: postgres, redis, backend, frontend, nginx
docker compose logs backend
docker compose logs frontend
```

### Health Checks Failing

```bash
# Check health check status
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
# SSH into server
ssh USER@SERVER_HOST
cd ~/portfolio

# Stop all services
docker compose down

# Remove all containers and volumes (CAUTION: data loss)
docker compose down -v

# Pull latest images and restart
docker compose pull
docker compose up -d
```

### View Real-time Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

---

## Monitoring

### Check Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker resources
docker system prune -a --volumes
```

### Monitor Resource Usage

```bash
# View running containers and resource usage
docker stats

# View system resources
htop  # or top
```

---

## Rollback

If a deployment fails, rollback to the previous version:

```bash
# SSH into server
ssh USER@SERVER_HOST
cd ~/portfolio

# Pull specific version by commit SHA
docker pull YOUR_DOCKERHUB_USERNAME/portfolio-backend:PREVIOUS_COMMIT_SHA
docker pull YOUR_DOCKERHUB_USERNAME/portfolio-frontend:PREVIOUS_COMMIT_SHA

# Update docker-compose.yml to use specific tags
# Then restart
docker compose up -d
```

---

## Security Best Practices

1. **Always use environment variables** for sensitive data
2. **Never commit `.env` files** to Git
3. **Use strong passwords** for database and Redis
4. **Update regularly:** `sudo apt update && sudo apt upgrade`
5. **Enable firewall:** Only allow necessary ports
6. **Use HTTPS in production** (configure SSL certificates)
7. **Rotate secrets regularly** (JWT_SECRET, passwords)
8. **Monitor logs** for suspicious activity

---

## SSL/HTTPS Setup (Optional)

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

Update `nginx/conf.d/default.conf` to add SSL configuration.

---

## Support

For issues or questions:

- Check GitHub Actions logs
- View Docker container logs
- Review this documentation

**Common Commands Quick Reference:**

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
