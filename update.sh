#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} $1"; }

# Expect to be run from same directory as docker-compose.yml (e.g. /opt/trac)

# Use last-deployed tags from .versions when not set (e.g. manual run or after reboot)
if [ -z "${UI_TAG:-}" ] || [ -z "${API_TAG:-}" ]; then
  if [ -f .versions ]; then
    # shellcheck source=/dev/null
    set -a
    source ./.versions 2>/dev/null || true
    set +a
    [ -z "${UI_TAG:-}" ] && [ -n "${UI_VERSION:-}" ] && export UI_TAG="$UI_VERSION"
    [ -z "${API_TAG:-}" ] && [ -n "${API_VERSION:-}" ] && export API_TAG="$API_VERSION"
  fi
fi

show_disk() {
    df -h / | tail -1 | awk '{print "Disk: " $3 " / " $2 " (" $5 " kullanımda)"}'
}

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
# Always update core services
docker compose pull ui api

# PoC services (must never break UI/API deploy)
# Default: enabled. Set ENABLE_MMDVM_LINK=false to skip.
ENABLE_MMDVM_LINK="${ENABLE_MMDVM_LINK:-true}"
if [ "$ENABLE_MMDVM_LINK" = "1" ] || [ "$ENABLE_MMDVM_LINK" = "true" ]; then
  log "mmdvm-link PoC: imajlar çekiliyor..."
  docker compose --profile poc pull mosquitto mmdvm-link-server || warn "mmdvm-link PoC pull başarısız; UI/API deploy devam ediyor."

  log "mmdvm-link PoC: Mosquitto başlatılıyor..."
  docker compose --profile poc up -d mosquitto || warn "mmdvm-link PoC mosquitto up başarısız; UI/API deploy devam ediyor."
else
  warn "mmdvm-link PoC devre dışı (ENABLE_MMDVM_LINK=true ile açılır)."
fi

log "Servisler yeniden başlatılıyor..."
# Force recreate only UI and API so they get fresh env (APP_VERSION, UI_VERSION); leave db/certbot as-is
docker compose up -d --force-recreate ui api --remove-orphans

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
    log "Eski imajlar temizleniyor..."
    docker image prune -a -f 2>/dev/null || true
else
    warn "Servis durumları: API=$API_STATUS, UI=$UI_STATUS"
    warn "Logları kontrol et: docker compose logs -f"
fi

echo ""
show_disk
echo ""
