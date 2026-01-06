#!/bin/bash

# ===========================================
# SSL Certificate Initialization Script
# ===========================================
# Run this script ONCE on your VPS to obtain
# the initial Let's Encrypt SSL certificates
#
# Prerequisites:
# 1. DNS A record pointing giauy.dev to your VPS IP
# 2. Domain propagated (check with: dig giauy.dev)
# 3. Ports 80 and 443 open on firewall
# ===========================================

set -e

DOMAIN="giauy.dev"
EMAIL="${CERTBOT_EMAIL:-admin@giauy.dev}"
STAGING="${1:-}"  # Pass "staging" as arg for testing

echo "🔐 SSL Certificate Initialization for $DOMAIN"
echo "================================================"

# Create required directories
echo "📁 Creating directories..."
mkdir -p ./nginx/ssl
mkdir -p ./certbot/www
mkdir -p ./certbot/logs

# Check if certificates already exist
if [ -d "./nginx/ssl/live/$DOMAIN" ]; then
    echo "⚠️  Certificates already exist for $DOMAIN"
    read -p "Do you want to force renewal? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Exiting without changes."
        exit 0
    fi
fi

# Step 1: Use initial config (HTTP only)
echo ""
echo "📝 Step 1: Setting up HTTP-only config for certificate request..."
cp ./nginx/conf.d/default-initial.conf ./nginx/conf.d/default.conf.bak
cp ./nginx/conf.d/default-initial.conf ./nginx/conf.d/default.conf

# Step 2: Start/restart Nginx with HTTP config
echo ""
echo "🔄 Step 2: Starting Nginx with HTTP configuration..."
docker compose -f docker-compose.prod.yml up -d nginx

# Wait for Nginx to be ready
echo "⏳ Waiting for Nginx to be ready..."
sleep 5

# Step 3: Test ACME challenge path
echo ""
echo "🧪 Step 3: Testing ACME challenge path..."
mkdir -p ./certbot/www/.well-known/acme-challenge
echo "test" > ./certbot/www/.well-known/acme-challenge/test
if curl -s "http://$DOMAIN/.well-known/acme-challenge/test" | grep -q "test"; then
    echo "✅ ACME challenge path is accessible"
    rm ./certbot/www/.well-known/acme-challenge/test
else
    echo "❌ ACME challenge path is NOT accessible!"
    echo "   Please check:"
    echo "   - DNS is pointing to this server"
    echo "   - Port 80 is open"
    echo "   - Nginx is running"
    exit 1
fi

# Step 4: Request certificate
echo ""
echo "🔒 Step 4: Requesting SSL certificate from Let's Encrypt..."

STAGING_FLAG=""
if [ "$STAGING" = "staging" ]; then
    echo "⚠️  Using STAGING environment (for testing)"
    STAGING_FLAG="--staging"
fi

docker run --rm \
    -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    -v "$(pwd)/certbot/logs:/var/log/letsencrypt" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    $STAGING_FLAG

# Step 5: Restore HTTPS config
echo ""
echo "📝 Step 5: Restoring HTTPS configuration..."
if [ -f "./nginx/conf.d/default.conf.bak" ]; then
    # Restore the original HTTPS-enabled config
    rm ./nginx/conf.d/default.conf
    # The default.conf with HTTPS should already be the correct one
    # Just need to download/copy the original HTTPS version
fi

# Copy the HTTPS config (assuming default.conf was backed up)
cat > ./nginx/conf.d/default.conf << 'NGINX_CONF'
# HTTP server - redirect all traffic to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name giauy.dev www.giauy.dev;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name giauy.dev www.giauy.dev;

    ssl_certificate /etc/nginx/ssl/live/giauy.dev/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/giauy.dev/privkey.pem;

    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/live/giauy.dev/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    location / {
        proxy_pass http://frontend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_CONF

# Step 6: Reload Nginx with HTTPS
echo ""
echo "🔄 Step 6: Reloading Nginx with HTTPS configuration..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Step 7: Verify
echo ""
echo "✅ Step 7: Verifying SSL configuration..."
sleep 2
if curl -sI "https://$DOMAIN" | grep -q "200\|301\|302"; then
    echo "🎉 SUCCESS! SSL is now active for $DOMAIN"
    echo ""
    echo "🔗 Your site is now available at:"
    echo "   https://$DOMAIN"
    echo "   https://www.$DOMAIN"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Start the certbot service for auto-renewal:"
    echo "      docker compose -f docker-compose.prod.yml up -d certbot"
    echo ""
    echo "   2. Test auto-renewal (dry run):"
    echo "      docker compose -f docker-compose.prod.yml run --rm certbot renew --dry-run"
else
    echo "⚠️  Could not verify HTTPS. Please check manually."
fi

# Cleanup
rm -f ./nginx/conf.d/default.conf.bak

echo ""
echo "================================================"
echo "🔐 SSL Setup Complete!"
echo "================================================"
