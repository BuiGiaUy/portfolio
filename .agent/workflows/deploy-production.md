---
description: Deploy portfolio to VPS with HTTPS (giauy.dev)
---

# Production Deployment Workflow for giauy.dev

This workflow guides you through deploying the portfolio to a VPS with full HTTPS support using Let's Encrypt.

## Prerequisites

Before starting, ensure you have:

- [ ] A VPS (Ubuntu 22.04+ recommended)
- [ ] Docker and Docker Compose installed on VPS
- [ ] DNS A record: `giauy.dev` → VPS IP
- [ ] DNS A record: `www.giauy.dev` → VPS IP
- [ ] Ports 80 and 443 open in firewall
- [ ] SSH access to VPS

---

## Step 1: Prepare VPS Environment

SSH into your VPS:

```bash
ssh user@your-vps-ip
```

Install Docker if not already installed:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

---

## Step 2: Clone Repository

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

---

## Step 3: Configure Environment

Copy and edit the production environment file:

```bash
cp .env.production .env
nano .env
```

**IMPORTANT: Update these values:**

- `POSTGRES_PASSWORD` - Strong random password
- `REDIS_PASSWORD` - Strong random password
- `JWT_SECRET` - Random 64-character string
- `REFRESH_TOKEN_SECRET` - Another random 64-character string
- `ADMIN_PASSWORD` - Secure admin password
- `CERTBOT_EMAIL` - Your email for Let's Encrypt notifications

Generate secure passwords:

```bash
openssl rand -base64 32
```

---

## Step 4: Initial Deployment (HTTP Only)

First, deploy with HTTP only to prepare for SSL:

```bash
# Use the initial HTTP-only config
cp nginx/conf.d/default-initial.conf nginx/conf.d/default.conf

# Build and start services
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d postgres redis
docker compose -f docker-compose.prod.yml up -d backend frontend nginx
```

Verify services are running:

```bash
docker compose -f docker-compose.prod.yml ps
curl http://giauy.dev/health
```

---

## Step 5: Obtain SSL Certificate

Run the SSL initialization script:

```bash
chmod +x scripts/ssl-init.sh
./scripts/ssl-init.sh
```

Or manually:

```bash
# Create directories
mkdir -p certbot/www certbot/logs

# Request certificate
docker run --rm \
  -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d giauy.dev \
  -d www.giauy.dev
```

---

## Step 6: Enable HTTPS

Restore the HTTPS-enabled Nginx config:

```bash
# The default.conf should already have HTTPS config
# If not, copy it back
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

Verify HTTPS:

```bash
curl -I https://giauy.dev
```

---

## Step 7: Enable Auto-Renewal

Start the certbot service for automatic renewal:

```bash
docker compose -f docker-compose.prod.yml up -d certbot
```

Test renewal (dry run):

```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew --dry-run
```

---

## Step 8: Final Verification

| Check          | Command                             | Expected     |
| -------------- | ----------------------------------- | ------------ |
| HTTPS works    | `curl -I https://giauy.dev`         | 200 OK       |
| HTTP redirects | `curl -I http://giauy.dev`          | 301 to HTTPS |
| API health     | `curl https://giauy.dev/api/health` | 200 OK       |
| All services   | `docker compose ps`                 | All healthy  |

---

## Post-Deployment

### View Logs

```bash
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services

```bash
docker compose -f docker-compose.prod.yml restart
```

### Update Deployment

```bash
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Manual SSL Renewal

```bash
./scripts/ssl-renew.sh
```

---

## Troubleshooting

### SSL Certificate Issues

```bash
# Check certificate status
docker run --rm -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
  certbot/certbot certificates

# Force renewal
docker run --rm \
  -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot renew --force-renewal
```

### Nginx Config Test

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

### DNS Not Propagated

```bash
dig giauy.dev
nslookup giauy.dev
```

---

## Security Checklist

- [ ] All passwords in `.env` are unique and strong
- [ ] `.env` file has restrictive permissions: `chmod 600 .env`
- [ ] Firewall allows only ports 22, 80, 443
- [ ] SSH password auth disabled (use keys)
- [ ] Regular backups configured
