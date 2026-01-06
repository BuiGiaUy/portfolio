#!/bin/bash

# ===========================================
# SSL Certificate Renewal Script
# ===========================================
# This script can be run manually or via cron
# The certbot container also handles auto-renewal
# ===========================================

set -e

DOMAIN="giauy.dev"

echo "🔄 SSL Certificate Renewal for $DOMAIN"
echo "========================================"

# Check if certificate exists
if [ ! -d "./nginx/ssl/live/$DOMAIN" ]; then
    echo "❌ No certificate found for $DOMAIN"
    echo "   Run ssl-init.sh first to obtain certificates"
    exit 1
fi

# Check certificate expiry
echo "📅 Checking certificate expiry..."
EXPIRY=$(docker run --rm \
    -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
    certbot/certbot certificates 2>/dev/null | grep "Expiry Date" | head -1)
echo "   $EXPIRY"

# Attempt renewal
echo ""
echo "🔒 Attempting certificate renewal..."
docker run --rm \
    -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    -v "$(pwd)/certbot/logs:/var/log/letsencrypt" \
    certbot/certbot renew

# Reload Nginx to pick up new certificates
echo ""
echo "🔄 Reloading Nginx..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo ""
echo "✅ Renewal process complete!"
echo "========================================"
