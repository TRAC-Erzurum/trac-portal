#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} $1"; }

show_disk() {
    df -h / | tail -1 | awk '{print "Disk: " $3 " / " $2 " (" $5 " kullanımda)"}'
}

if [ "$1" != "--prune" ] && [ "$1" != "--keep" ]; then
    echo "Kullanım: $0 --prune | --keep"
    echo "  --prune  Güncelleme sonrası eski imajları sil"
    echo "  --keep   Eski imajları sakla"
    exit 1
fi

PRUNE_AFTER=$( [ "$1" = "--prune" ] && echo true || echo false )

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TRAC Portal - Güncelleme"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log "Başlangıç durumu:"
show_disk
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || true
echo ""

log "Ön temizlik..."
docker image prune -f 2>/dev/null || true
docker builder prune -f 2>/dev/null || true

log "Yeni imajlar çekiliyor..."
docker compose pull

log "Servisler yeniden başlatılıyor..."
docker compose up -d --remove-orphans

log "Eski loglar temizleniyor..."
find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null || true
find /var/log -name "*.gz" -mtime +7 -delete 2>/dev/null || true
journalctl --vacuum-time=3d 2>/dev/null || true

echo ""
log "Healthcheck bekleniyor (30s)..."
sleep 30

API_STATUS=$(docker inspect --format='{{.State.Health.Status}}' trac-portal-api 2>/dev/null || echo "unknown")
UI_STATUS=$(docker inspect --format='{{.State.Health.Status}}' trac-portal-ui 2>/dev/null || echo "unknown")

echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

if [ "$API_STATUS" = "healthy" ] && [ "$UI_STATUS" = "healthy" ]; then
    log "Tüm servisler sağlıklı!"
    if [ "$PRUNE_AFTER" = true ]; then
        log "Eski imajlar temizleniyor..."
        docker image prune -a -f 2>/dev/null || true
    fi
else
    warn "Servis durumları: API=$API_STATUS, UI=$UI_STATUS"
    warn "Logları kontrol et: docker compose logs -f"
fi

echo ""
show_disk
echo ""
